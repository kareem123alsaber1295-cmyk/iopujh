// Pure script processing. Cleans the raw script, splits it into UGC ad
// segments (hook / problem / solution / payoff), and estimates per-segment
// timing using a typical UGC-creator speech rate.
//
// Output of this step becomes the structural plan that the rest of the
// pipeline (voice → video → lip sync) honors. Audio is still the source
// of truth at render time, but these estimates drive the video prompt
// (e.g. how long the talking intro is for Hybrid mode).

export type SegmentRole = "hook" | "problem" | "solution" | "payoff";

export interface ScriptSegment {
  role: SegmentRole;
  text: string;
  estimatedSeconds: number;
}

export interface ProcessedScript {
  cleanedText: string;
  totalEstimatedSeconds: number;
  segments: ScriptSegment[];
}

// Approx UGC-creator speech rate. Real generated TTS comes back with a
// concrete duration we use afterwards; this is for pre-flight estimation only.
const WORDS_PER_SECOND = 2.6;

const ROLES_IN_ORDER: SegmentRole[] = ["hook", "problem", "solution", "payoff"];

export function processScript(script: string, targetDurationSeconds: number): ProcessedScript {
  const cleaned = cleanScript(script);
  const sentences = splitIntoSentences(cleaned);
  const segments = assignRolesAndTiming(sentences, targetDurationSeconds);
  const totalEstimatedSeconds = segments.reduce((s, x) => s + x.estimatedSeconds, 0);

  return { cleanedText: cleaned, totalEstimatedSeconds, segments };
}

function cleanScript(raw: string): string {
  return raw
    .replace(/\s+/g, " ")          // collapse whitespace
    .replace(/[""'']/g, '"')       // normalise smart quotes
    .replace(/—/g, " - ")          // em dash → spaced dash so TTS pauses
    .replace(/\s+([.,!?])/g, "$1") // tighten space-before-punct
    .trim();
}

function splitIntoSentences(text: string): string[] {
  // Greedy sentence split on terminal punctuation. Keeps the punctuation.
  const matches = text.match(/[^.!?]+[.!?]+|\S[^.!?]*$/g);
  return (matches ?? [text]).map((s) => s.trim()).filter(Boolean);
}

function assignRolesAndTiming(sentences: string[], targetDuration: number): ScriptSegment[] {
  if (sentences.length === 0) return [];

  // Bucket the sentences across the 4 roles. With short scripts (<4 sentences)
  // some roles collapse; with long scripts the middle roles get more sentences.
  const buckets: string[][] = [[], [], [], []];
  const perBucket = Math.max(1, Math.floor(sentences.length / ROLES_IN_ORDER.length));

  sentences.forEach((s, i) => {
    const idx = Math.min(Math.floor(i / perBucket), ROLES_IN_ORDER.length - 1);
    buckets[idx].push(s);
  });

  const wordsToSec = (words: number) => Math.max(1, Math.round(words / WORDS_PER_SECOND));

  const rawSegments = buckets
    .map((bucket, i) => {
      const text = bucket.join(" ").trim();
      if (!text) return null;
      const words = text.split(/\s+/).filter(Boolean).length;
      return {
        role: ROLES_IN_ORDER[i],
        text,
        estimatedSeconds: wordsToSec(words),
      };
    })
    .filter((x): x is ScriptSegment => x !== null);

  // Scale to fit target duration if estimate is way off.
  const estimated = rawSegments.reduce((s, x) => s + x.estimatedSeconds, 0);
  if (estimated > targetDuration * 1.5) {
    const scale = targetDuration / estimated;
    return rawSegments.map((s) => ({
      ...s,
      estimatedSeconds: Math.max(1, Math.round(s.estimatedSeconds * scale)),
    }));
  }

  return rawSegments;
}

// Convert a VideoDuration label like "15 sec" into a number we can math on.
export function parseDurationLabel(label: string): number {
  const match = label.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 15;
}
