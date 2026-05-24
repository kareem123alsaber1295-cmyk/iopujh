// Mock VideoGeneration record builder.
//
// Returns a fake-but-realistic VideoGeneration that the gallery can render.
// The placeholder video URLs are public sample MP4s so the <video> tag can
// actually play something. Swap mockGenerateVideo() for the real Seedance /
// FFmpeg / R2 pipeline when wiring up paid APIs.

import type { VideoGeneration, VideoGenerationInput } from "./videoPipeline";

const PLACEHOLDER_VIDEOS = [
  "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4",
  "https://test-videos.co.uk/vids/sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4",
];

export function mockGenerateVideo(input: VideoGenerationInput): VideoGeneration {
  const finalVideoUrl =
    PLACEHOLDER_VIDEOS[Math.floor(Math.random() * PLACEHOLDER_VIDEOS.length)];

  return {
    id: `vid_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    // TODO: replace with the authenticated user's id from Supabase auth (auth.uid())
    user_id: "demo_user",
    // TODO: upload `input.productImage` to Cloudflare R2 and store the public URL
    product_image_url: input.productImage,
    product_name: input.productName || "Untitled product",
    script: input.script,
    voice_style: input.voiceStyle,
    // TODO: ElevenLabs / OpenAI TTS will return a real audio URL here
    voice_url: null,
    // TODO: fal.ai Seedance 2.0 raw render URL (pre-captioning, pre-final-mux)
    raw_video_url: null,
    // TODO: FFmpeg / Remotion final render uploaded to Cloudflare R2
    final_video_url: finalVideoUrl,
    captions: buildMockCaptions(input.script),
    mode: input.mode,
    platform: input.platform,
    duration: input.duration,
    status: "completed",
    created_at: new Date().toISOString(),
  };
}

// Very rough SRT-style caption mock. Real version uses Whisper / AssemblyAI
// forced alignment against the generated voice file.
function buildMockCaptions(script: string): string {
  const lines = script
    .split(/[.!?\n]+/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 8);

  if (lines.length === 0) {
    return "00:00:00,000 --> 00:00:03,000\nYour ad starts here.";
  }

  return lines
    .map((line, i) => {
      const start = i * 2;
      const end = start + 2;
      return `${i + 1}\n${formatSrtTime(start)} --> ${formatSrtTime(end)}\n${line}`;
    })
    .join("\n\n");
}

function formatSrtTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s},000`;
}
