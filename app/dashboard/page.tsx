"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  TrendingUp, Palette, Megaphone, FileText, Video, Image,
  ArrowRight, Zap, BarChart3, Users, DollarSign, Star
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

export default function DashboardPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="mb-8">
        <motion.div variants={fadeUp}>
          <p className="text-muted-foreground text-sm mb-1">Good morning 👋</p>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, Alex</h1>
        </motion.div>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {stats.map((s) => (
          <motion.div
            key={s.label}
            variants={fadeUp}
            className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center`}>
                <s.icon className="h-4.5 w-4.5 text-white" />
              </div>
              <span className={`text-xs font-semibold ${s.change > 0 ? "text-emerald-600" : "text-red-500"}`}>
                {s.change > 0 ? "+" : ""}{s.change}%
              </span>
            </div>
            <p className="text-2xl font-bold tracking-tight mb-0.5">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Brands */}
        <motion.div
          className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-semibold">Recent Brands</h2>
            <Link href="/dashboard/brand-generator" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
              New brand <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentBrands.map((brand) => (
              <div key={brand.name} className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors">
                <div className={`w-10 h-10 rounded-xl ${brand.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                  {brand.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{brand.name}</p>
                  <p className="text-xs text-muted-foreground">{brand.category} · {brand.date}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${brand.statusColor}`}>
                    {brand.status}
                  </span>
                </div>
                <Link href="/dashboard/results" className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2.5">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-all group"
                >
                  <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center shrink-0`}>
                    <action.icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{action.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{action.desc}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* AI Tip */}
          <div className="gradient-bg rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1),transparent)]" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                <span className="text-white text-xs font-semibold uppercase tracking-wide">Pro Tip</span>
              </div>
              <p className="text-white/90 text-sm leading-relaxed">
                Add a competitor URL when generating brands — it helps the AI create positioning that directly counters their messaging.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Feature cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {featureCards.map((card) => (
          <motion.div key={card.label} variants={fadeUp}>
            <Link
              href={card.href}
              className="group flex flex-col bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-4`}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{card.label}</h3>
              <p className="text-xs text-muted-foreground flex-1 leading-relaxed">{card.desc}</p>
              <div className="mt-3 flex items-center text-xs text-primary font-semibold group-hover:gap-2 transition-all gap-1">
                Open <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

const stats = [
  { label: "Brands Generated", value: "32", change: 18, icon: TrendingUp, color: "bg-violet-500" },
  { label: "Ad Scripts", value: "148", change: 32, icon: FileText, color: "bg-blue-500" },
  { label: "Hooks Created", value: "412", change: 24, icon: Zap, color: "bg-pink-500" },
  { label: "Audiences Found", value: "89", change: 12, icon: Users, color: "bg-emerald-500" },
];

const recentBrands = [
  { name: "GlowSkin Serum", category: "Skincare", date: "2 hours ago", initials: "GS", color: "bg-pink-500", status: "Complete", statusColor: "bg-emerald-50 text-emerald-700" },
  { name: "FuelPeak Pre-Workout", category: "Supplements", date: "Yesterday", initials: "FP", color: "bg-blue-500", status: "Complete", statusColor: "bg-emerald-50 text-emerald-700" },
  { name: "LuxeHome Candles", category: "Lifestyle", date: "3 days ago", initials: "LH", color: "bg-amber-500", status: "Draft", statusColor: "bg-amber-50 text-amber-700" },
  { name: "SwiftPod Wireless", category: "Tech", date: "1 week ago", initials: "SP", color: "bg-violet-500", status: "Complete", statusColor: "bg-emerald-50 text-emerald-700" },
];

const quickActions = [
  { label: "New Brand", desc: "Upload product & generate", href: "/dashboard/brand-generator", icon: Palette, color: "bg-violet-500" },
  { label: "Generate Hooks", desc: "Viral opening lines", href: "/dashboard/hooks-scripts", icon: Megaphone, color: "bg-pink-500" },
  { label: "Write Ad Script", desc: "UGC & VSL scripts", href: "/dashboard/ad-generator", icon: FileText, color: "bg-blue-500" },
  { label: "Research Product", desc: "Validate your idea", href: "/dashboard/product-research", icon: BarChart3, color: "bg-emerald-500" },
];

const featureCards = [
  { label: "Brand Generator", desc: "Turn any product into a full brand identity with name, colors, and positioning.", href: "/dashboard/brand-generator", icon: Palette, color: "bg-violet-500" },
  { label: "Ad Generator", desc: "Generate Meta & TikTok ad copy, UGC briefs, and creative angles.", href: "/dashboard/ad-generator", icon: Megaphone, color: "bg-pink-500" },
  { label: "Hooks & Scripts", desc: "500+ hook frameworks plus full ad scripts for any funnel stage.", href: "/dashboard/hooks-scripts", icon: FileText, color: "bg-blue-500" },
  { label: "Video Ads", desc: "Complete video ad briefs with scene directions and script overlays.", href: "/dashboard/video-ads", icon: Video, color: "bg-emerald-500" },
  { label: "Picture Ads", desc: "Static ad storyboards and angle concepts ready for your designer.", href: "/dashboard/picture-ads", icon: Image, color: "bg-amber-500" },
  { label: "Product Research", desc: "Market validation, competitor analysis, and demand scoring.", href: "/dashboard/product-research", icon: DollarSign, color: "bg-cyan-500" },
];
