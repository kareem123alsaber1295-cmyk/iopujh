"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Film, Sparkles } from "lucide-react";
import type { VideoGeneration } from "@/lib/videoPipeline";
import VideoResultCard from "./VideoResultCard";

interface Props {
  generations: VideoGeneration[];
  onRegenerate: (g: VideoGeneration) => void;
  onDelete: (id: string) => void;
}

export default function VideoGallery({ generations, onRegenerate, onDelete }: Props) {
  if (generations.length === 0) {
    return <EmptyState />;
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Film className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">Your generated videos</h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
            {generations.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence initial={false}>
          {generations.map((g) => (
            <motion.div
              key={g.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
            >
              <VideoResultCard
                generation={g}
                onRegenerate={onRegenerate}
                onDelete={onDelete}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="bg-card border border-dashed border-border rounded-2xl p-12 min-h-[600px] flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mb-5 shadow-lg shadow-primary/20">
        <Sparkles className="h-7 w-7 text-white" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        Fill out the video brief on the left and hit{" "}
        <span className="font-semibold text-foreground">Generate Video</span>. Your finished ads will appear here.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-md text-xs">
        {[
          { label: "AI Voice" },
          { label: "Seedance 2.0" },
          { label: "Auto Captions" },
          { label: "9:16 Ready" },
        ].map((x) => (
          <div key={x.label} className="bg-secondary/50 rounded-xl p-3 flex flex-col items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium">{x.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
