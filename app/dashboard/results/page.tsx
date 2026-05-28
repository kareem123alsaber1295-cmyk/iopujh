"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Sparkles, Copy, Check, Download, ArrowLeft, Palette,
  Megaphone, FileText, Video, Image, Users, ChevronRight,
  Star, Target, Zap, RefreshCw, Camera, Aperture, SunMedium,
  Layers, Share2, Loader2, ArrowLeftRight
} from "lucide-react";

const tabs = [
  { id: "brand", label: "Brand Concepts", icon: Palette },
  { id: "photos", label: "Product Photos", icon: Camera, badge: "AI" },
  { id: "hooks", label: "Hooks", icon: Megaphone },
  { id: "scripts", label: "Scripts", icon: FileText },
  { id: "picture-ads", label: "Picture Ads", icon: Image },
  { id: "video-ads", label: "Video Ads", icon: Video },
  { id: "audience", label: "Audience Ideas", icon: Users },
];

interface ProductData {
  name: string;
  desc: string;
  audience: string;
  style: string;
  outputs: string[];
  referenceImageUrl?: string | null;
}

function useProductData(): ProductData {
  const [data, setData] = useState<ProductData>({
    name: "Your Product",
    desc: "",
    audience: "",
    style: "viral-tiktok",
    outputs: [],
  });
  useEffect(() => {
    try {
      const raw = localStorage.getItem("ll_product");
      if (raw) setData(JSON.parse(raw));
    } catch {}
  }, []);
  return data;
}

// Derives brand names from the product name
function deriveBrandNames(productName: string): { name: string; tagline: string; score: number; rationale: string }[] {
  const words = productName.trim().split(/\s+/);
  const first = words[0] || "Brand";
  const last = words[words.length - 1] || first;
  const initial = first[0]?.toUpperCase() || "X";
  return [
    { name: `${first}Lab`, tagline: "Science meets style", score: 96, rationale: `Blends your product name with 'Lab' — signals efficacy and credibility` },
    { name: `${initial}ura`, tagline: "Feel the difference", score: 93, rationale: `Short, memorable, and easy to trademark across all categories` },
    { name: `Pure${last}`, tagline: "Nothing but results", score: 90, rationale: `'Pure' prefix elevates perceived quality and appeals to wellness buyers` },
    { name: `${first}Co.`, tagline: "Built for results", score: 87, rationale: `Simple and scalable — works across product lines and brand extensions` },
    { name: `The${first}Brand`, tagline: "Your new obsession", score: 84, rationale: `Definite article creates authority; works especially well on TikTok` },
  ];
}

const STYLE_MAP: Record<string, string> = {
  luxury: "dark", "viral-tiktok": "bold", minimal: "clean",
  feminine: "natural", bold: "bold", wellness: "natural", premium: "clean",
};
const PHOTO_ANGLES = ["Hero Shot", "Lifestyle Context", "Ad Composition", "Detail Close-up"];
const PHOTO_FORMATS = ["square", "portrait", "landscape", "square"];

