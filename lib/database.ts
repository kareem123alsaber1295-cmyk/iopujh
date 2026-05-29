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
//
// In-flight ("generating") rows are filtered out so the partner gallery
// only ever shows finished or terminally-failed videos. The "generating"
// state is owned by the originating browser tab, which is already showing
// it via the progress UI.
export async function listVideoGenerations(): Promise<VideoGeneration[]> {
  const config = getConfig();
  if (!config) return [];

  try {
    const res = await fetch(
      `${config.url}/rest/v1/${TABLE}?status=in.(completed,failed)&order=created_at.desc&limit=200`,
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

// Fetch a single generation by id. Returns null if not found or Supabase
// isn't configured. Used by the status polling endpoint to look up the
// pending record for an in-flight Seedance job.
export async function getVideoGeneration(id: string): Promise<VideoGeneration | null> {
  const config = getConfig();
  if (!config) return null;

  try {
    const res = await fetch(
      `${config.url}/rest/v1/${TABLE}?id=eq.${encodeURIComponent(id)}&limit=1`,
      { headers: headers(config.key) },
    );
    if (!res.ok) {
      console.error(`[db] get returned ${res.status}: ${await res.text()}`);
      return null;
    }
    const rows = (await res.json()) as VideoGeneration[];
    return rows[0] ?? null;
  } catch (err) {
    console.error("[db] get threw:", err);
    return null;
  }
}

// Patch a record in place. Used when a pending Seedance job completes and
// we need to flip status to "completed" and fill in the final URLs.
export async function updateVideoGeneration(
  id: string,
  updates: Partial<VideoGeneration>,
): Promise<boolean> {
  const config = getConfig();
  if (!config) return false;

  try {
    const res = await fetch(
      `${config.url}/rest/v1/${TABLE}?id=eq.${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: { ...headers(config.key), Prefer: "return=minimal" },
        body: JSON.stringify(updates),
      },
    );
    if (!res.ok) {
      console.error(`[db] update returned ${res.status}: ${await res.text()}`);
      return false;
    }
    console.log(`[db] updated ${id}`);
    return true;
  } catch (err) {
    console.error("[db] update threw:", err);
    return false;
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
