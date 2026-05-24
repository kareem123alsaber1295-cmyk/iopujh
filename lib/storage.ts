// Step 6: Storage.
//
// Persists the final video to Supabase Storage so the generation record
// has a stable public URL that won't expire (Sync Labs / fal.ai output
// URLs are short-lived). If Supabase env vars are missing, returns the
// source URL unchanged — the gallery still works, the URL just isn't
// owned by us.

export interface UploadResult {
  publicUrl: string;
  provider: "supabase" | "mock";
}

// Bucket name we expect to exist in Supabase Storage. Must be public-read.
// TODO: create this bucket via the Supabase dashboard or a migration.
const BUCKET = "video-generations";

export async function uploadVideo(sourceUrl: string, filename: string): Promise<UploadResult> {
  const rawUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!rawUrl || !serviceKey) {
    console.log("[storage] Supabase env vars not set — using mock (passthrough source URL)");
    return { publicUrl: sourceUrl, provider: "mock" };
  }

  // Normalise the URL down to just the origin. Supabase's dashboard shows a
  // few different URLs (Project URL, REST URL, GraphQL URL); users sometimes
  // grab one with a /rest/v1 suffix. Using .origin gives us the canonical
  // "https://<project>.supabase.co" no matter which one they pasted.
  let url: string;
  try {
    url = new URL(rawUrl).origin;
  } catch {
    console.error("[storage] SUPABASE_URL is not a valid URL, falling back to mock");
    return { publicUrl: sourceUrl, provider: "mock" };
  }

  console.log(`[storage] uploading ${filename} to Supabase`);

  try {
    return await uploadToSupabase(url, serviceKey, sourceUrl, filename);
  } catch (err) {
    console.warn("[storage] Supabase upload failed once, retrying:", err);
    try {
      return await uploadToSupabase(url, serviceKey, sourceUrl, filename);
    } catch (err2) {
      console.error("[storage] Supabase upload failed twice, falling back to source URL:", err2);
      return { publicUrl: sourceUrl, provider: "mock" };
    }
  }
}

async function uploadToSupabase(
  supabaseUrl: string,
  serviceKey: string,
  sourceUrl: string,
  filename: string,
): Promise<UploadResult> {
  // Pull the bytes from wherever the synced video lives.
  // TODO: switch to streaming once we move long renders to a background worker.
  // Some CDNs (e.g. Google's commondatastorage) reject fetches without a
  // browser-like User-Agent, so we send one explicitly.
  const fetchRes = await fetch(sourceUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; LaunchLabs-VideoPipeline/1.0)",
    },
  });
  if (!fetchRes.ok) {
    throw new Error(`Failed to fetch source video: ${fetchRes.status}`);
  }
  const buffer = await fetchRes.arrayBuffer();

  // POST the bytes to Supabase Storage's REST endpoint. We use the service
  // role key (server-side only — never exposed to the browser) so the upload
  // succeeds regardless of bucket RLS policies.
  const uploadUrl = `${supabaseUrl}/storage/v1/object/${BUCKET}/${filename}`;
  const uploadRes = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${serviceKey}`,
      "Content-Type": "video/mp4",
      "x-upsert": "true",
    },
    body: buffer,
  });

  if (!uploadRes.ok) {
    throw new Error(`Supabase upload returned ${uploadRes.status}: ${await uploadRes.text()}`);
  }

  // Public URL pattern for a public bucket. If the bucket isn't public,
  // signed URLs would go here instead.
  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${filename}`;
  return { publicUrl, provider: "supabase" };
}
