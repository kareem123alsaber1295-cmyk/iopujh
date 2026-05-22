"use client";
import { motion } from "framer-motion";
import { Image, Download, Copy } from "lucide-react";

const pictureAds = [
  {
    title: "Before/After Split",
    format: "Static · Square (1:1)",
    platform: "Meta & Instagram",
    concept: "Left half shows dull, uneven skin texture. Right half shows glowing, even skin. Bold text overlay: 'Day 1 vs Day 30'. Product featured prominently in bottom corner with 5-star rating.",
    elements: ["Split image layout", "Before/after contrast", "Bold typography", "Product badge", "Star rating"],
    colors: ["#6366F1", "#EDE9FE", "#FFFFFF"],
    angle: "Transformation",
  },
  {
    title: "Ingredient Highlight",
    format: "Static · 4:5 Portrait",
    platform: "Instagram Feed",
    concept: "Clean white background. Product bottle centered. Key ingredients floating around it with connecting lines and benefit callouts. Premium, scientific aesthetic. Bottom: 'Dermatologist formulated' badge.",
    elements: ["Hero product shot", "Floating ingredient callouts", "Scientific aesthetic", "Trust badge", "Benefit bullets"],
    colors: ["#FFFFFF", "#1E293B", "#6366F1"],
    angle: "Education / Trust",
  },
  {
    title: "UGC Quote Overlay",
    format: "Static · 9:16 Story",
    platform: "Instagram Stories & TikTok",
    concept: "Real customer photo as background (blurred edges). Large testimonial quote in center: 'I\'ve tried 20 serums. This is the only one I\'ve reordered.' Star rating + name underneath. Gradient overlay at bottom with CTA.",
    elements: ["Customer photo background", "Pull quote typography", "Star rating", "Gradient CTA bar", "Trust signal"],
    colors: ["#EC4899", "#6366F1", "#FFFFFF"],
    angle: "Social Proof",
  },
  {
    title: "Problem/Solution",
    format: "Static · Landscape (16:9)",
    platform: "YouTube Thumbnail & Meta",
    concept: "Bold red headline on left: 'Still using that serum that doesn\'t work?' Product bottle on right with green checkmark. Dark, high-contrast background for scroll-stop power.",
    elements: ["Problem headline", "Solution product", "High contrast design", "Checkmark CTA", "Urgency color"],
    colors: ["#EF4444", "#22C55E", "#0F172A"],
    angle: "Pain Point",
  },
];

export default function PictureAdsPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <p className="text-muted-foreground text-sm mb-1">Creative Suite</p>
        <h1 className="text-2xl font-bold tracking-tight">Picture Ad Concepts</h1>
        <p className="text-muted-foreground text-sm mt-1">Static ad briefs ready for your designer or Canva</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {pictureAds.map((ad, i) => (
          <motion.div
            key={i}
            className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all hover:-translate-y-0.5 group"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            {/* Mock preview area */}
            <div
              className="h-44 relative overflow-hidden flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${ad.colors[0]}33, ${ad.colors[1]}33)` }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Image className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p className="text-xs text-muted-foreground font-medium">{ad.format}</p>
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-card to-transparent" />
              <div className="absolute top-3 left-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: ad.colors[0] }}>
                  {ad.angle}
                </span>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-sm">{ad.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{ad.platform}</p>
                </div>
                <div className="flex gap-1.5">
                  <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed mb-4">{ad.concept}</p>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {ad.elements.map((el) => (
                  <span key={el} className="text-xs bg-secondary px-2 py-0.5 rounded-full">{el}</span>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Colors:</span>
                {ad.colors.map((c) => (
                  <div key={c} className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
