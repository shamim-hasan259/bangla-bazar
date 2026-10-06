"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, UploadCloud, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface ImageUploadProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export default function ImageUpload({
    value,
    onChange,
    disabled,
}: ImageUploadProps) {
    const [loading, setLoading] = useState(false);

    const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append("files", file);

        try {
            const response = await fetch("/api/upload/products", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (data.success && data.urls.length > 0) {
                onChange(data.urls[0]);
                toast.success("Image uploaded successfully");
            } else {
                toast.error("Image upload failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const onRemove = () => {
        onChange("");
    };

    return (
        <div className="space-y-4 w-full">
            <div className="flex flex-col gap-4">
                {!value ? (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition cursor-pointer relative">
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={onUpload}
                            disabled={disabled || loading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center gap-2 text-center">
                            <UploadCloud className="h-10 w-10 text-gray-400" />
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                {loading ? "Uploading..." : "Click to upload image"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Supported formats: JPEG, PNG, WEBP
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="relative rounded-md overflow-hidden border w-full h-[200px] bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                        <Image
                            src={value}
                            alt="Uploaded image"
                            fill
                            className="object-contain p-2"
                        />
                        <div className="z-10 absolute top-2 right-2">
                            <Button
                                type="button"
                                onClick={onRemove}
                                variant="destructive"
                                size="icon"
                                disabled={disabled}
                                className="h-8 w-8"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
