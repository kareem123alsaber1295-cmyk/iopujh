// Video generation pipeline (mocked).
//
// Today this just runs through a sequence of fake stages with delays and
// returns a placeholder VideoGeneration record. The shape of the record
// matches what a real Supabase table would store, so swapping the mock
// for real APIs later means changing function bodies, not call sites.
//
// Real-world wiring will replace each stage:
//   - "voice"    → ElevenLabs / OpenAI TTS
//   - "video"    → fal.ai Seedance 2.0
//   - "lipsync"  → Sync Labs (fallback when Seedance lip-sync drifts)
//   - "captions" → Whisper / AssemblyAI forced alignment
//   - "render"   → FFmpeg or Remotion server-side render
//   - "save"     → Cloudflare R2 upload + Supabase insert

import { mockGenerateVideo } from "./mockVideoGeneration";

export type VideoMode = "Hybrid UGC" | "Full Talking UGC" | "Silent B-Roll";
export type VideoPlatform = "Meta" | "TikTok" | "Instagram Reels" | "YouTube Shorts";
export type VideoDuration = "8 sec" | "15 sec" | "30 sec";
export type VideoStatus = "queued" | "generating" | "completed" | "failed";

export interface VideoGenerationInput {
  productImage: string | null; // base64 data URL until Cloudflare R2 is wired up
  productName: string;
  script: string;
  mode: VideoMode;
  duration: VideoDuration;
  platform: VideoPlatform;
  characterStyle: string;
  setting: string;
  voiceStyle: string;
  captionStyle: string;
}

// Database-ready record. Maps 1:1 to the planned Supabase `video_generations` table.
export interface VideoGeneration {
  id: string;
  user_id: string;
  product_image_url: string | null;
  product_name: string;
  script: string;
  voice_style: string;
  voice_url: string | null;
  raw_video_url: string | null;
  final_video_url: string;
  captions: string;
  mode: VideoMode;
  platform: VideoPlatform;
  duration: VideoDuration;
  status: VideoStatus;
  created_at: string;
}

export const PIPELINE_STAGES = [
  { key: "preparing", label: "Preparing script" },
  { key: "timing",    label: "Timing script" },
  { key: "voice",     label: "Generating voice" },
  { key: "video",     label: "Creating Seedance video" },
  { key: "lipsync",   label: "Checking lip sync" },
  { key: "captions",  label: "Adding captions" },
  { key: "render",    label: "Rendering final ad" },
  { key: "save",      label: "Saving to dashboard" },
] as const;

export type StageKey = typeof PIPELINE_STAGES[number]["key"];

export const VIDEO_MODES: VideoMode[] = ["Hybrid UGC", "Full Talking UGC", "Silent B-Roll"];
export const VIDEO_DURATIONS: VideoDuration[] = ["8 sec", "15 sec", "30 sec"];
export const VIDEO_PLATFORMS: VideoPlatform[] = ["Meta", "TikTok", "Instagram Reels", "YouTube Shorts"];

export const CHARACTER_STYLES = [
  "Young woman (20s)",
  "Young man (20s)",
  "Mom (30s–40s)",
  "Dad (30s–40s)",
  "Athletic creator",
  "Cozy founder",
  "Skincare expert",
  "Gen-Z hype creator",
];

export const SETTINGS = [
  "Bright bedroom",
  "Modern kitchen",
  "Bathroom counter",
  "Outdoor cafe",
  "Studio with white backdrop",
  "Cozy living room",
  "Gym / locker room",
  "Office desk",
];

export const VOICE_STYLES = [
  "Warm female narrator",
  "Confident male narrator",
  "Hype TikTok voice",
  "Calm ASMR delivery",
  "Documentary voiceover",
  "Founder-style conversational",
];

export const CAPTION_STYLES = [
  "Bold pop-out",
  "Karaoke highlight",
  "Minimal subtitle",
  "TikTok-style chunky",
  "Hand-drawn",
  "None",
];

// Drive the server-side pipeline and tick the UI through stages as work
// progresses. Two server flows are supported:
//
//   Mock mode (no FAL_KEY on the server):
//     POST /api/generate-video returns the full VideoGeneration record in
//     one shot. We tick stages on a short timer for visual effect, then
//     return.
//
//   Real mode (FAL_KEY set):
//     POST /api/generate-video returns { id, status: "generating" } almost
//     immediately. We then poll GET /api/generate-video/status?id=<id>
//     every POLL_INTERVAL_MS until the record flips to "completed" or
//     "failed". Stages are walked roughly: voice while the POST is in
//     flight, video while polling, lipsync/captions/render/save once the
//     final record arrives.
//
// If anything goes wrong we fall back to the local mock generator so the
// gallery still gets a playable video instead of an error.

// Frontend poll interval. fal.ai recommends not hammering their queue —
// every 4-5s is plenty responsive for a 1-3 minute render.
const POLL_INTERVAL_MS = 5_000;
// Absolute ceiling on the polling loop, after which we give up and fall
// back to mock. 10 minutes covers even the longest realistic Seedance Pro
// renders with plenty of headroom.
const POLL_TIMEOUT_MS = 10 * 60 * 1000;

// Server response from POST /api/generate-video. Either a full record (mock
// mode finished synchronously) or a job handle (real mode, must poll).
type StartResponse = VideoGeneration | { id: string; status: "generating" };

function isJobHandle(r: StartResponse): r is { id: string; status: "generating" } {
  return (r as { status?: string }).status === "generating" && !("final_video_url" in r);
}

export async function runVideoPipeline(
  input: VideoGenerationInput,
  onStage: (stageIndex: number) => void,
): Promise<VideoGeneration> {
  // Step indices we snap the UI to at key transitions. Mapped against
  // PIPELINE_STAGES: 0=preparing, 1=timing, 2=voice, 3=video, 4=lipsync,
  // 5=captions, 6=render, 7=save.
  const STAGE_PREPARING = 0;
  const STAGE_VIDEO = 3;
  const STAGE_SAVE = PIPELINE_STAGES.length - 1;

  onStage(STAGE_PREPARING);

  let startData: StartResponse;
  try {
    const res = await fetch("/api/generate-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      console.warn(`[pipeline] /api/generate-video returned ${res.status}, using mock`);
      return mockGenerateVideo(input);
    }
    startData = (await res.json()) as StartResponse;
  } catch (err) {
    console.warn("[pipeline] /api/generate-video threw, using mock:", err);
    return mockGenerateVideo(input);
  }

  // Mock-mode synchronous path — server returned the finished record.
  if (!isJobHandle(startData)) {
    onStage(STAGE_SAVE);
    return startData;
  }

  // Real-mode async path — server gave us a job id, now we poll.
  onStage(STAGE_VIDEO);

  const startedAt = Date.now();
  const url = `/api/generate-video/status?id=${encodeURIComponent(startData.id)}`;

  while (Date.now() - startedAt < POLL_TIMEOUT_MS) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

    let body: StartResponse & { status?: string };
    try {
      const res = await fetch(url);
      if (!res.ok) {
        // Treat transient errors as "still working" and try again next tick.
        continue;
      }
      body = await res.json();
    } catch {
      continue;
    }

    if (body.status === "generating") continue;

    if (body.status === "completed" && "final_video_url" in body) {
      onStage(STAGE_SAVE);
      return body;
    }

    if (body.status === "failed") {
      console.warn("[pipeline] server reported failed status, using mock");
      return mockGenerateVideo(input);
    }
  }

  console.warn(`[pipeline] poll timed out after ${POLL_TIMEOUT_MS}ms, using mock`);
  return mockGenerateVideo(input);
}
