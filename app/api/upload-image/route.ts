import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const FAL_KEY = process.env.FAL_KEY;
    if (!FAL_KEY) {
      return NextResponse.json({ error: "FAL_KEY not configured" }, { status: 500 });
    }

    // Explicit auth config — required for Vercel serverless
    fal.config({ credentials: FAL_KEY });

    const { base64, mimeType = "image/jpeg" } = await req.json();
    if (!base64) return NextResponse.json({ error: "base64 required" }, { status: 400 });

    // Decode base64 → Blob → File
    const binary = Buffer.from(base64, "base64");
    const blob = new Blob([binary], { type: mimeType });
    const file = new File([blob], "product-reference.jpg", { type: mimeType });

    // Use fal.storage.upload() — resolves DNS correctly in Vercel serverless
    // Direct fetch("https://storage.fal.ai/upload") fails with ENOTFOUND
    const url = await fal.storage.upload(file);

    console.log("[upload-image] Uploaded to:", url?.slice(0, 80));
    return NextResponse.json({ url });
  } catch (err) {
    console.error("upload-image error:", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
