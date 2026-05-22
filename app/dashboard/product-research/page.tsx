"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, TrendingUp, TrendingDown, Minus, Star, AlertTriangle, CheckCircle2, BarChart3 } from "lucide-react";

const products = [
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

export default function ProductResearchPage() {
  const [query, setQuery] = useState("");

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <p className="text-muted-foreground text-sm mb-1">Market Intelligence</p>
        <h1 className="text-2xl font-bold tracking-tight">Product Research</h1>
        <p className="text-muted-foreground text-sm mt-1">Validate products before you invest in branding</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a product category or niche..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button className="gradient-bg text-white font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analyze
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {products.map((product, i) => (
          <motion.div
            key={i}
            className="bg-card border border-border rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
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
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">Demand Score</span>
                  </div>
                  <ScoreBar value={product.demandScore} color="bg-emerald-500" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">Profit Potential</span>
                  </div>
                  <ScoreBar value={product.profitPotential} color="bg-violet-500" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">Market Saturation</span>
                  </div>
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
        ))}
      </div>
    </div>
  );
}
