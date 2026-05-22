"use client";
import { motion } from "framer-motion";
import { Video, Play, Download, Copy } from "lucide-react";

const videoConcepts = [
  {
    title: "The Transformation Story",
    format: "UGC · 30-45s",
    platform: "TikTok & Reels",
    hook: "I've been using this serum for 30 days and I can't believe my results...",
    scenes: [
      { time: "0:00-0:03", desc: "Close-up of face with morning light, looking in mirror", voiceover: "Hook line delivered direct to camera" },
      { time: "0:03-0:10", desc: "B-roll: serum bottle, dropping serum onto face", voiceover: "Describe the problem you had before" },
      { time: "0:10-0:20", desc: "Side-by-side comparison or before/after reveal", voiceover: "Reveal the result / transformation" },
      { time: "0:20-0:30", desc: "Product hero shot + text overlay with offer", voiceover: "CTA with urgency or guarantee" },
    ],
    palette: ["#FFE4E1", "#FF6B6B", "#FFF5F5"],
    tags: ["High conversion", "Easy to film", "Works for UGC creators"],
  },
  {
    title: "The Skeptic Turned Believer",
    format: "UGC · 45-60s",
    platform: "TikTok & Facebook",
    hook: "I was EXTREMELY skeptical about this serum. Then I tried it.",
    scenes: [
      { time: "0:00-0:04", desc: "Creator looking directly at camera, skeptical expression", voiceover: "Hook — 'I never believed skincare actually worked until...'" },
      { time: "0:04-0:15", desc: "Holding old products, rolling eyes", voiceover: "Agitate — talk about past failures and wasted money" },
      { time: "0:15-0:35", desc: "Unboxing, applying serum, showing texture", voiceover: "Discovery — found GlowSkin, first impressions" },
      { time: "0:35-0:50", desc: "Close-up of skin glowing, big smile", voiceover: "Result — 7 days later, 30 days later" },
      { time: "0:50-1:00", desc: "Product with text overlay: link in bio + discount", voiceover: "CTA — 'Link in bio, code GLOW saves 20%'" },
    ],
    palette: ["#E8F5E9", "#4CAF50", "#F3E5F5"],
    tags: ["High trust", "Relatable angle", "Good for cold traffic"],
  },
  {
    title: "Expert Authority",
    format: "Polished · 60s",
    platform: "Meta & YouTube",
    hook: "This is why 80% of skincare products fail — and what actually works",
    scenes: [
      { time: "0:00-0:05", desc: "Clean white studio, presenter in lab coat or professional attire", voiceover: "Bold claim that challenges conventional wisdom" },
      { time: "0:05-0:20", desc: "Whiteboard / diagrams explaining the science", voiceover: "Explain why competitor products fail (no names)" },
      { time: "0:20-0:40", desc: "Product demo with close-up of ingredient list", voiceover: "Introduce your superior formula / technology" },
      { time: "0:40-0:55", desc: "Testimonials on screen, b-roll of happy customers", voiceover: "Social proof — numbers, reviews, certifications" },
      { time: "0:55-1:00", desc: "Logo + CTA screen with guarantee", voiceover: "Offer + urgency + risk reversal" },
    ],
    palette: ["#EDE7F6", "#7C3AED", "#F3E8FF"],
    tags: ["High CPM", "Cold & warm traffic", "VSL style"],
  },
];

export default function VideoAdsPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <p className="text-muted-foreground text-sm mb-1">Creative Suite</p>
        <h1 className="text-2xl font-bold tracking-tight">Video Ad Concepts</h1>
        <p className="text-muted-foreground text-sm mt-1">Production-ready briefs for your video creators</p>
      </div>

      <div className="space-y-6">
        {videoConcepts.map((concept, i) => (
          <motion.div
            key={i}
            className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/20 transition-all"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            <div className="p-5 border-b border-border flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center shrink-0">
                  <Video className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">{concept.title}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{concept.format}</span>
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{concept.platform}</span>
                    {concept.tags.map(tag => (
                      <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                  <Copy className="h-4 w-4" />
                </button>
                <button className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-5">
              <div className="mb-4 p-4 bg-secondary/50 rounded-xl">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Hook</p>
                <p className="text-sm font-semibold">"{concept.hook}"</p>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Scene Breakdown</p>
                {concept.scenes.map((scene, j) => (
                  <div key={j} className="flex gap-3">
                    <div className="shrink-0 w-20 text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded-lg text-center self-start mt-0.5">
                      {scene.time}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground leading-relaxed"><span className="font-medium text-foreground">Visual:</span> {scene.desc}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-0.5"><span className="font-medium text-foreground">VO:</span> {scene.voiceover}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Color mood:</span>
                <div className="flex gap-1.5">
                  {concept.palette.map((color) => (
                    <div key={color} className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
