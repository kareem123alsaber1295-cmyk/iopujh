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

// Run the mocked pipeline. `onStage` is invoked when each stage begins.
// Returns the final VideoGeneration record once all stages complete.
export async function runVideoPipeline(
  input: VideoGenerationInput,
  onStage: (stageIndex: number) => void,
): Promise<VideoGeneration> {
  // TODO: real implementation will fire off jobs to fal.ai / ElevenLabs / Sync Labs
  // in parallel where possible, and poll their status endpoints between stages.
  for (let i = 0; i < PIPELINE_STAGES.length; i++) {
    onStage(i);
    // Slightly randomised stage delay so it feels less mechanical
    const base = 600;
    const jitter = Math.floor(Math.random() * 300);
    await new Promise((r) => setTimeout(r, base + jitter));
  }

  return mockGenerateVideo(input);
}
