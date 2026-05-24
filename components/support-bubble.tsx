"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { MessageCircle, X, Bug, RefreshCw, Zap, LifeBuoy, Sparkles, ArrowUpRight } from "lucide-react";

const QUICK_LINKS = [
  { icon: Bug, label: "Report a bug", color: "text-amber-500" },
  { icon: RefreshCw, label: "Request refund", color: "text-emerald-500" },
  { icon: Zap, label: "Upgrade plan", color: "text-violet-500" },
  { icon: LifeBuoy, label: "Get help", color: "text-blue-500" },
];

export default function SupportBubble() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-card border border-border rounded-2xl shadow-2xl shadow-black/10 w-64 overflow-hidden"
          >
            <div className="gradient-bg p-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-tight">LaunchLabs Support</p>
                  <p className="text-white/70 text-xs">24/7 AI-assisted support</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="text-white/80 text-xs">Online now</span>
                <span className="ml-auto text-white/50 text-xs">Demo support system</span>
              </div>
            </div>

            <div className="p-3 space-y-0.5">
              {QUICK_LINKS.map((item) => (
                <Link
                  key={item.label}
                  href="/dashboard/support"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors group"
                >
                  <item.icon className={`h-4 w-4 ${item.color} shrink-0`} />
                  <span className="text-sm font-medium flex-1">{item.label}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>

            <div className="px-3 pb-3">
              <Link
                href="/dashboard/support"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 w-full gradient-bg text-white text-sm font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity"
              >
                Open Support Center
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen(!open)}
        className="relative w-14 h-14 gradient-bg rounded-full shadow-xl shadow-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
        aria-label="Support"
      >
        <span className="absolute inset-0 rounded-full gradient-bg animate-ping opacity-20" />
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="h-6 w-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="msg" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle className="h-6 w-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
