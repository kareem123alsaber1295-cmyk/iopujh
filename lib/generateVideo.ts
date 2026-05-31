// Step 3: Video generation via fal.ai Seedance 2.0.
//
// Uses the official @fal-ai/client library (same one your partner uses for
// product photos) instead of raw fetch. The library knows the right queue
// URLs and HTTP methods — we tried multiple guesses with raw fetch and they
// all hit 405/404 because fal.ai's actual queue API doesn't match what their
// public docs describe.
//
// Two phases (Seedance renders take 1-3 minutes; can't block a single
// serverless function that long):
//   submitSeedance(input) → fire off the job, return request_id immediately
//   checkSeedance(requestId) → one-shot status check; returns video URL when
//                              fal.ai reports COMPLETED.

import { fal } from "@fal-ai/client";
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
  "product appears EXACTLY as in the reference image",
  "do not redesign, restyle, or reshape the product",
  "preserve the product's exact contour, color, and texture",
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

// Canonical fal.ai endpoint id for Seedance 2.0 image-to-video. Note the
// flat dash-separated naming — NOT the namespaced `fal-ai/bytedance/...`
// pattern. Old id was rejected silently by fal.ai (submit accepted but
// status/result returned 404 with "Path /seedance/v2/pro/image-to-video
// not found"), which is why nothing ever rendered.
const SEEDANCE_ENDPOINT = "bytedance/seedance-2.0/image-to-video";

// Returns true if FAL_KEY is set, i.e. we should actually submit to Seedance.
export function isSeedanceEnabled(): boolean {
  return !!process.env.FAL_KEY;
}

// Configure the fal.ai client with the server-side API key. Safe to call
// repeatedly — the library just overwrites the stored credential. Called
// before every queue operation so a missing env var produces a clear error
// instead of a cryptic 401 from the library.
function configureFal(): void {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) throw new Error("FAL_KEY not set — cannot call Seedance");
  fal.config({ credentials: apiKey });
}

export interface SeedanceSubmitResult {
  requestId: string;
  statusUrl: string;
  responseUrl: string;
  provider: "fal-seedance";
}

// Phase 1: submit a Seedance job and return its request_id + the canonical
// status/response URLs that fal.ai itself returned. Caller persists all
// three so a later poll can hit the exact URLs fal.ai expects (bypassing
// any URL-construction guesswork on our side or in the client library).
export async function submitSeedance(input: VideoInput): Promise<SeedanceSubmitResult> {
  configureFal();

  const prompt = buildPrompt(input);
  const durationSec = parseInt(input.duration.match(/(\d+)/)?.[1] ?? "15", 10);

  console.log(`[video] submitting Seedance job, mode=${input.mode}, duration=${input.duration}`);

  const submitResponse = await fal.queue.submit(SEEDANCE_ENDPOINT, {
    input: {
      prompt,
      image_url: input.productImage,
      duration: durationSec,
      aspect_ratio: "9:16",
      resolution: "1080p",
    },
  }) as { request_id: string; status_url: string; response_url: string };

  console.log(`[video] Seedance job submitted, request_id=${submitResponse.request_id}`);
  return {
    requestId: submitResponse.request_id,
    statusUrl: submitResponse.status_url,
    responseUrl: submitResponse.response_url,
    provider: "fal-seedance",
  };
}

export type SeedanceJobStatus =
  | { status: "pending" }
  | { status: "completed"; videoUrl: string }
  | { status: "failed"; error: string };

// Phase 2: one-shot status check for a previously-submitted Seedance job.
// Maps fal.ai's vocabulary (IN_QUEUE / IN_PROGRESS / COMPLETED) to our
// simpler {pending, completed, failed} so callers don't need to know
// fal-specific states. When status is COMPLETED, also fetches the result
// in the same call so callers get the video URL inline.
//
// We use raw fetch here instead of fal.queue.status / fal.queue.result
// because @fal-ai/client v1.10 has a bug for deeply-nested endpoints —
// it parses `fal-ai/bytedance/seedance/v2/pro/image-to-video` down to
// `fal-ai/bytedance/seedance` for status/result calls, dropping the path.
// The submit response shows the *real* canonical URL is just
// `fal-ai/bytedance/requests/<id>/...` (namespace/owner only).
export async function checkSeedance(
  requestId: string,
  statusUrl: string,
  resultUrl: string,
): Promise<SeedanceJobStatus> {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) throw new Error("FAL_KEY not set — cannot call Seedance");

  const shortId = requestId.slice(0, 8);
  const authHeaders = { Authorization: `Key ${apiKey}` };

  try {
    const statusRes = await fetch(statusUrl, { headers: authHeaders });
    if (!statusRes.ok) {
      const body = await statusRes.text().catch(() => "");
      console.warn(`[video] Seedance ${shortId} status ${statusRes.status}: ${body.slice(0, 200)}`);
      return { status: "pending" }; // treat transient errors as still-pending
    }

    const status = (await statusRes.json()) as {
      status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED";
      queue_position?: number;
    };

    if (status.status === "COMPLETED") {
      console.log(`[video] Seedance ${shortId} COMPLETED — fetching result`);
      const resultRes = await fetch(resultUrl, { headers: authHeaders });
      if (!resultRes.ok) {
        const body = await resultRes.text().catch(() => "");
        return { status: "failed", error: `Result fetch ${resultRes.status}: ${body.slice(0, 200)}` };
      }
      const result = (await resultRes.json()) as { video?: { url?: string }; video_url?: string };
      const videoUrl = result.video?.url ?? result.video_url;
      if (!videoUrl) {
        return { status: "failed", error: `Result had no video URL: ${JSON.stringify(result).slice(0, 200)}` };
      }
      return { status: "completed", videoUrl };
    }

    if (status.status === "IN_QUEUE") {
      console.log(`[video] Seedance ${shortId} IN_QUEUE position=${status.queue_position}`);
    } else {
      console.log(`[video] Seedance ${shortId} ${status.status}`);
    }
    return { status: "pending" };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { status: "failed", error: message };
  }
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
