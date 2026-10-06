import { writeFile, mkdir } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    
    // Support files, file, image, or photo field names
    let files: File[] = data.getAll("files") as File[];
    if (files.length === 0) {
      const single = (data.get("file") || data.get("image") || data.get("photo")) as File;
      if (single && typeof single !== "string") {
        files = [single];
      }
    }

    if (files.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No files uploaded",
      }, { status: 400 });
    }

    const uploadsFolder = join(process.cwd(), "public", "img", "uploads");

    // Ensure directory exists
    await mkdir(uploadsFolder, { recursive: true });

    const uploadPromises = files.map(async (file) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const timestamp = Date.now();
      const sanitizedFileName = `${timestamp}-${file.name.replace(
        /[^a-zA-Z0-9.]/g,
        "_"
      )}`;
      const filePath = join(uploadsFolder, sanitizedFileName);

      await writeFile(filePath, buffer);

      return `/img/uploads/${sanitizedFileName}`;
    });

    const urls = await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      urls,
      url: urls[0],
      imageUrl: urls[0],
      name: urls[0].split("/").pop(),
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
