"use client";
import { motion } from "framer-motion";
import { User, CreditCard, Bell, Shield, Key, Globe } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <p className="text-muted-foreground text-sm mb-1">Account</p>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <motion.div
          className="bg-card border border-border rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3 p-5 border-b border-border">
            <User className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Profile</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center">
                <span className="text-white text-xl font-bold">AJ</span>
              </div>
              <div>
                <p className="font-semibold">Alex Johnson</p>
                <p className="text-sm text-muted-foreground">alex@launchlabs.ai</p>
                <button className="text-xs text-primary font-medium mt-1 hover:underline">Change photo</button>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">First name</label>
                <input defaultValue="Alex" className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Last name</label>
                <input defaultValue="Johnson" className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input defaultValue="alex@launchlabs.ai" type="email" className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <button className="gradient-bg text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity">
              Save changes
            </button>
          </div>
        </motion.div>

        {/* Billing */}
        <motion.div
          className="bg-card border border-border rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <div className="flex items-center gap-3 p-5 border-b border-border">
            <CreditCard className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Billing & Plan</h2>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-semibold">Pro Plan</p>
                <p className="text-sm text-muted-foreground">$49 / month · Renews June 15, 2025</p>
              </div>
              <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">Active</span>
            </div>
            <div className="flex gap-3">
              <button className="text-sm font-medium px-4 py-2 rounded-xl border border-border hover:bg-secondary transition-colors">
                Manage billing
              </button>
              <button className="text-sm font-medium px-4 py-2 rounded-xl gradient-bg text-white hover:opacity-90 transition-opacity">
                Upgrade to Agency
              </button>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          className="bg-card border border-border rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <div className="flex items-center gap-3 p-5 border-b border-border">
            <Bell className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Notifications</h2>
          </div>
          <div className="p-5 space-y-3">
            {[
              { label: "Generation complete", desc: "Notify when brand kit is ready", on: true },
              { label: "Weekly performance tips", desc: "AI-powered tips based on your brands", on: true },
              { label: "Product updates", desc: "New features and improvements", on: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <button className={`w-10 h-5 rounded-full transition-colors relative ${item.on ? "gradient-bg" : "bg-secondary"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${item.on ? "right-0.5" : "left-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Security */}
        <motion.div
          className="bg-card border border-border rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="flex items-center gap-3 p-5 border-b border-border">
            <Shield className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Security</h2>
          </div>
          <div className="p-5 space-y-3">
            <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-secondary/50 transition-colors text-left">
              <Key className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Change password</p>
                <p className="text-xs text-muted-foreground">Last changed 3 months ago</p>
              </div>
            </button>
            <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-secondary/50 transition-colors text-left">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Connected apps</p>
                <p className="text-xs text-muted-foreground">Manage third-party access</p>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
