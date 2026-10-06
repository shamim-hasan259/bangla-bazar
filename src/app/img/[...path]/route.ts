import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { join } from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: any }
) {
  try {
    // Next.js 15/16 dynamic route params are async and must be awaited.
    const resolvedParams = await params;
    const { path } = resolvedParams;

    if (!path || path.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Target absolute file path in local public directory
    const publicFolder = join(process.cwd(), "public", "img");
    const filePath = join(publicFolder, ...path);

    // Security check: prevent directory traversal (ensure filepath starts with publicFolder)
    if (!filePath.startsWith(publicFolder)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    if (!fs.existsSync(filePath)) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Read the file buffer
    const fileBuffer = fs.readFileSync(filePath);

    // Determine the Content-Type
    const ext = filePath.split(".").pop()?.toLowerCase();
    let contentType = "image/jpeg";
    if (ext === "png") contentType = "image/png";
    else if (ext === "webp") contentType = "image/webp";
    else if (ext === "gif") contentType = "image/gif";
    else if (ext === "svg") contentType = "image/svg+xml";

    // Stream the file back
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("Dynamic image serving error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
