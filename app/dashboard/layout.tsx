"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, LayoutDashboard, Palette, Megaphone, FileText,
  Video, Image, Package, Settings, Menu, X, Bell, Search,
  ChevronRight, LogOut, User, Zap
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/brand-generator", label: "Brand Generator", icon: Palette },
  { href: "/dashboard/ad-generator", label: "Ad Generator", icon: Megaphone },
  { href: "/dashboard/hooks-scripts", label: "Hooks & Scripts", icon: FileText },
  { href: "/dashboard/video-ads", label: "Video Ads", icon: Video },
  { href: "/dashboard/picture-ads", label: "Picture Ads", icon: Image },
  { href: "/dashboard/product-research", label: "Product Research", icon: Package },
];

const bottomItems = [
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
        w-60 bg-sidebar border-r border-sidebar-border flex flex-col
        transition-transform duration-300 ease-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-base text-sidebar-foreground">LaunchLabs</span>
          <button
            className="ml-auto lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Usage badge */}
        <div className="px-4 py-3 border-b border-sidebar-border">
          <div className="bg-primary/15 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-primary">Pro Plan</span>
              <span className="text-xs text-primary/80">32 / ∞</span>
            </div>
            <div className="w-full h-1.5 bg-primary/20 rounded-full overflow-hidden">
              <div className="h-full w-[40%] gradient-bg rounded-full" />
            </div>
            <p className="text-xs text-primary/60 mt-1.5">Generations this month</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <item.icon className={`h-4 w-4 shrink-0 ${active ? "text-primary" : ""}`} />
                {item.label}
                {active && <ChevronRight className="h-3.5 w-3.5 ml-auto text-primary" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 pt-2 border-t border-sidebar-border space-y-0.5">
          {bottomItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                pathname === item.href
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          ))}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-sidebar-accent/50 cursor-pointer transition-all">
            <div className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center shrink-0">
              <User className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">Alex Johnson</p>
              <p className="text-xs text-sidebar-foreground/40 truncate">alex@launchlabs.ai</p>
            </div>
            <LogOut className="h-3.5 w-3.5 text-sidebar-foreground/40 shrink-0" />
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 border-b border-border flex items-center gap-4 px-4 sm:px-6 bg-background shrink-0">
          <button
            className="lg:hidden p-1.5 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1 flex items-center gap-3">
            <div className="relative hidden sm:flex items-center max-w-xs w-full">
              <Search className="absolute left-3 h-3.5 w-3.5 text-muted-foreground" />
              <input
                placeholder="Search..."
                className="w-full h-8 pl-9 pr-3 rounded-lg bg-secondary/60 text-sm focus:outline-none focus:ring-2 focus:ring-ring border border-transparent focus:border-border transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/brand-generator"
              className="hidden sm:flex gradient-bg text-white items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              <Zap className="h-3.5 w-3.5" />
              New Brand
            </Link>
            <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 gradient-bg rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center">
              <span className="text-white text-xs font-bold">AJ</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
