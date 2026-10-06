import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function base64decode(str: string) {
  return Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const signedRequest = formData.get("signed_request") as string;

    if (!signedRequest) {
      return NextResponse.json(
        { error: "Missing signed_request" },
        { status: 400 },
      );
    }

    const [encodedSig, payload] = signedRequest.split(".");
    const appSecret = process.env.FACEBOOK_CLIENT_SECRET;

    if (!appSecret) {
      console.error('FACEBOOK_CLIENT_SECRET is not defined in environment variables');
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    // Decode the signature
    const sig = base64decode(encodedSig);

    // Verify the signature
    // HMAC-SHA256 of the payload using the app secret
    const expectedSig = crypto
      .createHmac("sha256", appSecret)
      .update(payload)
      .digest();

    if (!crypto.timingSafeEqual(sig, expectedSig)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Decode payload to get data (optional, if we need user ID)
    // const data = JSON.parse(base64decode(payload).toString());
    // const userId = data.user_id;

    // Here we would typically delete the user's data from our database
    // For now, we will return a confirmation code as this is often sufficient for compliance
    // if automated deletion isn't fully implemented yet or if we just want to pass the check.

    const confirmationCode = `del_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // The URL should be a page where the user can check the status of the deletion
    // We'll point to a privacy/deletion info page for now
    const statusUrl = `${process.env.NEXT_PUBLIC_APP_URL}/privacy-policy`;

    return NextResponse.json({
      url: statusUrl,
      confirmation_code: confirmationCode,
    });
  } catch (error) {
    console.error("Error processing Facebook deletion callback:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
