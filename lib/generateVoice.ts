// Step 2: Voice generation (the source of truth for downstream timing).
//
// Calls ElevenLabs text-to-speech if ELEVENLABS_API_KEY is set; otherwise
// returns a mock that lets the rest of the pipeline proceed unchanged.
// The audio buffer / URL produced here is what Sync Labs uses to align
// the talking lips in step 4.

export interface VoiceResult {
  // Public URL of the generated audio, OR null when running in mock mode.
  audioUrl: string | null;
  // Best estimate of audio duration in seconds. Real APIs return this in
  // their response; mock mode uses a word-rate estimate.
  durationSeconds: number;
  // Which provider actually ran (for logging / debugging).
  provider: "elevenlabs" | "mock";
}

export interface VoiceInput {
  script: string;
  voiceStyle: string;
  estimatedDurationSeconds: number;
}

// Map our user-facing voice style labels → ElevenLabs voice IDs.
// TODO: surface these in the dashboard so users can A/B between voices.
// Reference: https://elevenlabs.io/voice-library
const ELEVENLABS_VOICE_MAP: Record<string, string> = {
  "Warm female narrator":         "EXAVITQu4vr4xnSDxMaL", // Bella
  "Confident male narrator":      "VR6AewLTigWG4xSOukaG", // Arnold
  "Hype TikTok voice":            "MF3mGyEYCl7XYWbV9V6O", // Elli
  "Calm ASMR delivery":           "ThT5KcBeYPX3keUQqHPh", // Dorothy
  "Documentary voiceover":        "29vD33N1CtxCmqQRPOHJ", // Drew
  "Founder-style conversational": "pNInz6obpgDQGcFmaJgB", // Adam
};

const DEFAULT_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";

export async function generateVoice(input: VoiceInput): Promise<VoiceResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    console.log("[voice] ELEVENLABS_API_KEY not set — using mock");
    return mockVoice(input);
  }

  const voiceId = ELEVENLABS_VOICE_MAP[input.voiceStyle] ?? DEFAULT_VOICE_ID;
  console.log(`[voice] generating with ElevenLabs voiceId=${voiceId}`);

  try {
    return await callElevenLabs(apiKey, voiceId, input);
  } catch (err) {
    console.warn("[voice] ElevenLabs failed once, retrying:", err);
    try {
      return await callElevenLabs(apiKey, voiceId, input);
    } catch (err2) {
      console.error("[voice] ElevenLabs failed twice, falling back to mock:", err2);
      return mockVoice(input);
    }
  }
}

async function callElevenLabs(apiKey: string, voiceId: string, input: VoiceInput): Promise<VoiceResult> {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "Accept": "audio/mpeg",
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      text: input.script,
      model_id: "eleven_turbo_v2_5",
      voice_settings: {
        stability: 0.55,
        similarity_boost: 0.75,
        style: 0.35,
        use_speaker_boost: true,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`ElevenLabs returned ${res.status}: ${await res.text()}`);
  }

  // ElevenLabs streams audio bytes; we collect them into a buffer.
  // TODO: pipe directly to Supabase Storage instead of buffering in memory
  // once the upload step lands — we currently hold the full audio file in
  // RAM, which is fine for short ad reads but not for long-form.
  const audioBuffer = await res.arrayBuffer();

  // For the immediate pipeline we don't need a public URL — Sync Labs can
  // accept a base64 / signed URL. The orchestrator uploads to Supabase
  // Storage in the storage step and the public URL gets baked into the
  // VideoGeneration record there.
  const base64 = Buffer.from(audioBuffer).toString("base64");
  const dataUrl = `data:audio/mpeg;base64,${base64}`;

  // ElevenLabs response doesn't include explicit duration; rough estimate
  // is fine — the visible duration comes from the final synced video.
  const wordCount = input.script.split(/\s+/).filter(Boolean).length;
  const durationSeconds = Math.max(2, Math.round(wordCount / 2.6));

  return {
    audioUrl: dataUrl,
    durationSeconds,
    provider: "elevenlabs",
  };
}

function mockVoice(input: VoiceInput): VoiceResult {
  return {
    audioUrl: null,
    durationSeconds: input.estimatedDurationSeconds,
    provider: "mock",
  };
}
