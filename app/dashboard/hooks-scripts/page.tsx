"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Zap, RefreshCw } from "lucide-react";

const hookCategories = ["All", "Pain Point", "Curiosity", "Social Proof", "Transformation", "Controversial", "How-To"];

const hooks = [
  { category: "Pain Point", hook: "Stop wasting money on skincare that doesn't work. This is what actually changed my skin.", score: 94 },
  { category: "Curiosity", hook: "The skincare ingredient dermatologists don't want you to know about (it's in this serum)", score: 91 },
  { category: "Social Proof", hook: "50,000 women switched to this serum after their old one stopped working. Here's why.", score: 88 },
  { category: "Transformation", hook: "Before: Dull, uneven skin. After: People keep asking if I got filler. Same serum, 30 days.", score: 93 },
  { category: "Controversial", hook: "Unpopular opinion: most skincare routines are making your skin WORSE. Here's proof.", score: 87 },
  { category: "How-To", hook: "How I fixed 5 years of hyperpigmentation in 6 weeks with one ingredient.", score: 89 },
  { category: "Pain Point", hook: "If your skincare is still not working after 3 months, you're missing this step.", score: 85 },
  { category: "Curiosity", hook: "I tried every viral serum on TikTok. This is the only one I reordered.", score: 92 },
];

const scripts = [
  {
    type: "UGC Script (30s)",
    script: `[Hook - 0:00-0:03]
"I never thought I'd find a serum that actually WORKS until I tried this."

[Problem - 0:03-0:10]
"For years I struggled with dull, uneven skin. I tried everything — expensive treatments, drugstore options, you name it. Nothing worked."

[Solution - 0:10-0:20]
"Then I found GlowSkin. Within the first week I noticed my skin was brighter. By week three, my hyperpigmentation had visibly faded."

[CTA - 0:20-0:30]
"I've linked it below. If you're on the fence — they have a 30-day money-back guarantee, so there's zero risk. Just try it."`,
  },
  {
    type: "VSL Script (60s)",
    script: `[HOOK - 0:00-0:05]
"What if I told you there's a serum that 50,000 women have called life-changing?"

[AGITATE - 0:05-0:20]
"Most skincare is 90% water and 10% promises. You buy it, use it religiously, and 60 days later... nothing. You start thinking it's just your skin."

[SOLUTION - 0:20-0:40]
"GlowSkin is different. Our patented Slow-Release Vitamin C Matrix delivers active ingredients directly into the dermis — not just sitting on top of the skin. That's why you see real results in 7 days."

[SOCIAL PROOF - 0:40-0:52]
"Over 10,000 verified 5-star reviews. Featured in Vogue and Byrdie. Recommended by 200+ dermatologists."

[OFFER + CTA - 0:52-1:00]
"Right now you can try it risk-free with our 30-day guarantee. Click below — your skin will thank you."`,
  },
];

export default function HooksScriptsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"hooks" | "scripts">("hooks");

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const filtered = activeCategory === "All" ? hooks : hooks.filter(h => h.category === activeCategory);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-muted-foreground text-sm mb-1">Creative Tools</p>
        <h1 className="text-2xl font-bold tracking-tight">Hooks & Scripts</h1>
      </div>

      <div className="flex gap-3 mb-6">
        {["hooks", "scripts"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as "hooks" | "scripts")}
            className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
              activeTab === tab ? "gradient-bg text-white shadow-md shadow-primary/20" : "bg-secondary hover:bg-secondary/80"
            }`}
          >
            {tab === "hooks" ? "Ad Hooks" : "Full Scripts"}
          </button>
        ))}
      </div>

      {activeTab === "hooks" && (
        <div>
          <div className="flex gap-2 flex-wrap mb-6">
            {hookCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
                  activeCategory === cat ? "bg-foreground text-background" : "bg-secondary hover:bg-secondary/80 text-muted-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map((hook, i) => (
              <motion.div
                key={i}
                className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4 hover:border-primary/20 transition-all group"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">
                      {hook.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs">
                      <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
                      <span className="font-bold text-amber-600">{hook.score}</span>
                      <span className="text-muted-foreground">/ 100</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium leading-relaxed">{hook.hook}</p>
                </div>
                <button
                  onClick={() => copy(hook.hook, `hook-${i}`)}
                  className="shrink-0 p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                >
                  {copied === `hook-${i}` ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </motion.div>
            ))}
          </div>

          <button className="w-full mt-4 py-3 border border-dashed border-border rounded-2xl text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Generate 8 more hooks
          </button>
        </div>
      )}

      {activeTab === "scripts" && (
        <div className="space-y-6">
          {scripts.map((script, i) => (
            <motion.div
              key={i}
              className="bg-card border border-border rounded-2xl overflow-hidden"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h3 className="font-semibold text-sm">{script.type}</h3>
                <button
                  onClick={() => copy(script.script, `script-${i}`)}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied === `script-${i}` ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied === `script-${i}` ? "Copied!" : "Copy script"}
                </button>
              </div>
              <div className="p-5">
                <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans text-foreground/90">{script.script}</pre>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
