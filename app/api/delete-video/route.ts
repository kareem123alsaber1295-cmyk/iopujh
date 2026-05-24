// Removes a single video generation from the shared partner workspace.
// Called by the dashboard when a user clicks Delete on a video card.
// Note: this does NOT delete the underlying file from Supabase Storage —
// that's intentional for now so a delete can be undone if needed. We
// can wire up a hard delete later.

import { NextRequest, NextResponse } from "next/server";
import { deleteVideoGeneration } from "@/lib/database";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { id } = await req.json();
  if (typeof id !== "string" || !id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  const ok = await deleteVideoGeneration(id);
  return NextResponse.json({ ok });
}
