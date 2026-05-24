// Step 4: Lip sync correction via Sync Labs.
//
// Sync Labs takes the raw Seedance video + the generated audio and produces
// a final MP4 with aligned mouth movement. This is the step that turns a
// plausible-looking UGC clip into one that doesn't immediately break the
// illusion when someone is talking on camera.
//
// Skipped entirely for Silent B-Roll mode (no talking to sync).
// Sync Labs also bakes the audio into the output, so the result is a
// final 9:16 MP4 with audio — we use it directly as the final video.

import type { VideoMode } from "./videoPipeline";

export interface LipSyncResult {
  syncedVideoUrl: string;
  provider: "sync-labs" | "skipped" | "mock";
}

export interface LipSyncInput {
  videoUrl: string;
  audioUrl: string | null;
  mode: VideoMode;
}

export async function lipSync(input: LipSyncInput): Promise<LipSyncResult> {
  // Silent B-Roll has no talking → no syncing needed.
  // TODO: this mode still needs an audio mux step to overlay the voiceover
  // onto the silent video. For V1 we just return the raw video; the user
  // can add a render step (FFmpeg via Inngest worker or similar) later.
  if (input.mode === "Silent B-Roll") {
    console.log("[lipsync] mode is Silent B-Roll — skipping");
    return { syncedVideoUrl: input.videoUrl, provider: "skipped" };
  }

  const apiKey = process.env.SYNCLABS_API_KEY;

  if (!apiKey) {
    console.log("[lipsync] SYNCLABS_API_KEY not set — using mock (returning input video unchanged)");
    return { syncedVideoUrl: input.videoUrl, provider: "mock" };
  }

  if (!input.audioUrl) {
    console.warn("[lipsync] no audio URL available — skipping sync");
    return { syncedVideoUrl: input.videoUrl, provider: "skipped" };
  }

  console.log("[lipsync] running Sync Labs");

  try {
    return await callSyncLabs(apiKey, input);
  } catch (err) {
    console.warn("[lipsync] Sync Labs failed once, retrying:", err);
    try {
      return await callSyncLabs(apiKey, input);
    } catch (err2) {
      console.error("[lipsync] Sync Labs failed twice, falling back to raw video:", err2);
      return { syncedVideoUrl: input.videoUrl, provider: "mock" };
    }
  }
}

async function callSyncLabs(apiKey: string, input: LipSyncInput): Promise<LipSyncResult> {
  // Submit the lip-sync job.
  const submitRes = await fetch("https://api.sync.so/v2/generate", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "lipsync-2",
      input: [
        { type: "video", url: input.videoUrl },
        { type: "audio", url: input.audioUrl },
      ],
      options: {
        output_format: "mp4",
        active_speaker_detection: true,
        sync_mode: "loop",
      },
    }),
  });

  if (!submitRes.ok) {
    throw new Error(`Sync Labs submit returned ${submitRes.status}: ${await submitRes.text()}`);
  }

  const { id } = await submitRes.json();
  console.log(`[lipsync] Sync Labs job submitted, id=${id}`);

  // Poll for completion within a 45s budget (similar pattern to Seedance).
  const startedAt = Date.now();
  const POLL_BUDGET_MS = 45_000;
  while (Date.now() - startedAt < POLL_BUDGET_MS) {
    await new Promise((r) => setTimeout(r, 3000));
    const statusRes = await fetch(`https://api.sync.so/v2/generate/${id}`, {
      headers: { "x-api-key": apiKey },
    });
    if (!statusRes.ok) continue;
    const status = await statusRes.json();
    if (status.status === "COMPLETED") {
      return {
        syncedVideoUrl: status.outputUrl ?? status.output_url,
        provider: "sync-labs",
      };
    }
    if (status.status === "FAILED" || status.status === "REJECTED") {
      throw new Error(`Sync Labs job failed: ${JSON.stringify(status)}`);
    }
  }

  throw new Error("Sync Labs job timed out waiting for completion");
}
