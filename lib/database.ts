// Supabase Postgres helpers for the video_generations table.
//
// We talk to Supabase via PostgREST (the auto-generated REST layer) rather
// than the @supabase/supabase-js SDK to avoid adding a dependency. Each
// helper falls back to a no-op when env vars are missing so the system
// keeps working in pure-mock mode without database access.

import type { VideoGeneration } from "./videoPipeline";

const TABLE = "video_generations";

function getConfig(): { url: string; key: string } | null {
  const rawUrl = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!rawUrl || !key) return null;
  try {
    return { url: new URL(rawUrl).origin, key };
  } catch {
    return null;
  }
}

function headers(key: string): Record<string, string> {
  return {
    "apikey": key,
    "Authorization": `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

// Insert a new generation record. Returns true on success, false if the
// insert failed or Supabase is not configured. Failure never blocks the
// pipeline — the client still gets its record back, it just won't be
// visible to the partner until the next successful insert.
export async function insertVideoGeneration(record: VideoGeneration): Promise<boolean> {
  const config = getConfig();
  if (!config) {
    console.log("[db] Supabase not configured — skipping insert");
    return false;
  }

  try {
    const res = await fetch(`${config.url}/rest/v1/${TABLE}`, {
      method: "POST",
      headers: { ...headers(config.key), Prefer: "return=minimal" },
      body: JSON.stringify(record),
    });
    if (!res.ok) {
      console.error(`[db] insert returned ${res.status}: ${await res.text()}`);
      return false;
    }
    console.log(`[db] inserted ${record.id}`);
    return true;
  } catch (err) {
    console.error("[db] insert threw:", err);
    return false;
  }
}

// Fetch all generations, newest first. Returns an empty array if Supabase
// isn't configured or the query fails — callers should handle that as
// "no shared history yet" rather than as an error.
export async function listVideoGenerations(): Promise<VideoGeneration[]> {
  const config = getConfig();
  if (!config) return [];

  try {
    const res = await fetch(
      `${config.url}/rest/v1/${TABLE}?order=created_at.desc&limit=200`,
      { headers: headers(config.key) },
    );
    if (!res.ok) {
      console.error(`[db] list returned ${res.status}: ${await res.text()}`);
      return [];
    }
    return (await res.json()) as VideoGeneration[];
  } catch (err) {
    console.error("[db] list threw:", err);
    return [];
  }
}

// Delete a single generation by id.
export async function deleteVideoGeneration(id: string): Promise<boolean> {
  const config = getConfig();
  if (!config) return false;

  try {
    const res = await fetch(
      `${config.url}/rest/v1/${TABLE}?id=eq.${encodeURIComponent(id)}`,
      { method: "DELETE", headers: headers(config.key) },
    );
    if (!res.ok) {
      console.error(`[db] delete returned ${res.status}: ${await res.text()}`);
      return false;
    }
    console.log(`[db] deleted ${id}`);
    return true;
  } catch (err) {
    console.error("[db] delete threw:", err);
    return false;
  }
}
