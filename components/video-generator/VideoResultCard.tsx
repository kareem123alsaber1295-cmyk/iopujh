"use client";
import { useState } from "react";
import { Download, Copy, Check, RefreshCw, Play, Clock, Trash2 } from "lucide-react";
import type { VideoGeneration } from "@/lib/videoPipeline";

interface Props {
  generation: VideoGeneration;
  onRegenerate: (g: VideoGeneration) => void;
  onDelete: (id: string) => void;
}

export default function VideoResultCard({ generation: g, onRegenerate, onDelete }: Props) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(g.final_video_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function download() {
    const a = document.createElement("a");
    a.href = g.final_video_url;
    a.download = `${g.product_name.toLowerCase().replace(/\s+/g, "-")}-${g.id}.mp4`;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
  }

  const createdAt = new Date(g.created_at);
  const dateLabel = createdAt.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all">
      {/* Video preview */}
      <div className="relative aspect-[9/16] bg-black overflow-hidden group">
        <video
          src={g.final_video_url}
          poster={g.product_image_url ?? undefined}
          controls
          preload="metadata"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2 flex items-center gap-1.5 pointer-events-none">
          <StatusBadge status={g.status} />
        </div>
        <div className="absolute top-2 right-2 pointer-events-none">
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-black/60 text-white backdrop-blur-sm">
            {g.duration}
          </span>
        </div>
      </div>

      {/* Meta */}
      <div className="p-4 space-y-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-sm truncate">{g.product_name}</h3>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{dateLabel}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge tone="violet">{g.mode}</Badge>
          <Badge tone="blue">{g.platform}</Badge>
        </div>

        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <ActionButton onClick={download} icon={Download} label="Download" />
          <ActionButton
            onClick={copyLink}
            icon={copied ? Check : Copy}
            label={copied ? "Copied" : "Copy link"}
            tone={copied ? "success" : "default"}
          />
          <ActionButton
            onClick={() => onRegenerate(g)}
            icon={RefreshCw}
            label="Regenerate"
          />
        </div>

        <button
          type="button"
          onClick={() => onDelete(g.id)}
          className="w-full mt-1 text-[11px] text-muted-foreground hover:text-rose-600 flex items-center justify-center gap-1 transition-colors"
        >
          <Trash2 className="h-3 w-3" />
          Delete
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: VideoGeneration["status"] }) {
  const map: Record<VideoGeneration["status"], { label: string; cls: string; icon: React.ReactNode }> = {
    queued:     { label: "Queued",     cls: "bg-amber-500/90 text-white",   icon: <Clock className="h-2.5 w-2.5" /> },
    generating: { label: "Generating", cls: "bg-violet-500/90 text-white",  icon: <Play className="h-2.5 w-2.5" /> },
    completed:  { label: "Completed",  cls: "bg-emerald-500/90 text-white", icon: <Check className="h-2.5 w-2.5" /> },
    failed:     { label: "Failed",     cls: "bg-rose-500/90 text-white",    icon: <Clock className="h-2.5 w-2.5" /> },
  };
  const v = map[status];
  return (
    <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm ${v.cls}`}>
      {v.icon}
      {v.label}
    </span>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "violet" | "blue" | "pink" | "emerald" }) {
  const cls: Record<typeof tone, string> = {
    violet: "bg-violet-50 text-violet-700 border-violet-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    pink: "bg-pink-50 text-pink-700 border-pink-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cls[tone]}`}>
      {children}
    </span>
  );
}

function ActionButton({
  onClick, icon: Icon, label, tone = "default",
}: {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tone?: "default" | "success";
}) {
  const base = "flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-semibold border transition-all";
  const styles = tone === "success"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground hover:bg-secondary/40";
  return (
    <button type="button" onClick={onClick} className={`${base} ${styles}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
