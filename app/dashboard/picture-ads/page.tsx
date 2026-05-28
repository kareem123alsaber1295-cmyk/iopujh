"use client";
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Camera, Loader2, AlertCircle, Sparkles, RefreshCw,
  Upload, X, ImageIcon, Package, Target, Zap, Leaf, Layers,
  ArrowLeftRight, ChevronLeft, ChevronRight,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const IMAGE_FORMATS = [
  { value: "square", label: "Square (1:1)", desc: "Meta Feed & TikTok" },
  { value: "portrait", label: "Portrait (4:5)", desc: "Instagram Feed" },
  { value: "story", label: "Story (9:16)", desc: "Stories & Reels" },
  { value: "landscape", label: "Landscape (16:9)", desc: "YouTube & Meta Banner" },
];

const GENERATION_MODES = [
  { value: "luxury", label: "Luxury Ad", icon: Sparkles, color: "from-amber-500/15 to-yellow-500/15", ring: "ring-amber-500/40", text: "text-amber-400" },
  { value: "studio", label: "Studio Shot", icon: Camera, color: "from-slate-500/15 to-gray-500/15", ring: "ring-slate-400/40", text: "text-slate-400" },
  { value: "amazon", label: "Amazon", icon: Package, color: "from-orange-500/15 to-yellow-500/15", ring: "ring-orange-500/40", text: "text-orange-400" },
  { value: "meta-ad", label: "Meta Ad", icon: Target, color: "from-blue-500/15 to-indigo-500/15", ring: "ring-blue-500/40", text: "text-blue-400" },
  { value: "tiktok", label: "TikTok", icon: Zap, color: "from-pink-500/15 to-fuchsia-500/15", ring: "ring-pink-500/40", text: "text-pink-400" },
  { value: "wellness", label: "Wellness", icon: Leaf, color: "from-emerald-500/15 to-green-500/15", ring: "ring-emerald-500/40", text: "text-emerald-400" },
  { value: "minimal", label: "Minimal", icon: Layers, color: "from-violet-500/15 to-purple-500/15", ring: "ring-violet-500/40", text: "text-violet-400" },
];

const ANGLES = ["Hero Shot", "Lifestyle Context", "Detail Close-up", "Ad Composition"];

const ANGLE_META = [
  { gradient: "from-indigo-500/20 to-violet-500/20", color: "#6366F1", desc: "Centered product, front-facing, studio lighting" },
  { gradient: "from-pink-500/20 to-rose-500/20", color: "#EC4899", desc: "Product in aspirational real-world setting" },
  { gradient: "from-amber-500/20 to-orange-500/20", color: "#F59E0B", desc: "Macro shot — texture, label, craftsmanship" },
  { gradient: "from-emerald-500/20 to-teal-500/20", color: "#10B981", desc: "Styled flat lay with space for headline overlay" },
];

const STRENGTH_LABELS = ["Preserve Structure", "Balanced", "Max Creativity"];

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImageState {
  angle: string;
  b64: string | null;
  loading: boolean;
  error: string | null;
}

// ─── Before/After Slider ──────────────────────────────────────────────────────

function BeforeAfterSlider({ before, after, alt }: { before: string; after: string; alt: string }) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  function onPointerMove(e: React.PointerEvent) {
    if (!(e.buttons & 1)) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setPos(pct);
  }

  return (
    <div
      ref={containerRef}
      className="relative select-none cursor-ew-resize overflow-hidden"
      onPointerMove={onPointerMove}
    >
      {/* Generated (after) — base layer */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`data:image/jpeg;base64,${after}`} alt={alt} className="w-full block" draggable={false} />

      {/* Original (before) — clipped left portion */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ width: `${pos}%` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={before}
          alt="Original reference"
          className="absolute inset-0 block"
          style={{ width: `${10000 / pos}%`, maxWidth: "none" }}
          draggable={false}
        />
      </div>

      {/* Divider */}
      <div
        className="absolute top-0 bottom-0 w-px bg-white/90 shadow-[0_0_8px_rgba(0,0,0,0.6)] pointer-events-none"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 bg-white rounded-full shadow-xl flex items-center justify-center">
          <ArrowLeftRight className="h-4 w-4 text-black" />
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-2 left-2 pointer-events-none">
        <span className="text-[10px] font-bold bg-black/70 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">ORIGINAL</span>
      </div>
      <div className="absolute bottom-2 right-2 pointer-events-none">
        <span className="text-[10px] font-bold gradient-bg text-white px-2 py-0.5 rounded-full">AI GENERATED</span>
      </div>

      {/* Invisible range input fallback for touch */}
      <input
        type="range" min="0" max="100" value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        className="absolute inset-0 opacity-0 w-full h-full"
        style={{ cursor: "ew-resize" }}
      />
    </div>
  );
}

// ─── Image Upload Zone ────────────────────────────────────────────────────────

