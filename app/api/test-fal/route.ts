import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  const FAL_KEY = process.env.FAL_KEY;

  if (!FAL_KEY) {
    return NextResponse.json({
      ok: false,
      step: "env_check",
      error: "FAL_KEY environment variable is not set in Vercel",
    }, { status: 500 });
  }

  const keyPrefix = FAL_KEY.slice(0, 6) + "...";
  const keyFormat = FAL_KEY.includes(":") ? "valid (key_id:key_secret)" : "invalid (missing colon separator)";

  // Explicitly configure the client
  fal.config({ credentials: FAL_KEY });

  try {
    console.log("[test-fal] Testing with key prefix:", keyPrefix);

    // Use flux/schnell — fastest/cheapest model, widely available
    const { data } = await fal.run("fal-ai/flux/schnell", {
      input: {
        prompt: "a solid red circle on white background",
        num_inference_steps: 1,
        image_size: "square_hd" as const,
        num_images: 1,
        sync_mode: true,
      },
    });

    const imageUrl = (data as { images?: { url: string }[] }).images?.[0]?.url;

    return NextResponse.json({
      ok: true,
      keyPrefix,
      keyFormat,
      model: "fal-ai/flux/schnell",
      imageUrl: imageUrl || null,
      imageReceived: !!imageUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const isForbidden = message.toLowerCase().includes("403") || message.toLowerCase().includes("forbidden");
    const isUnauthorized = message.toLowerCase().includes("401") || message.toLowerCase().includes("unauthorized");

    console.error("[test-fal] Error:", message);

    return NextResponse.json({
      ok: false,
      step: "api_call",
      keyPrefix,
      keyFormat,
      error: message,
      diagnosis: isForbidden
        ? "403 Forbidden — FAL_KEY is present but rejected. Check: correct key value, account not suspended, model access enabled."
        : isUnauthorized
        ? "401 Unauthorized — FAL_KEY missing or malformed. Verify the key at fal.ai/dashboard > API Keys."
        : "API call failed for unknown reason.",
    }, { status: 500 });
  }
}
