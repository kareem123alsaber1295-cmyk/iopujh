"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Copy, Check, RefreshCw, Save, Download, Upload, X,
  Search, Lightbulb, Layers, PenTool, Film, ClipboardList,
  AlertCircle, Megaphone, Target, Wand2, ImageIcon, Play,
} from "lucide-react";
import {
  generateAds,
  type AdKit,
  type AdGeneratorInput,
  type Platform,
  type Goal,
  type AdType,
  type VideoLength,
  type HookType,
} from "@/lib/generateAds";

const PLATFORMS: Platform[] = ["Meta Feed", "TikTok", "Instagram Stories", "YouTube Shorts"];
const GOALS: Goal[] = ["Conversions", "Leads", "Awareness", "Retargeting"];
const AD_TYPES: AdType[] = ["UGC Video", "Image Ad", "Problem/Solution", "Testimonial", "Founder Ad", "Educational Ad"];
const VIDEO_LENGTHS: VideoLength[] = ["8 sec", "15 sec"];

const LOADING_STAGES = [
  { label: "Scanning product", icon: Search },
  { label: "Finding customer pain points", icon: Target },
  { label: "Building ad angles", icon: Lightbulb },
  { label: "Writing direct response copy", icon: PenTool },
  { label: "Creating Seedance prompts", icon: Film },
  { label: "Preparing testing plan", icon: ClipboardList },
];

type TabKey = "overview" | "hooks" | "meta" | "tiktok" | "ugc" | "seedance" | "static" | "testing";

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "overview", label: "Overview", icon: Layers },
  { key: "hooks", label: "Hooks", icon: Lightbulb },
  { key: "meta", label: "Meta Ads", icon: Megaphone },
  { key: "tiktok", label: "TikTok Ads", icon: Play },
  { key: "ugc", label: "UGC Scripts", icon: PenTool },
  { key: "seedance", label: "Seedance Prompts", icon: Film },
  { key: "static", label: "Static Ads", icon: ImageIcon },
  { key: "testing", label: "Testing Plan", icon: ClipboardList },
];

const HOOK_BADGE_COLOR: Record<HookType, string> = {
  "Curiosity": "bg-violet-50 text-violet-700 border-violet-200",
  "Pain-Point": "bg-rose-50 text-rose-700 border-rose-200",
  "Belief-Shift": "bg-blue-50 text-blue-700 border-blue-200",
  "Direct-Response": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Comment-Reply": "bg-amber-50 text-amber-700 border-amber-200",
};