function ImageUploadZone({
  preview,
  uploading,
  onFile,
  onClear,
}: {
  preview: string | null;
  uploading: boolean;
  onFile: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) onFile(file);
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1.5">
        Reference Product Image
        <span className="text-muted-foreground font-normal ml-1.5 text-xs">(guides structure & realism)</span>
      </label>

      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-border group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Reference product" className="w-full max-h-48 object-contain bg-secondary/30" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          <button
            onClick={onClear}
            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg transition-colors backdrop-blur-sm"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
              <div className="flex items-center gap-2 text-white text-sm font-medium">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading…
              </div>
            </div>
          )}
          {!uploading && (
            <div className="absolute bottom-2 left-2">
              <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                ✓ Reference ready
              </span>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
            dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-secondary/30"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Drop your product photo here</p>
            <p className="text-xs text-muted-foreground mt-0.5">or click to browse · PNG, JPG up to 10MB</p>
          </div>
          <p className="text-[11px] text-muted-foreground/60 text-center max-w-xs">
            AI will preserve shape, proportions, lighting & shadows — replacing only the branding
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PictureAdsPage() {
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [imageFormat, setImageFormat] = useState("square");
  const [generationMode, setGenerationMode] = useState("studio");
  const [strength, setStrength] = useState(0.5);

  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const [referenceUrl, setReferenceUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [images, setImages] = useState<ImageState[]>([]);

  const hasStarted = images.length > 0;
  const doneCount = images.filter((img) => !img.loading).length;
  const allDone = hasStarted && doneCount === images.length;

  // ── Image upload ────────────────────────────────────────────────────────────

  const handleFile = useCallback(async (file: File) => {
    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setReferencePreview(localUrl);
    setReferenceUrl(null);
    setUploading(true);

    try {
      // Resize to max 1024px to stay within request limits
      const resized = await resizeImage(file, 1024);
      const b64 = resized.split(",")[1];
      const mimeType = resized.split(";")[0].split(":")[1];

      const res = await fetch("/api/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64: b64, mimeType }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setReferenceUrl(data.url);
    } catch (err) {
      console.error("[PictureAds] Upload error:", err);
      // Keep the preview but clear URL so generation falls back to text-to-image
      setReferenceUrl(null);
    } finally {
      setUploading(false);
    }
  }, []);

  function clearReference() {
    if (referencePreview) URL.revokeObjectURL(referencePreview);
    setReferencePreview(null);
    setReferenceUrl(null);
  }

  // ── Generation ──────────────────────────────────────────────────────────────

  async function fetchOne(angle: string, params: object): Promise<void> {
    try {
      const res = await fetch("/api/generate-product-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...params, angle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setImages((prev) =>
        prev.map((img) => img.angle === angle ? { ...img, b64: data.b64, loading: false, error: null } : img)
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed";
      setImages((prev) =>
        prev.map((img) => img.angle === angle ? { ...img, loading: false, error: msg } : img)
      );
    }
  }

  async function handleGenerate() {
    if (!productName.trim()) return;
    setGenerating(true);
    setImages(ANGLES.map((angle) => ({ angle, b64: null, loading: true, error: null })));

    const params = {
      productName: productName.trim(),
      productDescription: productDescription.trim(),
      targetAudience: targetAudience.trim(),
      imageType: imageFormat,
      generationMode,
      referenceImageUrl: referenceUrl || null,
      strength,
    };

    await Promise.all(ANGLES.map((angle) => fetchOne(angle, params)));
    setGenerating(false);
  }

  function downloadImage(b64: string, angle: string) {
    const a = document.createElement("a");
    a.href = `data:image/jpeg;base64,${b64}`;
    a.download = `${productName.replace(/\s+/g, "-").toLowerCase()}-${angle.replace(/\s+/g, "-").toLowerCase()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  const selectedMode = GENERATION_MODES.find((m) => m.value === generationMode)!;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-muted-foreground text-sm mb-1">Creative Suite</p>
        <h1 className="text-2xl font-bold tracking-tight">AI Product Photo Generator</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload your product · Choose a style · Get ecommerce-ready photos that preserve your real packaging
        </p>
      </div>

      {/* Form */}
      <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 mb-6">
        {/* Reference Image Upload */}
        <ImageUploadZone
          preview={referencePreview}
          uploading={uploading}
          onFile={handleFile}
          onClear={clearReference}
        />

        {/* Generation Mode */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Generation Mode</label>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
            {GENERATION_MODES.map((mode) => (
              <button
                key={mode.value}
                onClick={() => setGenerationMode(mode.value)}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all text-center ${
                  generationMode === mode.value
                    ? `bg-gradient-to-br ${mode.color} border-primary/30 ring-1 ${mode.ring}`
                    : "border-border hover:border-border/80 hover:bg-secondary/30"
                }`}
              >
                <mode.icon className={`h-4 w-4 ${generationMode === mode.value ? mode.text : "text-muted-foreground"}`} />
                <span className={`text-[10px] font-semibold leading-tight ${generationMode === mode.value ? mode.text : "text-muted-foreground"}`}>
                  {mode.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Product Name + Audience */}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Product Name <span className="text-red-400">*</span>
            </label>
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Vitamin C Glow Serum"
              className="w-full h-10 px-3.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Target Audience</label>
            <input
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. Women 25–40 with sensitive skin"
              className="w-full h-10 px-3.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1.5">
            Product Description
            <span className="text-muted-foreground font-normal ml-1 text-xs">(improves accuracy)</span>
          </label>
          <textarea
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            placeholder="e.g. Glass dropper bottle, orange-tinted serum, minimalist white label, gold metallic cap"
            rows={2}
            className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
          />
        </div>

        {/* Image Format + Strength */}
        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Image Format</label>
            <select
              value={imageFormat}
              onChange={(e) => setImageFormat(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            >
              {IMAGE_FORMATS.map((f) => (
                <option key={f.value} value={f.value}>{f.label} — {f.desc}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Image Strength
              <span className="text-muted-foreground font-normal ml-1.5 text-xs">
                {strength < 0.35 ? "Preserve structure" : strength < 0.65 ? "Balanced" : "Max creativity"}
              </span>
            </label>
            <div className="flex items-center gap-3 h-10">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Structure</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={strength}
                onChange={(e) => setStrength(Number(e.target.value))}
                className="flex-1 accent-primary"
              />
              <span className="text-xs text-muted-foreground whitespace-nowrap">Creative</span>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={generating || !productName.trim() || uploading}
          className="w-full gradient-bg text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating… {doneCount} of {ANGLES.length} ready
            </>
          ) : allDone ? (
            <>
              <RefreshCw className="h-4 w-4" />
              Regenerate Photos
            </>
          ) : (
            <>
              <selectedMode.icon className="h-4 w-4" />
              Generate {selectedMode.label} Photos
            </>
          )}
        </button>
      </div>

      {/* Results Grid */}
      <div className="grid sm:grid-cols-2 gap-5">
        {hasStarted
          ? images.map((img, i) => (
              <motion.div
                key={img.angle}
                className="bg-card border border-border rounded-2xl overflow-hidden group hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                {img.loading ? (
                  <>
                    <div className="h-56 bg-secondary relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_1.5s_infinite]" />
                    </div>
                    <div className="p-4 flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{img.angle}</p>
                        <p className="text-xs text-muted-foreground">Generating with FLUX Kontext…</p>
                      </div>
                    </div>
                  </>
                ) : img.error ? (
                  <>
                    <div className="h-56 bg-red-50 dark:bg-red-900/10 flex items-center justify-center">
                      <div className="text-center px-6">
                        <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                        <p className="text-xs text-red-500 font-medium">Generation failed</p>
                        <p className="text-xs text-red-400 mt-1 break-all">{img.error}</p>
                      </div>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-sm font-semibold">{img.angle}</p>
                    </div>
                  </>
                ) : img.b64 ? (
                  <>
                    {/* Before/After when reference exists, else plain image */}
                    {referencePreview ? (
                      <BeforeAfterSlider
                        before={referencePreview}
                        after={img.b64}
                        alt={`${productName} – ${img.angle}`}
                      />
                    ) : (
                      <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`data:image/jpeg;base64,${img.b64}`}
                          alt={`${productName} – ${img.angle}`}
                          className="w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        <div className="absolute top-3 left-3">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-sm">
                            {img.angle}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => downloadImage(img.b64!, img.angle)}
                            className="p-2 rounded-lg bg-black/60 text-white backdrop-blur-sm hover:bg-black/80 transition-colors"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">{img.angle}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{selectedMode.label} · {imageFormat}</p>
                      </div>
                      <button
                        onClick={() => downloadImage(img.b64!, img.angle)}
                        className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline shrink-0"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download JPG
                      </button>
                    </div>
                  </>
                ) : null}
              </motion.div>
            ))
          : ANGLES.map((angle, i) => (
              <motion.div
                key={angle}
                className="bg-card border border-border rounded-2xl overflow-hidden"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <div
                  className={`h-44 bg-gradient-to-br ${ANGLE_META[i].gradient} flex items-center justify-center relative`}
                >
                  <ImageIcon className="h-10 w-10 opacity-20" style={{ color: ANGLE_META[i].color }} />
                  <div className="absolute top-3 left-3">
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
                      style={{ backgroundColor: ANGLE_META[i].color }}
                    >
                      {angle}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold mb-1">{angle}</p>
                  <p className="text-xs text-muted-foreground">{ANGLE_META[i].desc}</p>
                </div>
              </motion.div>
            ))}
      </div>

      {!hasStarted && (
        <div className="flex items-start gap-3 mt-5 p-4 bg-secondary/30 rounded-xl border border-border">
          <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">
              {referencePreview
                ? "Reference image ready — generation will preserve your product's exact structure"
                : "Upload a reference product photo for the most accurate ecommerce results"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              4 angle variations · FLUX Kontext image-to-image · ~25 sec per image
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resizeImage(file: File, maxPx: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = reject;
    img.src = url;
  });
}
