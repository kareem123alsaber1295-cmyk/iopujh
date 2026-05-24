"use client";
import { motion } from "framer-motion";
import {
  FileText, Clock, Mic, Film, AudioLines, Captions, Wand2, Save, Check, Sparkles,
} from "lucide-react";
import { PIPELINE_STAGES, type StageKey } from "@/lib/videoPipeline";

const STAGE_ICON: Record<StageKey, React.ComponentType<{ className?: string }>> = {
  preparing: FileText,
  timing:    Clock,
  voice:     Mic,
  video:     Film,
  lipsync:   AudioLines,
  captions:  Captions,
  render:    Wand2,
  save:      Save,
};

export default function GenerationProgress({ stage }: { stage: number }) {
  const pct = Math.round(((stage + 1) / PIPELINE_STAGES.length) * 100);

  return (
    <div className="bg-card border border-border rounded-2xl p-8 sm:p-10 min-h-[600px] flex flex-col items-center">
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute inset-0 rounded-full gradient-bg opacity-20 animate-ping" />
        <div className="absolute inset-2 rounded-full gradient-bg flex items-center justify-center shadow-lg shadow-primary/30">
          <Sparkles className="h-7 w-7 text-white animate-pulse" />
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-1">Generating your video</h3>
      <p className="text-sm text-muted-foreground mb-2">This usually takes 30–90 seconds with real APIs</p>

      <div className="w-full max-w-md mb-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>{pct}% complete</span>
          <span>{stage + 1} / {PIPELINE_STAGES.length}</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full gradient-bg"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="w-full max-w-md space-y-2.5">
        {PIPELINE_STAGES.map((s, i) => {
          const Icon = STAGE_ICON[s.key];
          const done = i < stage;
          const active = i === stage;
          return (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                active
                  ? "border-primary bg-primary/5"
                  : done
                  ? "border-emerald-200 bg-emerald-50/50"
                  : "border-border bg-background"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  active
                    ? "gradient-bg text-white"
                    : done
                    ? "bg-emerald-500 text-white"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {done ? (
                  <Check className="h-3.5 w-3.5" />
                ) : active ? (
                  <Icon className="h-3.5 w-3.5 animate-pulse" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  active ? "text-foreground" : done ? "text-emerald-700" : "text-muted-foreground"
                }`}
              >
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
