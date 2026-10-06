"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Folder,
  FolderPlus,
  Upload,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  Download,
  Info,
  ChevronRight,
  X,
  Check,
  FolderOpen,
  FolderInput,
  Video,
  ExternalLink,
  HelpCircle
} from "lucide-react";
import { toast } from "sonner";

interface FolderType {
  id: string;
  name: string;
  parentId?: string | null;
  createdAt: string;
}

interface MediaFile {
  url: string;
  displayName: string;
  folderId: string | null;
  createdAt: string;
  size: string;
  dimensions: string;
}

type DeleteTargetType = {
  type: "file" | "folder" | "bulk-files";
  file?: MediaFile;
  folder?: FolderType;
} | null;

export default function MediaCenterPage() {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<"Picture" | "Video">("Picture");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // Data State
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State (Applied only on clicking 'Search')
  const [searchName, setSearchName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [appliedSearchName, setAppliedSearchName] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");

  // UI Interactive States
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
  const [activeMenuUrl, setActiveMenuUrl] = useState<string | null>(null);
  const [activeFolderMenuId, setActiveFolderMenuId] = useState<string | null>(null);

  // Modals & Forms State
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isRenameFolderOpen, setIsRenameFolderOpen] = useState(false);
  const [isRenameFileOpen, setIsRenameFileOpen] = useState(false);
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTargetType>(null);

  const [activeFolder, setActiveFolder] = useState<FolderType | null>(null);
  const [activeFile, setActiveFile] = useState<MediaFile | null>(null);

  const [folderInputName, setFolderInputName] = useState("");
  const [fileInputName, setFileInputName] = useState("");
  const [moveTargetFolderId, setMoveTargetFolderId] = useState<string | "root">("root");

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Folders and Files
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/media-center");
      const data = await res.json();
      if (data.success) {
        setFolders(data.folders || []);
        setFiles(data.files || []);
      } else {
        toast.error("Failed to load media center items");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while loading data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync background image dimensions once they load
  const syncDimensions = async (url: string, width: number, height: number) => {
    try {
      const res = await fetch("/api/media-center", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateDimensions",
          url,
          width,
          height,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFiles((prev) =>
          prev.map((f) => (f.url === url ? { ...f, dimensions: `${width} x ${height}` } : f))
        );
      }
    } catch (error) {
      console.warn("Could not sync dimensions for ", url, error);
    }
  };

  const handleImageLoad = (url: string, e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    const currentDim = `${width} x ${height}`;

    const matchingFile = files.find((f) => f.url === url);
    if (matchingFile && matchingFile.dimensions !== currentDim) {
      syncDimensions(url, width, height);
    }
  };

  // Close dropdowns on outer click
  useEffect(() => {
    const handleOuterClick = () => {
      setActiveMenuUrl(null);
      setActiveFolderMenuId(null);
    };
    window.addEventListener("click", handleOuterClick);
    return () => window.removeEventListener("click", handleOuterClick);
  }, []);

  // Filter Helpers
  const isVideoFile = (url: string) => {
    const ext = url.split(".").pop()?.toLowerCase();
    return ["mp4", "webm", "ogg", "mov"].includes(ext || "");
  };

  // Compute storage dynamically
  const totalStorageString = useMemo(() => {
    let totalBytes = 0;
    files.forEach((f) => {
      const sizeStr = f.size.toUpperCase();
      const val = parseFloat(sizeStr);
      if (isNaN(val)) return;
      if (sizeStr.includes("MB")) {
        totalBytes += val * 1024 * 1024;
      } else if (sizeStr.includes("KB")) {
        totalBytes += val * 1024;
      } else {
        totalBytes += val;
      }
    });
    if (totalBytes > 1024 * 1024) {
      return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${(totalBytes / 1024).toFixed(1)} KB`;
  }, [files]);

  // Filter folders and files
  const currentFolders = useMemo(() => {
    return folders.filter((f) => {
      const matchesFolder = f.parentId === currentFolderId;
      if (!matchesFolder) return false;
      if (appliedSearchName && !f.name.toLowerCase().includes(appliedSearchName.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [folders, currentFolderId, appliedSearchName]);

  const currentFiles = useMemo(() => {
    return files.filter((f) => {
      const isVideo = isVideoFile(f.url);
      if (activeTab === "Picture" && isVideo) return false;
      if (activeTab === "Video" && !isVideo) return false;
      if (f.folderId !== currentFolderId) return false;

      if (appliedSearchName && !f.displayName.toLowerCase().includes(appliedSearchName.toLowerCase())) {
        return false;
      }

      const fileTime = new Date(f.createdAt).getTime();
      if (appliedStartDate) {
        const start = new Date(appliedStartDate).getTime();
        if (fileTime < start) return false;
      }
      if (appliedEndDate) {
        const end = new Date(appliedEndDate);
        end.setHours(23, 59, 59, 999);
        if (fileTime > end.getTime()) return false;
      }

      return true;
    });
  }, [files, activeTab, currentFolderId, appliedSearchName, appliedStartDate, appliedEndDate]);

  // Folder Breadcrumbs
  const breadcrumbs = useMemo(() => {
    const list: { id: string | null; name: string }[] = [{ id: null, name: "Root" }];
    if (!currentFolderId) return list;

    const path: { id: string; name: string }[] = [];
    let currentId: string | null | undefined = currentFolderId;
    while (currentId) {
      const folder = folders.find((f) => f.id === currentId);
      if (folder) {
        path.unshift({ id: folder.id, name: folder.name });
        currentId = folder.parentId;
      } else {
        break;
      }
    }
    return [...list, ...path];
  }, [folders, currentFolderId]);

  // Search Action
  const handleSearch = () => {
    setAppliedSearchName(searchName);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
  };

  const handleClearFilters = () => {
    setSearchName("");
    setStartDate("");
    setEndDate("");
    setAppliedSearchName("");
    setAppliedStartDate("");
    setAppliedEndDate("");
  };

  // Upload Handlers
  const triggerUploadInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadFiles = e.target.files;
    if (!uploadFiles || uploadFiles.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < uploadFiles.length; i++) {
      formData.append("files", uploadFiles[i]);
    }
    if (currentFolderId) {
      formData.append("folderId", currentFolderId);
    }

    try {
      const res = await fetch("/api/media-center", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Successfully uploaded ${data.files.length} file(s)`);
        fetchData();
      } else {
        toast.error(data.message || "Failed to upload files");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Folder actions submit
  const handleCreateFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderInputName.trim()) return;

    try {
      const res = await fetch("/api/media-center", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createFolder",
          name: folderInputName.trim(),
          parentId: currentFolderId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Folder created successfully");
        setFolderInputName("");
        setIsCreateFolderOpen(false);
        fetchData();
      } else {
        toast.error(data.message || "Failed to create folder");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error creating folder");
    }
  };

  const handleRenameFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderInputName.trim() || !activeFolder) return;

    try {
      const res = await fetch("/api/media-center", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "renameFolder",
          id: activeFolder.id,
          newName: folderInputName.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Folder renamed successfully");
        setFolderInputName("");
        setIsRenameFolderOpen(false);
        setActiveFolder(null);
        fetchData();
      } else {
        toast.error(data.message || "Failed to rename folder");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error renaming folder");
    }
  };

  const handleDeleteFolderSubmit = async (folder: FolderType) => {
    try {
      const res = await fetch("/api/media-center", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deleteFolder",
          id: folder.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Folder deleted successfully");
        fetchData();
      } else {
        toast.error(data.message || "Failed to delete folder");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting folder");
    } finally {
      setDeleteTarget(null);
    }
  };

  // File rename submit
  const handleRenameFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileInputName.trim() || !activeFile) return;

    try {
      const res = await fetch("/api/media-center", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "renameFile",
          url: activeFile.url,
          newName: fileInputName.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("File renamed successfully");
        setFileInputName("");
        setIsRenameFileOpen(false);
        setActiveFile(null);
        fetchData();
      } else {
        toast.error(data.message || "Failed to rename file");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error renaming file");
    }
  };

  const handleDeleteFileSubmit = async (file: MediaFile) => {
    try {
      const res = await fetch("/api/media-center", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deleteFile",
          url: file.url,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("File deleted successfully");
        setSelectedUrls((prev) => {
          const next = new Set(prev);
          next.delete(file.url);
          return next;
        });
        fetchData();
      } else {
        toast.error(data.message || "Failed to delete file");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting file");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleBulkDeleteSubmit = async () => {
    if (selectedUrls.size === 0) return;

    try {
      const res = await fetch("/api/media-center", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deleteFile",
          urls: Array.from(selectedUrls),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Successfully deleted ${selectedUrls.size} file(s)`);
        setSelectedUrls(new Set());
        fetchData();
      } else {
        toast.error(data.message || "Failed to delete files");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting files");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleMoveFilesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetFolderId = moveTargetFolderId === "root" ? null : moveTargetFolderId;
    const urlsToMove = activeFile ? [activeFile.url] : Array.from(selectedUrls);

    if (urlsToMove.length === 0) return;

    try {
      const res = await fetch("/api/media-center", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "moveFile",
          urls: urlsToMove,
          folderId: targetFolderId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Files moved successfully");
        setIsMoveOpen(false);
        setActiveFile(null);
        setSelectedUrls(new Set());
        fetchData();
      } else {
        toast.error(data.message || "Failed to move files");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error moving files");
    }
  };

  // Utilities
  const handleCopyLink = (fileUrl: string) => {
    const absoluteUrl = `${window.location.origin}${fileUrl}`;
    navigator.clipboard.writeText(absoluteUrl);
    toast.success("Link copied to clipboard!");
  };

  const handleDownload = (fileUrl: string, displayName: string) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = displayName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download initiated");
  };

  const handleCheckboxToggle = (url: string) => {
    setSelectedUrls((prev) => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        next.add(url);
      }
      return next;
    });
  };

  const handleSelectAllOnPage = () => {
    const allUrlsOnPage = currentFiles.map((f) => f.url);
    const allSelected = allUrlsOnPage.every((url) => selectedUrls.has(url));

    setSelectedUrls((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        allUrlsOnPage.forEach((url) => next.delete(url));
      } else {
        allUrlsOnPage.forEach((url) => next.add(url));
      }
      return next;
    });
  };

  const getExportUrlsText = () => {
    const urls = activeFile ? [activeFile.url] : Array.from(selectedUrls);
    return urls.map((url) => `${window.location.origin}${url}`).join("\n");
  };

  const handleCopyExportUrls = () => {
    const text = getExportUrlsText();
    navigator.clipboard.writeText(text);
    toast.success("URLs copied to clipboard!");
    setIsExportOpen(false);
    setActiveFile(null);
  };

  // Render Folders SVG (Daraz aesthetic)
  const renderFolderSvg = (isSystem: boolean) => (
    <svg
      viewBox="0 0 100 80"
      className="w-14 h-14 transition-transform group-hover:scale-105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 0C4.48 0 0 4.48 0 10V70C0 75.52 4.48 80 10 80H90C95.52 80 100 75.52 100 70V20C100 14.48 95.52 10 90 10H45L35 0H10Z"
        fill="#FFA000"
      />
      <path d="M10 10H90V70H10V10Z" fill="#FFCA28" />
      {isSystem && (
        <>
          <rect x="35" y="30" width="12" height="12" rx="2" fill="#FFA000" opacity="0.3" />
          <rect x="53" y="30" width="12" height="12" rx="2" fill="#FFA000" opacity="0.3" />
          <rect x="35" y="48" width="12" height="12" rx="2" fill="#FFA000" opacity="0.3" />
          <rect x="53" y="48" width="12" height="12" rx="2" fill="#FFA000" opacity="0.3" />
        </>
      )}
    </svg>
  );

  return (
    <div className="w-full min-h-screen bg-[#F4F6F9]  font-sans text-sm text-[#333]">
      <div className="w-full bg-white rounded border border-slate-200 shadow-sm p-6 flex flex-col min-h-[calc(100vh-3rem)]">
        {/* Title, Breadcrumbs, Quota Display */}
        <div className="flex items-center justify-between mb-4 mt-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1 select-none">
              <span>Home</span>
              <ChevronRight size={12} className="text-gray-300" />
              <span>Products</span>
              <ChevronRight size={12} className="text-gray-300" />
              <span className="text-gray-600 font-semibold">Media Center</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Media Center</h1>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold select-none">
            <span>{totalStorageString} / 10 GB</span>
            <Info size={14} className="text-gray-400 cursor-help" />
          </div>
        </div>

        {/* Tab selection Header */}
        <div className="border-b border-gray-200 mb-5 flex items-center justify-between">
          <div className="flex gap-8">
            <button
              onClick={() => {
                setActiveTab("Picture");
                setSelectedUrls(new Set());
              }}
              className={`pb-3 text-base font-semibold tracking-wide border-b-2 transition-all ${
                activeTab === "Picture"
                  ? "border-[#1E60ED] text-[#1E60ED]"
                  : "border-transparent text-gray-500 hover:text-[#1E60ED]"
              }`}
            >
              Picture
            </button>
            <button
              onClick={() => {
                setActiveTab("Video");
                setSelectedUrls(new Set());
              }}
              className={`pb-3 text-base font-semibold tracking-wide border-b-2 transition-all ${
                activeTab === "Video"
                  ? "border-[#1E60ED] text-[#1E60ED]"
                  : "border-transparent text-gray-500 hover:text-[#1E60ED]"
              }`}
            >
              Video
            </button>
          </div>
        </div>

        {/* Informative Alert matching Daraz */}
        <div className="flex items-start gap-2.5 px-4 py-2.5 bg-[#FFFCE8] border border-[#F5EAA6] text-[#9c8400] text-xs rounded mb-5 leading-normal select-none">
          <Info className="w-4 h-4 shrink-0 text-[#E0A800] mt-0.5" />
          <span>
            Remember: the image must be smaller than 6 MB and in JPG, PNG, or JPEG format. Any file uploaded via
            products edit, category page, or store setup will automatically sync here.
          </span>
        </div>

        {/* Top Control Bar: Upload, Create Folder, Date, Search, Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            {/* Upload Image Button */}
            <button
              onClick={triggerUploadInput}
              disabled={uploading}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#1E60ED] hover:bg-[#164ec2] text-white font-medium rounded shadow-sm hover:shadow transition cursor-pointer disabled:opacity-50"
            >
              <Upload size={15} />
              {uploading ? "Uploading..." : `Upload ${activeTab}`}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              multiple
              accept={activeTab === "Picture" ? "image/*" : "video/*"}
            />

            {/* Create Folder Button */}
            <button
              onClick={() => setIsCreateFolderOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 border border-[#1E60ED] hover:bg-[#EFF6FF] text-[#1E60ED] font-medium rounded transition cursor-pointer bg-white"
            >
              <FolderPlus size={15} />
              Create new folder
            </button>
          </div>

          {/* Filters: Dates & Search text */}
          <div className="flex flex-wrap items-center gap-2 bg-[#FAFBFD] p-2 rounded border border-gray-100">
            {/* Start Date */}
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start Date"
                className="px-2 py-1.5 border border-gray-300 rounded text-xs focus:border-[#1E60ED] focus:outline-none bg-white min-w-[125px]"
              />
            </div>
            <span className="text-gray-400 text-xs">—</span>
            {/* End Date */}
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End Date"
                className="px-2 py-1.5 border border-gray-300 rounded text-xs focus:border-[#1E60ED] focus:outline-none bg-white min-w-[125px]"
              />
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder={`Search ${activeTab.toLowerCase()}'s name`}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-8 pr-3 py-1.5 border border-gray-300 rounded text-xs focus:border-[#1E60ED] focus:outline-none w-[180px] sm:w-[220px]"
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Actions */}
            <button
              onClick={handleClearFilters}
              className="px-3 py-1.5 border border-gray-300 hover:border-gray-400 text-gray-700 rounded text-xs transition bg-white"
            >
              Clear
            </button>
            <button
              onClick={handleSearch}
              className="px-4 py-1.5 bg-[#1E60ED] hover:bg-[#164ec2] text-white rounded text-xs transition font-semibold"
            >
              Search
            </button>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 flex-1">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-[#1E60ED] rounded-full animate-spin"></div>
            <span className="text-gray-500 mt-3 font-medium">Syncing files on disk...</span>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* breadcrumbs */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-5 border-b border-gray-100 pb-2">
              <span className="font-semibold text-gray-700">Breadcrumbs:</span>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight size={12} className="text-gray-400" />}
                  <button
                    onClick={() => {
                      setCurrentFolderId(crumb.id);
                      setSelectedUrls(new Set());
                    }}
                    className={`hover:text-[#1E60ED] hover:underline cursor-pointer ${
                      idx === breadcrumbs.length - 1 ? "font-bold text-slate-800" : ""
                    }`}
                  >
                    {crumb.name}
                  </button>
                </React.Fragment>
              ))}
            </div>

            {/* Folder Grid Section */}
            {currentFolders.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-700 mb-3 border-l-3 border-[#1E60ED] pl-2 leading-none">
                  Folder
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                  {currentFolders.map((folder) => {
                    const isSystemFolder = folder.name === "Product Listing";
                    return (
                      <div
                        key={folder.id}
                        onDoubleClick={() => {
                          setCurrentFolderId(folder.id);
                          setSelectedUrls(new Set());
                        }}
                        className="group relative flex flex-col items-center justify-center p-3.5 border border-gray-200 rounded hover:border-[#1E60ED] hover:bg-[#EFF6FF] transition duration-150 select-none cursor-pointer text-center bg-white"
                      >
                        {/* Folder Action Buttons */}
                        <div className="absolute right-1.5 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveFolderMenuId(
                                activeFolderMenuId === folder.id ? null : folder.id
                              );
                            }}
                            className="p-1 hover:bg-white rounded border border-gray-100 text-gray-500 shadow-sm"
                          >
                            <MoreVertical size={13} />
                          </button>
                          {/* Folder Option Dropdown Menu */}
                          {activeFolderMenuId === folder.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-6 bg-white border border-gray-200 rounded shadow-lg z-50 py-1 min-w-[90px] text-left"
                            >
                              <button
                                onClick={() => {
                                  setActiveFolder(folder);
                                  setFolderInputName(folder.name);
                                  setIsRenameFolderOpen(true);
                                  setActiveFolderMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 hover:bg-gray-50 text-xs text-gray-700 flex items-center gap-1.5"
                              >
                                <Edit2 size={12} /> Rename
                              </button>
                              <button
                                onClick={() => {
                                  setActiveFolder(folder);
                                  setDeleteTarget({ type: "folder", folder });
                                  setActiveFolderMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 hover:bg-gray-50 text-xs text-red-600 flex items-center gap-1.5"
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          )}
                        </div>

                        {renderFolderSvg(isSystemFolder)}
                        <span className="text-xs font-semibold text-gray-700 mt-2 truncate w-full px-1">
                          {folder.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pictures Grid Section */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-700 border-l-3 border-[#1E60ED] pl-2 leading-none">
                  {activeTab}
                </h3>
              </div>

              {currentFiles.length === 0 && currentFolders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 flex-1 border border-dashed border-gray-200 rounded">
                  <FolderOpen className="w-12 h-12 text-gray-300 mb-2" />
                  <span className="text-gray-400 font-medium">This folder is empty</span>
                  <span className="text-gray-400 text-xs mt-1">
                    Upload new items or move folders here
                  </span>
                </div>
              ) : currentFiles.length === 0 ? (
                <div className="py-10 text-center text-xs text-gray-400 border border-dashed border-gray-100 rounded">
                  No files found at this folder level. Check sub-folders.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-5">
                  {currentFiles.map((file) => {
                    const isSelected = selectedUrls.has(file.url);
                    return (
                      <div
                        key={file.url}
                        className={`group relative flex flex-col bg-white border rounded overflow-hidden hover:shadow transition duration-155 ${
                          isSelected ? "border-2 border-blue-600 shadow-md ring-0" : "border-gray-200"
                        }`}
                      >
                        {/* Custom Orange Selected Checkbox (Hover or Selected) */}
                        <div
                          className={`absolute left-2.5 top-2.5 z-10 transition-opacity duration-100 ${
                            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                          }`}
                        >
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCheckboxToggle(file.url);
                            }}
                            className={`w-5 h-5 flex items-center justify-center rounded cursor-pointer border shadow-sm transition-colors ${
                              isSelected
                                ? "bg-[#1E60ED] border-[#1E60ED] text-white"
                                : "bg-white border-gray-300 hover:border-gray-400 text-transparent"
                            }`}
                          >
                            <Check size={12} strokeWidth={3.5} />
                          </div>
                        </div>

                        {/* More Actions Toggle */}
                        <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuUrl(activeMenuUrl === file.url ? null : file.url);
                            }}
                            className="p-1 hover:bg-slate-100/90 bg-white/80 backdrop-blur-xs rounded border border-gray-200 text-gray-600 shadow-sm"
                          >
                            <MoreVertical size={13} />
                          </button>

                          {/* Image Actions Menu (exactly matching Daraz options) */}
                          {activeMenuUrl === file.url && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-6 bg-white border border-gray-200 rounded shadow-lg z-50 py-1 min-w-[120px] text-left animate-in fade-in slide-in-from-top-1 duration-100"
                            >
                              <button
                                onClick={() => {
                                  setActiveFile(file);
                                  setIsDetailsOpen(true);
                                  setActiveMenuUrl(null);
                                }}
                                className="w-full px-3.5 py-1.5 hover:bg-gray-50 text-xs text-gray-700 flex items-center gap-1.5 border-b border-gray-50"
                              >
                                <Info size={12} /> View details
                              </button>
                              <button
                                onClick={() => {
                                  setActiveFile(file);
                                  setFileInputName(file.displayName);
                                  setIsRenameFileOpen(true);
                                  setActiveMenuUrl(null);
                                }}
                                className="w-full px-3.5 py-1.5 hover:bg-gray-50 text-xs text-gray-700 flex items-center gap-1.5"
                              >
                                <Edit2 size={12} /> Edit
                              </button>
                              <button
                                onClick={() => {
                                  setActiveFile(file);
                                  setMoveTargetFolderId(file.folderId || "root");
                                  setIsMoveOpen(true);
                                  setActiveMenuUrl(null);
                                }}
                                className="w-full px-3.5 py-1.5 hover:bg-gray-50 text-xs text-gray-700 flex items-center gap-1.5"
                              >
                                <FolderInput size={12} /> Move to folder
                              </button>
                              <button
                                onClick={() => {
                                  handleCopyLink(file.url);
                                  setActiveMenuUrl(null);
                                }}
                                className="w-full px-3.5 py-1.5 hover:bg-gray-50 text-xs text-gray-700 flex items-center gap-1.5"
                              >
                                <Copy size={12} /> Copy Link
                              </button>
                              <button
                                onClick={() => {
                                  handleDownload(file.url, file.displayName);
                                  setActiveMenuUrl(null);
                                }}
                                className="w-full px-3.5 py-1.5 hover:bg-gray-50 text-xs text-gray-700 flex items-center gap-1.5"
                              >
                                <Download size={12} /> Download
                              </button>
                              <button
                                onClick={() => {
                                  setActiveFile(file);
                                  setIsExportOpen(true);
                                  setActiveMenuUrl(null);
                                }}
                                className="w-full px-3.5 py-1.5 hover:bg-gray-50 text-xs text-gray-700 flex items-center gap-1.5 border-t border-gray-100"
                              >
                                <ExternalLink size={12} /> Export URLS
                              </button>
                              <button
                                onClick={() => {
                                  setActiveFile(file);
                                  setDeleteTarget({ type: "file", file });
                                  setActiveMenuUrl(null);
                                }}
                                className="w-full px-3.5 py-1.5 hover:bg-gray-50 text-xs text-red-600 flex items-center gap-1.5 border-t border-gray-100"
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          )}
                        </div>

                        {/* File Media Preview */}
                        <div
                          className="relative aspect-square w-full bg-slate-50 border-b border-gray-100 flex items-center justify-center p-1.5 cursor-pointer"
                          onClick={() => handleCheckboxToggle(file.url)}
                        >
                          {activeTab === "Picture" ? (
                            <img
                              src={file.url}
                              alt={file.displayName}
                              onLoad={(e) => handleImageLoad(file.url, e)}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center w-full h-full text-slate-400">
                              <Video size={36} className="text-[#1E60ED]" />
                              <span className="text-[10px] mt-1 text-gray-500 font-semibold uppercase">
                                Video Clip
                              </span>
                            </div>
                          )}
                        </div>

                        {/* File Details (Close spacing) */}
                        <div className="p-2 flex flex-col justify-between flex-1 min-w-0 bg-white select-none">
                          <p
                            title={file.displayName}
                            className="text-xs font-semibold text-gray-800 truncate leading-tight mb-0.5"
                          >
                            {file.displayName}
                          </p>
                          <div className="flex flex-col gap-0.5 mt-auto">
                            <span className="text-[10px] text-gray-400 leading-none">
                              {file.dimensions}
                            </span>
                            <span className="text-[10px] text-gray-400 leading-none">
                              {file.size}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Floating Bulk Action Bar (Exact Screenshot design: white/light background, orange borders) */}
        {selectedUrls.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white text-gray-800 py-3 px-6 rounded-lg flex items-center gap-6 shadow-xl border border-gray-200 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
            <span className="text-xs font-semibold text-slate-600">
              Selected: <strong className="text-[#1E60ED] font-bold">{selectedUrls.size} {activeTab}</strong>
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSelectAllOnPage}
                className="text-xs text-[#2F5ACF] hover:underline font-semibold bg-transparent border-0 cursor-pointer pr-1"
              >
                {currentFiles.every((f) => selectedUrls.has(f.url)) ? "Deselect all" : "Select all"}
              </button>
              <button
                onClick={() => setSelectedUrls(new Set())}
                className="px-3.5 py-1.5 border border-gray-300 hover:border-[#1E60ED] hover:text-[#1E60ED] text-gray-600 rounded bg-white font-semibold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setActiveFile(null);
                  setIsExportOpen(true);
                }}
                className="px-3.5 py-1.5 border border-[#1E60ED] text-[#1E60ED] hover:bg-[#EFF6FF] rounded bg-white font-semibold text-xs transition cursor-pointer"
              >
                Export URLS
              </button>
              <button
                onClick={() => {
                  setActiveFile(null);
                  setMoveTargetFolderId("root");
                  setIsMoveOpen(true);
                }}
                className="px-3.5 py-1.5 border border-[#1E60ED] text-[#1E60ED] hover:bg-[#EFF6FF] rounded bg-white font-semibold text-xs transition cursor-pointer"
              >
                Move to
              </button>
              <button
                onClick={() => toast.info("Remove background feature is coming soon!")}
                className="px-3.5 py-1.5 border border-[#1E60ED] text-[#1E60ED] hover:bg-[#EFF6FF] rounded bg-white font-semibold text-xs transition cursor-pointer"
              >
                Remove background
              </button>
              <button
                onClick={() => {
                  setDeleteTarget({ type: "bulk-files" });
                }}
                className="px-5 py-1.5 bg-[#1E60ED] hover:bg-[#164ec2] text-white rounded font-bold text-xs transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────── MODAL DIALOGS ─────────────────── */}

      {/* Delete Confirmation Modal (Custom dialog instead of native browser prompt) */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-55 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-lg border border-gray-200 shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-4 py-3 bg-white border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-teal-50 border border-teal-100 rounded-full flex items-center justify-center text-[#22C55E]">
                  <HelpCircle size={16} strokeWidth={2.5} />
                </div>
                <span className="font-bold text-gray-700 text-sm select-none">
                  {deleteTarget.type === "folder" ? "Delete folder" : `Delete ${activeTab.toLowerCase()}(s)`}
                </span>
              </div>
              <button
                onClick={() => setDeleteTarget(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
            {/* Modal Body */}
            <div className="p-5 text-center md:text-left select-none">
              <p className="text-gray-600 text-xs leading-relaxed font-semibold">
                {deleteTarget.type === "folder" && (
                  `Are you sure you want to delete folder "${deleteTarget.folder?.name}"? Media files inside will be moved to root.`
                )}
                {deleteTarget.type === "file" && (
                  `Are you sure you want to delete these 1 ${activeTab.toLowerCase()}?`
                )}
                {deleteTarget.type === "bulk-files" && (
                  `Are you sure you want to delete these ${selectedUrls.size} ${activeTab.toLowerCase()}(s)?`
                )}
              </p>
            </div>
            {/* Modal Actions */}
            <div className="px-4 py-3 bg-gray-50/70 border-t border-gray-100 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-1.5 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteTarget.type === "file" && deleteTarget.file) {
                    handleDeleteFileSubmit(deleteTarget.file);
                  } else if (deleteTarget.type === "folder" && deleteTarget.folder) {
                    handleDeleteFolderSubmit(deleteTarget.folder);
                  } else if (deleteTarget.type === "bulk-files") {
                    handleBulkDeleteSubmit();
                  }
                }}
                className="px-5 py-1.5 bg-[#1E60ED] hover:bg-[#164ec2] text-white rounded font-bold transition cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {isCreateFolderOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-md border border-gray-200 shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b border-gray-100">
              <span className="font-bold text-gray-700">Create New Folder</span>
              <button
                onClick={() => {
                  setIsCreateFolderOpen(false);
                  setFolderInputName("");
                }}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateFolderSubmit} className="p-4">
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Folder Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter folder name (e.g. Product Listing)"
                  value={folderInputName}
                  onChange={(e) => setFolderInputName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:border-[#1E60ED] focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateFolderOpen(false);
                    setFolderInputName("");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1E60ED] hover:bg-[#164ec2] text-white rounded font-semibold transition cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rename Folder Modal */}
      {isRenameFolderOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-md border border-gray-200 shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b border-gray-100">
              <span className="font-bold text-gray-700">Rename Folder</span>
              <button
                onClick={() => {
                  setIsRenameFolderOpen(false);
                  setFolderInputName("");
                  setActiveFolder(null);
                }}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleRenameFolderSubmit} className="p-4">
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  New Folder Name
                </label>
                <input
                  type="text"
                  required
                  value={folderInputName}
                  onChange={(e) => setFolderInputName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:border-[#1E60ED] focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsRenameFolderOpen(false);
                    setFolderInputName("");
                    setActiveFolder(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1E60ED] hover:bg-[#164ec2] text-white rounded font-semibold transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rename File Modal */}
      {isRenameFileOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-md border border-gray-200 shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b border-gray-100">
              <span className="font-bold text-gray-700">Rename {activeTab}</span>
              <button
                onClick={() => {
                  setIsRenameFileOpen(false);
                  setFileInputName("");
                  setActiveFile(null);
                }}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleRenameFileSubmit} className="p-4">
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={fileInputName}
                  onChange={(e) => setFileInputName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:border-[#1E60ED] focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsRenameFileOpen(false);
                    setFileInputName("");
                    setActiveFile(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1E60ED] hover:bg-[#164ec2] text-white rounded font-semibold transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Move Files Modal */}
      {isMoveOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-md border border-gray-200 shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b border-gray-100">
              <span className="font-bold text-gray-700">Move to Folder</span>
              <button
                onClick={() => {
                  setIsMoveOpen(false);
                  setActiveFile(null);
                }}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleMoveFilesSubmit} className="p-4">
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Select Destination Folder
                </label>
                <select
                  value={moveTargetFolderId}
                  onChange={(e) => setMoveTargetFolderId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:border-[#1E60ED] focus:outline-none bg-white"
                >
                  <option value="root">Root (Uncategorized)</option>
                  {folders.map((fold) => (
                    <option key={fold.id} value={fold.id}>
                      {fold.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsMoveOpen(false);
                    setActiveFile(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1E60ED] hover:bg-[#164ec2] text-white rounded font-semibold transition cursor-pointer"
                >
                  Confirm Move
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {isDetailsOpen && activeFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-md border border-gray-200 shadow-xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b border-gray-100">
              <span className="font-bold text-gray-700">Media Details</span>
              <button
                onClick={() => {
                  setIsDetailsOpen(false);
                  setActiveFile(null);
                }}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-5 flex flex-col md:flex-row gap-5">
              {/* Media Preview Box */}
              <div className="w-full md:w-2/5 aspect-square bg-slate-50 border border-gray-200 rounded flex items-center justify-center p-2">
                {!isVideoFile(activeFile.url) ? (
                  <img
                    src={activeFile.url}
                    alt={activeFile.displayName}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <Video size={40} className="text-[#1E60ED] mb-1" />
                    <span className="text-xs font-bold text-gray-500 uppercase">Video</span>
                  </div>
                )}
              </div>

              {/* Data Table */}
              <div className="flex-1 flex flex-col gap-3 text-xs">
                <div>
                  <label className="font-bold text-gray-500 uppercase text-[10px] tracking-wider block">
                    File Name
                  </label>
                  <span className="text-gray-800 font-semibold break-all">
                    {activeFile.displayName}
                  </span>
                </div>
                <div>
                  <label className="font-bold text-gray-500 uppercase text-[10px] tracking-wider block">
                    File URL
                  </label>
                  <span className="text-gray-800 break-all bg-slate-50 border border-slate-100 p-1.5 rounded block mt-0.5 select-all">
                    {activeFile.url}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-500 uppercase text-[10px] tracking-wider block">
                      Dimensions
                    </label>
                    <span className="text-gray-800 font-semibold">{activeFile.dimensions}</span>
                  </div>
                  <div>
                    <label className="font-bold text-gray-500 uppercase text-[10px] tracking-wider block">
                      File Size
                    </label>
                    <span className="text-gray-800 font-semibold">{activeFile.size}</span>
                  </div>
                </div>
                <div>
                  <label className="font-bold text-gray-500 uppercase text-[10px] tracking-wider block">
                    Upload Date
                  </label>
                  <span className="text-gray-800 font-semibold">
                    {new Date(activeFile.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex justify-end gap-2 text-xs">
              <button
                onClick={() => handleCopyLink(activeFile.url)}
                className="px-4 py-2 border border-[#1E60ED] hover:bg-[#EFF6FF] text-[#1E60ED] rounded font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Copy size={13} /> Copy link
              </button>
              <button
                onClick={() => {
                  setIsDetailsOpen(false);
                  setActiveFile(null);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export URLs Modal */}
      {isExportOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-md border border-gray-200 shadow-xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b border-gray-100">
              <span className="font-bold text-gray-700">Export Media URLs</span>
              <button
                onClick={() => {
                  setIsExportOpen(false);
                  setActiveFile(null);
                }}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4">
              <p className="text-xs text-gray-500 mb-2 leading-relaxed">
                Copy the absolute URLs below to link these media items in external descriptions, catalogs, or posts.
              </p>
              <textarea
                readOnly
                value={getExportUrlsText()}
                className="w-full h-40 px-3 py-2 border border-gray-300 rounded text-xs font-mono focus:outline-none bg-slate-50"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
            </div>
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsExportOpen(false);
                  setActiveFile(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCopyExportUrls}
                className="px-5 py-2 bg-[#1E60ED] hover:bg-[#164ec2] text-white rounded font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Copy size={13} /> Copy All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
