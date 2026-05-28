"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Upload, Link2, Sparkles, X, Globe, Target, Zap,
  Palette, Tag, Layers, Package, Camera, Megaphone,
  FileText, Image as ImageIcon, Video, CheckSquare, Square
} from "lucide-react";

const brandStyles = [
  { value: "luxury", label: "Luxury", desc: "Premium, aspirational, exclusive", emoji: "✨" },
  { value: "viral-tiktok", label: "Viral TikTok", desc: "Bold, energetic, trend-driven", emoji: "🔥" },
  { value: "minimal", label: "Minimal", desc: "Clean, simple, sophisticated", emoji: "⚡" },
  { value: "feminine", label: "Feminine", desc: "Elegant, soft, empowering", emoji: "🌸" },
  { value: "bold", label: "Bold", desc: "Strong, confident, disruptive", emoji: "💪" },
  { value: "wellness", label: "Wellness", desc: "Natural, holistic, mindful", emoji: "🌿" },
  { value: "premium", label: "Premium", desc: "High-quality, trustworthy, refined", emoji: "🏆" },
];

const outputOptions = [
  { id: "product-concept", label: "Product Concept", desc: "Positioning, USP & market angle", icon: Package },
  { id: "brand-name", label: "Brand Name", desc: "AI-generated name ideas & rationale", icon: Tag },
  { id: "logo-concept", label: "Logo Concept", desc: "Logo direction & style brief", icon: Layers },
  { id: "packaging-concept", label: "Packaging Concept", desc: "Packaging layout & material ideas", icon: Package },
  { id: "product-photo", label: "Product Photo", desc: "Studio, lifestyle & ad-ready shots", icon: Camera, highlight: true },
  { id: "hooks", label: "Hooks", desc: "Viral scroll-stopping openers", icon: Megaphone },
  { id: "scripts", label: "Scripts", desc: "UGC & VSL ad scripts", icon: FileText },
  { id: "picture-ads", label: "Picture Ads", desc: "Static ad storyboards & briefs", icon: ImageIcon },
  { id: "video-ads", label: "Video Ads", desc: "Scene-by-scene video briefs", icon: Video },
];

const defaultSelected = new Set(outputOptions.map((o) => o.id));

