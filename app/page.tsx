"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Sparkles, Zap, BarChart3, Layers, ArrowRight, CheckCircle2,
  Star, Play, Globe, Palette, Megaphone, Target,
  TrendingUp, Video, Package
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">LaunchLabs</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-foreground transition-colors">How it works</Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Sign in
            </Link>
            <Link href="/auth" className="gradient-bg text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-40 left-1/4 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          className="max-w-5xl mx-auto text-center"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-4 py-2 rounded-full mb-6 border border-primary/20">
            <Sparkles className="h-3.5 w-3.5" />
            Powered by GPT-4 Vision + Claude 3
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Turn Products Into{" "}
            <span className="gradient-text">Brands</span>{" "}
            With AI
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            Upload a product image or paste a competitor URL. LaunchLabs generates your complete brand identity — logos, ad scripts, hooks, color palettes, and scroll-stopping creative — in seconds.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/auth" className="w-full sm:w-auto gradient-bg text-white font-semibold px-8 py-3.5 rounded-xl hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-base shadow-lg shadow-primary/25">
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto bg-secondary text-secondary-foreground font-semibold px-8 py-3.5 rounded-xl hover:bg-secondary/80 transition-all flex items-center justify-center gap-2 text-base">
              <Play className="h-4 w-4 fill-current" />
              View demo
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {["bg-violet-400", "bg-pink-400", "bg-blue-400", "bg-amber-400", "bg-emerald-400"].map((c, i) => (
                <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-background`} />
              ))}
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
            </div>
            <span>Loved by <strong className="text-foreground">2,400+</strong> brand builders</span>
          </motion.div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          className="max-w-6xl mx-auto mt-16 px-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative rounded-2xl border border-border bg-card shadow-2xl shadow-black/10 overflow-hidden">
            <div className="bg-secondary/50 px-4 py-3 flex items-center gap-2 border-b border-border">
              {["bg-red-400", "bg-yellow-400", "bg-green-400"].map((c, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${c}`} />
              ))}
              <div className="mx-auto bg-background rounded-md px-6 py-1 text-xs text-muted-foreground flex items-center gap-1.5">
                <Globe className="h-3 w-3" />
                app.launchlabs.ai/dashboard
              </div>
            </div>
            <DashboardPreview />
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={fadeUp} className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              Everything you need
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight mb-4">
              Your complete brand engine
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg max-w-xl mx-auto">
              From zero to full brand kit in under 60 seconds.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-11 h-11 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                  <f.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Simple workflow</div>
            <h2 className="text-4xl font-bold tracking-tight mb-4">Launch a brand in 3 steps</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                className="relative text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <div className="relative z-10 w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/25">
                  <step.icon className="h-7 w-7 text-white" />
                </div>
                <div className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Step {i + 1}</div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Pricing</div>
            <h2 className="text-4xl font-bold tracking-tight mb-4">Simple, transparent pricing</h2>
            <p className="text-muted-foreground text-lg">Start free, scale as you grow</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                className={`relative rounded-2xl border p-8 ${plan.featured
                  ? "border-primary bg-primary/5 shadow-xl shadow-primary/10"
                  : "border-border bg-card"
                  }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-bg text-white text-xs font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground text-sm">{plan.period}</span>}
                  </div>
                  <p className="text-muted-foreground text-sm mt-2">{plan.desc}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth"
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${plan.featured
                    ? "gradient-bg text-white hover:opacity-90"
                    : "bg-secondary hover:bg-secondary/80"
                    }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative rounded-3xl gradient-bg p-8 sm:p-16 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
            <h2 className="text-4xl font-bold text-white mb-4 relative z-10">
              Ready to launch your brand?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto relative z-10">
              Join 2,400+ entrepreneurs using LaunchLabs to build viral brands faster than ever.
            </p>
            <Link
              href="/auth"
              className="relative z-10 inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-3.5 rounded-xl hover:bg-white/90 transition-all text-base hover:scale-[1.02] active:scale-[0.98]"
            >
              Start building for free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-sm">LaunchLabs</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground">
            {["Privacy", "Terms", "Blog", "Careers", "Support"].map((l) => (
              <Link key={l} href="#" className="hover:text-foreground transition-colors">{l}</Link>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">© 2025 LaunchLabs. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="flex h-[260px] sm:h-[420px] overflow-hidden">
      <div className="hidden sm:flex w-48 bg-sidebar border-r border-sidebar-border p-3 flex-col gap-1 shrink-0">
        <div className="flex items-center gap-2 px-2 py-2 mb-2">
          <div className="w-5 h-5 rounded gradient-bg" />
          <span className="text-xs font-bold text-sidebar-foreground">LaunchLabs</span>
        </div>
        {["Dashboard", "Brand Generator", "Ad Generator", "Hooks & Scripts", "Video Ads"].map((item, i) => (
          <div key={item} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${i === 1 ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground/60"}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${i === 1 ? "bg-primary" : "bg-current opacity-30"}`} />
            {item}
          </div>
        ))}
      </div>

      <div className="flex-1 p-5 overflow-hidden bg-background">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Brand Generator</p>
            <h3 className="font-semibold text-sm">GlowSkin Serum</h3>
          </div>
          <div className="gradient-bg text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
            Generating...
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          {[
            { label: "Brand Names", count: "12 generated", color: "text-violet-600 bg-violet-50" },
            { label: "Color Palettes", count: "6 concepts", color: "text-pink-600 bg-pink-50" },
            { label: "Ad Hooks", count: "24 hooks", color: "text-blue-600 bg-blue-50" },
            { label: "Scripts", count: "8 scripts", color: "text-emerald-600 bg-emerald-50" },
          ].map((item) => (
            <div key={item.label} className="border border-border rounded-xl p-3 bg-card">
              <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.color} inline-block mb-1`}>{item.label}</div>
              <p className="text-xs text-muted-foreground">{item.count}</p>
            </div>
          ))}
        </div>

        <div className="border border-border rounded-xl p-3 bg-card">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Top Brand Concepts</p>
          <div className="flex gap-2 flex-wrap">
            {["LumiGlow", "AuraLab", "SkinForge", "GlowCo"].map((name, i) => (
              <div key={name} className={`text-xs px-2 py-1 rounded-lg border ${i === 0 ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border text-muted-foreground"}`}>
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const features = [
  { title: "Brand Identity Generation", desc: "AI creates complete brand packages — name, logo concepts, color palettes, and voice guidelines instantly.", icon: Palette, color: "bg-violet-500" },
  { title: "Viral Hook Generator", desc: "500+ battle-tested hook frameworks. Generate scroll-stopping openers for any product in seconds.", icon: Megaphone, color: "bg-pink-500" },
  { title: "Meta & TikTok Ad Scripts", desc: "Full UGC scripts, VSL copy, and creative briefs tailored to your product and target audience.", icon: Video, color: "bg-blue-500" },
  { title: "Audience Targeting Ideas", desc: "Discover untapped customer segments and psychographic profiles for laser-targeted campaigns.", icon: Target, color: "bg-emerald-500" },
  { title: "Product Positioning", desc: "Craft a unique value proposition that dominates your niche and crushes competitor claims.", icon: TrendingUp, color: "bg-amber-500" },
  { title: "Competitor Analysis", desc: "Paste any product URL to reverse-engineer their branding and create something better.", icon: BarChart3, color: "bg-cyan-500" },
  { title: "Logo Concepts", desc: "Mood boards and logo direction briefs you can hand straight to a designer or AI image tool.", icon: Layers, color: "bg-indigo-500" },
  { title: "Product Research", desc: "Winning product criteria, demand signals, and saturation scores to validate before you invest.", icon: Package, color: "bg-orange-500" },
  { title: "Instant Export", desc: "Download everything as a PDF brand kit. Brief designers and copywriters in one document.", icon: Zap, color: "bg-rose-500" },
];

const steps = [
  { title: "Upload or paste", desc: "Drop a product photo or paste a competitor URL. That's all we need to get started.", icon: Package },
  { title: "AI analyzes & generates", desc: "Our AI engine runs 12 parallel generation tasks and returns a complete brand kit in under 30 seconds.", icon: Sparkles },
  { title: "Export & launch", desc: "Copy hooks, download scripts, and brief your creative team. Go from idea to live ads in hours, not weeks.", icon: Zap },
];

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "",
    desc: "Perfect for testing the waters",
    cta: "Get started free",
    featured: false,
    features: ["5 brand generations / mo", "Basic hooks & scripts", "3 ad concepts", "Email support"],
  },
  {
    name: "Pro",
    price: "$49",
    period: "/ month",
    desc: "For serious brand builders",
    cta: "Start free trial",
    featured: true,
    features: ["Unlimited generations", "All ad formats", "Competitor URL analysis", "Video ad scripts", "Priority support", "Export to PDF"],
  },
  {
    name: "Agency",
    price: "$149",
    period: "/ month",
    desc: "For teams & agencies",
    cta: "Contact sales",
    featured: false,
    features: ["Everything in Pro", "10 team seats", "White-label exports", "API access", "Custom workflows", "Dedicated success manager"],
  },
];
