// Step 5: Final render.
//
// V1 IMPLEMENTATION: passthrough.
// Sync Labs already returns a final 9:16 MP4 with audio baked in, so the
// "render" step is a no-op here. We keep this module so the pipeline shape
// matches the spec and so swapping in a real renderer later is one file.
//
// V2: this is where a real render step would live — burning in captions,
// adding intro/outro cards, platform-specific re-encodes (TikTok vs Reels
// vs Shorts). FFmpeg via @ffmpeg/ffmpeg WASM is too slow for serverless;
// the realistic path is to offload to a background worker:
//   - Remotion Lambda  (https://www.remotion.dev/lambda)
//   - Inngest + a small FFmpeg-on-Fly.io worker
//   - Creatomate / Shotstack hosted render APIs
//
// For Silent B-Roll mode this is also the step that would mux the
// voiceover audio onto the silent video — currently we hand back the raw
// video without audio (see lipSync.ts).

export interface RenderResult {
  finalVideoUrl: string;
  provider: "passthrough" | "ffmpeg" | "remotion";
}

export interface RenderInput {
  syncedVideoUrl: string;
  audioUrl: string | null;
  captionStyle: string;
  platform: string;
}

export async function renderFinal(input: RenderInput): Promise<RenderResult> {
  console.log(`[render] passthrough — using synced video as final (captionStyle=${input.captionStyle}, platform=${input.platform})`);

  // TODO: when we add real rendering, dispatch to a background worker here
  // and either await its result (if it can fit in maxDuration) or return a
  // pending job id and have the frontend poll.
  return {
    finalVideoUrl: input.syncedVideoUrl,
    provider: "passthrough",
  };
}
