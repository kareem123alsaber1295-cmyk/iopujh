import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.FAL_KEY) {
      return NextResponse.json({ error: "FAL_KEY not configured" }, { status: 500 });
    }

    const { base64, mimeType = "image/jpeg" } = await req.json();
    if (!base64) return NextResponse.json({ error: "base64 required" }, { status: 400 });

    // Decode base64 → Blob
    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
    const blob = new Blob([bytes], { type: mimeType });

    // Upload to fal.ai CDN storage
    const form = new FormData();
    form.append("file", new File([blob], "product-reference.jpg", { type: mimeType }));

    const res = await fetch("https://storage.fal.ai/upload", {
      method: "POST",
      headers: { Authorization: `Key ${process.env.FAL_KEY}` },
      body: form,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Storage upload failed: ${text}`);
    }

    const { url } = await res.json();
    return NextResponse.json({ url });
  } catch (err) {
    console.error("upload-image error:", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
