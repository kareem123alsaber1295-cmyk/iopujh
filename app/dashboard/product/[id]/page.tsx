"use client";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft, TrendingUp, Zap, Target, Copy, Check,
  Sparkles, BarChart3, Users, Lightbulb, Megaphone,
  ChevronRight, Flame,
} from "lucide-react";
import { getProductById, getTrendingProducts } from "@/lib/products";
import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const radius = 28;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-16 h-16">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={radius} fill="none" stroke="currentColor" strokeWidth="5" className="text-secondary" />
          <circle
            cx="36" cy="36" r={radius} fill="none"
            stroke={color} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{score}</span>
      </div>
      <span className="text-xs text-muted-foreground font-medium text-center leading-tight">{label}</span>
    </div>
  );
}

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : label}
    </button>
  );
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const product = getProductById(id);

  if (!product) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="text-center py-24">
          <p className="text-lg font-semibold mb-2">Product not found</p>
          <p className="text-muted-foreground text-sm mb-6">This product isn&apos;t in our database yet.</p>
          <Link href="/dashboard" className="text-primary font-medium hover:underline">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  const trending = getTrendingProducts(4).filter((p) => p.id !== product.id).slice(0, 3);

  function handleGenerateBrand() {
    if (typeof window !== "undefined") {
      localStorage.setItem("ll_prefill_product", JSON.stringify({
        productName: product!.name,
        category: product!.category,
        targetCustomer: product!.targetAudience,
        mainProblem: product!.problem,
        uniqueSellingPoint: product!.uniqueAngle,
      }));
    }
    router.push("/dashboard/brand-generator");
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Back */}
      <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </motion.div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">

        {/* Hero card */}
        <motion.div variants={fadeUp} className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="grid md:grid-cols-[240px_1fr] divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Product visual */}
            <div
              className="flex flex-col items-center justify-center gap-3 p-8 min-h-[200px]"
              style={{ background: `linear-gradient(135deg, ${product.accentColor}18, ${product.accentColor}08)` }}
            >
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl shadow-lg"
                style={{ background: `${product.accentColor}25`, border: `2px solid ${product.accentColor}40` }}
              >
                {product.emoji}
              </div>
              <span
                className="text-xs font-bold px-3 py-1 rounded-full border"
                style={{ color: product.accentColor, borderColor: `${product.accentColor}40`, background: `${product.accentColor}12` }}
              >
                {product.category}
              </span>
              <p className="text-sm font-bold text-foreground/70">{product.price}</p>
            </div>

            {/* Core info */}
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1 font-medium">{product.brand}</p>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{product.name}</h1>
                  <p className="text-sm text-muted-foreground mt-1">{product.subcategory}</p>
                </div>
                <div className="flex gap-4 shrink-0">
                  <ScoreRing score={product.trendScore} label="Trend Score" color="#8B5CF6" />
                  <ScoreRing score={product.saturationScore} label="Saturation" color="#EF4444" />
                </div>
              </div>

              <p className="text-sm text-foreground/80 leading-relaxed">{product.description}</p>

              <div className="flex flex-wrap gap-1.5">
                {product.tags.slice(0, 6).map((t) => (
                  <span key={t} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-secondary border border-border text-muted-foreground">
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  onClick={handleGenerateBrand}
                  className="flex items-center justify-center gap-2 gradient-bg text-white font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all text-sm shadow-lg shadow-primary/20"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate My Brand
                </button>
                <Link
                  href="/dashboard/ad-generator"
                  className="flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/70 font-semibold px-5 py-2.5 rounded-xl transition-all text-sm"
                >
                  <Megaphone className="h-4 w-4" />
                  Generate Ads
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Intelligence grid */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Market intel */}
          <motion.div variants={fadeUp} className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-sm">Market Intelligence</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Monthly Search Volume</p>
                <p className="text-2xl font-bold">{product.monthlySearchVolume}</p>
                <p className="text-xs text-muted-foreground">searches / month</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Trend Score</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-violet-500" style={{ width: `${product.trendScore}%` }} />
                    </div>
                    <span className="text-xs font-bold text-violet-600">{product.trendScore}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Saturation</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-rose-500" style={{ width: `${product.saturationScore}%` }} />
                    </div>
                    <span className="text-xs font-bold text-rose-600">{product.saturationScore}</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Best Platforms</p>
                <div className="flex flex-wrap gap-1.5">
                  {product.platforms.map((p) => (
                    <span key={p} className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Customer intel */}
          <motion.div variants={fadeUp} className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-sm">Customer Intelligence</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Target Audience</p>
                <p className="text-sm leading-relaxed text-foreground/90">{product.targetAudience}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Core Problem</p>
                <p className="text-sm leading-relaxed text-foreground/90">{product.problem}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Winning Angle</p>
                <p className="text-sm leading-relaxed text-foreground/90 font-medium">{product.uniqueAngle}</p>
              </div>
            </div>
          </motion.div>

          {/* Top hooks */}
          <motion.div variants={fadeUp} className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-sm">Top Hooks</h2>
              </div>
              <span className="text-xs text-muted-foreground">{product.topHooks.length} hooks</span>
            </div>
            <div className="divide-y divide-border">
              {product.topHooks.map((hook, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-3.5 group hover:bg-secondary/30 transition-colors">
                  <span className="w-5 h-5 rounded-full gradient-bg text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm flex-1 leading-relaxed text-foreground/90">{hook}</p>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <CopyButton text={hook} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Ad concepts */}
          <motion.div variants={fadeUp} className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-sm">Winning Ad Concepts</h2>
            </div>
            <div className="divide-y divide-border">
              {product.topAdConcepts.map((concept, i) => (
                <div key={i} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                      {concept.angle}
                    </span>
                    <CopyButton text={`${concept.angle}: ${concept.concept}`} />
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed">{concept.concept}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Competitor positioning */}
        <motion.div variants={fadeUp} className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm">Competitor Positioning</h2>
          </div>
          <div className="p-5">
            <p className="text-sm text-foreground/90 leading-relaxed">{product.competitorPositioning}</p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div variants={fadeUp} className="gradient-bg rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(255,255,255,0.08),transparent)]" />
          <div className="relative z-10 text-center sm:text-left">
            <p className="text-white font-bold text-lg">Ready to launch your version of this?</p>
            <p className="text-white/70 text-sm mt-1">Pre-fill the Brand Generator with {product.name} data and go in seconds.</p>
          </div>
          <button
            onClick={handleGenerateBrand}
            className="relative z-10 flex items-center gap-2 bg-white text-primary font-bold px-6 py-3 rounded-xl hover:bg-white/90 transition-all shrink-0 text-sm"
          >
            <Sparkles className="h-4 w-4" />
            Generate My Brand
            <ChevronRight className="h-4 w-4" />
          </button>
        </motion.div>

        {/* Trending similar products */}
        {trending.length > 0 && (
          <motion.div variants={fadeUp}>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Flame className="h-4 w-4 text-rose-500" />
              Trending Products
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {trending.map((p) => (
                <Link
                  key={p.id}
                  href={`/dashboard/product/${p.id}`}
                  className="bg-card border border-border rounded-2xl p-4 hover:border-primary/30 hover:shadow-md transition-all group flex items-center gap-3"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: `${p.accentColor}20` }}
                  >
                    {p.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.brand}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-rose-500 shrink-0">
                    <TrendingUp className="h-3 w-3" />
                    {p.trendScore}
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

      </motion.div>
    </div>
  );
}
