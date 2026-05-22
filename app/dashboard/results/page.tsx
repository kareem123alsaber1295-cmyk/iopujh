"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Sparkles, Copy, Check, Download, ArrowLeft, Palette,
  Megaphone, FileText, Video, Image, Users, ChevronRight,
  Star, Target, Zap, RefreshCw, Camera, Aperture, SunMedium,
  Layers, Share2
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

export default function ResultsPage() {
  const [activeTab, setActiveTab] = useState("brand");
  const [copied, setCopied] = useState<string | null>(null);

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

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
              <p className="text-sm font-semibold leading-none mt-0.5">GlowSkin Vitamin C Serum</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border hover:bg-secondary">
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate
            </button>
            <button className="flex items-center gap-1.5 gradient-bg text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity">
              <Download className="h-3.5 w-3.5" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
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
            {activeTab === "brand" && <BrandTab copy={copy} copied={copied} />}
            {activeTab === "photos" && <ProductPhotosTab />}
            {activeTab === "hooks" && <HooksTab copy={copy} copied={copied} />}
            {activeTab === "scripts" && <ScriptsTab copy={copy} copied={copied} />}
            {activeTab === "picture-ads" && <PictureAdsTab />}
            {activeTab === "video-ads" && <VideoAdsTab />}
            {activeTab === "audience" && <AudienceTab />}
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

function BrandTab({ copy, copied }: { copy: (t: string, i: string) => void; copied: string | null }) {
  const names = [
    { name: "LumiGlow", tagline: "Skin that speaks", score: 96, rationale: "Combines luminosity + glow — aspirational, feminine, easy to trademark" },
    { name: "AuraLab", tagline: "Science meets radiance", score: 93, rationale: "Scientific credibility + beauty aura. Lab signals efficacy to educated buyers" },
    { name: "SkinForge", tagline: "Built for results", score: 89, rationale: "Bold, strong positioning — appeals to results-driven buyers sick of fluffy claims" },
    { name: "GlowCo.", tagline: "Your skin, elevated", score: 87, rationale: "Simple, memorable, scalable brand name that works across SKUs" },
    { name: "ClearLux", tagline: "Luxury, clarified", score: 84, rationale: "Positions at premium tier. Clear skin + luxury fused in two syllables" },
  ];

  const palettes = [
    { name: "Rose Gold Minimal", colors: ["#1A0A0E", "#C97B84", "#F5E6E8", "#FFFFFF"], vibe: "Luxury · Feminine" },
    { name: "Clinical White", colors: ["#0A0F1A", "#3B82F6", "#EFF6FF", "#FFFFFF"], vibe: "Trust · Efficacy" },
    { name: "Earth & Glow", colors: ["#2D1A00", "#D97706", "#FEF3C7", "#FFFBF0"], vibe: "Wellness · Natural" },
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Brand Names */}
      <div className="space-y-5">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="font-bold">Brand Name Concepts</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Ranked by uniqueness, memorability & trademarkability</p>
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

        {/* Positioning */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-bold mb-3">Product Positioning</h2>
          <div className="space-y-3">
            {[
              { label: "Core Promise", text: "Dermatologist-grade Vitamin C results without the prescription price tag." },
              { label: "Target Enemy", text: "Cheap, watered-down serums that promise everything and deliver nothing." },
              { label: "Unique Mechanism", text: "Patented Slow-Release Matrix delivers active ingredients 3x deeper than standard formulas." },
              { label: "Brand Voice", text: "Confident, science-backed, and approachable. Educated but never condescending." },
            ].map((item) => (
              <div key={item.label} className="p-3 bg-secondary/40 rounded-xl">
                <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">{item.label}</p>
                <p className="text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Color Palettes + Logo */}
      <div className="space-y-5">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="font-bold">Color Palettes</h2>
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
                    <div
                      key={color}
                      className="flex-1 h-12 rounded-xl border border-border relative group cursor-pointer"
                      style={{ backgroundColor: color }}
                    >
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

        {/* Logo Direction */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-bold mb-4">Logo Concepts</h2>
          <div className="space-y-3">
            {[
              { style: "Wordmark", desc: "Elegant serif typeface in deep rose. Letter-spacing +0.08em. No icon — the brand name IS the logo.", preview: "bg-gradient-to-br from-rose-100 to-pink-50" },
              { style: "Icon + Wordmark", desc: "Abstract glow drop icon (representing a serum droplet with radiating lines). Clean sans-serif name below.", preview: "bg-gradient-to-br from-violet-100 to-indigo-50" },
              { style: "Monogram", desc: "Single letter 'L' or 'G' in a circle, embossed gold foil effect. High-end packaging feel.", preview: "bg-gradient-to-br from-amber-100 to-yellow-50" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-3 border border-border rounded-xl hover:border-primary/20 transition-colors">
                <div className={`w-14 h-14 rounded-xl ${item.preview} shrink-0 flex items-center justify-center`}>
                  <Palette className="h-5 w-5 text-muted-foreground/50" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{item.style}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HooksTab({ copy, copied }: { copy: (t: string, i: string) => void; copied: string | null }) {
  const hooks = [
    { hook: "Stop buying skincare that sits on TOP of your skin. This serum goes THROUGH it.", score: 97, type: "Education" },
    { hook: "I was embarrassed to go makeup-free for 3 years. Then I tried this.", score: 95, type: "Vulnerability" },
    { hook: "Dermatologists literally recommend Vitamin C but won't tell you WHICH one. Here's the secret.", score: 94, type: "Authority" },
    { hook: "Why does this $38 serum outperform every $200 serum I've tried? Let's break it down.", score: 93, type: "Comparison" },
    { hook: "If you have ONE skincare product in your routine, let it be this.", score: 91, type: "Simplicity" },
    { hook: "POV: You finally found the serum everyone on Sephora keeps selling out of.", score: 90, type: "Social Proof" },
    { hook: "Vitamin C sounds boring until you see what it actually does to your skin.", score: 89, type: "Curiosity" },
    { hook: "My esthetician said this — most people are using Vitamin C WRONG. Here's why.", score: 88, type: "Expert" },
    { hook: "Before you spend another $100 on skincare, watch this (I wish someone told me sooner).", score: 87, type: "Value" },
    { hook: "This ingredient is in every celebrity skincare routine and nobody talks about it.", score: 86, type: "Exclusive" },
    { hook: "I gave my skeptical mom this serum. She ordered 3 more for her friends. That's the review.", score: 92, type: "Story" },
    { hook: "30 days. One serum. The glow I've been chasing for 5 years.", score: 90, type: "Transformation" },
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

function ScriptsTab({ copy, copied }: { copy: (t: string, i: string) => void; copied: string | null }) {
  const scripts = [
    {
      title: "30s UGC Script — Transformation",
      platform: "TikTok / Reels",
      script: `[0:00-0:03 | HOOK]
Direct to camera: "I genuinely did not believe a serum could change my skin this fast. Then week two happened."

[0:03-0:12 | PROBLEM]
"For three years I wore full-coverage foundation every single day. I was embarrassed by my uneven texture and hyperpigmentation. I'd tried toners, acids, retinol — nothing worked."

[0:12-0:22 | SOLUTION]
B-roll of applying GlowSkin serum. VO: "My esthetician told me to try this Vitamin C serum. Day 7 I noticed my skin was brighter. Day 21 I went foundation-free for the first time in years."

[0:22-0:30 | CTA]
Close-up of glowing skin + product. VO: "Link in bio. They have a 30-day guarantee so there's nothing to lose — but based on my results? You won't need it."`,
    },
    {
      title: "60s VSL — Direct Response",
      platform: "Meta / YouTube",
      script: `[0:00-0:05 | HOOK]
"Most skincare fails because it sits on TOP of your skin. It never gets absorbed. This serum is different."

[0:05-0:20 | AGITATE]
"You've probably spent hundreds — maybe thousands — on serums, treatments, and products that promised everything. And you're still here. Still dealing with the same issues. That's not your fault. The industry is built on products that look great in ads and do nothing in real life."

[0:20-0:40 | SOLUTION]
"GlowSkin's Vitamin C Serum uses a Slow-Release Matrix that delivers active ingredients past the surface layer of your skin — where real change actually happens. That's why 87% of users see visible improvement within 2 weeks. Not 2 months. 2 weeks."

[0:40-0:52 | PROOF]
Text overlays: "50,000+ bottles sold · 4.9/5 from 12,847 reviews · Featured in Vogue, Byrdie, and Harper's Bazaar"

[0:52-1:00 | OFFER]
"Right now, use code GLOW for 20% off your first bottle — plus free shipping and a 30-day money-back guarantee. Click below. Your skin will thank you."`,
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

function AudienceTab() {
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

function ProductPhotosTab() {
  const [downloading, setDownloading] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  async function fakeDownload(i: number) {
    setDownloading(i);
    await new Promise((r) => setTimeout(r, 1400));
    setDownloading(null);
  }

  return (
    <div>
      <div className="flex items-start gap-4 mb-6 p-4 bg-primary/5 border border-primary/15 rounded-2xl">
        <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center shrink-0">
          <Camera className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold mb-0.5">AI Product Photos — GlowSkin Vitamin C Serum</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            4 photorealistic images generated based on your product, brand style, and target audience.
            Download as PNG or use the AI prompt to generate with Midjourney, DALL·E, or Firefly.
          </p>
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
            {/* Fake photo preview */}
            <div
              className={`relative h-56 bg-gradient-to-br ${shot.gradient} overflow-hidden cursor-pointer`}
              onClick={() => setExpanded(expanded === i ? null : i)}
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

              {i === 1 && (
                <>
                  <div className="absolute bottom-4 left-4 w-16 h-4 bg-stone-300/40 rounded-full blur-sm" />
                  <div className="absolute top-8 right-6 w-8 h-12 bg-green-200/30 rounded-full blur-sm" />
                  <div className="absolute inset-0 bg-gradient-to-t from-rose-200/30 to-transparent" />
                </>
              )}
              {i === 2 && (
                <>
                  <div className="absolute bottom-0 inset-x-0 h-12 gradient-bg opacity-20" />
                  <div className="absolute top-3 right-3 bg-white/80 rounded-full px-2 py-0.5 text-[10px] font-black text-violet-700 shadow">30-Day Guarantee</div>
                  <div className="absolute bottom-3 left-3 right-3 bg-white/70 rounded-lg px-2 py-1.5">
                    <div className="h-1.5 bg-violet-400/60 rounded w-3/4 mb-1" />
                    <div className="h-1 bg-violet-300/50 rounded w-1/2" />
                  </div>
                </>
              )}
              {i === 3 && (
                <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-400/20 to-pink-400/20" />
              )}

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                  View prompt
                </div>
              </div>
              <div className="absolute top-3 left-3 bg-black/50 text-white text-[10px] font-mono px-2 py-1 rounded-lg backdrop-blur-sm">
                {shot.aspectLabel}
              </div>
            </div>

            <AnimatePresence>
              {expanded === i && (
                <motion.div
                  className="border-t border-border bg-secondary/30 px-4 py-3"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">AI Prompt</p>
                  <p className="text-xs text-muted-foreground italic leading-relaxed">"{shot.prompt}"</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg ${shot.accent} flex items-center justify-center`}>
                    <shot.icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <h3 className="font-bold text-sm">{shot.type}</h3>
                </div>
                <button
                  onClick={() => fakeDownload(i)}
                  disabled={downloading === i}
                  className="flex items-center gap-1.5 gradient-bg text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-70"
                >
                  {downloading === i
                    ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Download className="h-3 w-3" />
                  }
                  {downloading === i ? "Saving..." : "Download PNG"}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{shot.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {shot.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{tag}</span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-5 p-4 border border-dashed border-border rounded-2xl flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">Not quite right?</p>
          <p className="text-xs text-muted-foreground mt-0.5">Adjust your brand style or product description and regenerate.</p>
        </div>
        <button className="flex items-center gap-2 text-xs font-semibold text-primary border border-primary/30 px-4 py-2 rounded-xl hover:bg-primary/5 transition-colors whitespace-nowrap">
          <RefreshCw className="h-3.5 w-3.5" />
          Regenerate photos
        </button>
      </div>
    </div>
  );
}
