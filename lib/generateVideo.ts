// Step 3: Video generation via fal.ai Seedance 2.0.
//
// Seedance renders take longer than a single Vercel function invocation
// can wait for, so we split the call into two phases:
//
//   submitSeedance(...)  → fire off the job, return the request_id immediately
//   checkSeedance(id)    → one-shot status check, returns the video URL when done
//
// The /api/generate-video route uses submit; /api/generate-video/status uses
// check. The pipeline persists the request_id in Supabase between the two
// calls so the polling endpoint can find an in-flight job after any number
// of serverless cold starts.
//
// Look-and-feel rules ("UGC realism, no commercial polish") are baked into
// every prompt. Lip sync is still step 4's job — we don't rely on Seedance
// for perfect mouth-to-audio alignment.

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

const SEEDANCE_SUBMIT_URL = "https://queue.fal.run/fal-ai/bytedance/seedance/v2/pro/image-to-video";
const SEEDANCE_REQUEST_BASE = "https://queue.fal.run/fal-ai/bytedance/seedance/v2/pro/requests";

// Returns true if FAL_KEY is set, i.e. we should actually submit to Seedance.
export function isSeedanceEnabled(): boolean {
  return !!process.env.FAL_KEY;
}

export interface SeedanceSubmitResult {
  requestId: string;
  provider: "fal-seedance";
}

// Phase 1: submit a Seedance job and return its request_id immediately.
// Caller is responsible for persisting the request_id so a later request
// (after the function instance dies) can pick up the result.
export async function submitSeedance(input: VideoInput): Promise<SeedanceSubmitResult> {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) throw new Error("FAL_KEY not set — submitSeedance called in mock mode");

  const prompt = buildPrompt(input);
  const durationSec = parseInt(input.duration.match(/(\d+)/)?.[1] ?? "15", 10);

  console.log(`[video] submitting Seedance job, mode=${input.mode}, duration=${input.duration}`);

  const res = await fetch(SEEDANCE_SUBMIT_URL, {
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

  if (!res.ok) {
    throw new Error(`Seedance submit returned ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const requestId = data.request_id;
  if (!requestId) {
    throw new Error(`Seedance submit returned no request_id: ${JSON.stringify(data)}`);
  }

  console.log(`[video] Seedance job submitted, request_id=${requestId}`);
  return { requestId, provider: "fal-seedance" };
}

export type SeedanceJobStatus =
  | { status: "pending" }
  | { status: "completed"; videoUrl: string }
  | { status: "failed"; error: string };

// Phase 2: one-shot status check for a previously-submitted Seedance job.
// Maps fal.ai's vocabulary ("IN_QUEUE" / "IN_PROGRESS" / "COMPLETED" /
// "FAILED") to our simpler {pending, completed, failed} so callers don't
// need to know fal-specific states.
export async function checkSeedance(requestId: string): Promise<SeedanceJobStatus> {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) throw new Error("FAL_KEY not set — checkSeedance called in mock mode");

  const statusRes = await fetch(`${SEEDANCE_REQUEST_BASE}/${requestId}/status`, {
    headers: { "Authorization": `Key ${apiKey}` },
  });
  if (!statusRes.ok) {
    // Treat transient status errors as "still pending" so we just poll again
    // next time rather than failing the whole job.
    console.warn(`[video] Seedance status check returned ${statusRes.status}, treating as pending`);
    return { status: "pending" };
  }

  const status = await statusRes.json();

  if (status.status === "COMPLETED") {
    const resultRes = await fetch(`${SEEDANCE_REQUEST_BASE}/${requestId}`, {
      headers: { "Authorization": `Key ${apiKey}` },
    });
    if (!resultRes.ok) {
      return { status: "failed", error: `Seedance result fetch returned ${resultRes.status}` };
    }
    const result = await resultRes.json();
    const videoUrl = result.video?.url ?? result.video_url;
    if (!videoUrl) {
      return { status: "failed", error: `Seedance result had no video URL: ${JSON.stringify(result)}` };
    }
    return { status: "completed", videoUrl };
  }

  if (status.status === "FAILED") {
    return { status: "failed", error: `Seedance job failed: ${JSON.stringify(status)}` };
  }

  // IN_QUEUE, IN_PROGRESS, or anything else we don't recognise — keep polling.
  return { status: "pending" };
}

// Mock-mode entry point. Returns immediately with a placeholder video URL.
// Used when FAL_KEY isn't set so the dashboard still works end-to-end.
export function mockVideo(): GeneratedVideo {
  return {
    videoUrl: MOCK_PLACEHOLDERS[Math.floor(Math.random() * MOCK_PLACEHOLDERS.length)],
    provider: "mock",
  };
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
