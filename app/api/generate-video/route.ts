// Server-side video generation entry point.
//
// Runs the synchronous-friendly steps (script processing, voice) and then
// branches:
//
//   Real mode (FAL_KEY set):
//     Submit Seedance, persist a "generating" row with the request_id, and
//     return immediately. The client then polls /api/generate-video/status
//     until the video is ready. Total wall time here: ~1-3s.
//
//   Mock mode (FAL_KEY not set):
//     Run the entire pipeline synchronously like before — mock video, mock
//     lipsync, passthrough render, mock or real storage upload. Returns the
//     full record in one shot so the dashboard keeps working without a
//     fal.ai key.

import { NextRequest, NextResponse } from "next/server";
import { processScript, parseDurationLabel } from "@/lib/scriptProcessor";
import { generateVoice } from "@/lib/generateVoice";
import { isSeedanceEnabled, submitSeedance, mockVideo } from "@/lib/generateVideo";
import { lipSync } from "@/lib/lipSync";
import { renderFinal } from "@/lib/renderFinal";
import { uploadVideo } from "@/lib/storage";
import { insertVideoGeneration } from "@/lib/database";
import type { VideoGeneration, VideoGenerationInput } from "@/lib/videoPipeline";

export const runtime = "nodejs";
// Real mode finishes in 1-3s (just submit + voice). Mock mode finishes in
// under a second. 60s is way more than enough headroom.
export const maxDuration = 60;

// Prefix we stash in raw_video_url while a Seedance job is in flight. Lets
// the status endpoint recover the fal.ai request_id without adding a new
// Supabase column.
const SEEDANCE_PENDING_PREFIX = "seedance:";

export async function POST(req: NextRequest) {
  const startedAt = Date.now();

  try {
    const input = (await req.json()) as VideoGenerationInput;

    console.log(`[pipeline] start mode=${input.mode} duration=${input.duration} platform=${input.platform}`);

    // ── Step 1: Script processing ─────────────────────────────────────
    const targetDuration = parseDurationLabel(input.duration);
    const processed = processScript(input.script, targetDuration);
    console.log(`[pipeline] script split into ${processed.segments.length} segments, ~${processed.totalEstimatedSeconds}s total`);

    // ── Step 2: Voice ─────────────────────────────────────────────────
    const voice = await generateVoice({
      script: processed.cleanedText,
      voiceStyle: input.voiceStyle,
      estimatedDurationSeconds: processed.totalEstimatedSeconds || targetDuration,
    });
    console.log(`[pipeline] voice: provider=${voice.provider}, ${voice.durationSeconds}s`);

    const id = `vid_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // ── Step 3: Video — branch on whether Seedance is configured ──────
    if (isSeedanceEnabled()) {
      // Real mode: submit and return immediately. Client polls /status.
      const submit = await submitSeedance({
        productImage: input.productImage,
        productName: input.productName,
        script: processed.cleanedText,
        mode: input.mode,
        duration: input.duration,
        characterStyle: input.characterStyle,
        setting: input.setting,
      });

      const pending: VideoGeneration = {
        id,
        // TODO: replace with auth.uid() once Supabase Auth is wired up.
        user_id: "demo_user",
        product_image_url: input.productImage,
        product_name: input.productName || "Untitled product",
        script: input.script,
        voice_style: input.voiceStyle,
        voice_url: voice.audioUrl,
        // Stash the fal.ai request_id here so the polling endpoint can
        // recover it without adding a new Supabase column.
        raw_video_url: `${SEEDANCE_PENDING_PREFIX}${submit.requestId}`,
        final_video_url: "",
        captions: "",
        mode: input.mode,
        platform: input.platform,
        duration: input.duration,
        status: "generating",
        created_at: new Date().toISOString(),
      };

      await insertVideoGeneration(pending);

      const totalMs = Date.now() - startedAt;
      console.log(`[pipeline] submitted in ${totalMs}ms, request_id=${submit.requestId}, id=${id}`);

      return NextResponse.json({ id, status: "generating" });
    }

    // ── Mock-mode fallback: run the whole pipeline synchronously ──────
    const video = mockVideo();
    console.log(`[pipeline] video: provider=${video.provider}`);

    const synced = await lipSync({
      videoUrl: video.videoUrl,
      audioUrl: voice.audioUrl,
      mode: input.mode,
    });
    console.log(`[pipeline] lipsync: provider=${synced.provider}`);

    const rendered = await renderFinal({
      syncedVideoUrl: synced.syncedVideoUrl,
      audioUrl: voice.audioUrl,
      captionStyle: input.captionStyle,
      platform: input.platform,
    });
    console.log(`[pipeline] render: provider=${rendered.provider}`);

    const stored = await uploadVideo(rendered.finalVideoUrl, `${id}.mp4`);
    console.log(`[pipeline] storage: provider=${stored.provider}`);

    const record: VideoGeneration = {
      id,
      user_id: "demo_user",
      product_image_url: input.productImage,
      product_name: input.productName || "Untitled product",
      script: input.script,
      voice_style: input.voiceStyle,
      voice_url: voice.audioUrl,
      raw_video_url: video.videoUrl,
      final_video_url: stored.publicUrl,
      captions: "",
      mode: input.mode,
      platform: input.platform,
      duration: input.duration,
      status: "completed",
      created_at: new Date().toISOString(),
    };

    await insertVideoGeneration(record);

    const totalMs = Date.now() - startedAt;
    console.log(`[pipeline] mock-mode done in ${totalMs}ms`);

    return NextResponse.json(record);
  } catch (err) {
    const totalMs = Date.now() - startedAt;
    console.error(`[pipeline] failed after ${totalMs}ms:`, err);
    return NextResponse.json(
      { error: "Video generation pipeline failed", details: String(err) },
      { status: 500 },
    );
  }
}
