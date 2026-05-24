// Server-side video generation orchestrator.
//
// Runs the full mocked-or-real pipeline:
//   1. Process script
//   2. Generate voice  (ElevenLabs or mock)
//   3. Generate video  (fal.ai Seedance or mock)
//   4. Lip sync        (Sync Labs or mock; skipped for Silent B-Roll)
//   5. Final render    (passthrough for V1)
//   6. Storage upload  (Supabase or mock)
//
// Each step's module decides whether to call its real API or fall back to a
// mock based on the presence of its env var. That means the day this lands,
// the route works in pure mock mode (matches the existing UX); adding env
// vars one at a time progressively swaps real APIs in without code changes.

import { NextRequest, NextResponse } from "next/server";
import { processScript, parseDurationLabel } from "@/lib/scriptProcessor";
import { generateVoice } from "@/lib/generateVoice";
import { generateVideo } from "@/lib/generateVideo";
import { lipSync } from "@/lib/lipSync";
import { renderFinal } from "@/lib/renderFinal";
import { uploadVideo } from "@/lib/storage";
import { insertVideoGeneration } from "@/lib/database";
import type { VideoGeneration, VideoGenerationInput } from "@/lib/videoPipeline";

// Run the pipeline as a Node.js (not Edge) function so we can hold the audio
// buffer in memory and use Node fetch semantics.
export const runtime = "nodejs";
// 60s is the Vercel Pro hard cap for serverless functions. Anything beyond
// that needs background jobs (Inngest / Vercel Workflow / Trigger.dev).
export const maxDuration = 60;

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

    // ── Step 3: Video (Seedance) ──────────────────────────────────────
    const video = await generateVideo({
      productImage: input.productImage,
      productName: input.productName,
      script: processed.cleanedText,
      mode: input.mode,
      duration: input.duration,
      characterStyle: input.characterStyle,
      setting: input.setting,
    });
    console.log(`[pipeline] video: provider=${video.provider}`);

    // ── Step 4: Lip sync ──────────────────────────────────────────────
    const synced = await lipSync({
      videoUrl: video.videoUrl,
      audioUrl: voice.audioUrl,
      mode: input.mode,
    });
    console.log(`[pipeline] lipsync: provider=${synced.provider}`);

    // ── Step 5: Final render (passthrough in V1) ──────────────────────
    const rendered = await renderFinal({
      syncedVideoUrl: synced.syncedVideoUrl,
      audioUrl: voice.audioUrl,
      captionStyle: input.captionStyle,
      platform: input.platform,
    });
    console.log(`[pipeline] render: provider=${rendered.provider}`);

    // ── Step 6: Storage upload ────────────────────────────────────────
    const id = `vid_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const filename = `${id}.mp4`;
    const stored = await uploadVideo(rendered.finalVideoUrl, filename);
    console.log(`[pipeline] storage: provider=${stored.provider}`);

    // Compose the database-ready record. Fields match the Supabase
    // video_generations table 1:1.
    const record: VideoGeneration = {
      id,
      // TODO: replace with auth.uid() once Supabase Auth is wired up.
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

    // Persist to the shared workspace so both partners see this video in
    // their gallery. Failure is non-fatal — the client still gets its
    // record back and the file still exists in storage.
    await insertVideoGeneration(record);

    const totalMs = Date.now() - startedAt;
    console.log(`[pipeline] done in ${totalMs}ms`);

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
