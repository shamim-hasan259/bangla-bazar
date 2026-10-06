"use client";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useState } from "react";

function PhotoUpload({ photoName, setPhotoName }: any) {
  const [file, setFile] = useState<File>();
  //  (file)

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
    <form className="pt-4 w-5/6">
      <p>Offer Photo</p>
      <div className="w-full ">
        <AspectRatio ratio={16 / 9}>
          <Image
            src={`/img/${photoName}`}
            width="300"
            height="150"
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
    </form>
  );
}

export default PhotoUpload;
