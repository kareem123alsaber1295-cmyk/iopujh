"use client";
import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Download, Camera, Loader2, AlertCircle, Sparkles, RefreshCw,
  Upload, X, ImageIcon, Package, Target, Zap, Leaf, ArrowLeftRight,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const PHOTO_TYPES = [
  {
    value: "shopify", label: "Clean Shopify", icon: Camera,
    color: "from-slate-500/15 to-gray-500/15", ring: "ring-slate-400/40", text: "text-slate-400",
    desc: "White studio · hero ecommerce",
  },
  {
    value: "amazon", label: "Amazon", icon: Package,
    color: "from-orange-500/15 to-yellow-500/15", ring: "ring-orange-500/40", text: "text-orange-400",
    desc: "Pure white · catalog listing",
  },
  {
    value: "luxury", label: "Luxury Ad", icon: Sparkles,
    color: "from-amber-500/15 to-yellow-500/15", ring: "ring-amber-500/40", text: "text-amber-400",
    desc: "Dark moody · editorial beauty",
  },
  {
    value: "bathroom", label: "Lifestyle", icon: Leaf,
    color: "from-emerald-500/15 to-green-500/15", ring: "ring-emerald-500/40", text: "text-emerald-400",
    desc: "Marble counter · natural light",
  },
  {
    value: "tiktok", label: "TikTok Visual", icon: Zap,
    color: "from-pink-500/15 to-fuchsia-500/15", ring: "ring-pink-500/40", text: "text-pink-400",
    desc: "Vibrant gradient · Gen-Z bold",
  },
  {
    value: "meta-ad", label: "Meta Ad", icon: Target,
    color: "from-blue-500/15 to-indigo-500/15", ring: "ring-blue-500/40", text: "text-blue-400",
    desc: "Lifestyle bg · scroll-stopping",
  },
];

