"use client";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useState } from "react";

function PhotoUpload({ photoName, setPhotoName, size }: any) {
  const [file, setFile] = useState<File>();

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    ("Upload Tigger");
    if (!file) return;

    try {
      const data = new FormData();
      data.set("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        throw new Error(await res.text());
      } else {
        setPhotoName(file.name);
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="w-full ">
        <AspectRatio ratio={size === "logo" ? 16 / 6 : 16 / 9}>
          <Image
            src={`/img/${photoName}`}
            width={size === "logo" ? "300" : "750"}
            height={size === "logo" ? "150" : "100"}
            alt="Image"
            className="rounded-md object-cover"
          />
        </AspectRatio>
      </div>
      <div className="flex gap-1">
        <Input
          placeholder="photo"
          className="mr-2"
          type="file"
          onChange={(e) => setFile(e.target.files?.[0])}
        />
        <Button type="button" onClick={(e) => handleUpload(e)}>
          Upload
        </Button>
      </div>
    </div>
  );
}

export default PhotoUpload;