export default function ResultsPage() {
  const product = useProductData();
  const [activeTab, setActiveTab] = useState("brand");
  const [copied, setCopied] = useState<string | null>(null);
  const [photoImages, setPhotoImages] = useState<(string | null)[]>([null, null, null, null]);
  const [photoLoading, setPhotoLoading] = useState<boolean[]>([false, false, false, false]);
  const [regenerating, setRegenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const photosTriggeredRef = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  async function generatePhotos(force = false) {
    if (!force && photosTriggeredRef.current) return;
    photosTriggeredRef.current = true;
    setPhotoLoading([true, true, true, true]);
    setPhotoImages([null, null, null, null]);
    const brandStyle = STYLE_MAP[product.style] || "clean";
    await Promise.all(
      PHOTO_ANGLES.map(async (angle, idx) => {
        try {
          const res = await fetch("/api/generate-product-photo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productName: product.name,
              productDescription: product.desc,
              brandStyle,
              targetAudience: product.audience,
              imageType: PHOTO_FORMATS[idx],
              angle,
              referenceImageUrl: product.referenceImageUrl || null,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Generation failed");
          setPhotoImages((prev) => { const n = [...prev]; n[idx] = data.b64; return n; });
        } catch (err) {
          console.error(`Photo [${angle}] error:`, err);
        } finally {
          setPhotoLoading((prev) => { const n = [...prev]; n[idx] = false; return n; });
        }
      })
    );
  }

  async function handleRegenerate() {
    if (activeTab === "photos") {
      photosTriggeredRef.current = false;
      generatePhotos(true);
    } else {
      setRegenerating(true);
      setTimeout(() => setRegenerating(false), 700);
    }
  }

  async function handleExportPDF() {
    if (!contentRef.current) return;
    setExporting(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const { default: jsPDF } = await import("jspdf");
      const canvas = await html2canvas(contentRef.current, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      pdf.setFillColor(99, 102, 241);
      pdf.rect(0, 0, pw, 18, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text("LaunchLabs Brand Kit", 10, 12);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.text(product.name, pw - 10, 12, { align: "right" });
      const imgW = pw - 20;
      const imgH = (canvas.height / canvas.width) * imgW;
      pdf.addImage(imgData, "PNG", 10, 22, imgW, Math.min(imgH, ph - 28));
      pdf.save("launchlabs-brand-kit.pdf");
    } catch (err) {
      console.error("PDF export error:", err);
    } finally {
      setExporting(false);
    }
  }

  useEffect(() => {
    if (activeTab === "photos" && !photosTriggeredRef.current && product.name && product.name !== "Your Product") {
      generatePhotos();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, product.name]);

  return (
    <div>
      {/* Header */}
      <div className="border-b border-border bg-background/95 sticky top-0 z-40">
        <div className="px-4 sm:px-6 h-14 flex items-center gap-4">
          <Link href="/dashboard/brand-generator" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg gradient-bg flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground leading-none">Generated Brand Kit</p>
              <p className="text-sm font-semibold leading-none mt-0.5">{product.name}</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleRegenerate}
              disabled={regenerating || photoLoading.some(Boolean)}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border hover:bg-secondary disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${regenerating ? "animate-spin" : ""}`} />
              Regenerate
            </button>
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="flex items-center gap-1.5 gradient-bg text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              {exporting ? "Exporting…" : "Export PDF"}
            </button>
          </div>
        </div>
      </div>

      <div ref={contentRef} className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-secondary/50 p-1 rounded-2xl mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all relative ${
                activeTab === tab.id
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
              {"badge" in tab && tab.badge && (
                <span className="text-[9px] font-black gradient-bg text-white px-1.5 py-0.5 rounded-full leading-none">{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === "brand" && <BrandTab copy={copy} copied={copied} product={product} />}
            {activeTab === "photos" && <ProductPhotosTab product={product} images={photoImages} loading={photoLoading} onRegenerate={() => { photosTriggeredRef.current = false; generatePhotos(true); }} />}
            {activeTab === "hooks" && <HooksTab copy={copy} copied={copied} product={product} />}
            {activeTab === "scripts" && <ScriptsTab copy={copy} copied={copied} product={product} />}
            {activeTab === "picture-ads" && <PictureAdsTab />}
            {activeTab === "video-ads" && <VideoAdsTab />}
            {activeTab === "audience" && <AudienceTab product={product} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function CopyButton({ text, id, copy, copied }: { text: string; id: string; copy: (t: string, i: string) => void; copied: string | null }) {
  return (
    <button
      onClick={() => copy(text, id)}
      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied === id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copied === id ? "Copied" : "Copy"}
    </button>
  );
}

const styleпалетtes: Record<string, { name: string; colors: string[]; vibe: string }[]> = {
  luxury: [
    { name: "Noir & Gold", colors: ["#0D0D0D", "#C9A84C", "#F5F0E8", "#FFFFFF"], vibe: "Luxury · Exclusive" },
    { name: "Champagne", colors: ["#1A1208", "#D4AF70", "#FDF6E3", "#FFFFFF"], vibe: "Premium · Elegant" },
    { name: "Midnight Rose", colors: ["#1A0A0E", "#C97B84", "#F5E6E8", "#FFFFFF"], vibe: "Luxury · Feminine" },
  ],
  "viral-tiktok": [
    { name: "Electric Pop", colors: ["#0D0D0D", "#FF3CAC", "#784BA0", "#FFFFFF"], vibe: "Bold · Viral" },
    { name: "Neon Glow", colors: ["#0A0A0A", "#00F5A0", "#00D9F5", "#FFFFFF"], vibe: "Energetic · Gen-Z" },
    { name: "Hot Pink Energy", colors: ["#1A0010", "#FF0080", "#FFD6EC", "#FFFFFF"], vibe: "Trendy · Loud" },
  ],
  minimal: [
    { name: "Clean Slate", colors: ["#111111", "#555555", "#F2F2F2", "#FFFFFF"], vibe: "Minimal · Timeless" },
    { name: "Soft Mono", colors: ["#1A1A1A", "#888888", "#EFEFEF", "#FFFFFF"], vibe: "Clean · Refined" },
    { name: "Ink & Air", colors: ["#0A0A0A", "#2D2D2D", "#F8F8F8", "#FFFFFF"], vibe: "Simple · Bold" },
  ],
  feminine: [
    { name: "Blush & Cream", colors: ["#2D1020", "#E8A0BF", "#FDE8F0", "#FFFFFF"], vibe: "Soft · Feminine" },
    { name: "Lilac Dream", colors: ["#1A0A2E", "#C3A6E8", "#F3ECFB", "#FFFFFF"], vibe: "Dreamy · Elegant" },
    { name: "Rose Dust", colors: ["#2D1A1A", "#D4847A", "#FAE8E6", "#FFFFFF"], vibe: "Warm · Empowering" },
  ],
  bold: [
    { name: "Power Red", colors: ["#0D0D0D", "#E03030", "#FFF0F0", "#FFFFFF"], vibe: "Strong · Disruptive" },
    { name: "Electric Blue", colors: ["#050A1A", "#1E40AF", "#EFF6FF", "#FFFFFF"], vibe: "Confident · Bold" },
    { name: "Orange Strike", colors: ["#0D0800", "#EA580C", "#FFF7ED", "#FFFFFF"], vibe: "Energy · Impact" },
  ],
  wellness: [
    { name: "Earth & Sage", colors: ["#1A1A0A", "#6B7C4E", "#F2F5EC", "#FFFFFF"], vibe: "Natural · Holistic" },
    { name: "Ocean Calm", colors: ["#0A1A1A", "#4E9E9E", "#EAF6F6", "#FFFFFF"], vibe: "Serene · Pure" },
    { name: "Terracotta Glow", colors: ["#2D1A00", "#D97706", "#FEF3C7", "#FFFBF0"], vibe: "Warm · Organic" },
  ],
  premium: [
    { name: "Clinical White", colors: ["#0A0F1A", "#3B82F6", "#EFF6FF", "#FFFFFF"], vibe: "Trust · Efficacy" },
    { name: "Deep Navy", colors: ["#050A1A", "#1E3A8A", "#E8F0FE", "#FFFFFF"], vibe: "Premium · Reliable" },
    { name: "Forest Elite", colors: ["#0A1A0A", "#166534", "#DCFCE7", "#FFFFFF"], vibe: "Premium · Natural" },
  ],
};

function LogoMockup({ name, style }: { name: string; style: string }) {
  const initial = (name[0] || "B").toUpperCase();
  const shortName = name.split(" ").slice(0, 2).join("").toUpperCase().slice(0, 8);
  const word1 = name.split(" ")[0] || name;
  const word2 = name.split(" ").slice(1).join(" ");

  const configs: Record<string, { bg: string; text: string; accent: string; sub: string }> = {
    luxury:      { bg: "#0D0D0D", text: "#C9A84C", accent: "#C9A84C", sub: "#888" },
    "viral-tiktok": { bg: "#0D0D0D", text: "#FF3CAC", accent: "#784BA0", sub: "#aaa" },
    minimal:     { bg: "#FFFFFF", text: "#111111", accent: "#555", sub: "#999" },
    feminine:    { bg: "#FDE8F0", text: "#2D1020", accent: "#E8A0BF", sub: "#999" },
    bold:        { bg: "#0D0D0D", text: "#FFFFFF", accent: "#E03030", sub: "#aaa" },
    wellness:    { bg: "#F2F5EC", text: "#1A1A0A", accent: "#6B7C4E", sub: "#888" },
    premium:     { bg: "#0A0F1A", text: "#FFFFFF", accent: "#3B82F6", sub: "#aaa" },
  };
  const c = configs[style] || configs.minimal;

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Wordmark */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-full h-20 rounded-xl flex items-center justify-center px-3 border border-border" style={{ background: c.bg }}>
          <div className="text-center">
            <div style={{ color: c.text, fontWeight: 800, fontSize: "clamp(10px,2.5vw,16px)", letterSpacing: "0.1em", lineHeight: 1 }}>{word1.toUpperCase()}</div>
            {word2 && <div style={{ color: c.accent, fontWeight: 400, fontSize: "clamp(7px,1.5vw,11px)", letterSpacing: "0.25em", marginTop: 2 }}>{word2.toUpperCase()}</div>}
          </div>
        </div>
        <p className="text-xs text-muted-foreground font-medium">Wordmark</p>
      </div>

      {/* Icon + Name */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-full h-20 rounded-xl flex items-center justify-center gap-2 px-3 border border-border" style={{ background: c.bg }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: c.accent }}>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 13, lineHeight: 1 }}>{initial}</span>
          </div>
          <div style={{ color: c.text, fontWeight: 700, fontSize: "clamp(9px,2vw,13px)", letterSpacing: "0.05em", lineHeight: 1.2 }}>{word1}<br />{word2 && <span style={{ color: c.accent, fontWeight: 400, fontSize: "0.8em" }}>{word2}</span>}</div>
        </div>
        <p className="text-xs text-muted-foreground font-medium">Icon + Name</p>
      </div>

      {/* Monogram */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-full h-20 rounded-xl flex items-center justify-center border border-border" style={{ background: c.bg }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center border-2" style={{ borderColor: c.accent }}>
            <span style={{ color: c.text, fontWeight: 900, fontSize: 20, lineHeight: 1 }}>{initial}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground font-medium">Monogram</p>
      </div>
    </div>
  );
}

function BrandTab({ copy, copied, product }: { copy: (t: string, i: string) => void; copied: string | null; product: ProductData }) {
  const names = deriveBrandNames(product.name);
  const palettes = (styleпалетtes[product.style] || styleпалетtes.minimal);
  const topName = names[0]?.name || product.name;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Left: Logo + Names */}
      <div className="space-y-5">
        {/* Logo mockup */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="font-bold">Generated Logo</h2>
              <p className="text-xs text-muted-foreground mt-0.5">3 concepts based on your brand style</p>
            </div>
            <span className="text-xs font-bold gradient-bg text-white px-2.5 py-1 rounded-full">{product.style}</span>
          </div>
          <div className="p-5">
            <LogoMockup name={topName} style={product.style} />
            <p className="text-xs text-muted-foreground mt-3 text-center leading-relaxed">
              Click "Export PDF" to download all logo variants as SVG
            </p>
          </div>
        </div>

        {/* Brand Names */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="font-bold">Brand Name Concepts</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Generated from: <span className="font-medium text-foreground">"{product.name}"</span></p>
          </div>
          <div className="divide-y divide-border">
            {names.map((item, i) => (
              <div key={item.name} className="p-4 flex items-start gap-4 hover:bg-secondary/20 transition-colors">
                <div className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h3 className="font-bold text-base">{item.name}</h3>
                    <div className="flex items-center gap-1 shrink-0">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-amber-600">{item.score}</span>
                    </div>
                  </div>
                  <p className="text-xs text-primary font-medium italic mb-1">"{item.tagline}"</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.rationale}</p>
                </div>
                <CopyButton text={`${item.name} — "${item.tagline}"`} id={`brand-${i}`} copy={copy} copied={copied} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Palettes + Positioning */}
      <div className="space-y-5">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="font-bold">Color Palettes</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Matched to your {product.style} brand style</p>
          </div>
          <div className="p-5 space-y-4">
            {palettes.map((palette, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{palette.name}</p>
                  <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{palette.vibe}</span>
                </div>
                <div className="flex gap-2">
                  {palette.colors.map((color) => (
                    <div key={color} className="flex-1 h-12 rounded-xl border border-border relative group cursor-pointer" style={{ backgroundColor: color }}>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-mono bg-background/90 px-1.5 py-0.5 rounded text-foreground shadow">{color}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-bold mb-3">Product Positioning</h2>
          <div className="space-y-3">
            {[
              { label: "Core Promise", text: `The ${product.style === "luxury" ? "most premium" : product.style === "minimal" ? "cleanest" : "most effective"} version of ${product.name} — real results, no filler.` },
              { label: "Target Enemy", text: product.audience ? `Competitors ignoring ${product.audience} — we speak directly to them.` : "Generic, over-hyped competitors with no real differentiation." },
              { label: "Unique Mechanism", text: product.desc ? `${product.desc.slice(0, 80)}${product.desc.length > 80 ? "..." : ""}` : "A proprietary formula delivering active results faster than anything else in the category." },
              { label: "Brand Voice", text: product.style === "luxury" ? "Aspirational, elevated, and quietly confident." : product.style === "viral-tiktok" ? "Raw, direct, and unapologetically bold — built for the scroll." : "Clear, trustworthy, and results-focused." },
            ].map((item) => (
              <div key={item.label} className="p-3 bg-secondary/40 rounded-xl">
                <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">{item.label}</p>
                <p className="text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HooksTab({ copy, copied, product }: { copy: (t: string, i: string) => void; copied: string | null; product: ProductData }) {
  const p = product.name;
  const hooks = [
    { hook: `Stop wasting money on products that don't work. This is what actually changed everything — ${p}.`, score: 97, type: "Pain Point" },
    { hook: `I was embarrassed to go out without makeup for 3 years. Then I found ${p}.`, score: 95, type: "Vulnerability" },
    { hook: `Why does ${p} outperform every expensive alternative I've tried? Let's break it down.`, score: 93, type: "Comparison" },
    { hook: `If you have ONE product in your routine, let it be ${p}.`, score: 91, type: "Simplicity" },
    { hook: `POV: You finally found the product everyone keeps selling out of. (It's ${p}.)`, score: 90, type: "Social Proof" },
    { hook: `${p} sounds simple until you see what it actually does in 30 days.`, score: 89, type: "Curiosity" },
    { hook: `Before you spend another dollar on anything else, watch this — it's about ${p}.`, score: 88, type: "Value" },
    { hook: `I gave my most skeptical friend ${p}. She ordered two more bottles. That's the review.`, score: 92, type: "Story" },
    { hook: `30 days. ${p}. The results I've been chasing for years.`, score: 90, type: "Transformation" },
    { hook: `This is why 80% of products fail — and why ${p} is different.`, score: 87, type: "Education" },
    { hook: `Nobody talks about ${p} yet. That's about to change.`, score: 86, type: "Exclusive" },
    { hook: `I was extremely skeptical about ${p}. Then week two happened.`, score: 94, type: "Authority" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-muted-foreground text-sm">{hooks.length} hooks generated · Sorted by scroll-stop score</p>
        <button className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
          <RefreshCw className="h-3 w-3" /> Generate more
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {hooks.map((item, i) => (
          <motion.div
            key={i}
            className="bg-card border border-border rounded-2xl p-4 hover:border-primary/20 transition-all group"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.3 }}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <span className="text-xs font-medium bg-secondary text-muted-foreground px-2 py-0.5 rounded-full shrink-0">
                {item.type}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <Zap className="h-3 w-3 text-amber-500 fill-amber-400" />
                <span className="text-xs font-bold text-amber-600">{item.score}</span>
              </div>
            </div>
            <p className="text-sm font-medium leading-relaxed mb-3">{item.hook}</p>
            <div className="flex items-center justify-end">
              <CopyButton text={item.hook} id={`hook-${i}`} copy={copy} copied={copied} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ScriptsTab({ copy, copied, product }: { copy: (t: string, i: string) => void; copied: string | null; product: ProductData }) {
  const p = product.name;
  const scripts = [
    {
      title: "30s UGC Script — Transformation",
      platform: "TikTok / Reels",
      script: `[0:00-0:03 | HOOK]
Direct to camera: "I genuinely did not believe ${p} could work this fast. Then week two happened."

[0:03-0:12 | PROBLEM]
"For years I tried everything — nothing worked. I felt like I'd wasted hundreds of dollars and nothing was changing."

[0:12-0:22 | SOLUTION]
B-roll of applying ${p}. VO: "Then I found ${p}. Day 7 I noticed a real difference. Day 21 I couldn't believe the results."

[0:22-0:30 | CTA]
Close-up of glowing skin + product. VO: "Link in bio. They have a 30-day guarantee so there's nothing to lose — but based on my results? You won't need it."`,
    },
    {
      title: "60s VSL — Direct Response",
      platform: "Meta / YouTube",
      script: `[0:00-0:05 | HOOK]
"Most products in this space fail because they never actually work. ${p} is built differently — and here's proof."

[0:05-0:20 | AGITATE]
"You've probably spent hundreds on products that promised everything. And you're still here. Still dealing with the same problem. That's not your fault. The market is full of hype and no results."

[0:20-0:40 | SOLUTION]
"${p} uses a different approach — one that actually delivers results where it counts. That's why customers see visible improvement within 2 weeks. Not 2 months. 2 weeks."

[0:40-0:52 | PROOF]
Text overlays: "50,000+ units sold · 4.9/5 from 12,847 reviews · As seen in Vogue, Byrdie, and Harper's Bazaar"

[0:52-1:00 | OFFER]
"Right now, get 20% off your first order — plus free shipping and a 30-day money-back guarantee. Click below. You won't regret it."`,
    },
  ];

  return (
    <div className="space-y-5">
      {scripts.map((script, i) => (
        <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h3 className="font-bold text-sm">{script.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{script.platform}</p>
            </div>
            <CopyButton text={script.script} id={`script-${i}`} copy={copy} copied={copied} />
          </div>
          <div className="p-5">
            <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans text-foreground/90 text-xs sm:text-sm">
              {script.script}
            </pre>
          </div>
        </div>
      ))}
    </div>
  );
}

function PictureAdsTab() {
  const concepts = [
    { title: "Before/After Split", format: "1:1 Square", angle: "Transformation", colors: ["#C97B84", "#EDF2FF", "#1A1A2E"], desc: "Left: dull skin close-up. Right: glowing, dewy skin. Bottom: star rating + 'Day 30'. Product badge in corner." },
    { title: "Ingredient Hero", format: "4:5 Portrait", angle: "Education", colors: ["#FFFFFF", "#6366F1", "#EDE9FE"], desc: "Clean white bg. Product centered. Floating 20% Vitamin C callout. 'Dermatologist Formulated' badge." },
    { title: "Testimonial Pull Quote", format: "9:16 Story", angle: "Social Proof", colors: ["#EC4899", "#F5F5F5", "#1E1E1E"], desc: "Real photo background. Large pull quote overlay. Star rating. Gradient CTA bar at bottom." },
    { title: "Problem vs Solution", format: "16:9 Landscape", angle: "Pain Point", colors: ["#EF4444", "#22C55E", "#0F172A"], desc: "Dark bg. Left: problem headline. Right: product solution with green checkmark. High contrast." },
  ];

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {concepts.map((ad, i) => (
        <motion.div
          key={i}
          className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/20 transition-all"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
        >
          <div
            className="h-36 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${ad.colors[0]}30, ${ad.colors[1]}30)` }}
          >
            <Image className="h-8 w-8 text-muted-foreground/30" />
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-sm">{ad.title}</h3>
              <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground ml-auto shrink-0">{ad.format}</span>
            </div>
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{ad.angle}</span>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{ad.desc}</p>
            <div className="flex gap-1.5 mt-3">
              {ad.colors.map((c) => <div key={c} className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: c }} />)}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function VideoAdsTab() {
  const videos = [
    {
      title: "The 7-Day Challenge",
      type: "UGC · 30s",
      hook: "I gave myself 7 days to prove this serum was worth the hype. Here's what actually happened.",
      scenes: ["Creator holding serum, skeptical look", "Day 1-3: morning application montage", "Day 7: close-up reveal, visible glow", "Product + link in bio CTA"],
    },
    {
      title: "Dermatologist Explains",
      type: "Authority · 45s",
      hook: "Why most Vitamin C serums fail — and what to look for instead (dermatologist explains)",
      scenes: ["Doctor/expert on clean background", "Explaining Vitamin C science simply", "Product ingredients close-up", "Results montage + CTA"],
    },
    {
      title: "The Unboxing Review",
      type: "UGC · 60s",
      hook: "Unboxing the skincare brand everyone keeps selling out of...",
      scenes: ["Package arrival excitement", "Unboxing, smell test, texture test", "First application reaction", "End of video: 'order placed for a second bottle'"],
    },
  ];

  return (
    <div className="space-y-4">
      {videos.map((video, i) => (
        <motion.div
          key={i}
          className="bg-card border border-border rounded-2xl p-5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.3 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center shrink-0">
              <Video className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold">{video.title}</h3>
                <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{video.type}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3 italic">"{video.hook}"</p>
              <div className="flex flex-wrap gap-2">
                {video.scenes.map((scene, j) => (
                  <div key={j} className="flex items-center gap-1.5 text-xs bg-secondary/70 px-2.5 py-1 rounded-lg">
                    <span className="w-4 h-4 rounded-full bg-primary/20 text-primary font-bold text-center leading-4 text-[10px] shrink-0">{j + 1}</span>
                    {scene}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function AudienceTab({ product }: { product: ProductData }) {
  const audiences = [
    {
      segment: "The Frustrated Skincare Enthusiast",
      age: "25-38",
      gender: "Female (78%)",
      size: "4.2M",
      psychographic: "Has tried 10+ products, follows skincare TikTok, reads INCI lists, willing to spend on quality but jaded by let-downs.",
      platforms: ["TikTok", "Instagram", "Pinterest"],
      interests: ["Skincare ingredients", "Dermatology TikTok", "Sephora", "Beauty reviews", "Minimalist routines"],
      painPoints: ["Hyperpigmentation", "Dull skin", "Finding products that actually work", "Ingredient confusion"],
      hooks: ["Education-based hooks", "Ingredient transparency", "Before/after results", "Expert validation"],
    },
    {
      segment: "The Wellness-First Millennial",
      age: "28-42",
      gender: "Female (85%)",
      size: "3.1M",
      psychographic: "Prioritizes clean, non-toxic products. Reads labels obsessively. Pays premium for perceived health benefits. Already buying supplements.",
      platforms: ["Instagram", "Facebook", "YouTube"],
      interests: ["Clean beauty", "Holistic health", "Yoga/wellness", "Organic food", "Sustainability"],
      painPoints: ["Toxic ingredients fear", "Finding clean alternatives", "Skin health from within"],
      hooks: ["Clean ingredient story", "What's NOT in it", "Holistic approach to skin"],
    },
    {
      segment: "The Makeup Minimizer",
      age: "22-35",
      gender: "Female (91%)",
      size: "2.8M",
      psychographic: "Wants to wear less makeup by having better skin. Motivated by confidence, not vanity. 'No-makeup makeup' aesthetic. Follows skin prep content.",
      platforms: ["TikTok", "YouTube Shorts", "Instagram"],
      interests: ["Skin prep", "Minimal makeup", "Glassy skin", "Confidence", "Morning routines"],
      painPoints: ["Needing foundation to feel confident", "Skin texture", "Breakouts ruining bare skin days"],
      hooks: ["Transformation / freedom angle", "Day without makeup POV", "Skin confidence story"],
    },
  ];

  return (
    <div className="space-y-5">
      {audiences.map((audience, i) => (
        <motion.div
          key={i}
          className="bg-card border border-border rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
        >
          <div className="p-5 border-b border-border flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 gradient-bg rounded-xl flex items-center justify-center shrink-0">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold">{audience.segment}</h3>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-xs text-muted-foreground">Age: {audience.age}</span>
                  <span className="text-xs text-muted-foreground">{audience.gender}</span>
                  <span className="text-xs font-semibold text-primary">~{audience.size} people</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 grid md:grid-cols-2 gap-5">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Psychographic Profile</p>
                <p className="text-sm leading-relaxed text-foreground/80">{audience.psychographic}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Pain Points</p>
                <ul className="space-y-1">
                  {audience.painPoints.map((p) => (
                    <li key={p} className="text-xs flex items-center gap-2 text-muted-foreground">
                      <ChevronRight className="h-3 w-3 text-primary shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Best Platforms</p>
                <div className="flex gap-2 flex-wrap">
                  {audience.platforms.map((p) => (
                    <span key={p} className="text-xs bg-primary/10 text-primary font-medium px-2.5 py-1 rounded-full">{p}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Interests & Targeting</p>
                <div className="flex gap-1.5 flex-wrap">
                  {audience.interests.map((int) => (
                    <span key={int} className="text-xs bg-secondary px-2 py-0.5 rounded-full">{int}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Best Hook Angles</p>
                <ul className="space-y-1">
                  {audience.hooks.map((h) => (
                    <li key={h} className="text-xs flex items-center gap-2 text-muted-foreground">
                      <Zap className="h-3 w-3 text-amber-500 shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

const photoShots = [
  {
    type: "Studio Product Shot",
    icon: Aperture,
    desc: "Clean white background, professional lighting, multiple angles",
    prompt: "GlowSkin Vitamin C Serum bottle, studio photography, white seamless background, soft box lighting, high detail product shot, 8k resolution",
    tags: ["Amazon listing", "Website hero", "Print ready"],
    gradient: "from-slate-100 to-slate-200",
    accent: "bg-slate-700",
    shimmer: ["bg-white/60", "bg-white/40", "bg-white/30"],
    aspectLabel: "1:1 · 4096×4096px",
  },
  {
    type: "Lifestyle Shot",
    icon: SunMedium,
    desc: "Real-world context, natural light, aspirational setting",
    prompt: "GlowSkin serum on marble bathroom counter, morning light through window, fresh flowers, luxury skincare flat lay aesthetic",
    tags: ["Instagram feed", "Pinterest", "Editorial"],
    gradient: "from-rose-50 to-pink-100",
    accent: "bg-rose-500",
    shimmer: ["bg-rose-200/70", "bg-pink-200/50", "bg-white/40"],
    aspectLabel: "4:5 · 3200×4000px",
  },
  {
    type: "Ad-Ready Image",
    icon: Layers,
    desc: "Headline, badge, and CTA baked into composition",
    prompt: "GlowSkin serum hero product shot, bold gradient background, '30-Day Guarantee' badge, clean sans-serif headline overlay, Meta ad format",
    tags: ["Meta ads", "Google display", "YouTube thumbnail"],
    gradient: "from-violet-100 to-indigo-200",
    accent: "bg-violet-600",
    shimmer: ["bg-violet-300/50", "bg-indigo-200/60", "bg-white/30"],
    aspectLabel: "16:9 · 1920×1080px",
  },
  {
    type: "Social Media Image",
    icon: Share2,
    desc: "Square crop, vibrant colors, optimised for TikTok & Reels",
    prompt: "GlowSkin serum, vibrant pink gradient, trendy skincare aesthetic, Gen-Z color palette, TikTok cover image style, glowing skin visual effect",
    tags: ["TikTok", "Instagram Reels", "Stories"],
    gradient: "from-fuchsia-100 to-pink-200",
    accent: "bg-fuchsia-500",
    shimmer: ["bg-fuchsia-300/60", "bg-pink-300/40", "bg-white/30"],
    aspectLabel: "1:1 · 1080×1080px",
  },
];

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
      <div className="absolute top-0 bottom-0 w-px bg-white/90 shadow-[0_0_8px_rgba(0,0,0,0.5)] pointer-events-none" style={{ left: `${pos}%` }}>
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center">
          <ArrowLeftRight className="h-3.5 w-3.5 text-black" />
        </div>
      </div>
      <div className="absolute bottom-2 left-2 pointer-events-none">
        <span className="text-[9px] font-bold bg-black/70 text-white px-1.5 py-0.5 rounded-full">ORIGINAL</span>
      </div>
      <div className="absolute bottom-2 right-2 pointer-events-none">
        <span className="text-[9px] font-bold gradient-bg text-white px-1.5 py-0.5 rounded-full">AI GENERATED</span>
      </div>
      <input type="range" min="0" max="100" value={pos} onChange={(e) => setPos(Number(e.target.value))}
        className="absolute inset-0 opacity-0 w-full h-full" style={{ cursor: "ew-resize" }} />
    </div>
  );
}

function ProductPhotosTab({
  product,
  images,
  loading,
  onRegenerate,
}: {
  product: ProductData;
  images: (string | null)[];
  loading: boolean[];
  onRegenerate: () => void;
}) {
  function downloadImage(b64: string, label: string) {
    const a = document.createElement("a");
    a.href = `data:image/jpeg;base64,${b64}`;
    a.download = `${product.name.replace(/\s+/g, "-").toLowerCase()}-${label.replace(/\s+/g, "-").toLowerCase()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  const isGenerating = loading.some(Boolean);
  const doneCount = loading.filter((l) => !l).length;
  const hasAny = images.some(Boolean);

  return (
    <div>
      <div className="flex items-start gap-4 mb-6 p-4 bg-primary/5 border border-primary/15 rounded-2xl">
        <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center shrink-0">
          <Camera className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold mb-0.5">AI Product Photos — {product.name}</p>
          {isGenerating ? (
            <p className="text-xs text-primary font-medium flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" />
              Generating… {doneCount} of {photoShots.length} ready (~20 sec each)
            </p>
          ) : (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {hasAny
                ? product.referenceImageUrl
                  ? "Generated with FLUX Kontext — drag the slider to compare original vs AI."
                  : "4 photorealistic images generated. Download as JPG."
                : product.referenceImageUrl
                  ? "Using your reference photo — FLUX Kontext will preserve structure while replacing branding."
                  : "4 photorealistic images generated based on your product, brand style, and target audience."}
            </p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {photoShots.map((shot, i) => (
          <motion.div
            key={i}
            className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all group"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            {loading[i] ? (
              <>
                <div className="h-56 bg-secondary animate-pulse" />
                <div className="p-4 flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
                  <p className="text-sm text-muted-foreground">Generating {PHOTO_ANGLES[i]}…</p>
                </div>
              </>
            ) : images[i] ? (
              <>
                <div className="relative overflow-hidden">
                  {product.referenceImageUrl ? (
                    <BeforeAfterSlider
                      before={product.referenceImageUrl}
                      after={images[i]!}
                      alt={`${product.name} – ${shot.type}`}
                    />
                  ) : (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`data:image/jpeg;base64,${images[i]}`}
                        alt={`${product.name} – ${shot.type}`}
                        className="w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      <div className="absolute top-3 left-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-sm">
                          {shot.type}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => downloadImage(images[i]!, shot.type)}
                          className="p-2 rounded-lg bg-black/60 text-white backdrop-blur-sm hover:bg-black/80 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <div className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{shot.type}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{shot.desc}</p>
                  </div>
                  <button
                    onClick={() => downloadImage(images[i]!, shot.type)}
                    className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline shrink-0 ml-3"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download PNG
                  </button>
                </div>
              </>
            ) : (
              <>
                <div
                  className={`relative h-56 bg-gradient-to-br ${shot.gradient} overflow-hidden`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-32 h-40">
                      <div className="absolute inset-x-1/4 inset-y-0 rounded-3xl bg-white/70 shadow-xl shadow-black/10 backdrop-blur-sm border border-white/50" />
                      <div className="absolute inset-x-1/3 top-0 h-6 rounded-xl bg-white/60 shadow-sm" />
                      <div className="absolute inset-x-1/4 top-10 bottom-8 flex flex-col items-center justify-center gap-1 px-3">
                        <div className={`w-full h-1.5 rounded-full ${shot.shimmer[0]}`} />
                        <div className={`w-3/4 h-1 rounded-full ${shot.shimmer[1]}`} />
                        <div className={`w-1/2 h-1 rounded-full ${shot.shimmer[2]}`} />
                      </div>
                      <div className={`absolute inset-x-1/3 top-0 h-4 rounded-lg ${shot.accent} opacity-80`} />
                    </div>
                  </div>
                  <div className="absolute top-3 left-3 bg-black/50 text-white text-[10px] font-mono px-2 py-1 rounded-lg backdrop-blur-sm">
                    {shot.aspectLabel}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-7 h-7 rounded-lg ${shot.accent} flex items-center justify-center`}>
                      <shot.icon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <h3 className="font-bold text-sm">{shot.type}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{shot.desc}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {shot.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-5 p-4 border border-dashed border-border rounded-2xl flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">Not quite right?</p>
          <p className="text-xs text-muted-foreground mt-0.5">Adjust your brand style or product description and regenerate.</p>
        </div>
        <button
          onClick={onRegenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 text-xs font-semibold text-primary border border-primary/30 px-4 py-2 rounded-xl hover:bg-primary/5 transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? "animate-spin" : ""}`} />
          Regenerate photos
        </button>
      </div>
    </div>
  );
}
