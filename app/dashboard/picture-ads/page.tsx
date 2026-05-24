"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const CONCEPT_PLACEHOLDERS = [
  {
    title: "Hero Shot",
    desc: "Centered product on clean background, front-facing, studio lighting",
    gradient: "from-indigo-500/20 to-violet-500/20",
    accent: "#6366F1",
  },
  {
    title: "Lifestyle Context",
    desc: "Product in aspirational real-world setting, tells the customer story",
    gradient: "from-pink-500/20 to-rose-500/20",
    accent: "#EC4899",
  },
  {
    title: "Detail Close-up",
    desc: "Macro shot highlighting texture, label, and premium craftsmanship",
    gradient: "from-amber-500/20 to-orange-500/20",
    accent: "#F59E0B",
  },
  {
    title: "Ad Composition",
    desc: "Styled flat lay with negative space ready for headline overlay",
    gradient: "from-emerald-500/20 to-teal-500/20",
    accent: "#10B981",
  },
];

interface GeneratedImage {
  angle: string;
  b64: string | null;
}

export default function PictureAdsPage() {
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [brandStyle, setBrandStyle] = useState("clean");
  const [targetAudience, setTargetAudience] = useState("");
  const [imageFormat, setImageFormat] = useState("square");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<GeneratedImage[]>([]);

  async function handleGenerate() {
    if (!productName.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-product-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: productName.trim(),
          productDescription: productDescription.trim(),
          brandStyle,
          targetAudience: targetAudience.trim(),
          imageType: imageFormat,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      setImages(data.images as GeneratedImage[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  function downloadImage(b64: string, angle: string) {
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${b64}`;
    link.download = `${productName.replace(/\s+/g, "-").toLowerCase()}-${angle.replace(/\s+/g, "-").toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const hasImages = images.length > 0;

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
          disabled={loading || !productName.trim()}
          className="w-full gradient-bg text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating 4 photos — this takes ~20 seconds…
            </>
          ) : hasImages ? (
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

        {error && (
          <div className="mt-3 flex items-start gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2.5 rounded-xl">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid sm:grid-cols-2 gap-5"
          >
            {CONCEPT_PLACEHOLDERS.map((_, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-2xl overflow-hidden"
              >
                <div className="h-56 bg-secondary animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-24 bg-secondary animate-pulse rounded-full" />
                  <div className="h-3 w-40 bg-secondary animate-pulse rounded-full" />
                </div>
              </div>
            ))}
          </motion.div>
        ) : hasImages ? (
          <motion.div
            key="generated"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid sm:grid-cols-2 gap-5"
          >
            {images.map((img, i) => (
              <motion.div
                key={i}
                className="bg-card border border-border rounded-2xl overflow-hidden group hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                {img.b64 ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`data:image/png;base64,${img.b64}`}
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
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-56 bg-secondary flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Image unavailable</p>
                  </div>
                )}

                <div className="px-4 py-3 flex items-center justify-between">
                  <p className="text-sm font-semibold">{img.angle}</p>
                  {img.b64 && (
                    <button
                      onClick={() => downloadImage(img.b64!, img.angle)}
                      className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download PNG
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="placeholders"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground font-medium">
                4 photo styles will be generated — fill in the form above and click Generate
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              {CONCEPT_PLACEHOLDERS.map((card, i) => (
                <motion.div
                  key={i}
                  className="bg-card border border-border rounded-2xl overflow-hidden"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                >
                  <div
                    className={`h-44 bg-gradient-to-br ${card.gradient} flex items-center justify-center relative`}
                  >
                    <Camera className="h-10 w-10 opacity-20" style={{ color: card.accent }} />
                    <div className="absolute top-3 left-3">
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
                        style={{ backgroundColor: card.accent }}
                      >
                        {card.title}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold mb-1">{card.title}</p>
                    <p className="text-xs text-muted-foreground">{card.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
