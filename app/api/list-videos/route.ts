// Returns every video generation in the shared partner workspace,
// newest first. Used by the dashboard to populate the gallery on
// mount instead of reading from per-browser localStorage.

import { NextResponse } from "next/server";
import { listVideoGenerations } from "@/lib/database";

export const runtime = "nodejs";

export async function GET() {
  const videos = await listVideoGenerations();
  return NextResponse.json(videos);
}
