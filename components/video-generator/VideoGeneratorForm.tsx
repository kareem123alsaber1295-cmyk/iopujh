"use client";
import { useRef } from "react";
import { Upload, X, Wand2, Sparkles, Image as ImageIcon } from "lucide-react";
import {
  VIDEO_MODES,
  VIDEO_DURATIONS,
  VIDEO_PLATFORMS,
  CHARACTER_STYLES,
  SETTINGS,
  VOICE_STYLES,
  CAPTION_STYLES,
  type VideoGenerationInput,
  type VideoMode,
  type VideoPlatform,
  type VideoDuration,
} from "@/lib/videoPipeline";

interface Props {
  value: VideoGenerationInput;
  onChange: (next: VideoGenerationInput) => void;
  onGenerate: () => void;
  disabled?: boolean;
  errors?: string[];
}

export default function VideoGeneratorForm({ value, onChange, onGenerate, disabled, errors }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  function update<K extends keyof VideoGenerationInput>(key: K, v: VideoGenerationInput[K]) {
    onChange({ ...value, [key]: v });
  }

  function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update("productImage", reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <aside className="space-y-4">
      <div className="bg-card border border-border rounded-2xl p-5 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm">Video Brief</h2>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            Required fields ★
          </span>
        </div>

        {/* Product image */}
        <Field label="Product image" required>
          {value.productImage ? (
            <div className="relative group">
              <img
                src={value.productImage}
                alt=""
                className="w-full h-36 object-cover rounded-xl border border-border"
              />
              <button
                type="button"
                onClick={() => update("productImage", null)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full h-28 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span className="text-xs">Click to upload product image</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onImage} />
        </Field>

        {/* Product name */}
        <Field label="Product name" required>
          <input
            value={value.productName}
            onChange={(e) => update("productName", e.target.value)}
            placeholder="GlowSkin Vitamin C Serum"
            className="form-input"
          />
        </Field>

        {/* Script */}
        <Field label="Script" required>
          <textarea
            value={value.script}
            onChange={(e) => update("script", e.target.value)}
            placeholder="Paste or write the script the creator will deliver..."
            rows={6}
            className="form-input"
          />
          <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug">
            We&apos;ll time, voice, and caption this for you.
          </p>
        </Field>

        {/* Mode */}
        <Field label="Video mode" required>
          <div className="grid grid-cols-1 gap-2">
            {VIDEO_MODES.map((m) => {
              const active = value.mode === m;
              return (
                <button
                  type="button"
                  key={m}
                  onClick={() => update("mode", m as VideoMode)}
                  className={`text-xs font-medium px-3 py-2.5 rounded-lg border text-left transition-all ${
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </Field>

        {/* Duration */}
        <Field label="Duration">
          <div className="grid grid-cols-3 gap-2">
            {VIDEO_DURATIONS.map((d) => {
              const active = value.duration === d;
              return (
                <button
                  type="button"
                  key={d}
                  onClick={() => update("duration", d as VideoDuration)}
                  className={`text-xs font-medium px-3 py-2 rounded-lg border transition-all ${
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </Field>

        {/* Platform */}
        <Field label="Platform">
          <div className="grid grid-cols-2 gap-2">
            {VIDEO_PLATFORMS.map((p) => {
              const active = value.platform === p;
              return (
                <button
                  type="button"
                  key={p}
                  onClick={() => update("platform", p as VideoPlatform)}
                  className={`text-xs font-medium px-3 py-2 rounded-lg border transition-all ${
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </Field>

        {/* Character style */}
        <Field label="Character style">
          <select
            value={value.characterStyle}
            onChange={(e) => update("characterStyle", e.target.value)}
            className="form-input"
          >
            {CHARACTER_STYLES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>

        {/* Setting */}
        <Field label="Setting">
          <select
            value={value.setting}
            onChange={(e) => update("setting", e.target.value)}
            className="form-input"
          >
            {SETTINGS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>

        {/* Voice style */}
        <Field label="Voice style">
          <select
            value={value.voiceStyle}
            onChange={(e) => update("voiceStyle", e.target.value)}
            className="form-input"
          >
            {VOICE_STYLES.map((v) => <option key={v}>{v}</option>)}
          </select>
        </Field>

        {/* Caption style */}
        <Field label="Caption style">
          <select
            value={value.captionStyle}
            onChange={(e) => update("captionStyle", e.target.value)}
            className="form-input"
          >
            {CAPTION_STYLES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>

        {errors && errors.length > 0 && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 space-y-1">
            {errors.map((e) => (
              <div key={e} className="flex items-center gap-2 text-xs text-rose-700">
                <ImageIcon className="h-3.5 w-3.5 shrink-0" />
                {e}
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onGenerate}
          disabled={disabled}
          className="w-full gradient-bg text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {disabled ? (
            <>
              <Sparkles className="h-4 w-4 animate-pulse" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              Generate Video
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 text-foreground/80">
        {label}{required && <span className="text-primary ml-0.5">★</span>}
      </label>
      {children}
    </div>
  );
}
