import { writeFile, mkdir } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    // console.log({ data });
    const files = data.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No files uploaded",
      });
    }

    const uploadsFolder = join(process.cwd(), "public", "img", "products");

    // Ensure the directory exists
    await mkdir(uploadsFolder, { recursive: true });

    const uploadPromises = files.map(async (file) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Sanitize and prevent overwriting filenames
      const timestamp = Date.now();
      const sanitizedFileName = `${timestamp}-${file.name.replace(
        /[^a-zA-Z0-9.]/g,
        "_"
      )}`;
      const filePath = join(uploadsFolder, sanitizedFileName);

      await writeFile(filePath, buffer);

      // Return the URL where the file can be accessed
      return `/img/products/${sanitizedFileName}`;
    });

    const urls = await Promise.all(uploadPromises);

    return NextResponse.json({ success: true, urls });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, message: "Upload failed" });
  }
}
