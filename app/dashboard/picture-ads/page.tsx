"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Camera, Loader2, AlertCircle, Sparkles, RefreshCw } from "lucide-react";

const IMAGE_FORMATS = [
  { value: "square", label: "Square (1:1)", desc: "Meta Feed & TikTok" },
  { value: "portrait", label: "Portrait (4:5)", desc: "Instagram Feed" },
  { value: "story", label: "Story (9:16)", desc: "Stories & Reels" },
  { value: "landscape", label: "Landscape (16:9)", desc: "YouTube & Meta Banner" },
];

const BRAND_STYLES = [
  { value: "clean", label: "Clean & Minimal" },
  { value: "bold", label: "Bold & Colorful" },
  { value: "dark", label: "Dark Luxury" },
  { value: "natural", label: "Natural & Organic" },
];

const ANGLES = ["Hero Shot", "Lifestyle Context", "Detail Close-up", "Ad Composition"];

const ANGLE_COLORS = ["#6366F1", "#EC4899", "#F59E0B", "#10B981"];
const ANGLE_GRADIENTS = [
  "from-indigo-500/20 to-violet-500/20",
  "from-pink-500/20 to-rose-500/20",
  "from-amber-500/20 to-orange-500/20",
  "from-emerald-500/20 to-teal-500/20",
];
const ANGLE_DESCS = [
  "Centered product on clean background, front-facing, studio lighting",
  "Product in aspirational real-world setting, tells the customer story",
  "Macro shot highlighting texture, label, and premium craftsmanship",
  "Styled flat lay with negative space ready for headline overlay",
];

interface ImageState {
  angle: string;
  objectUrl: string | null;
  loading: boolean;
  error: string | null;
}

export default function PictureAdsPage() {
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [brandStyle, setBrandStyle] = useState("clean");
  const [targetAudience, setTargetAudience] = useState("");
  const [imageFormat, setImageFormat] = useState("square");
  const [generating, setGenerating] = useState(false);
  const [images, setImages] = useState<ImageState[]>([]);

  const hasStarted = images.length > 0;
  const allDone = hasStarted && images.every((img) => !img.loading);

  async function fetchOne(angle: string, params: object): Promise<void> {
    try {
      const res = await fetch("/api/generate-product-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...params, angle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      // Convert base64 to blob URL so browser renders it natively
      const binary = atob(data.b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: "image/png" });
      const objectUrl = URL.createObjectURL(blob);

      setImages((prev) =>
        prev.map((img) =>
          img.angle === angle ? { ...img, objectUrl, loading: false, error: null } : img
        )
      );
    } catch (err) {
      setImages((prev) =>
        prev.map((img) =>
          img.angle === angle
            ? { ...img, loading: false, error: err instanceof Error ? err.message : "Failed" }
            : img
        )
      );
    }
  }

  async function handleGenerate() {
    if (!productName.trim()) return;
    setGenerating(true);

    const initial: ImageState[] = ANGLES.map((angle) => ({
      angle,
      objectUrl: null,
      loading: true,
      error: null,
    }));
    setImages(initial);

    const params = {
      productName: productName.trim(),
      productDescription: productDescription.trim(),
      brandStyle,
      targetAudience: targetAudience.trim(),
      imageType: imageFormat,
    };

    await Promise.all(ANGLES.map((angle) => fetchOne(angle, params)));
    setGenerating(false);
  }

  function downloadImage(objectUrl: string, angle: string) {
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `${productName.replace(/\s+/g, "-").toLowerCase()}-${angle.replace(/\s+/g, "-").toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-muted-foreground text-sm mb-1">Creative Suite</p>
        <h1 className="text-2xl font-bold tracking-tight">Product Photo Generator</h1>
        <p className="text-muted-foreground text-sm mt-1">
          AI-generated ecommerce photography for Shopify, Meta ads, and TikTok
        </p>
      </div>

      {/* Form */}
      <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 mb-6">
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

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1.5">
            Product Description
            <span className="text-muted-foreground font-normal ml-1">(helps accuracy)</span>
          </label>
          <textarea
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            placeholder="e.g. Glass dropper bottle, orange-tinted serum, minimalist white label, gold metallic cap"
            rows={2}
            className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Brand Style</label>
            <select
              value={brandStyle}
              onChange={(e) => setBrandStyle(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            >
              {BRAND_STYLES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Image Format</label>
            <select
              value={imageFormat}
              onChange={(e) => setImageFormat(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            >
              {IMAGE_FORMATS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label} — {f.desc}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating || !productName.trim()}
          className="w-full gradient-bg text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating — images appear as each one finishes…
            </>
          ) : allDone ? (
            <>
              <RefreshCw className="h-4 w-4" />
              Regenerate Photos
            </>
          ) : (
            <>
              <Camera className="h-4 w-4" />
              Generate Product Photos
            </>
          )}
        </button>
      </div>

      {/* Grid */}
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
                    <div className="h-56 bg-secondary animate-pulse" />
                    <div className="p-4 flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Generating {img.angle}…</p>
                    </div>
                  </>
                ) : img.error ? (
                  <>
                    <div className="h-56 bg-secondary flex items-center justify-center">
                      <div className="text-center px-6">
                        <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                        <p className="text-xs text-red-400">{img.error}</p>
                      </div>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-sm font-semibold">{img.angle}</p>
                    </div>
                  </>
                ) : img.objectUrl ? (
                  <>
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.objectUrl}
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
                          onClick={() => downloadImage(img.objectUrl!, img.angle)}
                          className="p-2 rounded-lg bg-black/60 text-white backdrop-blur-sm hover:bg-black/80 transition-colors"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="px-4 py-3 flex items-center justify-between">
                      <p className="text-sm font-semibold">{img.angle}</p>
                      <button
                        onClick={() => downloadImage(img.objectUrl!, img.angle)}
                        className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download PNG
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
                  className={`h-44 bg-gradient-to-br ${ANGLE_GRADIENTS[i]} flex items-center justify-center relative`}
                >
                  <Camera className="h-10 w-10 opacity-20" style={{ color: ANGLE_COLORS[i] }} />
                  <div className="absolute top-3 left-3">
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
                      style={{ backgroundColor: ANGLE_COLORS[i] }}
                    >
                      {angle}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold mb-1">{angle}</p>
                  <p className="text-xs text-muted-foreground">{ANGLE_DESCS[i]}</p>
                </div>
              </motion.div>
            ))}
      </div>

      {!hasStarted && (
        <div className="flex items-center gap-2 mt-4">
          <Sparkles className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Fill in the form above and click Generate — 4 photos will appear one by one
          </p>
        </div>
      )}
    </div>
  );
}
