// Step 3: Video generation via fal.ai Seedance 2.0.
//
// Produces the base UGC-style video. Seedance is NOT relied on for perfect
// speech sync — that's step 4's job. We do, however, control the look very
// strictly through the prompt: realistic UGC, not commercial-looking.

import type { VideoMode, VideoDuration } from "./videoPipeline";

export interface GeneratedVideo {
  videoUrl: string;
  provider: "fal-seedance" | "mock";
}

export interface VideoInput {
  productImage: string | null; // base64 data URL OR public URL
  productName: string;
  script: string;
  mode: VideoMode;
  duration: VideoDuration;
  characterStyle: string;
  setting: string;
}

// Look-and-feel rules baked into every Seedance prompt. These come straight
// from the product spec — the whole point is realism over polish.
const STYLE_DIRECTIVES = [
  "Shot on iPhone front camera",
  "subtle handheld shake",
  "natural daylight, no studio lighting",
  "minimal subtle movement only",
  "product held naturally in frame",
  "creator-style UGC realism",
  "9:16 vertical",
  "no exaggerated gestures",
  "no fast or jerky movements",
  "no floating or morphing objects",
  "no commercial / advertisement look",
  "no robotic motion",
].join(", ");

// Mode-specific framing layered on top of the style directives.
const MODE_DIRECTIVES: Record<VideoMode, string> = {
  "Hybrid UGC":       "Short 2-4 second talking intro to camera, then transitions to natural product B-roll for the remainder. Casual, believable.",
  "Full Talking UGC": "Creator speaks directly to camera for the full duration, natural pauses, no scripted-feeling delivery.",
  "Silent B-Roll":    "No talking, no mouth movement. Pure product-in-use footage with natural ambient feel; voiceover layered separately.",
};

// Public placeholders used in mock mode so the gallery can still render
// a playable video without spending money on real generation.
// Hosted by test-videos.co.uk which allows server-side fetches (unlike
// Google's commondatastorage which 403s without a real browser UA).
const MOCK_PLACEHOLDERS = [
  "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4",
  "https://test-videos.co.uk/vids/sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4",
];

export async function generateVideo(input: VideoInput): Promise<GeneratedVideo> {
  const apiKey = process.env.FAL_KEY;

  if (!apiKey) {
    console.log("[video] FAL_KEY not set — using mock");
    return mockVideo();
  }

  console.log(`[video] generating with fal.ai Seedance 2.0, mode=${input.mode}, duration=${input.duration}`);

  try {
    return await callSeedance(apiKey, input);
  } catch (err) {
    console.warn("[video] Seedance failed once, retrying:", err);
    try {
      return await callSeedance(apiKey, input);
    } catch (err2) {
      console.error("[video] Seedance failed twice, falling back to mock:", err2);
      return mockVideo();
    }
  }
}

async function callSeedance(apiKey: string, input: VideoInput): Promise<GeneratedVideo> {
  const prompt = buildPrompt(input);
  const durationSec = parseInt(input.duration.match(/(\d+)/)?.[1] ?? "15", 10);

  // fal.ai's image-to-video endpoint for Seedance 2.0. Their job pattern is
  // submit → poll → fetch result, so we submit and then poll status until
  // completed or until we hit our budget (45s, leaving 15s for downstream).
  const submitRes = await fetch("https://queue.fal.run/fal-ai/bytedance/seedance/v2/pro/image-to-video", {
    method: "POST",
    headers: {
      "Authorization": `Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      image_url: input.productImage,
      duration: durationSec,
      aspect_ratio: "9:16",
      resolution: "1080p",
    }),
  });

  if (!submitRes.ok) {
    throw new Error(`Seedance submit returned ${submitRes.status}: ${await submitRes.text()}`);
  }

  const { request_id } = await submitRes.json();
  console.log(`[video] Seedance job submitted, request_id=${request_id}`);

  // Poll for completion. fal.ai recommends 2-3s between polls.
  const startedAt = Date.now();
  const POLL_BUDGET_MS = 45_000;
  while (Date.now() - startedAt < POLL_BUDGET_MS) {
    await new Promise((r) => setTimeout(r, 2500));
    const statusRes = await fetch(
      `https://queue.fal.run/fal-ai/bytedance/seedance/v2/pro/requests/${request_id}/status`,
      { headers: { "Authorization": `Key ${apiKey}` } },
    );
    if (!statusRes.ok) continue;
    const status = await statusRes.json();
    if (status.status === "COMPLETED") {
      const resultRes = await fetch(
        `https://queue.fal.run/fal-ai/bytedance/seedance/v2/pro/requests/${request_id}`,
        { headers: { "Authorization": `Key ${apiKey}` } },
      );
      const result = await resultRes.json();
      return {
        videoUrl: result.video?.url ?? result.video_url,
        provider: "fal-seedance",
      };
    }
    if (status.status === "FAILED") {
      throw new Error(`Seedance job failed: ${JSON.stringify(status)}`);
    }
  }

  throw new Error("Seedance job timed out waiting for completion");
}

function buildPrompt(input: VideoInput): string {
  return [
    `${input.characterStyle} in ${input.setting}.`,
    `Holding and naturally using ${input.productName}.`,
    MODE_DIRECTIVES[input.mode],
    `Style: ${STYLE_DIRECTIVES}.`,
    `Script context (for tone/energy reference, NOT for explicit reading): "${truncate(input.script, 200)}"`,
  ].join(" ");
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n)}...` : s;
}

function mockVideo(): GeneratedVideo {
  return {
    videoUrl: MOCK_PLACEHOLDERS[Math.floor(Math.random() * MOCK_PLACEHOLDERS.length)],
    provider: "mock",
  };
}