export default function BrandGeneratorPage() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null);
  const [uploadingRef, setUploadingRef] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("viral-tiktok");
  const [selectedOutputs, setSelectedOutputs] = useState<Set<string>>(defaultSelected);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [targetAudience, setTargetAudience] = useState("");

  const handleFile = useCallback(async (file: File) => {
    setUploadedImage(URL.createObjectURL(file));
    setReferenceImageUrl(null);
    setUploadingRef(true);
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
      if (res.ok) setReferenceImageUrl(data.url);
    } catch (err) {
      console.error("Reference image upload failed:", err);
    } finally {
      setUploadingRef(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  }, [handleFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  function toggleOutput(id: string) {
    setSelectedOutputs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selectedOutputs.size === outputOptions.length) {
      setSelectedOutputs(new Set());
    } else {
      setSelectedOutputs(new Set(outputOptions.map((o) => o.id)));
    }
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);
    setCompletedSteps(new Set());

    const selected = outputOptions.filter((o) => selectedOutputs.has(o.id));
    const hasPhoto = selectedOutputs.has("product-photo");

    const baseSteps = [
      { pct: 8, label: "Analyzing product inputs...", key: "" },
      { pct: 18, label: "Generating product concept...", key: "product-concept" },
      { pct: 28, label: "Crafting brand names...", key: "brand-name" },
      { pct: 38, label: "Designing logo direction...", key: "logo-concept" },
      { pct: 46, label: "Building packaging concept...", key: "packaging-concept" },
      { pct: 56, label: "Writing viral hooks...", key: "hooks" },
      { pct: 65, label: "Scripting UGC & VSL ads...", key: "scripts" },
      { pct: 73, label: "Creating picture ad briefs...", key: "picture-ads" },
      { pct: 81, label: "Producing video ad concepts...", key: "video-ads" },
      ...(hasPhoto ? [
        { pct: 87, label: "Rendering studio product shot...", key: "" },
        { pct: 92, label: "Generating lifestyle image...", key: "" },
        { pct: 96, label: "Composing ad-ready photo...", key: "" },
        { pct: 99, label: "Finishing social media image...", key: "product-photo" },
      ] : []),
      { pct: 100, label: "Finalizing your brand kit...", key: "" },
    ];

    const steps = baseSteps.filter(
      (s) => !s.key || selectedOutputs.has(s.key) || s.key === ""
    );

    for (const step of steps) {
      setProgress(step.pct);
      setProgressLabel(step.label);
      if (step.key) setCompletedSteps((prev) => new Set([...prev, step.key]));
      await new Promise((r) => setTimeout(r, hasPhoto && step.pct > 86 ? 520 : 350));
    }

    await new Promise((r) => setTimeout(r, 300));
    // Save inputs so results page can personalise output
    localStorage.setItem("ll_product", JSON.stringify({
      name: productName || "Your Product",
      desc: productDesc,
      audience: targetAudience,
      style: selectedStyle,
      outputs: Array.from(selectedOutputs),
      referenceImageUrl: referenceImageUrl || null,
    }));
    router.push("/dashboard/results");
  }

  const allSelected = selectedOutputs.size === outputOptions.length;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="mb-8">
          <p className="text-muted-foreground text-sm mb-1">AI Brand Builder</p>
          <h1 className="text-2xl font-bold tracking-tight">Product Generator</h1>
        </div>

        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Image upload */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-semibold mb-1">Product Image</h2>
            <p className="text-muted-foreground text-sm mb-4">Upload a product photo — required for AI photo generation</p>
            <div
              className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${
                dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-secondary/30"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
            >
              <input type="file" accept="image/*" onChange={handleFileInput} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              {uploadedImage ? (
                <div className="relative p-4">
                  <div className="relative w-full rounded-lg overflow-hidden bg-secondary/50 flex items-center justify-center max-h-52">
                    <img src={uploadedImage} alt="Product" className="w-full h-full object-contain max-h-52" />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setUploadedImage(null); setReferenceImageUrl(null); }}
                    className="absolute top-6 right-6 w-7 h-7 bg-background border border-border rounded-full flex items-center justify-center hover:bg-secondary transition-colors shadow-sm"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <div className="absolute bottom-6 left-6">
                    {uploadingRef ? (
                      <span className="text-[10px] font-semibold bg-black/70 text-white px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                        <Upload className="h-2.5 w-2.5 animate-pulse" /> Uploading…
                      </span>
                    ) : referenceImageUrl ? (
                      <span className="text-[10px] font-semibold bg-emerald-500 text-white px-2 py-1 rounded-full">
                        ✓ Ready for AI photos
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center pointer-events-none">
                  <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium mb-1">Drop your product image here</p>
                  <p className="text-xs text-muted-foreground">or click to browse · PNG, JPG, WEBP · Max 10MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Product details */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <h2 className="font-semibold">Product Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Product Name <span className="text-primary">*</span></label>
                <input type="text" placeholder="e.g. GlowSkin Vitamin C Serum" required value={productName} onChange={(e) => setProductName(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  <span className="flex items-center gap-1.5"><Target className="h-3.5 w-3.5" />Target Audience</span>
                </label>
                <input type="text" placeholder="e.g. Women 25-40 interested in skincare" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Product Description</label>
              <textarea placeholder="Describe your product, key benefits, unique ingredients, or what makes it special..." rows={3} value={productDesc} onChange={(e) => setProductDesc(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" />Competitor URL</span>
              </label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="url" placeholder="https://competitor.com/product" className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">Optional — paste a competitor product page for smarter positioning</p>
            </div>
          </div>

          {/* Output options */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold">Select Outputs</h2>
                <p className="text-muted-foreground text-sm mt-0.5">Choose what AI generates for you</p>
              </div>
              <button
                type="button"
                onClick={toggleAll}
                className="text-xs font-semibold text-primary hover:underline"
              >
                {allSelected ? "Deselect all" : "Select all"}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {outputOptions.map((option) => {
                const active = selectedOutputs.has(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleOutput(option.id)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      active
                        ? option.highlight
                          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                          : "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/30 hover:bg-secondary/40"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      active ? "gradient-bg" : "bg-secondary"
                    }`}>
                      <option.icon className={`h-4 w-4 ${active ? "text-white" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold leading-tight">{option.label}</p>
                        {option.highlight && (
                          <span className="text-[10px] font-bold gradient-bg text-white px-1.5 py-0.5 rounded-full leading-none">NEW</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{option.desc}</p>
                    </div>
                    <div className="shrink-0 mt-0.5">
                      {active
                        ? <CheckSquare className="h-4 w-4 text-primary" />
                        : <Square className="h-4 w-4 text-muted-foreground/40" />
                      }
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {selectedOutputs.size} of {outputOptions.length} selected
              {selectedOutputs.has("product-photo") && (
                <span className="text-primary font-medium"> · Product photos will be AI-generated</span>
              )}
            </p>
          </div>

          {/* Brand style */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-semibold mb-1">Brand Style</h2>
            <p className="text-muted-foreground text-sm mb-4">Choose the aesthetic direction — affects photos, names & copy</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {brandStyles.map((style) => (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => setSelectedStyle(style.value)}
                  className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
                    selectedStyle === style.value
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/40 hover:bg-secondary/50"
                  }`}
                >
                  <span className="text-xl mb-2">{style.emoji}</span>
                  <p className="text-sm font-semibold">{style.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{style.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={generating || selectedOutputs.size === 0}
            className="w-full gradient-bg text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base shadow-lg shadow-primary/25"
          >
            <Sparkles className="h-5 w-5" />
            Generate {selectedOutputs.size > 0 ? `${selectedOutputs.size} Output${selectedOutputs.size > 1 ? "s" : ""}` : "Brand Kit"}
          </button>
        </form>
      </motion.div>

      {/* Generation overlay */}
      <AnimatePresence>
        {generating && (
          <motion.div
            className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-lg text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="w-20 h-20 gradient-bg rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/30">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                  <Sparkles className="h-9 w-9 text-white" />
                </motion.div>
              </div>

              <h2 className="text-2xl font-bold mb-2">
                {progress < 85 ? "Building Your Brand Kit" : "Generating Product Photos"}
              </h2>
              <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                {progress < 85
                  ? "AI is crafting your complete brand identity across all selected outputs..."
                  : "Rendering photorealistic product images with AI..."}
              </p>

              <div className="w-full bg-secondary rounded-full h-2.5 mb-3 overflow-hidden">
                <motion.div
                  className="h-full gradient-bg rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-8">
                <span>{progressLabel}</span>
                <span>{progress}%</span>
              </div>

              {/* Output grid */}
              <div className="grid grid-cols-3 gap-2">
                {outputOptions.filter((o) => selectedOutputs.has(o.id)).map((option) => {
                  const done = completedSteps.has(option.id);
                  return (
                    <div
                      key={option.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all ${
                        done ? "border-primary bg-primary/10" : "border-border bg-card"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${done ? "bg-primary" : "bg-secondary"}`}>
                        {done
                          ? <Zap className="h-2.5 w-2.5 text-white" />
                          : <option.icon className="h-2.5 w-2.5 text-muted-foreground" />
                        }
                      </div>
                      <p className={`text-xs font-medium leading-tight truncate ${done ? "text-primary" : "text-muted-foreground"}`}>
                        {option.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
