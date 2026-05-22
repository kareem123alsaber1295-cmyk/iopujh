"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Copy, Check, Monitor, Smartphone } from "lucide-react";

const adTypes = ["Meta Feed", "TikTok", "Instagram Stories", "YouTube Pre-roll"];

const sampleAds = [
  {
    platform: "Meta Feed",
    headline: "Finally — Skincare That Actually Works Overnight",
    body: "Tired of serums that promise everything and deliver nothing? GlowSkin's Vitamin C Serum uses a patented slow-release formula that works while you sleep.\n\n✅ Visible results in 7 days\n✅ Dermatologist tested\n✅ No harsh chemicals\n\nJoin 50,000+ women who woke up to brighter, firmer skin. Try risk-free with our 30-day guarantee.",
    cta: "Shop Now",
    format: "Image Ad",
  },
  {
    platform: "TikTok",
    headline: "POV: You found the serum everyone's talking about",
    body: "I was today years old when I discovered GlowSkin and my skincare routine will never be the same 😭✨\n\nDropping my full morning routine in comments — follow for more honest reviews!",
    cta: "Learn More",
    format: "UGC Video",
  },
  {
    platform: "Instagram Stories",
    headline: "Swipe up to transform your skin →",
    body: "Limited time: Get 20% off your first order + FREE shipping. Over 10,000 5-star reviews. Try it risk-free.",
    cta: "Swipe Up",
    format: "Story Ad",
  },
];

export default function AdGeneratorPage() {
  const [selected, setSelected] = useState(0);
  const [copied, setCopied] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);

  function copy(text: string, i: number) {
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  }

  async function regenerate() {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1500));
    setGenerating(false);
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <p className="text-muted-foreground text-sm mb-1">Creative Suite</p>
        <h1 className="text-2xl font-bold tracking-tight">Ad Generator</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h2 className="font-semibold">Configuration</h2>
            <div>
              <label className="block text-sm font-medium mb-1.5">Product</label>
              <input
                defaultValue="GlowSkin Vitamin C Serum"
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Platform</label>
              <div className="space-y-2">
                {adTypes.map((type) => (
                  <label key={type} className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" defaultChecked={type !== "YouTube Pre-roll"} className="rounded" />
                    <span className="text-sm">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Tone</label>
              <select className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option>Conversational & friendly</option>
                <option>Bold & direct</option>
                <option>Luxury & aspirational</option>
                <option>Educational</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Goal</label>
              <select className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option>Conversions (Purchase)</option>
                <option>Traffic</option>
                <option>Brand Awareness</option>
                <option>Lead Generation</option>
              </select>
            </div>
            <button
              onClick={regenerate}
              disabled={generating}
              className="w-full gradient-bg text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm"
            >
              {generating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {generating ? "Generating..." : "Generate Ads"}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-2 flex-wrap">
            {sampleAds.map((ad, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                  selected === i ? "gradient-bg text-white" : "bg-secondary hover:bg-secondary/80"
                }`}
              >
                {ad.platform}
              </button>
            ))}
          </div>

          {sampleAds.map((ad, i) => (
            <motion.div
              key={i}
              className={selected === i ? "block" : "hidden"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    {ad.platform === "Meta Feed" ? <Monitor className="h-4 w-4 text-blue-500" /> : <Smartphone className="h-4 w-4 text-pink-500" />}
                    <span className="font-semibold text-sm">{ad.platform}</span>
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{ad.format}</span>
                  </div>
                  <button
                    onClick={() => copy(`${ad.headline}\n\n${ad.body}\n\nCTA: ${ad.cta}`, i)}
                    className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied === i ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied === i ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="p-5 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Headline</p>
                    <p className="font-bold text-lg leading-tight">{ad.headline}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Ad Copy</p>
                    <p className="text-sm leading-relaxed whitespace-pre-line text-foreground/90">{ad.body}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                      CTA: {ad.cta}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
