"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <p className="text-7xl font-black gradient-text mb-4">404</p>
        <h1 className="text-2xl font-bold mb-3">Page not found</h1>
        <p className="text-muted-foreground max-w-sm mx-auto mb-8">
          This page doesn&apos;t exist — but your next viral brand does. Head back and build it.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 gradient-bg text-white font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
          >
            Go to Dashboard
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
