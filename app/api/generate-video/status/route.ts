// Poll endpoint for in-flight Seedance jobs.
//
// The /api/generate-video POST kicks off a Seedance job and persists a
// "generating" row with the fal.ai request_id stashed in raw_video_url
// behind a "seedance:" prefix. The client then polls this endpoint every
// few seconds with ?id=<row_id> until the status flips to "completed" or
// "failed".
//
// When Seedance reports COMPLETED, we run the remaining synchronous-ish
// pipeline steps (lipsync, render, storage) inside this same poll request,
// then update the row. That means the client's final poll call is the one
// that actually pays for the assembly — usually a few seconds, well under
// the 60s function ceiling now that the slow Seedance wait is gone.

import { NextRequest, NextResponse } from "next/server";
import { checkSeedance } from "@/lib/generateVideo";
import { lipSync } from "@/lib/lipSync";
import { renderFinal } from "@/lib/renderFinal";
import { uploadVideo } from "@/lib/storage";
import { getVideoGeneration, updateVideoGeneration } from "@/lib/database";
import type { VideoGeneration } from "@/lib/videoPipeline";

export const runtime = "nodejs";
export const maxDuration = 60;

const SEEDANCE_PENDING_PREFIX = "seedance:";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id query param" }, { status: 400 });
  }

  const record = await getVideoGeneration(id);
  if (!record) {
    return NextResponse.json({ error: `No record with id=${id}` }, { status: 404 });
  }

  // Already finished — just return the record so the client stops polling.
  if (record.status === "completed" || record.status === "failed") {
    return NextResponse.json(record);
  }

  // Recover the fal.ai request_id we stashed in raw_video_url during submit.
  if (!record.raw_video_url?.startsWith(SEEDANCE_PENDING_PREFIX)) {
    console.error(`[status] record ${id} has no seedance request_id in raw_video_url`);
    await updateVideoGeneration(id, { status: "failed" });
    return NextResponse.json({ ...record, status: "failed" });
  }
  const requestId = record.raw_video_url.slice(SEEDANCE_PENDING_PREFIX.length);

  const job = await checkSeedance(requestId);

  if (job.status === "pending") {
    // Still rendering — tell the client to keep polling.
    return NextResponse.json({ id, status: "generating" });
  }

  if (job.status === "failed") {
    console.error(`[status] Seedance job ${requestId} failed: ${job.error}`);
    await updateVideoGeneration(id, { status: "failed" });
    return NextResponse.json({ ...record, status: "failed" });
  }

  // job.status === "completed" — finish the rest of the pipeline.
  console.log(`[status] Seedance ${requestId} completed, finishing pipeline for ${id}`);

  try {
    const synced = await lipSync({
      videoUrl: job.videoUrl,
      audioUrl: record.voice_url,
      mode: record.mode,
    });
    console.log(`[status] lipsync: provider=${synced.provider}`);

    const rendered = await renderFinal({
      syncedVideoUrl: synced.syncedVideoUrl,
      audioUrl: record.voice_url,
      // captionStyle isn't persisted on the pending record — pass a sensible
      // default. (Caption rendering is passthrough today anyway.)
      captionStyle: "Bold pop-out",
      platform: record.platform,
    });
    console.log(`[status] render: provider=${rendered.provider}`);

    const stored = await uploadVideo(rendered.finalVideoUrl, `${id}.mp4`);
    console.log(`[status] storage: provider=${stored.provider}`);

    const completed: VideoGeneration = {
      ...record,
      raw_video_url: job.videoUrl,
      final_video_url: stored.publicUrl,
      status: "completed",
    };

    await updateVideoGeneration(id, {
      raw_video_url: completed.raw_video_url,
      final_video_url: completed.final_video_url,
      status: "completed",
    });

    return NextResponse.json(completed);
  } catch (err) {
    console.error(`[status] post-Seedance assembly failed for ${id}:`, err);
    await updateVideoGeneration(id, { status: "failed" });
    return NextResponse.json(
      { ...record, status: "failed", error: String(err) },
      { status: 500 },
    );
  }
}
