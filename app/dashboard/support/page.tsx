"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, FileText, Bug, CreditCard, HelpCircle,
  Send, Bot, CheckCircle2, ChevronDown, User, Zap,
  RefreshCw, ArrowUpRight, AlertCircle, Clock
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
}

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("bug") || lower.includes("error") || lower.includes("broken") || lower.includes("not working") || lower.includes("crash"))
    return "I've logged your bug report and flagged it as high priority. Our engineering team typically reviews new reports within 2–4 hours. You'll receive an email update at your registered address. Can you share your browser and device details?";
  if (lower.includes("refund") || lower.includes("money back") || lower.includes("charge") || lower.includes("charged"))
    return "Refund requests are processed within 3–5 business days. If your subscription was charged in the last 7 days, you qualify for a full refund under our money-back guarantee. Want me to initiate that for your account right now?";
  if (lower.includes("upgrade") || lower.includes("business plan") || lower.includes("higher plan"))
    return "You're currently on the Pro Plan. Upgrading to Business unlocks unlimited generations, team collaboration, white-label exports, and priority support. Want to see a full plan comparison?";
  if (lower.includes("billing") || lower.includes("invoice") || lower.includes("payment") || lower.includes("subscription"))
    return "I can help with billing. Common topics include updating your payment method, downloading invoices, changing your plan, or requesting a refund. What specifically do you need help with?";
  if (lower.includes("feature") || lower.includes("request") || lower.includes("suggestion") || lower.includes("idea") || lower.includes("add"))
    return "Thanks for the feature request! I've added it to our product roadmap tracker. Our team reviews all requests weekly — popular ones get prioritized fast. Is there anything else I can help you with?";
  if (lower.includes("cancel") || lower.includes("cancellation") || lower.includes("stop"))
    return "Before I process a cancellation, can I ask what's not working for you? Many issues resolve quickly, and you may be eligible for a plan downgrade instead. If you'd still like to cancel, I can initiate that process right now.";
  if (lower.includes("password") || lower.includes("login") || lower.includes("sign in") || lower.includes("access") || lower.includes("locked"))
    return "To reset your password, go to Settings → Security → Change Password, or use 'Forgot Password' on the login page. Reset emails typically arrive within 1 minute. Still stuck? I can escalate to our team.";
  if (lower.includes("hi") || lower.includes("hello") || lower.includes("hey") || lower.includes("help"))
    return "Hey! I'm your LaunchLabs AI support assistant, available 24/7. I can help with billing, bug reports, account issues, feature requests, and platform guidance. What can I help you with today?";
  return "Thanks for reaching out! I've received your message and I'm here to help. For complex issues, I may loop in a human support agent — typically within 2 hours during business hours. Can you tell me more about what you're experiencing?";
}

const STATUS_SERVICES = [
  { name: "Dashboard" }, { name: "Brand Generator" }, { name: "Ad Generator" },
  { name: "Product Research" }, { name: "Billing System" }, { name: "AI Services" },
];

const QUICK_ACTIONS = [
  { label: "Report a bug", value: "I'd like to report a bug I found on the platform." },
  { label: "Request refund", value: "I'd like to request a refund for my subscription." },
  { label: "Upgrade subscription", value: "I want to upgrade my subscription plan." },
  { label: "Contact support", value: "I need to speak with a support agent." },
  { label: "Feature request", value: "I have a feature request for the platform." },
];

const FAQ_ITEMS = [
  { q: "How do I cancel my subscription?", a: "Go to Settings → Billing → Cancel Subscription. Your access continues until the end of your current billing period. You can also contact support for immediate assistance." },
  { q: "Can I get a refund?", a: "Yes — we offer a 7-day money-back guarantee on all plans. Contact support within 7 days of your charge and we'll process a full refund within 3–5 business days." },
  { q: "How does the Brand Generator work?", a: "Enter your product name, description, and target audience, choose a brand style, and select your outputs. Our AI generates brand names, logos, color palettes, ad scripts, hooks, and more in seconds." },
  { q: "What's included in the Pro Plan?", a: "The Pro Plan includes unlimited brand generations, all output types (including product photos), ad scripts, hooks, video ad briefs, and product research tools." },
  { q: "How do I report a bug?", a: "Use the Bug Report tab above, or type 'report a bug' in the chat. Include steps to reproduce, your browser, and any error messages. We review all reports within 2–4 hours." },
  { q: "Can I invite team members?", a: "Team collaboration is available on the Business Plan. Upgrade from Settings → Billing to unlock team seats, shared brand libraries, and collaborative workspaces." },
  { q: "How do I update my payment method?", a: "Go to Settings → Billing → Payment Methods. You can add, remove, or set a new default payment method at any time." },
  { q: "Is my data secure?", a: "Yes. All data is encrypted in transit and at rest. We never sell your data or share it with third parties. Read our Privacy Policy for full details." },
  { q: "How long does support take to respond?", a: "Our AI assistant responds instantly 24/7. Human agents respond within 2 hours during business hours (9am–8pm EST, Mon–Fri)." },
];

