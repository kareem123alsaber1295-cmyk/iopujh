"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, TrendingUp, TrendingDown, Minus, AlertTriangle,
  CheckCircle2, BarChart3, Sparkles, X
} from "lucide-react";

interface Product {
  name: string;
  niche: string;
  demandScore: number;
  saturationScore: number;
  profitPotential: number;
  avgPrice: string;
  trend: "up" | "down" | "flat";
  verdict: string;
  verdictColor: string;
  insights: string[];
  risks: string[];
}

const defaultProducts: Product[] = [
  {
    name: "Vitamin C Serum",
    niche: "Skincare",
    demandScore: 92,
    saturationScore: 65,
    profitPotential: 88,
    avgPrice: "$38",
    trend: "up",
    verdict: "Strong Buy",
    verdictColor: "text-emerald-600 bg-emerald-50",
    insights: [
      "High search volume on Amazon (120k/mo) with growing trend",
      "Top 5 competitors have thin social presence — opportunity",
      "Avg margin: 68% · Shopify AOV: $52",
      "TikTok hashtag #vitaminCserum has 4.2B views",
    ],
    risks: ["Crowded category — differentiation is critical"],
  },
  {
    name: "Blue Light Glasses",
    niche: "Health & Wellness",
    demandScore: 78,
    saturationScore: 88,
    profitPotential: 55,
    avgPrice: "$24",
    trend: "down",
    verdict: "Saturated",
    verdictColor: "text-amber-600 bg-amber-50",
    insights: [
      "Search volume stable but declining (-12% YoY)",
      "300+ competitors with >100 reviews on Amazon",
      "Low AOV limits ad spend headroom",
    ],
    risks: ["Very saturated — need strong brand differentiation", "Declining interest post-pandemic"],
  },
  {
    name: "Collagen Peptide Powder",
    niche: "Supplements",
    demandScore: 95,
    profitPotential: 91,
    saturationScore: 55,
    avgPrice: "$45",
    trend: "up",
    verdict: "Hot Product",
    verdictColor: "text-violet-600 bg-violet-50",
    insights: [
      "Fastest growing supplement category in 2024",
      "Amazon BSR top 100 in Sports Nutrition",
      "TikTok: #collagen has 12B+ views",
      "AOV typically $65+ with subscription model",
    ],
    risks: ["FDA compliance required — consult regulations"],
  },
];

// Generates fake-but-plausible analysis from any query string
function generateAnalysis(query: string): Product {
  const q = query.trim();
  const words = q.split(" ");
  const niche = words.length > 1 ? words.slice(1).join(" ") : "General";

  // Seed numbers from the query string so results are consistent per query
  const seed = q.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const demand = 55 + (seed % 40);
  const profit = 50 + ((seed * 3) % 45);
  const saturation = 30 + ((seed * 7) % 55);
  const price = 20 + ((seed * 11) % 80);
  const trendSeed = seed % 3;
  const trend: "up" | "down" | "flat" = trendSeed === 0 ? "up" : trendSeed === 1 ? "down" : "flat";

  let verdict = "Moderate";
  let verdictColor = "text-blue-600 bg-blue-50";
  if (demand > 80 && saturation < 60) { verdict = "Hot Product"; verdictColor = "text-violet-600 bg-violet-50"; }
  else if (demand > 70 && profit > 70) { verdict = "Strong Buy"; verdictColor = "text-emerald-600 bg-emerald-50"; }
  else if (saturation > 75) { verdict = "Saturated"; verdictColor = "text-amber-600 bg-amber-50"; }
  else if (demand < 55) { verdict = "Low Demand"; verdictColor = "text-red-600 bg-red-50"; }

  const trendLabel = trend === "up" ? "growing +18% YoY" : trend === "down" ? "declining -12% YoY" : "stable with flat growth";

  return {
    name: q,
    niche: niche.charAt(0).toUpperCase() + niche.slice(1),
    demandScore: demand,
    saturationScore: saturation,
    profitPotential: profit,
    avgPrice: `$${price}`,
    trend,
    verdict,
    verdictColor,
    insights: [
      `Search volume is ${trendLabel} across Google & Amazon`,
      `Estimated ${(seed % 8) + 2}k monthly searches on Amazon in this category`,
      `Avg margin in this niche: ${profit - 10}–${profit + 5}% · Typical AOV: $${price + 15}`,
      `TikTok content around this niche has ${(seed % 9) + 1}.${seed % 9}B+ total views`,
    ],
    risks: [
      saturation > 65 ? "Competitive market — strong branding required to stand out" : "Relatively low competition — first-mover advantage available",
      demand < 70 ? "Lower demand signals — validate with paid traffic before scaling" : "Strong demand — validate unit economics before scaling ad spend",
    ],
  };
}

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs font-bold w-8 text-right">{value}</span>
    </div>
  );
}

