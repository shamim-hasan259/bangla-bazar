"use client";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, UploadCloud, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";

interface PhotoUploadProps {
  photoName?: string;
  setPhotoName: (url: string) => void;
  size?: "logo" | "banner";
  onUploaded?: (url: string) => void;
}

export function PhotoUpload({ photoName, setPhotoName, size, onUploaded }: PhotoUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    try {
      setUploading(true);
      const data = new FormData();
      data.append("file", file);

      const res = await axios.post("/api/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success && res.data?.url) {
        const uploadedUrl = res.data.url;
        setPhotoName(uploadedUrl);
        if (onUploaded) {
          onUploaded(uploadedUrl);
        }
        setFile(null);
        toast.success("Image uploaded successfully! Remember to click Save.");
      } else {
        toast.error(res.data?.message || "Upload failed");
      }
    } catch (e: any) {
      console.error("Upload error:", e);
      toast.error(e.response?.data?.message || e.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const getDisplaySrc = () => {
    if (!photoName || photoName.trim() === "") {
      return size === "logo" ? "/logo.png" : "/img/hero-BG.jpg";
    }
    if (photoName.startsWith("/") || photoName.startsWith("http")) {
      return photoName;
    }
    return `/img/${photoName}`;
  };

  return (
    <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
      <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
        <AspectRatio ratio={size === "logo" ? 16 / 6 : 16 / 9} className="flex items-center justify-center p-2 bg-slate-50">
          <img
            src={getDisplaySrc()}
            alt="Preview"
            className="w-full h-full object-contain rounded-lg"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/img/hero-BG.jpg";
            }}
          />
        </AspectRatio>
      </div>
      
      {photoName && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="truncate max-w-[280px]" title={photoName}>
            Current: {photoName}
          </span>
        </div>
      )}

      <div className="flex gap-2 items-center">
        <Input
          type="file"
          accept="image/*"
          className="flex-1 text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <Button
          type="button"
          disabled={uploading || !file}
          onClick={handleUpload}
          className="bg-[#1E60ED] hover:bg-[#164ec2] text-white text-xs font-semibold px-4 flex items-center gap-1.5 rounded-xl shadow-sm transition-all"
        >
          {uploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default PhotoUpload;
