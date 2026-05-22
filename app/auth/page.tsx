"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Eye, EyeOff, Globe } from "lucide-react";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/dashboard"), 1200);
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08),transparent)]" />

        <Link href="/" className="relative z-10 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center border border-white/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl text-white">LaunchLabs</span>
        </Link>

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Your next big brand starts here.
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-10">
              Join thousands of entrepreneurs who use LaunchLabs to turn products into viral brands in minutes.
            </p>
            <div className="space-y-4">
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.15, duration: 0.5 }}
                >
                  <p className="text-white/90 text-sm leading-relaxed mb-3">"{t.quote}"</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold`}>
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-white text-xs font-semibold">{t.name}</p>
                      <p className="text-white/50 text-xs">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg">LaunchLabs</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-muted-foreground">
              {mode === "signup"
                ? "Start building viral brands with AI today."
                : "Sign in to continue building."}
            </p>
          </div>

          {/* Google SSO */}
          <button className="w-full flex items-center justify-center gap-3 border border-border rounded-xl py-3 px-4 text-sm font-medium hover:bg-secondary/50 transition-colors mb-6">
            <Globe className="h-4 w-4" />
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground font-medium">or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium mb-1.5">Full name</label>
                <input
                  type="text"
                  placeholder="Alex Johnson"
                  className="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                placeholder="alex@company.com"
                className="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium">Password</label>
                {mode === "login" && (
                  <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full h-11 px-4 pr-11 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-bg text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "signup" ? "Create account" : "Sign in"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "signup" ? "login" : "signup")}
              className="text-primary font-semibold hover:underline"
            >
              {mode === "signup" ? "Sign in" : "Sign up free"}
            </button>
          </p>

          {mode === "signup" && (
            <p className="text-center text-xs text-muted-foreground mt-4 leading-relaxed">
              By creating an account you agree to our{" "}
              <Link href="#" className="underline hover:text-foreground">Terms</Link>{" "}
              and{" "}
              <Link href="#" className="underline hover:text-foreground">Privacy Policy</Link>.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

const testimonials = [
  {
    quote: "I launched a full skincare brand in 2 hours. The hooks LaunchLabs generated outperformed my agency's copy by 3x.",
    name: "Sarah K.",
    role: "Founder, LumiGlow",
    initials: "SK",
    color: "bg-pink-500",
  },
  {
    quote: "Used it to research 10 competitors and build a brand brief. Saved my team 2 weeks of work.",
    name: "Marcus T.",
    role: "Head of Growth, DropBrands",
    initials: "MT",
    color: "bg-violet-500",
  },
];