function StatusBar() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-sm font-semibold text-emerald-600">All Systems Operational</span>
          <span className="text-xs text-muted-foreground ml-1">· Last checked just now</span>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-3 gap-3">
              {STATUS_SERVICES.map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span className="text-xs text-muted-foreground">{s.name}</span>
                  <span className="text-xs text-emerald-600 font-medium ml-auto">Operational</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChatTab() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "ai",
      text: "Hi! I'm your LaunchLabs AI support assistant, available 24/7. I can help with billing questions, bug reports, account issues, feature requests, and platform guidance. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function sendMessage(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg) return;
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", text: msg }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "ai", text: getAIResponse(msg) }]);
    }, 1400);
  }

  return (
    <div className="flex flex-col h-[540px]">
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === "ai" ? "gradient-bg" : "bg-secondary border border-border"
            }`}>
              {msg.role === "ai" ? <Bot className="h-4 w-4 text-white" /> : <User className="h-4 w-4 text-muted-foreground" />}
            </div>
            <div className={`max-w-[76%] flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === "ai"
                  ? "bg-secondary text-foreground rounded-tl-none"
                  : "gradient-bg text-white rounded-tr-none"
              }`}>
                {msg.text}
              </div>
            </div>
          </motion.div>
        ))}
        {typing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="bg-secondary rounded-2xl rounded-tl-none px-4 py-3.5 flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border px-5 pt-3 pb-2 flex gap-2 flex-wrap">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={() => sendMessage(action.value)}
            disabled={typing}
            className="text-xs bg-secondary hover:bg-secondary/70 border border-border px-3 py-1.5 rounded-full font-medium transition-colors disabled:opacity-50"
          >
            {action.label}
          </button>
        ))}
      </div>

      <div className="px-5 pt-2 pb-5">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={typing}
            className="flex-1 h-11 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || typing}
            className="h-11 w-11 gradient-bg text-white rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

function TicketTab() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ subject: "", category: "general", priority: "normal", description: "", email: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 900);
  }

  if (submitted) {
    const ticketId = `LL-${Math.floor(Math.random() * 9000) + 1000}`;
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
          <CheckCircle2 className="h-8 w-8 text-white" />
        </div>
        <h3 className="font-bold text-lg mb-2">Ticket Submitted!</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          Your ticket <strong className="text-foreground">{ticketId}</strong> has been created. We'll respond to your email within 2–4 hours.
        </p>
        <div className="flex items-center gap-1.5 mt-4 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          Avg. response time: under 2 hours
        </div>
        <button onClick={() => { setSubmitted(false); setForm({ subject: "", category: "general", priority: "normal", description: "", email: "" }); }}
          className="mt-6 text-sm text-primary font-medium hover:underline">
          Submit another ticket
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Subject</label>
          <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="Brief description of your issue"
            className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Your Email</label>
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="your@email.com"
            className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Category</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="general">General Question</option>
            <option value="billing">Billing & Subscriptions</option>
            <option value="technical">Technical Issue</option>
            <option value="account">Account & Access</option>
            <option value="feature">Feature Request</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Priority</label>
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
            className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Description</label>
        <textarea required rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Describe your issue in detail. The more information you provide, the faster we can help."
          className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
      </div>
      <button type="submit" disabled={loading}
        className="gradient-bg text-white font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm flex items-center gap-2 disabled:opacity-60">
        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FileText className="h-4 w-4" />}
        {loading ? "Submitting..." : "Submit Ticket"}
      </button>
    </form>
  );
}

function BugTab() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", steps: "", expected: "", actual: "", device: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 900);
  }

  if (submitted) {
    const bugId = `BUG-${Math.floor(Math.random() * 9000) + 1000}`;
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center mb-4">
          <Bug className="h-8 w-8 text-amber-500" />
        </div>
        <h3 className="font-bold text-lg mb-2">Bug Report Received!</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          Report <strong className="text-foreground">{bugId}</strong> filed. Our engineering team reviews all reports within 2–4 hours.
        </p>
        <button onClick={() => { setSubmitted(false); setForm({ title: "", steps: "", expected: "", actual: "", device: "" }); }}
          className="mt-6 text-sm text-primary font-medium hover:underline">
          Report another bug
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-4">
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Bug Title</label>
        <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. Brand generator crashes on mobile Safari"
          className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Steps to Reproduce</label>
        <textarea required rows={3} value={form.steps} onChange={(e) => setForm({ ...form, steps: e.target.value })}
          placeholder={"1. Go to Brand Generator\n2. Click Generate\n3. See error"}
          className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Expected Behavior</label>
          <textarea rows={2} value={form.expected} onChange={(e) => setForm({ ...form, expected: e.target.value })}
            placeholder="What should have happened?"
            className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Actual Behavior</label>
          <textarea rows={2} value={form.actual} onChange={(e) => setForm({ ...form, actual: e.target.value })}
            placeholder="What actually happened?"
            className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Browser / Device</label>
        <input value={form.device} onChange={(e) => setForm({ ...form, device: e.target.value })}
          placeholder="e.g. Chrome 124 on MacBook Pro M2"
          className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div className="border-2 border-dashed border-border rounded-xl p-5 text-center text-xs text-muted-foreground">
        Screenshot / screen recording upload — coming soon
      </div>
      <button type="submit" disabled={loading}
        className="gradient-bg text-white font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm flex items-center gap-2 disabled:opacity-60">
        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Bug className="h-4 w-4" />}
        {loading ? "Submitting..." : "Submit Bug Report"}
      </button>
    </form>
  );
}

function BillingTab() {
  const actions = [
    { title: "Upgrade to Business", desc: "Unlock team collaboration, unlimited generations & white-label exports.", icon: Zap, color: "text-violet-600 bg-violet-50 border-violet-100", cta: "Upgrade Now" },
    { title: "Request a Refund", desc: "7-day money-back guarantee. Processed within 3–5 business days.", icon: RefreshCw, color: "text-emerald-600 bg-emerald-50 border-emerald-100", cta: "Request Refund" },
    { title: "Update Payment Method", desc: "Add or change your credit card, PayPal, or bank account.", icon: CreditCard, color: "text-blue-600 bg-blue-50 border-blue-100", cta: "Update Card" },
    { title: "Cancel Subscription", desc: "Cancel anytime. Access continues until end of billing period.", icon: AlertCircle, color: "text-red-500 bg-red-50 border-red-100", cta: "Cancel Plan" },
  ];

  return (
    <div className="p-5 space-y-4">
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Current Plan</p>
          <p className="font-bold text-xl gradient-text">Pro Plan</p>
          <p className="text-xs text-muted-foreground mt-0.5">$49/mo · Renews June 22, 2026</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-muted-foreground mb-0.5">Generations used</p>
          <p className="font-bold text-lg">32 / ∞</p>
          <p className="text-xs text-emerald-600 font-medium">Unlimited</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {actions.map((action) => (
          <div key={action.title} className={`border rounded-2xl p-4 flex flex-col gap-3`} style={{ borderColor: "var(--border)" }}>
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${action.color}`}>
                <action.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{action.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{action.desc}</p>
              </div>
            </div>
            <button className="text-xs font-semibold text-primary hover:text-primary/70 transition-colors flex items-center gap-1 w-fit">
              {action.cta} <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 leading-relaxed">
        <strong>Refund Policy:</strong> All plans include a 7-day money-back guarantee. After 7 days, refunds are reviewed case-by-case by our support team.
      </div>
    </div>
  );
}

