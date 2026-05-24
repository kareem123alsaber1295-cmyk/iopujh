"use client";
import { useEffect, useRef, useState } from "react";
import { Video } from "lucide-react";
import VideoGeneratorForm from "@/components/video-generator/VideoGeneratorForm";
import GenerationProgress from "@/components/video-generator/GenerationProgress";
import VideoGallery from "@/components/video-generator/VideoGallery";
import {
  runVideoPipeline,
  PIPELINE_STAGES,
  CHARACTER_STYLES,
  SETTINGS,
  VOICE_STYLES,
  CAPTION_STYLES,
  type VideoGeneration,
  type VideoGenerationInput,
} from "@/lib/videoPipeline";

const STORAGE_KEY = "launchlabs_video_generations_v1";

const DEFAULT_FORM: VideoGenerationInput = {
  productImage: null,
  productName: "",
  script: "",
  mode: "Hybrid UGC",
  duration: "15 sec",
  platform: "TikTok",
  characterStyle: CHARACTER_STYLES[0],
  setting: SETTINGS[0],
  voiceStyle: VOICE_STYLES[0],
  captionStyle: CAPTION_STYLES[0],
};

export default function VideoAdsPage() {
  const [form, setForm] = useState<VideoGenerationInput>(DEFAULT_FORM);
  const [generations, setGenerations] = useState<VideoGeneration[]>([]);
  const [stage, setStage] = useState<number | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const hydratedRef = useRef(false);

  // Hydrate from localStorage on mount. Future: replace with a Supabase
  // `SELECT * FROM video_generations WHERE user_id = auth.uid()` query.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setGenerations(JSON.parse(raw));
    } catch {
      // Ignore corrupted storage; user will start fresh.
    }
    hydratedRef.current = true;
  }, []);

  // Persist whenever generations change (after initial hydration).
  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(generations));
    } catch {
      // Quota errors are non-fatal for the mock flow.
    }
  }, [generations]);

  function validate(input: VideoGenerationInput): string[] {
    const errs: string[] = [];
    if (!input.productImage) errs.push("Product image is required");
    if (!input.productName.trim()) errs.push("Product name is required");
    if (!input.script.trim()) errs.push("Script is required");
    if (!input.mode) errs.push("Pick a video mode");
    return errs;
  }

  async function handleGenerate(input: VideoGenerationInput = form) {
    const errs = validate(input);
    setErrors(errs);
    if (errs.length > 0) return;

    setStage(0);
    try {
      const result = await runVideoPipeline(input, (i) => setStage(i));
      // Hold on the final stage for a beat so the user sees "Saving..." complete.
      setStage(PIPELINE_STAGES.length - 1);
      await new Promise((r) => setTimeout(r, 300));
      setGenerations((prev) => [result, ...prev]);
    } finally {
      setStage(null);
    }
  }

  function handleRegenerate(g: VideoGeneration) {
    // Reuse the saved generation's settings and run the pipeline again.
    const input: VideoGenerationInput = {
      productImage: g.product_image_url,
      productName: g.product_name,
      script: g.script,
      mode: g.mode,
      duration: g.duration,
      platform: g.platform,
      // Style fields aren't currently stored on VideoGeneration — fall back
      // to whatever is in the form right now or defaults.
      characterStyle: form.characterStyle,
      setting: form.setting,
      voiceStyle: g.voice_style || form.voiceStyle,
      captionStyle: form.captionStyle,
    };
    setForm(input);
    handleGenerate(input);
  }

  function handleDelete(id: string) {
    setGenerations((prev) => prev.filter((g) => g.id !== id));
  }

  const isGenerating = stage !== null;

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm mb-1">Creative Suite</p>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Video className="h-6 w-6 text-primary" />
            Video Generator
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Turn a script and a product image into a finished ad — voiced, captioned, and ready to post.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-6 items-start">
        {/* LEFT: Form */}
        <VideoGeneratorForm
          value={form}
          onChange={setForm}
          onGenerate={() => handleGenerate()}
          disabled={isGenerating}
          errors={errors}
        />

        {/* RIGHT: Progress (while generating) + Gallery */}
        <section className="min-w-0 space-y-6">
          {isGenerating && stage !== null && <GenerationProgress stage={stage} />}

          {!isGenerating && (
            <VideoGallery
              generations={generations}
              onRegenerate={handleRegenerate}
              onDelete={handleDelete}
            />
          )}
        </section>
      </div>

      <style jsx global>{`
        .form-input {
          width: 100%;
          padding: 0.55rem 0.75rem;
          border-radius: 0.75rem;
          border: 1px solid var(--input);
          background: var(--background);
          font-size: 0.875rem;
          transition: all 0.15s;
        }
        .form-input:focus {
          outline: none;
          border-color: var(--ring);
          box-shadow: 0 0 0 3px color-mix(in oklch, var(--ring) 20%, transparent);
        }
        textarea.form-input { resize: vertical; min-height: 60px; }
      `}</style>
    </div>
  );
}