function ProductCard({ product, i }: { product: Product; i: number }) {
  return (
    <motion.div
      className="bg-card border border-border rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.08, duration: 0.4 }}
    >
      <div className="p-5 border-b border-border flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
            {product.trend === "up" ? (
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            ) : product.trend === "down" ? (
              <TrendingDown className="h-5 w-5 text-red-500" />
            ) : (
              <Minus className="h-5 w-5 text-amber-500" />
            )}
          </div>
          <div>
            <h3 className="font-bold">{product.name}</h3>
            <p className="text-xs text-muted-foreground">{product.niche} · Avg. price: {product.avgPrice}</p>
          </div>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${product.verdictColor}`}>
          {product.verdict}
        </span>
      </div>

      <div className="p-5 grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Scores</p>
          <div>
            <p className="text-xs font-medium mb-1">Demand Score</p>
            <ScoreBar value={product.demandScore} color="bg-emerald-500" />
          </div>
          <div>
            <p className="text-xs font-medium mb-1">Profit Potential</p>
            <ScoreBar value={product.profitPotential} color="bg-violet-500" />
          </div>
          <div>
            <p className="text-xs font-medium mb-1">Market Saturation</p>
            <ScoreBar value={product.saturationScore} color="bg-amber-500" />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">AI Insights</p>
          <ul className="space-y-2">
            {product.insights.map((insight, j) => (
              <li key={j} className="flex items-start gap-2 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-muted-foreground leading-relaxed">{insight}</span>
              </li>
            ))}
            {product.risks.map((risk, j) => (
              <li key={j} className="flex items-start gap-2 text-xs">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-muted-foreground leading-relaxed">{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProductResearchPage() {
  const [query, setQuery] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<Product[]>(defaultProducts);
  const [searchedQuery, setSearchedQuery] = useState("");

  async function handleAnalyze(e?: React.FormEvent) {
    e?.preventDefault();
    if (!query.trim()) return;

    setAnalyzing(true);
    setSearched(false);

    // Fake analysis delay
    await new Promise((r) => setTimeout(r, 1800));

    const generated = generateAnalysis(query);
    setResults([generated, ...defaultProducts]);
    setSearchedQuery(query);
    setSearched(true);
    setAnalyzing(false);
  }

  function clearSearch() {
    setQuery("");
    setSearched(false);
    setResults(defaultProducts);
    setSearchedQuery("");
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <p className="text-muted-foreground text-sm mb-1">Market Intelligence</p>
        <h1 className="text-2xl font-bold tracking-tight">Product Research</h1>
        <p className="text-muted-foreground text-sm mt-1">Validate products before you invest in branding</p>
      </div>

      <form onSubmit={handleAnalyze} className="bg-card border border-border rounded-2xl p-5 mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter a product or niche (e.g. 'matcha powder', 'posture corrector')"
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            disabled={analyzing || !query.trim()}
            className="gradient-bg text-white font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {analyzing ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <BarChart3 className="h-4 w-4" />
            )}
            {analyzing ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </form>

      {/* Analyzing overlay */}
      <AnimatePresence>
        {analyzing && (
          <motion.div
            className="bg-card border border-primary/20 rounded-2xl p-6 mb-6 text-center"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-3">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                <Sparkles className="h-6 w-6 text-white" />
              </motion.div>
            </div>
            <p className="font-semibold mb-1">Analyzing "{query}"</p>
            <p className="text-sm text-muted-foreground">Scanning demand data, competition levels, and market trends...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result banner */}
      <AnimatePresence>
        {searched && !analyzing && (
          <motion.div
            className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl px-5 py-3 mb-5 text-sm"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <span>
              <strong>Analysis complete</strong> for "{searchedQuery}" — showing your result + similar products
            </span>
            <button onClick={clearSearch} className="ml-3 text-emerald-600 hover:text-emerald-800 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-5">
        {results.map((product, i) => (
          <ProductCard key={`${product.name}-${i}`} product={product} i={i} />
        ))}
      </div>
    </div>
  );
}