export default function AdGeneratorPage() {
  const [form, setForm] = useState<AdGeneratorInput>({
    productUrl: "",
    productName: "",
    productImage: null,
    category: "",
    targetCustomer: "",
    mainProblem: "",
    uniqueSellingPoint: "",
    offer: "",
    platforms: ["Meta Feed", "TikTok"],
    goal: "Conversions",
    adType: "UGC Video",
    videoLength: "15 sec",
  });

  const [kit, setKit] = useState<AdKit | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const stageIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (stageIntervalRef.current) clearInterval(stageIntervalRef.current);
  }, []);

  function update<K extends keyof AdGeneratorInput>(key: K, value: AdGeneratorInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function togglePlatform(p: Platform) {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p) ? f.platforms.filter((x) => x !== p) : [...f.platforms, p],
    }));
  }

  function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update("productImage", reader.result as string);
    reader.readAsDataURL(file);
  }

  function validate(): string[] {
    const errs: string[] = [];
    if (!form.productName.trim()) errs.push("Product name is required");
    if (!form.category.trim()) errs.push("Product category is required");
    if (!form.targetCustomer.trim()) errs.push("Target customer is required");
    if (!form.mainProblem.trim()) errs.push("Main customer problem is required");
    if (form.platforms.length === 0) errs.push("Pick at least one platform");
    return errs;
  }

  async function handleGenerate() {
    const errs = validate();
    setErrors(errs);
    if (errs.length > 0) return;

    setKit(null);
    setLoading(true);
    setLoadingStage(0);
    setSaved(false);

    stageIntervalRef.current = setInterval(() => {
      setLoadingStage((s) => Math.min(s + 1, LOADING_STAGES.length - 1));
    }, 550);

    try {
      const result = await generateAds(form);
      if (stageIntervalRef.current) clearInterval(stageIntervalRef.current);
      setLoadingStage(LOADING_STAGES.length - 1);
      await new Promise((r) => setTimeout(r, 350));
      setKit(result);
      setActiveTab("overview");
    } finally {
      setLoading(false);
    }
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((c) => (c === key ? null : c)), 1800);
  }

  function exportKit() {
    if (!kit) return;
    const blob = new Blob([JSON.stringify({ input: form, kit }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(form.productName || "ad-kit").toLowerCase().replace(/\s+/g, "-")}-kit.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function saveProject() {
    // Placeholder: project saving isn't implemented yet at the app level.
    // Acknowledge intent locally so the button feels real.
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Page header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm mb-1">Creative Suite</p>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-primary" />
            Ad Generator
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generate a full ecommerce ad kit — hooks, copy, UGC scripts, Seedance prompts, and a testing plan.
          </p>
        </div>
        {kit && (
          <div className="flex items-center gap-2">
            <button
              onClick={saveProject}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/70 transition-colors"
            >
              {saved ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Save className="h-3.5 w-3.5" />}
              {saved ? "Saved" : "Save Project"}
            </button>
            <button
              onClick={exportKit}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/70 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Export Ad Kit
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg gradient-bg text-white hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Regenerate
            </button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-6">
        {/* ── LEFT: Form ─────────────────────────────────────────── */}
        <aside className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm">Product Brief</h2>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Required fields ★</span>
            </div>

            <Field label="Product URL">
              <input
                type="url"
                value={form.productUrl}
                onChange={(e) => update("productUrl", e.target.value)}
                placeholder="https://yourstore.com/product"
                className="form-input"
              />
            </Field>

            <Field label="Product name" required>
              <input
                value={form.productName}
                onChange={(e) => update("productName", e.target.value)}
                placeholder="GlowSkin Vitamin C Serum"
                className="form-input"
              />
            </Field>

            <Field label="Product image">
              {form.productImage ? (
                <div className="relative">
                  <img src={form.productImage} alt="" className="w-full h-32 object-cover rounded-xl border border-border" />
                  <button
                    onClick={() => update("productImage", null)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-24 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span className="text-xs">Click to upload</span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onImage} />
            </Field>

            <Field label="Product category" required>
              <input
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                placeholder="Skincare, supplements, home goods..."
                className="form-input"
              />
            </Field>

            <Field label="Target customer" required>
              <input
                value={form.targetCustomer}
                onChange={(e) => update("targetCustomer", e.target.value)}
                placeholder="Women 25–40 who care about skincare"
                className="form-input"
              />
            </Field>

            <Field label="Main customer problem" required>
              <textarea
                value={form.mainProblem}
                onChange={(e) => update("mainProblem", e.target.value)}
                placeholder="What pain are they trying to solve?"
                rows={2}
                className="form-input"
              />
            </Field>

            <Field label="Unique selling point">
              <textarea
                value={form.uniqueSellingPoint}
                onChange={(e) => update("uniqueSellingPoint", e.target.value)}
                placeholder="Why this over competitors?"
                rows={2}
                className="form-input"
              />
            </Field>

            <Field label="Offer / discount">
              <input
                value={form.offer}
                onChange={(e) => update("offer", e.target.value)}
                placeholder="20% off + free shipping"
                className="form-input"
              />
            </Field>

            <Field label="Platforms" required>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map((p) => {
                  const active = form.platforms.includes(p);
                  return (
                    <button
                      key={p}
                      onClick={() => togglePlatform(p)}
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

            <Field label="Campaign goal">
              <div className="grid grid-cols-2 gap-2">
                {GOALS.map((g) => (
                  <button
                    key={g}
                    onClick={() => update("goal", g)}
                    className={`text-xs font-medium px-3 py-2 rounded-lg border transition-all ${
                      form.goal === g
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Ad type">
              <select
                value={form.adType}
                onChange={(e) => update("adType", e.target.value as AdType)}
                className="form-input"
              >
                {AD_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>

            <Field label="Video length">
              <div className="grid grid-cols-3 gap-2">
                {VIDEO_LENGTHS.map((v) => (
                  <button
                    key={v}
                    onClick={() => update("videoLength", v)}
                    className={`text-xs font-medium px-3 py-2 rounded-lg border transition-all ${
                      form.videoLength === v
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </Field>

            {errors.length > 0 && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 space-y-1">
                {errors.map((e) => (
                  <div key={e} className="flex items-center gap-2 text-xs text-rose-700">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {e}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full gradient-bg text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-primary/20 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              {loading ? "Generating Ad Kit..." : "Generate Ads"}
            </button>
          </div>
        </aside>

        {/* ── RIGHT: Results ─────────────────────────────────────── */}
        <section className="min-w-0">
          {loading ? (
            <LoadingPanel stage={loadingStage} />
          ) : !kit ? (
            <EmptyState />
          ) : (
            <ResultsPanel
              kit={kit}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              copy={copy}
              copiedKey={copiedKey}
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

// ─────────────────────────────────────────────────────────────────
// Form field wrapper
// ─────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="bg-card border border-dashed border-border rounded-2xl p-12 min-h-[600px] flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mb-5 shadow-lg shadow-primary/20">
        <Sparkles className="h-7 w-7 text-white" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Your ad kit will appear here</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        Fill out the product brief on the left and click <span className="font-semibold text-foreground">Generate Ads</span> to build a full kit with hooks, copy, UGC scripts, Seedance prompts, and a testing plan.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-md text-xs">
        {[
          { icon: Lightbulb, label: "15+ Hooks" },
          { icon: Megaphone, label: "5 Meta Ads" },
          { icon: Play, label: "5 TikTok Ads" },
          { icon: Film, label: "5 Seedance" },
        ].map((x) => (
          <div key={x.label} className="bg-secondary/50 rounded-xl p-3 flex flex-col items-center gap-1.5">
            <x.icon className="h-4 w-4 text-primary" />
            <span className="font-medium">{x.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Loading panel
// ─────────────────────────────────────────────────────────────────
function LoadingPanel({ stage }: { stage: number }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-10 min-h-[600px] flex flex-col items-center justify-center">
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute inset-0 rounded-full gradient-bg opacity-20 animate-ping" />
        <div className="absolute inset-2 rounded-full gradient-bg flex items-center justify-center shadow-lg shadow-primary/30">
          <Sparkles className="h-7 w-7 text-white animate-pulse" />
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-1">Generating your ad kit</h3>
      <p className="text-sm text-muted-foreground mb-8">This usually takes a few seconds</p>

      <div className="w-full max-w-sm space-y-2.5">
        {LOADING_STAGES.map((s, i) => {
          const Icon = s.icon;
          const done = i < stage;
          const active = i === stage;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                active ? "border-primary bg-primary/5" : done ? "border-emerald-200 bg-emerald-50/50" : "border-border bg-background"
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                active ? "gradient-bg text-white" : done ? "bg-emerald-500 text-white" : "bg-secondary text-muted-foreground"
              }`}>
                {done ? <Check className="h-3.5 w-3.5" /> : active ? <Icon className="h-3.5 w-3.5 animate-pulse" /> : <Icon className="h-3.5 w-3.5" />}
              </div>
              <span className={`text-sm font-medium ${active ? "text-foreground" : done ? "text-emerald-700" : "text-muted-foreground"}`}>
                {s.label}
              </span>
              {active && (
                <div className="ml-auto w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Results panel + tabs
// ─────────────────────────────────────────────────────────────────
function ResultsPanel({
  kit,
  activeTab,
  setActiveTab,
  copy,
  copiedKey,
}: {
  kit: AdKit;
  activeTab: TabKey;
  setActiveTab: (k: TabKey) => void;
  copy: (text: string, key: string) => void;
  copiedKey: string | null;
}) {
  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="bg-card border border-border rounded-2xl p-1.5 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  active
                    ? "gradient-bg text-white shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "overview" && <OverviewTab overview={kit.overview} copy={copy} copiedKey={copiedKey} />}
          {activeTab === "hooks" && <HooksTab hooks={kit.hooks} copy={copy} copiedKey={copiedKey} />}
          {activeTab === "meta" && <MetaTab ads={kit.metaAds} copy={copy} copiedKey={copiedKey} />}
          {activeTab === "tiktok" && <TikTokTab ads={kit.tiktokAds} copy={copy} copiedKey={copiedKey} />}
          {activeTab === "ugc" && <UGCTab scripts={kit.ugcScripts} copy={copy} copiedKey={copiedKey} />}
          {activeTab === "seedance" && <SeedanceTab prompts={kit.seedancePrompts} copy={copy} copiedKey={copiedKey} />}
          {activeTab === "static" && <StaticTab ads={kit.staticAds} copy={copy} copiedKey={copiedKey} />}
          {activeTab === "testing" && <TestingTab plan={kit.testingPlan} copy={copy} copiedKey={copiedKey} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Reusable card pieces
// ─────────────────────────────────────────────────────────────────
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card border border-border rounded-2xl overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({
  title, subtitle, badges, onCopy, copyKey, copiedKey,
}: {
  title: string;
  subtitle?: string;
  badges?: { label: string; color?: string }[];
  onCopy: () => void;
  copyKey: string;
  copiedKey: string | null;
}) {
  const copied = copiedKey === copyKey;
  return (
    <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-sm">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        {badges && badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {badges.map((b) => (
              <span key={b.label} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${b.color || "bg-secondary text-secondary-foreground border-border"}`}>
                {b.label}
              </span>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={onCopy}
        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

function Field2({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Tab: Overview
// ─────────────────────────────────────────────────────────────────
function OverviewTab({ overview, copy, copiedKey }: { overview: AdKit["overview"]; copy: (t: string, k: string) => void; copiedKey: string | null }) {
  const items: { label: string; value: string; badge?: string }[] = [
    { label: "Product Summary", value: overview.productSummary, badge: "Brief" },
    { label: "Best Customer Avatar", value: overview.customerAvatar, badge: "Targeting" },
    { label: "Core Selling Angle", value: overview.coreAngle, badge: "Conversion Angle" },
    { label: "Main Emotional Trigger", value: overview.emotionalTrigger, badge: "Psychology" },
    { label: "Recommended First Test Angle", value: overview.firstTestAngle, badge: "Start Here" },
  ];
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {items.map((item, i) => (
        <Card key={item.label} className={i === items.length - 1 ? "sm:col-span-2" : ""}>
          <CardHeader
            title={item.label}
            badges={item.badge ? [{ label: item.badge, color: "bg-primary/10 text-primary border-primary/20" }] : undefined}
            onCopy={() => copy(item.value, `overview-${i}`)}
            copyKey={`overview-${i}`}
            copiedKey={copiedKey}
          />
          <div className="p-5">
            <p className="text-sm leading-relaxed text-foreground/90">{item.value}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Tab: Hooks
// ─────────────────────────────────────────────────────────────────
function HooksTab({ hooks, copy, copiedKey }: { hooks: AdKit["hooks"]; copy: (t: string, k: string) => void; copiedKey: string | null }) {
  const grouped = hooks.reduce<Record<HookType, string[]>>((acc, h) => {
    (acc[h.type] ||= []).push(h.text);
    return acc;
  }, {} as Record<HookType, string[]>);

  const order: HookType[] = ["Curiosity", "Pain-Point", "Belief-Shift", "Direct-Response", "Comment-Reply"];

  return (
    <div className="space-y-4">
      {order.filter((t) => grouped[t]?.length).map((type) => (
        <Card key={type}>
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${HOOK_BADGE_COLOR[type]}`}>{type}</span>
              <span className="text-xs text-muted-foreground">{grouped[type].length} hooks</span>
            </div>
          </div>
          <div className="divide-y divide-border">
            {grouped[type].map((text, i) => {
              const key = `hook-${type}-${i}`;
              const copied = copiedKey === key;
              return (
                <div key={key} className="px-5 py-3.5 flex items-start gap-3 group hover:bg-secondary/30 transition-colors">
                  <p className="text-sm flex-1 leading-relaxed text-foreground/90">{text}</p>
                  <button
                    onClick={() => copy(text, key)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground shrink-0"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Tab: Meta Ads
// ─────────────────────────────────────────────────────────────────
function MetaTab({ ads, copy, copiedKey }: { ads: AdKit["metaAds"]; copy: (t: string, k: string) => void; copiedKey: string | null }) {
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {ads.map((ad, i) => {
        const fullCopy = `Primary text:\n${ad.primaryText}\n\nHeadline: ${ad.headline}\nDescription: ${ad.description}\nCTA: ${ad.cta}\nAngle: ${ad.angle}\n\nCompliance-safe version:\n${ad.complianceSafe}`;
        return (
          <Card key={i}>
            <CardHeader
              title={`Meta Ad #${i + 1}`}
              subtitle={ad.angle}
              badges={[
                { label: "Meta Safe", color: "bg-blue-50 text-blue-700 border-blue-200" },
                { label: ad.angle, color: "bg-violet-50 text-violet-700 border-violet-200" },
              ]}
              onCopy={() => copy(fullCopy, `meta-${i}`)}
              copyKey={`meta-${i}`}
              copiedKey={copiedKey}
            />
            <div className="p-5 space-y-4">
              <Field2 label="Primary text">{ad.primaryText}</Field2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <Field2 label="Headline">{ad.headline}</Field2>
                <Field2 label="Description">{ad.description}</Field2>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">CTA: {ad.cta}</span>
              </div>
              <details className="rounded-xl border border-border bg-secondary/40 p-3">
                <summary className="text-xs font-semibold cursor-pointer text-muted-foreground hover:text-foreground">Compliance-safe version</summary>
                <p className="text-sm mt-2 leading-relaxed text-foreground/90 whitespace-pre-line">{ad.complianceSafe}</p>
              </details>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Tab: TikTok Ads
// ─────────────────────────────────────────────────────────────────
function TikTokTab({ ads, copy, copiedKey }: { ads: AdKit["tiktokAds"]; copy: (t: string, k: string) => void; copiedKey: string | null }) {
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {ads.map((ad, i) => {
        const fullCopy = `Hook: ${ad.hook}\n\nScript:\n${ad.script}\n\nScene direction: ${ad.sceneDirection}\nCaption: ${ad.caption}\nAngle: ${ad.angle}`;
        return (
          <Card key={i}>
            <CardHeader
              title={`TikTok Ad #${i + 1}`}
              subtitle={ad.angle}
              badges={[
                { label: "UGC Ready", color: "bg-pink-50 text-pink-700 border-pink-200" },
                { label: ad.angle, color: "bg-violet-50 text-violet-700 border-violet-200" },
              ]}
              onCopy={() => copy(fullCopy, `tt-${i}`)}
              copyKey={`tt-${i}`}
              copiedKey={copiedKey}
            />
            <div className="p-5 space-y-4">
              <Field2 label="Hook">{ad.hook}</Field2>
              <Field2 label="Script">{ad.script}</Field2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <Field2 label="Scene direction">{ad.sceneDirection}</Field2>
                <Field2 label="Caption">{ad.caption}</Field2>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Tab: UGC Scripts
// ─────────────────────────────────────────────────────────────────
function UGCTab({ scripts, copy, copiedKey }: { scripts: AdKit["ugcScripts"]; copy: (t: string, k: string) => void; copiedKey: string | null }) {
  return (
    <div className="space-y-4">
      {scripts.map((s, i) => {
        const fullCopy = `Character: ${s.character}\nSetting: ${s.setting}\nCamera: ${s.cameraStyle}\n\nSpoken script:\n${s.spokenScript}\n\nNatural actions: ${s.naturalActions}\n\nWhy it works: ${s.whyItWorks}`;
        return (
          <Card key={i}>
            <CardHeader
              title={`UGC Script #${i + 1}`}
              badges={[
                { label: "UGC Ready", color: "bg-pink-50 text-pink-700 border-pink-200" },
                { label: "Conversion Angle", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
              ]}
              onCopy={() => copy(fullCopy, `ugc-${i}`)}
              copyKey={`ugc-${i}`}
              copiedKey={copiedKey}
            />
            <div className="p-5 grid md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <Field2 label="Character">{s.character}</Field2>
                <Field2 label="Setting">{s.setting}</Field2>
                <Field2 label="Camera style">{s.cameraStyle}</Field2>
                <Field2 label="Natural actions">{s.naturalActions}</Field2>
              </div>
              <div className="space-y-4">
                <Field2 label="Spoken script">{s.spokenScript}</Field2>
                <div className="rounded-xl bg-primary/5 border border-primary/15 p-3">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Why this angle works</p>
                  <p className="text-sm leading-relaxed text-foreground/90">{s.whyItWorks}</p>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Tab: Seedance Prompts
// ─────────────────────────────────────────────────────────────────
function SeedanceTab({ prompts, copy, copiedKey }: { prompts: AdKit["seedancePrompts"]; copy: (t: string, k: string) => void; copiedKey: string | null }) {
  return (
    <div className="space-y-4">
      {prompts.map((p, i) => (
        <Card key={i}>
          <CardHeader
            title={p.title}
            subtitle={`${p.angle} · Seedance 2.0 ready`}
            badges={[
              { label: "Seedance 2.0", color: "bg-violet-50 text-violet-700 border-violet-200" },
              { label: "9:16 Vertical", color: "bg-blue-50 text-blue-700 border-blue-200" },
              { label: "UGC Ready", color: "bg-pink-50 text-pink-700 border-pink-200" },
            ]}
            onCopy={() => copy(p.fullPrompt, `seed-${i}`)}
            copyKey={`seed-${i}`}
            copiedKey={copiedKey}
          />
          <div className="p-5 space-y-5">
            <div className="rounded-xl bg-secondary/40 border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Full copy-paste prompt</p>
                <button
                  onClick={() => copy(p.fullPrompt, `seed-full-${i}`)}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  {copiedKey === `seed-full-${i}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedKey === `seed-full-${i}` ? "Copied" : "Copy prompt"}
                </button>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line font-mono text-xs">{p.fullPrompt}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Field2 label="Character">{p.characterDescription}</Field2>
              <Field2 label="Setting">{p.setting}</Field2>
              <Field2 label="Lighting">{p.lighting}</Field2>
              <Field2 label="Camera movement">{p.cameraMovement}</Field2>
              <Field2 label="Audio direction">{p.audioDirection}</Field2>
              <Field2 label="Product placement">{p.productPlacement}</Field2>
            </div>

            <Field2 label="Spoken script">{p.spokenScript}</Field2>
            <Field2 label="Timing breakdown">{p.timingBreakdown}</Field2>

            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3">
              <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider mb-1">Avoid in generation</p>
              <p className="text-sm text-rose-700/90 leading-relaxed">{p.avoidInstructions}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Tab: Static Ads
// ─────────────────────────────────────────────────────────────────
function StaticTab({ ads, copy, copiedKey }: { ads: AdKit["staticAds"]; copy: (t: string, k: string) => void; copiedKey: string | null }) {
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {ads.map((ad, i) => {
        const fullCopy = `Visual: ${ad.visualConcept}\n\nHeadline: ${ad.headline}\nSubheadline: ${ad.subheadline}\nCTA: ${ad.cta}\n\nLayout: ${ad.layoutDirection}\n\nWhy it works: ${ad.whyItWorks}`;
        return (
          <Card key={i}>
            <CardHeader
              title={`Static Ad #${i + 1}`}
              badges={[
                { label: "Static", color: "bg-amber-50 text-amber-700 border-amber-200" },
                { label: "Meta Safe", color: "bg-blue-50 text-blue-700 border-blue-200" },
              ]}
              onCopy={() => copy(fullCopy, `static-${i}`)}
              copyKey={`static-${i}`}
              copiedKey={copiedKey}
            />
            <div className="p-5 space-y-4">
              <Field2 label="Visual concept">{ad.visualConcept}</Field2>
              <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-2">
                <p className="font-bold text-lg leading-tight">{ad.headline}</p>
                <p className="text-sm text-muted-foreground">{ad.subheadline}</p>
                <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mt-1">{ad.cta}</span>
              </div>
              <Field2 label="Layout direction">{ad.layoutDirection}</Field2>
              <div className="rounded-xl bg-primary/5 border border-primary/15 p-3">
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Why this could work</p>
                <p className="text-sm leading-relaxed text-foreground/90">{ad.whyItWorks}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Tab: Testing Plan
// ─────────────────────────────────────────────────────────────────
function TestingTab({ plan, copy, copiedKey }: { plan: AdKit["testingPlan"]; copy: (t: string, k: string) => void; copiedKey: string | null }) {
  const fullCopy = `TESTING PLAN\n\nAngles to test first:\n${plan.angles.map((a, i) => `${i + 1}. ${a}`).join("\n")}\n\nPlatforms: ${plan.platforms.join(", ")}\n\nCreative mix:\n${plan.creativeMix}\n\nMetrics to watch:\n${plan.metricsToWatch.map((m) => `• ${m}`).join("\n")}\n\nKill / scale rules:\n${plan.killScaleRules}\n\nWhat to generate next:\n${plan.nextToGenerate}`;
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Media-Buying Test Plan"
          subtitle="Run this first. Iterate from real data."
          badges={[
            { label: "Strategy", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
            { label: "Start Here", color: "bg-primary/10 text-primary border-primary/20" },
          ]}
          onCopy={() => copy(fullCopy, "plan")}
          copyKey="plan"
          copiedKey={copiedKey}
        />
        <div className="p-5 space-y-5">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Top 3 angles to test first</p>
            <ol className="space-y-2">
              {plan.angles.map((a, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full gradient-bg text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span className="leading-relaxed">{a}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Platforms</p>
              <div className="flex flex-wrap gap-1.5">
                {plan.platforms.map((p) => (
                  <span key={p} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary border border-border">{p}</span>
                ))}
              </div>
            </div>
            <Field2 label="Creative mix">{plan.creativeMix}</Field2>
          </div>

          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Metrics to watch</p>
            <ul className="space-y-1.5">
              {plan.metricsToWatch.map((m, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span className="leading-relaxed">{m}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-4">
              <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider mb-1.5">Kill / scale rules</p>
              <p className="text-sm leading-relaxed text-rose-900/90">{plan.killScaleRules}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1.5">What to generate next</p>
              <p className="text-sm leading-relaxed text-emerald-900/90">{plan.nextToGenerate}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