const VARIATIONS = [
  { idx: 0, label: "Variation A", gradient: "from-indigo-500/20 to-violet-500/20", color: "#6366F1" },
  { idx: 1, label: "Variation B", gradient: "from-pink-500/20 to-rose-500/20", color: "#EC4899" },
  { idx: 2, label: "Variation C", gradient: "from-amber-500/20 to-orange-500/20", color: "#F59E0B" },
  { idx: 3, label: "Variation D", gradient: "from-emerald-500/20 to-teal-500/20", color: "#10B981" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImageState {
  variation: number;
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
    setPos(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
  }

  return (
    <div ref={containerRef} className="relative select-none cursor-ew-resize overflow-hidden" onPointerMove={onPointerMove}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`data:image/jpeg;base64,${after}`} alt={alt} className="w-full block" draggable={false} />
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ width: `${pos}%` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={before} alt="Original" className="absolute inset-0 block" style={{ width: `${10000 / pos}%`, maxWidth: "none" }} draggable={false} />
      </div>
      <div className="absolute top-0 bottom-0 w-px bg-white/90 shadow-[0_0_8px_rgba(0,0,0,0.6)] pointer-events-none" style={{ left: `${pos}%` }}>
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 bg-white rounded-full shadow-xl flex items-center justify-center">
          <ArrowLeftRight className="h-4 w-4 text-black" />
        </div>
      </div>
      <div className="absolute bottom-2 left-2 pointer-events-none">
        <span className="text-[10px] font-bold bg-black/70 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">ORIGINAL</span>
      </div>
      <div className="absolute bottom-2 right-2 pointer-events-none">
        <span className="text-[10px] font-bold gradient-bg text-white px-2 py-0.5 rounded-full">AI GENERATED</span>
      </div>
      <input type="range" min="0" max="100" value={pos} onChange={(e) => setPos(Number(e.target.value))} className="absolute inset-0 opacity-0 w-full h-full" style={{ cursor: "ew-resize" }} />
    </div>
  );
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────

function UploadZone({
  preview, uploading, onFile, onClear, label, hint, required,
}: {
  preview: string | null; uploading?: boolean; onFile: (f: File) => void; onClear: () => void;
  label: string; hint?: string; required?: boolean;
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
    <div>
      <label className="block text-sm font-medium mb-1.5">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
        {hint && <span className="text-muted-foreground font-normal ml-1.5 text-xs">{hint}</span>}
      </label>
      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-border group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" className="w-full max-h-44 object-contain bg-secondary/30" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          <button onClick={onClear} className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg transition-colors backdrop-blur-sm">
            <X className="h-3.5 w-3.5" />
          </button>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
              <div className="flex items-center gap-2 text-white text-sm font-medium"><Loader2 className="h-4 w-4 animate-spin" />Uploading…</div>
            </div>
          )}
          {!uploading && (
            <div className="absolute bottom-2 left-2">
              <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">✓ Ready</span>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
            dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-secondary/30"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
            <Upload className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-xs font-medium text-center">Drop here or click to browse</p>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PictureAdsPage() {
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [brandName, setBrandName] = useState("");
  const [brandColors, setBrandColors] = useState("");
  const [photoType, setPhotoType] = useState("shopify");

  // Product reference image
  const [productPreview, setProductPreview] = useState<string | null>(null);
  const [productUrl, setProductUrl] = useState<string | null>(null);
  const [uploadingProduct, setUploadingProduct] = useState(false);

  // Logo image (local preview only)
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [generating, setGenerating] = useState(false);
  const [images, setImages] = useState<ImageState[]>([]);

  const hasStarted = images.length > 0;
  const doneCount = images.filter((img) => !img.loading).length;
  const allDone = hasStarted && doneCount === images.length;
  const selectedType = PHOTO_TYPES.find((t) => t.value === photoType)!;

  // ── Upload handlers ─────────────────────────────────────────────────────────

  const handleProductFile = useCallback(async (file: File) => {
    const localUrl = URL.createObjectURL(file);
    setProductPreview(localUrl);
    setProductUrl(null);
    setUploadingProduct(true);

    try {
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
      setProductUrl(data.url);
    } catch (err) {
      console.error("[PictureAds] Upload error:", err);
      setProductUrl(null);
    } finally {
      setUploadingProduct(false);
    }
  }, []);

  function clearProduct() {
    if (productPreview) URL.revokeObjectURL(productPreview);
    setProductPreview(null);
    setProductUrl(null);
  }

  function handleLogoFile(file: File) {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(URL.createObjectURL(file));
  }

  function clearLogo() {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(null);
  }

  // ── Generation ──────────────────────────────────────────────────────────────

  async function fetchOne(variation: number, params: object): Promise<void> {
    try {
      const res = await fetch("/api/generate-product-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...params, variation, photoType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setImages((prev) =>
        prev.map((img) => img.variation === variation ? { ...img, b64: data.b64, loading: false, error: null } : img)
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed";
      setImages((prev) =>
        prev.map((img) => img.variation === variation ? { ...img, loading: false, error: msg } : img)
      );
    }
  }

  async function handleGenerate() {
    if (!productName.trim()) return;
    setGenerating(true);
    setImages(VARIATIONS.map(({ idx }) => ({ variation: idx, b64: null, loading: true, error: null })));

    const params = {
      productName: productName.trim(),
      productDescription: productDescription.trim(),
      brandName: brandName.trim(),
      brandColors: brandColors.trim(),
      referenceImageUrl: productUrl || null,
    };

    await Promise.all(VARIATIONS.map(({ idx }) => fetchOne(idx, params)));
    setGenerating(false);
  }

  function downloadImage(b64: string, variation: number) {
    const a = document.createElement("a");
    a.href = `data:image/jpeg;base64,${b64}`;
    a.download = `${productName.replace(/\s+/g, "-").toLowerCase()}-${photoType}-v${variation + 1}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-muted-foreground text-sm mb-1">Creative Suite</p>
        <h1 className="text-2xl font-bold tracking-tight">AI Product Photo Generator</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload your product · Choose a scene style · Get 4 photorealistic ecommerce-ready variations
        </p>
      </div>

      {/* Form */}
      <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 mb-6 space-y-5">
        {/* Images row */}
        <div className="grid sm:grid-cols-2 gap-4">
          <UploadZone
            preview={productPreview}
            uploading={uploadingProduct}
            onFile={handleProductFile}
            onClear={clearProduct}
            label="Product Image"
            hint="(required for best results)"
            required
          />
          <UploadZone
            preview={logoPreview}
            onFile={handleLogoFile}
            onClear={clearLogo}
            label="Brand Logo"
            hint="(optional reference)"
          />
        </div>

        {/* Photo Type */}
        <div>
          <label className="block text-sm font-medium mb-2">Scene Style</label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {PHOTO_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setPhotoType(type.value)}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all text-center ${
                  photoType === type.value
                    ? `bg-gradient-to-br ${type.color} border-primary/30 ring-1 ${type.ring}`
                    : "border-border hover:border-border/80 hover:bg-secondary/30"
                }`}
              >
                <type.icon className={`h-4 w-4 ${photoType === type.value ? type.text : "text-muted-foreground"}`} />
                <span className={`text-[10px] font-semibold leading-tight ${photoType === type.value ? type.text : "text-muted-foreground"}`}>
                  {type.label}
                </span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">{selectedType.desc}</p>
        </div>

        {/* Product Name + Brand Name */}
        <div className="grid sm:grid-cols-2 gap-4">
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
            <label className="block text-sm font-medium mb-1.5">Brand Name</label>
            <input
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="e.g. Lumière Skincare"
              className="w-full h-10 px-3.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>
        </div>

        {/* Description + Brand Colors */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
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
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Brand Colors
              <span className="text-muted-foreground font-normal ml-1 text-xs">(influences scene palette)</span>
            </label>
            <textarea
              value={brandColors}
              onChange={(e) => setBrandColors(e.target.value)}
              placeholder="e.g. Soft ivory, warm gold, sage green accents"
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={generating || !productName.trim() || uploadingProduct}
          className="w-full gradient-bg text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating… {doneCount} of {VARIATIONS.length} ready
            </>
          ) : allDone ? (
            <>
              <RefreshCw className="h-4 w-4" />
              Regenerate Variations
            </>
          ) : (
            <>
              <selectedType.icon className="h-4 w-4" />
              Generate {selectedType.label} · 4 Variations
            </>
          )}
        </button>
      </div>

      {/* Results Grid */}
      <div className="grid sm:grid-cols-2 gap-5">
        {hasStarted
          ? images.map((img, i) => {
              const meta = VARIATIONS[img.variation];
              return (
                <motion.div
                  key={img.variation}
                  className="bg-card border border-border rounded-2xl overflow-hidden group hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                >
                  {img.loading ? (
                    <>
                      <div className="h-56 bg-secondary relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_1.5s_infinite]" />
                        <div className={`absolute inset-0 bg-gradient-to-br ${meta.gradient} opacity-40`} />
                      </div>
                      <div className="p-4 flex items-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{meta.label}</p>
                          <p className="text-xs text-muted-foreground">Generating with BRIA Product Shot…</p>
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
                        <p className="text-sm font-semibold">{meta.label}</p>
                      </div>
                    </>
                  ) : img.b64 ? (
                    <>
                      {productPreview ? (
                        <BeforeAfterSlider before={productPreview} after={img.b64} alt={`${productName} – ${meta.label}`} />
                      ) : (
                        <div className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={`data:image/jpeg;base64,${img.b64}`} alt={`${productName} – ${meta.label}`} className="w-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          <div className="absolute top-3 left-3">
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-sm">{meta.label}</span>
                          </div>
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => downloadImage(img.b64!, img.variation)} className="p-2 rounded-lg bg-black/60 text-white backdrop-blur-sm hover:bg-black/80 transition-colors">
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="px-4 py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">{meta.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{selectedType.label} · BRIA Product Shot</p>
                        </div>
                        <button onClick={() => downloadImage(img.b64!, img.variation)} className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline shrink-0">
                          <Download className="h-3.5 w-3.5" />
                          Download JPG
                        </button>
                      </div>
                    </>
                  ) : null}
                </motion.div>
              );
            })
          : VARIATIONS.map((meta, i) => (
              <motion.div
                key={meta.idx}
                className="bg-card border border-border rounded-2xl overflow-hidden"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <div className={`h-44 bg-gradient-to-br ${meta.gradient} flex items-center justify-center relative`}>
                  <ImageIcon className="h-10 w-10 opacity-20" style={{ color: meta.color }} />
                  <div className="absolute top-3 left-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: meta.color }}>
                      {meta.label}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold mb-1">{meta.label}</p>
                  <p className="text-xs text-muted-foreground">{selectedType.desc}</p>
                </div>
              </motion.div>
            ))}
      </div>

      {!hasStarted && (
        <div className="flex items-start gap-3 mt-5 p-4 bg-secondary/30 rounded-xl border border-border">
          <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">
              {productPreview
                ? "Product image ready — BRIA will place your exact product into AI-generated scenes"
                : "Upload your product photo to generate photorealistic ecommerce scenes"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              4 scene variations · BRIA Product Shot · background removal + AI scene placement · ~15 sec each
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
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = reject;
    img.src = url;
  });
}
