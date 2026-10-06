"use client";

import React, { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";

interface ProfileImageUploaderProps {
  customer: {
    id?: string;
    customerId?: string;
    name?: string;
    photo?: string | null;
  };
}

export default function ProfileImageUploader({ customer }: ProfileImageUploaderProps) {
  const [photoUrl, setPhotoUrl] = useState<string>(customer.photo || "");
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit");
      return;
    }

    try {
      setUploading(true);

      // 1. Upload to server
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!uploadRes.data?.success || !uploadRes.data?.url) {
        throw new Error(uploadRes.data?.message || "File upload failed");
      }

      const uploadedUrl = uploadRes.data.url;
      setPhotoUrl(uploadedUrl);

      // 2. Save to database
      const saveRes = await axios.post("/api/customer/profile-photo", {
        photo: uploadedUrl,
        customerId: customer.customerId || customer.id,
      });

      if (saveRes.data?.success) {
        toast.success("Profile photo updated successfully!");
        router.push("/dashboard/customer");
        router.refresh();
      } else {
        toast.error(saveRes.data?.error || "Failed to update profile photo");
      }
    } catch (err: any) {
      console.error("Error uploading profile photo:", err);
      toast.error(err.response?.data?.message || err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col justify-center items-center space-y-4 p-4 md:w-1/3">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      {/* Avatar with Hover Overlay */}
      <div className="relative group cursor-pointer" onClick={triggerFileInput}>
        <Avatar className="w-32 h-32 border-4 border-slate-100 dark:border-slate-800 shadow-md transition-transform group-hover:scale-105">
          <AvatarImage src={photoUrl || ""} alt={customer.name || "Customer"} />
          <AvatarFallback className="bg-[#1E60ED]/10 text-[#1E60ED] text-3xl font-bold">
            {customer.name ? customer.name.slice(0, 2).toUpperCase() : "CU"}
          </AvatarFallback>
        </Avatar>

        {/* Hover Camera Overlay */}
        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera className="w-8 h-8 text-white" />
        </div>

        {/* Uploading Spinner */}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white z-10">
            <Loader2 className="w-8 h-8 animate-spin text-white mb-1" />
            <span className="text-[10px] font-bold">Uploading...</span>
          </div>
        )}
      </div>

      {/* Action Button */}
      <Button
        type="button"
        variant="outline"
        disabled={uploading}
        onClick={triggerFileInput}
        className="rounded-full px-5 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-all shadow-xs"
      >
        {uploading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Updating...</span>
          </>
        ) : (
          <>
            <UploadCloud className="w-3.5 h-3.5 text-[#1E60ED]" />
            <span>Change image</span>
          </>
        )}
      </Button>
    </div>
  );
}
