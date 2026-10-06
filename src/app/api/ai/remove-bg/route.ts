import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ success: false, error: "Image URL is required" }, { status: 400 });
    }

    // ১. লোকাল ইমেজের পাথ (Path) বের করা (e.g., /img/products/image.jpg)
    // public ফোল্ডার থেকে ফাইলটি রিড করার জন্য পাথ তৈরি করছি
    const publicDir = path.join(process.cwd(), "public");
    const relativePath = imageUrl.replace(/^\//, ""); // সামনের slash বাদ দেওয়া
    const absolutePath = path.join(publicDir, relativePath);

    if (!fs.existsSync(absolutePath)) {
      return NextResponse.json({ success: false, error: "File not found on disk" }, { status: 404 });
    }

    // ২. লোকাল ফাইলটিকে Buffer-এ কনভার্ট করা
    const fileBuffer = fs.readFileSync(absolutePath);
    const blob = new Blob([fileBuffer], { type: "image/jpeg" });

    // ৩. Remove.bg API-তে রিকোয়েস্ট পাঠানো FormData এর মাধ্যমে
    const formData = new FormData();
    formData.append("image_file", blob, path.basename(absolutePath));
    formData.append("size", "auto");

    const removeBgResponse = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-API-Key": process.env.REMOVE_BG_API_KEY || "",
      },
      body: formData,
    });

    if (!removeBgResponse.ok) {
      const errorText = await removeBgResponse.text();
      return NextResponse.json({ success: false, error: `Remove.bg error: ${errorText}` }, { status: removeBgResponse.status });
    }

    // ৪. রেসপন্স থেকে ইমেজ ডাটা (ArrayBuffer) নেওয়া
    const resBuffer = await removeBgResponse.arrayBuffer();

    // ৫. নতুন ছবির নাম দেওয়া এবং সেভ করা (যেমন: image-no-bg.png)
    const ext = path.extname(absolutePath);
    const baseName = path.basename(absolutePath, ext);
    const newFileName = `${baseName}-no-bg.png`;
    const dirName = path.dirname(relativePath); // e.g., img/products
    
    const newRelativePath = `/${path.join(dirName, newFileName).replace(/\\/g, "/")}`;
    const newAbsolutePath = path.join(publicDir, dirName, newFileName);

    // ফাইলটি ডিস্কে রাইট (Save) করা
    fs.writeFileSync(newAbsolutePath, Buffer.from(resBuffer));

    // ৬. নতুন ইমেজের লোকাল URL রিটার্ন করা
    return NextResponse.json({ success: true, url: newRelativePath });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}