function FAQTab() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="p-5 space-y-2">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className="border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-secondary/40 transition-colors text-left gap-3"
          >
            <span className="text-sm font-medium">{item.q}</span>
            <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          </button>
          <AnimatePresence>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="px-4 pb-4 pt-3 text-sm text-muted-foreground leading-relaxed border-t border-border">
                  {item.a}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

const TABS = [
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "ticket", label: "Submit Ticket", icon: FileText },
  { id: "bug", label: "Bug Report", icon: Bug },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "faq", label: "FAQ", icon: HelpCircle },
];

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <p className="text-muted-foreground text-sm">Help & Support</p>
          <span className="text-xs bg-secondary border border-border px-2.5 py-0.5 rounded-full text-muted-foreground font-medium">
            Demo support system
          </span>
          <span className="text-xs gradient-bg text-white px-2.5 py-0.5 rounded-full font-medium">
            24/7 AI-assisted support
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Support Center</h1>
        <p className="text-muted-foreground text-sm mt-1">Get help with billing, bugs, account issues, and more</p>
      </div>

      <StatusBar />

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex border-b border-border overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "chat" && <ChatTab />}
            {activeTab === "ticket" && <TicketTab />}
            {activeTab === "bug" && <BugTab />}
            {activeTab === "billing" && <BillingTab />}
            {activeTab === "faq" && <FAQTab />}
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-6">
        Avg. response time: <strong>under 2 hours</strong> · Support in English · Powered by LaunchLabs AI
      </p>
    </div>
  );
}
