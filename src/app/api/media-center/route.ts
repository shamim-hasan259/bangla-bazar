import { promises as fs } from "fs";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";

const METADATA_PATH = join(process.cwd(), "public", "img", "store-media", "metadata.json");

interface Folder {
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

interface Metadata {
  folders: Folder[];
  files: MediaFile[];
}

// Helper: Ensure directories exist
async function ensureDir(dirPath: string) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err) {
    // Ignore if directory already exists
  }
}

// Helper: Read Metadata JSON
async function readMetadata(): Promise<Metadata> {
  try {
    await ensureDir(join(process.cwd(), "public", "img", "store-media"));
    const data = await fs.readFile(METADATA_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return { folders: [], files: [] };
  }
}

// Helper: Save Metadata JSON
async function saveMetadata(data: Metadata) {
  await ensureDir(join(process.cwd(), "public", "img", "store-media"));
  await fs.writeFile(METADATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// Helper: Scan directory recursively for files
async function scanDirRecursive(dirPath: string, relativePrefix: string): Promise<{ url: string; size: string; createdAt: string }[]> {
  const result: { url: string; size: string; createdAt: string }[] = [];
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = join(dirPath, entry.name);
      if (entry.isDirectory()) {
        const subFiles = await scanDirRecursive(entryPath, `${relativePrefix}/${entry.name}`);
        result.push(...subFiles);
      } else if (entry.isFile()) {
        if (entry.name === "metadata.json" || entry.name.startsWith(".")) continue;
        const stats = await fs.stat(entryPath);
        const sizeKb = Math.round(stats.size / 1024);
        const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;
        result.push({
          url: `${relativePrefix}/${entry.name}`,
          size: sizeStr,
          createdAt: stats.mtime.toISOString(),
        });
      }
    }
  } catch (err) {
    // Directory might not exist yet
  }
  return result;
}

// GET: Fetch folders and sync/fetch media files
export async function GET(req: NextRequest) {
  try {
    const metadata = await readMetadata();
    
    // Scan physical directories
    const productsPath = join(process.cwd(), "public", "img", "products");
    const storeMediaPath = join(process.cwd(), "public", "img", "store-media");
    
    await ensureDir(productsPath);
    await ensureDir(storeMediaPath);
    
    const productsFiles = await scanDirRecursive(productsPath, "/img/products");
    const storeMediaFiles = await scanDirRecursive(storeMediaPath, "/img/store-media");
    
    const physicalFiles = [...productsFiles, ...storeMediaFiles];
    const physicalUrls = new Set(physicalFiles.map(f => f.url));
    
    // Sync logic:
    // 1. Remove files in metadata that no longer exist physically on disk
    let updatedFiles = metadata.files.filter(f => physicalUrls.has(f.url));
    
    // 2. Add physical files that are not in metadata
    const metadataUrls = new Set(updatedFiles.map(f => f.url));
    for (const pFile of physicalFiles) {
      if (!metadataUrls.has(pFile.url)) {
        // Find filename
        const parts = pFile.url.split("/");
        const filename = parts[parts.length - 1];
        updatedFiles.push({
          url: pFile.url,
          displayName: filename,
          folderId: null, // default to root
          createdAt: pFile.createdAt,
          size: pFile.size,
          dimensions: "500 x 500", // placeholder, client will update
        });
      }
    }
    
    metadata.files = updatedFiles;
    await saveMetadata(metadata);
    
    return NextResponse.json({ success: true, folders: metadata.folders, files: metadata.files });
  } catch (error: any) {
    console.error("GET media-center error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Create folders or Upload files
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    const metadata = await readMetadata();

    // Case 1: File Upload (multipart/form-data)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const files = formData.getAll("files") as File[];
      const folderId = formData.get("folderId") as string | null;

      if (files.length === 0) {
        return NextResponse.json({ success: false, message: "No files uploaded" });
      }

      const uploadsFolder = join(process.cwd(), "public", "img", "store-media");
      await ensureDir(uploadsFolder);

      const addedFiles: MediaFile[] = [];

      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const timestamp = Date.now();
        const sanitizedFileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
        const filePath = join(uploadsFolder, sanitizedFileName);

        await fs.writeFile(filePath, buffer);

        const url = `/img/store-media/${sanitizedFileName}`;
        const sizeKb = Math.round(file.size / 1024);
        const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

        const newFile: MediaFile = {
          url,
          displayName: file.name,
          folderId: folderId || null,
          createdAt: new Date().toISOString(),
          size: sizeStr,
          dimensions: "500 x 500", // placeholder
        };

        metadata.files.push(newFile);
        addedFiles.push(newFile);
      }

      await saveMetadata(metadata);
      return NextResponse.json({ success: true, files: addedFiles });
    }

    // Case 2: JSON Payload (creating folder, etc.)
    const body = await req.json();
    const { action } = body;

    if (action === "createFolder") {
      const { name, parentId } = body;
      if (!name) {
        return NextResponse.json({ success: false, message: "Folder name is required" }, { status: 400 });
      }

      const newFolder: Folder = {
        id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name,
        parentId: parentId || null,
        createdAt: new Date().toISOString(),
      };

      metadata.folders.push(newFolder);
      await saveMetadata(metadata);

      return NextResponse.json({ success: true, folder: newFolder });
    }

    return NextResponse.json({ success: false, message: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("POST media-center error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Rename or move files/folders, update dimensions
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    const metadata = await readMetadata();

    if (action === "renameFile") {
      const { url, newName } = body;
      const fileIndex = metadata.files.findIndex(f => f.url === url);
      if (fileIndex !== -1) {
        metadata.files[fileIndex].displayName = newName;
        await saveMetadata(metadata);
        return NextResponse.json({ success: true, file: metadata.files[fileIndex] });
      }
      return NextResponse.json({ success: false, message: "File not found in metadata" }, { status: 404 });
    }

    if (action === "renameFolder") {
      const { id, newName } = body;
      const folderIndex = metadata.folders.findIndex(f => f.id === id);
      if (folderIndex !== -1) {
        metadata.folders[folderIndex].name = newName;
        await saveMetadata(metadata);
        return NextResponse.json({ success: true, folder: metadata.folders[folderIndex] });
      }
      return NextResponse.json({ success: false, message: "Folder not found" }, { status: 404 });
    }

    if (action === "moveFile") {
      const { url, urls, folderId } = body;
      const targetUrls = urls && Array.isArray(urls) ? urls : [url];
      
      let movedCount = 0;
      metadata.files = metadata.files.map(f => {
        if (targetUrls.includes(f.url)) {
          movedCount++;
          return { ...f, folderId: folderId || null };
        }
        return f;
      });

      if (movedCount > 0) {
        await saveMetadata(metadata);
        return NextResponse.json({ success: true, message: `Successfully moved ${movedCount} file(s)` });
      }
      return NextResponse.json({ success: false, message: "No files found to move" }, { status: 404 });
    }

    if (action === "updateDimensions") {
      const { url, width, height } = body;
      const fileIndex = metadata.files.findIndex(f => f.url === url);
      if (fileIndex !== -1) {
        metadata.files[fileIndex].dimensions = `${width} x ${height}`;
        await saveMetadata(metadata);
        return NextResponse.json({ success: true, file: metadata.files[fileIndex] });
      }
      return NextResponse.json({ success: false, message: "File not found" }, { status: 404 });
    }

    return NextResponse.json({ success: false, message: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("PUT media-center error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Delete files physically and remove from metadata, or delete folder
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    const metadata = await readMetadata();

    if (action === "deleteFile") {
      const { url, urls } = body;
      const targetUrls: string[] = urls && Array.isArray(urls) ? urls : [url];

      if (targetUrls.length === 0) {
        return NextResponse.json({ success: false, message: "No URLs provided" }, { status: 400 });
      }

      let deletedCount = 0;
      for (const targetUrl of targetUrls) {
        // Physically delete the file
        const physicalPath = join(process.cwd(), "public", targetUrl);
        try {
          await fs.unlink(physicalPath);
          deletedCount++;
        } catch (err: any) {
          // File might not exist physically, continue to remove from metadata
          console.warn(`Could not physically delete ${physicalPath}:`, err.message);
        }
      }

      // Remove from metadata
      metadata.files = metadata.files.filter(f => !targetUrls.includes(f.url));
      await saveMetadata(metadata);

      return NextResponse.json({ success: true, message: `Deleted ${deletedCount} file(s) physically and updated metadata` });
    }

    if (action === "deleteFolder") {
      const { id } = body;
      const folderExists = metadata.folders.some(f => f.id === id);
      if (!folderExists) {
        return NextResponse.json({ success: false, message: "Folder not found" }, { status: 404 });
      }

      // Delete the folder
      metadata.folders = metadata.folders.filter(f => f.id !== id);
      
      // Move any files in this folder to the root (folderId = null)
      metadata.files = metadata.files.map(f => {
        if (f.folderId === id) {
          return { ...f, folderId: null };
        }
        return f;
      });

      await saveMetadata(metadata);
      return NextResponse.json({ success: true, message: "Folder deleted and files moved to root" });
    }

    return NextResponse.json({ success: false, message: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("DELETE media-center error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
