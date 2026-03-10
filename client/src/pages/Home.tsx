import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLeadSchema, type InsertLead } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight, CheckCircle2, ChevronDown, Menu, X,
  Instagram, Mail, Clock, Shield, Star, Zap,
  Globe, Target, BarChart3, BrainCircuit, Sparkles, Layers,
  TrendingUp, Award,
} from "lucide-react";

/* ── helpers ── */

function FadeIn({ children, className = "", delay = 0 }: {
  children: React.ReactNode; className?: string; delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

function Counter({ end, suffix = "", prefix = "" }: { end: number; suffix?: string; prefix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let c = 0;
    const step = end / (1400 / 16);
    const t = setInterval(() => { c = Math.min(c + step, end); setN(Math.floor(c)); if (c >= end) clearInterval(t); }, 16);
    return () => clearInterval(t);
  }, [inView, end]);
  return <span ref={ref}>{prefix}{n.toLocaleString()}{suffix}</span>;
}

const goto = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

/* ── logo mark ── */
function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  const s = size === "sm" ? "w-7 h-7 text-[10px]" : "w-8 h-8 text-[11px]";
  return (
    <div className="flex items-center gap-2.5">
      <div className={`${s} rounded-xl bg-[#FF4500] flex items-center justify-center font-mono font-bold text-white leading-none flex-shrink-0`}>
        HCX
      </div>
      <span className="font-black text-white tracking-tight text-[16px] leading-none">
        HustleCoreX
      </span>
    </div>
  );
}

/* ── divider ── */
const Divider = () => <div className="border-t border-white/[0.06] mx-4 md:mx-8" />;

/* ── section wrapper ── */
function Section({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`px-4 md:px-8 py-16 md:py-28 ${className}`}>
      <div className="max-w-5xl mx-auto">
        {children}
      </div>
    </section>
  );
}

/* ── section label ── */
function Label({ children }: { children: React.ReactNode }) {
  return <p className="label-sm mb-5">{children}</p>;
}

/* ── nav ── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links: [string, string][] = [
    ["system", "System"], ["services", "Services"], ["results", "Results"], ["pricing", "Pricing"],
  ];

  return (
    <header data-testid="navbar"
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#070707]/96 backdrop-blur-xl border-b border-white/[0.06]" : ""
      }`}>
      <div className="max-w-5xl mx-auto px-4 md:px-8 h-[60px] flex items-center justify-between">
        <button onClick={() => goto("hero")} className="active:opacity-70 transition-opacity">
          <Logo size="sm" />
        </button>

        <nav className="hidden md:flex items-center gap-7">
          {links.map(([id, label]) => (
            <button key={id} data-testid={`nav-${id}`} onClick={() => goto(id)}
              className="text-[13px] font-medium text-white/40 hover:text-white/80 transition-colors">
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button data-testid="nav-cta" onClick={() => goto("apply")}
            className="hidden md:flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#FF4500] hover:bg-[#FF5A00] text-white text-[13px] font-semibold transition-colors">
            Apply Now
          </button>
          <button data-testid="mobile-menu-toggle" onClick={() => setOpen(!open)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-white/50 hover:text-white active:bg-white/5 transition-colors">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}
            className="md:hidden overflow-hidden border-t border-white/[0.06] bg-[#070707]">
            <div className="max-w-5xl mx-auto px-4">
              {[...links, ["apply", "Apply Now"] as [string, string]].map(([id, label]) => (
                <button key={id} onClick={() => { goto(id); setOpen(false); }}
                  className="flex w-full items-center justify-between py-4 text-[15px] font-medium text-white/55 hover:text-white border-b border-white/[0.05] last:border-0 active:opacity-60 transition-colors">
                  {label}
                  <ArrowRight size={14} className="text-white/20" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ── hero ── */
function Hero() {
  return (
    <section id="hero" className="min-h-[100svh] flex flex-col justify-center px-4 md:px-8 pt-[72px] pb-16">
      <div className="max-w-5xl mx-auto w-full">

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}
          className="inline-flex items-center gap-2 mb-8 md:mb-10">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF4500] flex-shrink-0" />
          <span className="label-sm !mb-0">The Standard for Online Fitness Coaches</span>
        </motion.div>

        <motion.h1 data-testid="hero-headline"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.12 }}
          className="heading text-[clamp(2.75rem,8vw,5rem)] mb-5 md:mb-6 text-white max-w-2xl">
          Setting the Standard<br />for Online<br />
          <span className="text-brand">Coaches.</span>
        </motion.h1>

        <motion.p data-testid="hero-subheadline"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.2 }}
          className="text-[16px] md:text-[18px] text-white/45 leading-relaxed max-w-lg mb-9 md:mb-10 font-light">
          We build the complete system — premium brand, elite website, and automated lead engine — so the best coaches can focus on what they do best.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.28 }}
          className="flex flex-col sm:flex-row gap-3 mb-14 md:mb-16">
          <button data-testid="hero-cta-primary" onClick={() => goto("apply")}
            className="flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[#FF4500] hover:bg-[#FF5A00] active:scale-[0.98] text-white text-[14px] font-semibold transition-all">
            Get a Free Audit <ArrowRight size={15} />
          </button>
          <button data-testid="hero-cta-secondary" onClick={() => goto("system")}
            className="flex items-center justify-center gap-2 h-12 px-6 rounded-xl border border-white/10 text-white/55 hover:text-white/80 hover:border-white/18 active:scale-[0.98] text-[14px] font-medium transition-all">
            See How It Works
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.36 }}
          className="grid grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-8 pt-6 border-t border-white/[0.06]">
          {[
            { n: 150, s: "+", label: "Coaches Scaled" },
            { n: 12, p: "$", s: "M+", label: "Revenue Generated" },
            { n: 97, s: "%", label: "Client Retention" },
            { n: 90, s: " days", label: "Full System Live" },
          ].map((stat, i) => (
            <div key={i} data-testid={`hero-stat-${i}`}>
              <div className="text-[1.6rem] md:text-[2rem] font-black text-white leading-none tracking-tight mb-1">
                <Counter end={stat.n} suffix={stat.s} prefix={stat.p} />
              </div>
              <p className="text-[12px] text-white/30 font-medium">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ── problem ── */
function Problem() {
  const items = [
    { icon: <Target size={15} />, before: "Posting content, hoping someone reaches out", after: "Qualified leads arriving consistently, every day" },
    { icon: <Award size={15} />, before: "Looking like every other coach online", after: "A premium brand that commands premium prices" },
    { icon: <BrainCircuit size={15} />, before: "Manually chasing every lead yourself", after: "Automated sequences that nurture and close for you" },
    { icon: <Globe size={15} />, before: "A basic website that loses you clients", after: "A conversion engine booking calls around the clock" },
    { icon: <TrendingUp size={15} />, before: "Stuck between $5–10k/month with no clear path", after: "A repeatable system hitting $30k+ every month" },
    { icon: <Clock size={15} />, before: "Working inside your business 10+ hours a day", after: "Working on your business from a position of leverage" },
  ];

  return (
    <Section>
      <FadeIn className="mb-10">
        <Label>The Problem</Label>
        <h2 className="heading text-[clamp(2rem,5vw,3.25rem)] text-white max-w-sm">
          Great coaches.<br />Broken systems.
        </h2>
      </FadeIn>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x-0 divide-white/[0.06] border border-white/[0.06] rounded-2xl overflow-hidden">
        {/* Using a different approach for the grid borders */}
        {items.map((item, i) => (
          <FadeIn key={i} delay={i * 0.04}>
            <div data-testid={`problem-card-${i}`}
              className={`bg-[#0C0C0C] hover:bg-[#101010] transition-colors p-5 md:p-6 h-full
                ${i < items.length - 1 && i % 1 === 0 ? "border-b border-white/[0.06] sm:border-b sm:border-r" : ""}
                ${i === 2 ? "sm:border-r-0 lg:border-r border-white/[0.06]" : ""}
                ${i === 1 ? "sm:border-r border-white/[0.06]" : ""}
                ${i === 3 ? "sm:border-r border-white/[0.06]" : ""}
                ${i === 4 ? "sm:border-r-0 lg:border-r border-white/[0.06]" : ""}
              `}>
              <div className="text-[#FF4500] opacity-60 mb-4">{item.icon}</div>
              <p className="text-[12px] text-white/22 line-through leading-snug mb-2.5">{item.before}</p>
              <p className="text-[13px] md:text-[14px] text-white/80 font-semibold leading-snug">{item.after}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}

/* ── system ── */
function System() {
  const [active, setActive] = useState(0);
  const pillars = [
    { num: "01", tab: "Brand", title: "Premium Brand Identity", icon: <Sparkles size={17} />,
      body: "Your brand is the very first impression every future client gets. We build a complete identity — visuals, voice, and positioning — that makes you the obvious premium choice in your niche.",
      features: ["Logo & Visual Identity", "Brand Voice & Messaging", "Niche Positioning", "Content Pillars", "Authority Architecture"] },
    { num: "02", tab: "Website", title: "High-Converting Website", icon: <Globe size={17} />,
      body: "Not just a beautiful site — a sales machine. We design and build a premium website that impresses, qualifies, and converts visitors into booked calls, around the clock.",
      features: ["Custom Premium Design", "Conversion Copywriting", "Automated Booking", "Video Sales Letter", "Speed & Mobile Optimised"] },
    { num: "03", tab: "Leads", title: "Lead Generation Engine", icon: <Target size={17} />,
      body: "We build a multi-channel lead machine — organic, outbound, and paid working together — so your pipeline is always full of warm, qualified prospects ready to work with you.",
      features: ["Instagram Overhaul", "Content-to-DM Funnel", "Strategic Outreach", "Paid Ad Strategy", "Lead Magnet Creation"] },
    { num: "04", tab: "Automation", title: "AutoNation System", icon: <BrainCircuit size={17} />,
      body: "Every tool in your stack connected and intelligent. Leads come in, get nurtured, book a call, and onboard — all without you lifting a finger. This is what real leverage looks like.",
      features: ["Full CRM Integration", "Email Automation", "DM Auto-Responses", "Lead Scoring", "Onboarding Flow"] },
    { num: "05", tab: "Analytics", title: "Growth Analytics", icon: <BarChart3 size={17} />,
      body: "Full visibility into your pipeline. Know exactly where your leads come from, where they drop off, and where to focus your energy to accelerate growth every single month.",
      features: ["Unified Dashboard", "Revenue Attribution", "Conversion Tracking", "Weekly Reports", "Continuous Optimisation"] },
  ];

  return (
    <Section id="system">
      <FadeIn className="mb-10">
        <Label>The System</Label>
        <h2 className="heading text-[clamp(2rem,5vw,3.25rem)] text-white max-w-sm">
          Five pillars.<br />One system.
        </h2>
      </FadeIn>

      {/* tabs — scrollable on mobile */}
      <div className="flex overflow-x-auto scrollbar-hide border-b border-white/[0.07] mb-8 -mx-4 px-4 md:mx-0 md:px-0">
        {pillars.map((p, i) => (
          <button key={i} data-testid={`system-tab-${i}`} onClick={() => setActive(i)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-3 text-[13px] font-semibold border-b-2 -mb-px transition-all duration-150 ${
              active === i
                ? "border-[#FF4500] text-white"
                : "border-transparent text-white/30 hover:text-white/55"
            }`}>
            <span className="font-mono text-[10px] opacity-40">{p.num}</span>
            {p.tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={active} data-testid="system-content"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22 }}
          className="grid md:grid-cols-2 gap-8 md:gap-12">
          <div>
            <div className="w-9 h-9 rounded-xl bg-[#FF4500]/10 border border-[#FF4500]/20 flex items-center justify-center text-[#FF4500] mb-5">
              {pillars[active].icon}
            </div>
            <h3 className="heading text-[1.4rem] text-white mb-3">{pillars[active].title}</h3>
            <p className="text-[14px] md:text-[15px] text-white/42 leading-relaxed">{pillars[active].body}</p>
          </div>
          <ul className="space-y-0 divide-y divide-white/[0.05]">
            {pillars[active].features.map((f, i) => (
              <motion.li key={f} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center gap-3 py-3.5">
                <CheckCircle2 size={13} className="text-[#FF4500] flex-shrink-0 opacity-80" />
                <span className="text-[13px] md:text-[14px] text-white/65">{f}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>
    </Section>
  );
}

/* ── services ── */
function Services() {
  const services = [
    { icon: <Sparkles size={16} />, title: "Brand Identity", desc: "Complete visual system, voice, and positioning that makes you the obvious choice." },
    { icon: <Globe size={16} />, title: "Website Build", desc: "Custom-designed, conversion-optimised site with integrated booking and VSL." },
    { icon: <Target size={16} />, title: "Lead Generation", desc: "Multi-channel pipeline combining organic, outbound, and paid acquisition." },
    { icon: <BrainCircuit size={16} />, title: "AutoNation", desc: "Every tool connected. DMs, emails, follow-ups, and onboarding automated." },
    { icon: <Instagram size={16} />, title: "Social Profiles", desc: "Instagram transformed into a consistent, high-converting lead asset." },
    { icon: <BarChart3 size={16} />, title: "Growth Analytics", desc: "Full pipeline visibility so you always know where to invest your energy." },
  ];

  return (
    <Section id="services">
      <FadeIn className="mb-10">
        <Label>Services</Label>
        <h2 className="heading text-[clamp(2rem,5vw,3.25rem)] text-white max-w-sm">
          Everything you need.<br />Nothing you don't.
        </h2>
      </FadeIn>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border border-white/[0.06] rounded-2xl overflow-hidden divide-y divide-white/[0.06] sm:divide-y-0">
        {services.map((s, i) => (
          <FadeIn key={i} delay={i * 0.04}>
            <div data-testid={`service-card-${i}`}
              className={`group bg-[#0C0C0C] hover:bg-[#101010] p-5 md:p-6 h-full transition-colors duration-200
                ${[0,1,3,4].includes(i) ? "sm:border-r border-white/[0.06]" : ""}
                ${i < 3 ? "sm:border-b border-white/[0.06]" : ""}
                ${i === 2 ? "sm:border-r-0" : ""}
                ${i === 5 ? "sm:border-r-0" : ""}
              `}>
              <div className="text-[#FF4500] opacity-55 group-hover:opacity-85 transition-opacity mb-4">{s.icon}</div>
              <p className="text-[14px] font-bold text-white mb-2 tracking-tight">{s.title}</p>
              <p className="text-[12px] md:text-[13px] text-white/35 leading-relaxed">{s.desc}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}

/* ── process ── */
function Process() {
  const steps = [
    { num: "01", title: "Free System Audit", desc: "We dig into your current setup, find the gaps, and map out exactly what it takes to hit your goals.", icon: <BrainCircuit size={15} /> },
    { num: "02", title: "Strategy Blueprint", desc: "Custom growth plan — brand positioning, channels, automation map, and a clear 90-day revenue roadmap.", icon: <Layers size={15} /> },
    { num: "03", title: "Brand & Website", desc: "Full brand identity and premium website built. You'll look and feel like a $100k/year coach from day one.", icon: <Globe size={15} /> },
    { num: "04", title: "System Activation", desc: "Lead gen engine launches. AutoNation goes live. Your pipeline starts filling automatically.", icon: <Zap size={15} /> },
    { num: "05", title: "Scale & Optimise", desc: "Real data, real decisions. We double down on what works and cut what doesn't — every single month.", icon: <TrendingUp size={15} /> },
  ];

  return (
    <Section>
      <FadeIn className="mb-10">
        <Label>The Process</Label>
        <h2 className="heading text-[clamp(2rem,5vw,3.25rem)] text-white max-w-sm">
          Zero to system<br />in 90 days.
        </h2>
      </FadeIn>

      <div className="border border-white/[0.06] rounded-2xl overflow-hidden divide-y divide-white/[0.06]">
        {steps.map((s, i) => (
          <FadeIn key={i} delay={i * 0.05}>
            <div data-testid={`process-step-${i}`}
              className="flex items-start gap-4 md:gap-6 px-5 py-5 md:px-6 md:py-5 bg-[#0C0C0C] hover:bg-[#101010] transition-colors">
              <span className="font-mono text-[11px] text-white/18 pt-0.5 flex-shrink-0 w-5">{s.num}</span>
              <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-[#FF4500]/8 border border-[#FF4500]/14 flex items-center justify-center text-[#FF4500] opacity-75">
                {s.icon}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-[14px] font-bold text-white mb-1 tracking-tight">{s.title}</p>
                <p className="text-[12px] md:text-[13px] text-white/38 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}

/* ── results ── */
function Results() {
  const cards = [
    { name: "James C.", role: "Fat Loss Coach", av: "JC",
      before: "$4.2k", after: "$31.5k", time: "4 months",
      quote: "HustleCoreX built me a real business. My system runs 24/7 and I've broken past $30k consistently every month." },
    { name: "Sarah M.", role: "PT & Nutrition Coach", av: "SM",
      before: "$7.8k", after: "$52k", time: "6 months",
      quote: "I used to post and pray. Now I have a machine booking 3–5 calls daily without me touching a thing." },
    { name: "Marcus R.", role: "Strength & Performance", av: "MR",
      before: "$2.9k", after: "$18.4k", time: "3 months",
      quote: "The brand transformation alone was worth 10x the investment. People say they've followed me for months — the automation closes them." },
    { name: "Priya S.", role: "Female Transformation", av: "PS",
      before: "$8.5k", after: "$67k", time: "5 months",
      quote: "From total burnout to a business I'm genuinely proud of. HustleCoreX handles the heavy lifting — I just coach." },
  ];

  return (
    <Section id="results">
      <FadeIn className="mb-10">
        <Label>Results</Label>
        <h2 className="heading text-[clamp(2rem,5vw,3.25rem)] text-white max-w-sm">
          Real coaches.<br />Real numbers.
        </h2>
      </FadeIn>

      <div className="grid sm:grid-cols-2 gap-3 mb-8">
        {cards.map((r, i) => (
          <FadeIn key={i} delay={i * 0.07}>
            <div data-testid={`result-card-${i}`}
              className="border border-white/[0.07] rounded-2xl p-5 md:p-6 bg-[#0C0C0C] h-full flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-[#FF4500] flex items-center justify-center text-white text-[11px] font-black flex-shrink-0">
                  {r.av}
                </div>
                <div>
                  <p className="text-[14px] font-bold text-white leading-tight">{r.name}</p>
                  <p className="text-[11px] text-white/30">{r.role}</p>
                </div>
              </div>
              <p className="text-[13px] text-white/45 italic leading-relaxed flex-1 mb-5">"{r.quote}"</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 text-center">
                  <p className="text-[10px] text-white/22 uppercase tracking-wide mb-0.5">Before</p>
                  <p className="text-[13px] font-bold text-white">{r.before}<span className="text-[10px] text-white/25">/mo</span></p>
                </div>
                <ArrowRight size={12} className="text-white/18 flex-shrink-0" />
                <div className="flex-1 rounded-xl border border-[#FF4500]/18 bg-[#FF4500]/[0.05] p-3 text-center">
                  <p className="text-[10px] text-white/22 uppercase tracking-wide mb-0.5">After</p>
                  <p className="text-[13px] font-bold text-[#FF4500]">{r.after}<span className="text-[10px] text-[#FF4500]/40">/mo</span></p>
                </div>
                <p className="text-[10px] text-white/18 pl-1 flex-shrink-0">{r.time}</p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      <FadeIn>
        <div className="grid grid-cols-2 sm:grid-cols-4 border border-white/[0.06] rounded-2xl overflow-hidden divide-y sm:divide-y-0 divide-x-0 sm:divide-x divide-white/[0.06]">
          {[
            { n: 150, s: "+", label: "Coaches Scaled" },
            { n: 12, p: "$", s: "M+", label: "Revenue Generated" },
            { n: 90, s: "%", label: "Hit $20k in 6 Mo." },
            { n: 4, s: ".9/5", label: "Average Rating" },
          ].map((s, i) => (
            <div key={i} data-testid={`results-stat-${i}`}
              className="bg-[#0C0C0C] p-5 md:p-6 text-center border-b border-white/[0.06] sm:border-b-0 last:border-0">
              <p className="text-[1.6rem] md:text-[2rem] font-black text-white leading-none tracking-tight mb-1">
                <Counter end={s.n} suffix={s.s} prefix={s.p} />
              </p>
              <p className="text-[11px] text-white/28">{s.label}</p>
            </div>
          ))}
        </div>
      </FadeIn>
    </Section>
  );
}

/* ── pricing ── */
function Pricing() {
  const plans = [
    {
      name: "Growth System", price: "4,997", note: "one-time",
      desc: "The complete system for coaches ready to break $20k/month.",
      features: ["Everything in Launchpad", "Premium Website Build", "AutoNation Integration", "Email & DM Automation", "Analytics Dashboard", "3-Month Strategy Support"],
      missing: [],
      highlight: true, badge: "Most Popular", order: "md:order-2",
    },
    {
      name: "Launchpad", price: "2,497", note: "one-time",
      desc: "For coaches under $5k/month who need solid foundations.",
      features: ["Brand Identity Package", "Instagram Overhaul", "Lead Gen Strategy", "30-Day Content Framework", "DM Script Library"],
      missing: ["Website Build", "AutoNation Setup"],
      highlight: false, badge: "", order: "md:order-1",
    },
    {
      name: "Empire", price: "Custom", note: "bespoke",
      desc: "For coaches at $20k+ scaling toward $100k/month.",
      features: ["Everything in Growth", "Full Ad Management", "Dedicated Strategist", "PR & Authority Building", "Team & Hiring Systems"],
      missing: [],
      highlight: false, badge: "6-Figure Track", order: "md:order-3",
    },
  ];

  return (
    <Section id="pricing">
      <FadeIn className="mb-10">
        <Label>Pricing</Label>
        <h2 className="heading text-[clamp(2rem,5vw,3.25rem)] text-white max-w-sm">
          Simple. Transparent.<br />No retainers.
        </h2>
        <p className="text-[14px] text-white/35 mt-3 max-w-sm leading-relaxed">
          Pay once. Own the system forever.
        </p>
      </FadeIn>

      <div className="flex flex-col md:grid md:grid-cols-3 gap-3 mb-4">
        {plans.map((p, i) => (
          <FadeIn key={i} delay={i * 0.07} className={p.order}>
            <div data-testid={`pricing-card-${i}`}
              className={`rounded-2xl p-5 md:p-6 flex flex-col h-full ${
                p.highlight
                  ? "border border-[#FF4500]/28 bg-[#FF4500]/[0.04]"
                  : "border border-white/[0.07] bg-[#0C0C0C]"
              }`}>
              {p.badge && (
                <span className={`self-start text-[11px] font-bold px-2.5 py-1 rounded-full mb-4 ${
                  p.highlight
                    ? "bg-[#FF4500] text-white"
                    : "bg-white/[0.06] text-white/38 border border-white/[0.08]"
                }`}>{p.badge}</span>
              )}

              <div className="mb-6">
                <p className="text-[14px] font-bold text-white mb-2">{p.name}</p>
                <div className="flex items-baseline gap-1 mb-2">
                  {p.price !== "Custom" && <span className="text-white/25 text-[17px]">$</span>}
                  <span className={`font-black leading-none tracking-tight ${
                    p.highlight ? "text-[#FF4500] text-[2.4rem]" : "text-white text-[2.4rem]"
                  }`}>{p.price}</span>
                  <span className="text-white/22 text-[12px] ml-1">/ {p.note}</span>
                </div>
                <p className="text-[12px] text-white/35 leading-relaxed">{p.desc}</p>
              </div>

              <ul className="flex-1 space-y-2.5 mb-6">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <CheckCircle2 size={12} className={`mt-0.5 flex-shrink-0 ${p.highlight ? "text-[#FF4500]" : "text-[#FF4500]/50"}`} />
                    <span className="text-[12px] md:text-[13px] text-white/60">{f}</span>
                  </li>
                ))}
                {p.missing.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5 opacity-22">
                    <X size={12} className="mt-0.5 flex-shrink-0 text-white/20" />
                    <span className="text-[12px] md:text-[13px] text-white/25 line-through">{f}</span>
                  </li>
                ))}
              </ul>

              <button data-testid={`pricing-cta-${i}`} onClick={() => goto("apply")}
                className={`w-full h-11 rounded-xl text-[13px] font-semibold transition-all active:scale-[0.98] ${
                  p.highlight
                    ? "bg-[#FF4500] hover:bg-[#FF5A00] text-white"
                    : "border border-white/10 text-white/50 hover:text-white/75 hover:border-white/18"
                }`}>
                {p.name === "Empire" ? "Book a Call" : "Get Started"}
              </button>
            </div>
          </FadeIn>
        ))}
      </div>

      <FadeIn>
        <div className="flex items-center justify-center gap-2 py-3">
          <Shield size={12} className="text-[#FF4500]/50" />
          <span className="text-[12px] text-white/22">30-day results guarantee on all packages.</span>
        </div>
      </FadeIn>
    </Section>
  );
}

/* ── faq ── */
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: "How quickly will I see results?",
      a: "Most clients see inbound leads within 2–3 weeks of activation. Consistent $20k+ months typically arrive by month 3 to 5 as the system compounds." },
    { q: "Do I need a big following to start?",
      a: "Not at all. We've built systems for coaches starting from zero. The system works on quality targeting — some of our best results came from coaches with under 1,000 followers." },
    { q: "What is AutoNation?",
      a: "AutoNation is the automation platform we use to connect every tool in your stack — CRM, email, DMs, booking, and onboarding — into one seamless flow running 24/7." },
    { q: "How are you different from a social media manager?",
      a: "A social media manager posts content. We build a complete business system — brand, website, lead gen, automation, and analytics. It's the difference between one employee and a full machine." },
    { q: "Is there ongoing support?",
      a: "Yes. All packages include setup and onboarding support. Growth System includes 3 months of strategy support. Empire includes a dedicated strategist with priority access." },
  ];

  return (
    <Section>
      <FadeIn className="mb-10">
        <Label>FAQ</Label>
        <h2 className="heading text-[clamp(2rem,5vw,3.25rem)] text-white">
          Common questions.
        </h2>
      </FadeIn>

      <div className="border border-white/[0.06] rounded-2xl overflow-hidden divide-y divide-white/[0.06]">
        {faqs.map((f, i) => (
          <FadeIn key={i}>
            <div data-testid={`faq-item-${i}`}>
              <button data-testid={`faq-toggle-${i}`} onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-5 md:px-6 py-4 md:py-5 bg-[#0C0C0C] hover:bg-[#101010] active:bg-[#111] transition-colors text-left">
                <span className="text-[14px] font-semibold text-white/75 pr-4">{f.q}</span>
                <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.18 }} className="flex-shrink-0">
                  <ChevronDown size={14} className={open === i ? "text-[#FF4500]" : "text-white/20"} />
                </motion.div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
                    className="overflow-hidden bg-[#0C0C0C]">
                    <p className="px-5 md:px-6 pb-5 text-[13px] text-white/38 leading-relaxed">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}

/* ── cta strip ── */
function CTAStrip() {
  return (
    <div className="px-4 md:px-8 py-4">
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <div className="border border-white/[0.08] rounded-2xl px-6 py-7 md:px-10 md:py-9 bg-[#0C0C0C] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <p className="label-sm mb-2">Limited to 5 clients per month</p>
              <h2 className="heading text-[1.4rem] md:text-[1.75rem] text-white leading-tight">
                Your competition isn't waiting.
              </h2>
            </div>
            <button data-testid="cta-banner-button" onClick={() => goto("apply")}
              className="flex-shrink-0 flex items-center gap-2 h-11 px-5 rounded-xl bg-[#FF4500] hover:bg-[#FF5A00] active:scale-[0.97] text-white text-[13px] font-semibold transition-all whitespace-nowrap">
              Get a Free Audit <ArrowRight size={14} />
            </button>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}

/* ── apply ── */
function Apply() {
  const { toast } = useToast();
  const [done, setDone] = useState(false);

  const form = useForm<InsertLead>({
    resolver: zodResolver(insertLeadSchema.extend({
      name: insertLeadSchema.shape.name.min(2, "Required"),
      email: insertLeadSchema.shape.email.email("Enter a valid email"),
      currentRevenue: insertLeadSchema.shape.currentRevenue.min(1, "Required"),
      goal: insertLeadSchema.shape.goal.min(1, "Required"),
    })),
    defaultValues: { name: "", email: "", instagram: "", currentRevenue: "", goal: "", message: "" },
  });

  const mut = useMutation({
    mutationFn: (d: InsertLead) => apiRequest("POST", "/api/leads", d),
    onSuccess: () => { setDone(true); toast({ title: "Application received", description: "We'll be in touch within 24 hours." }); },
    onError: () => toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" }),
  });

  const inputCls = "w-full h-11 px-4 rounded-xl bg-[#111] border border-white/[0.08] text-[14px] text-white placeholder-white/18 focus:outline-none focus:border-[#FF4500]/35 transition-colors";
  const lblCls = "block label-sm mb-2";

  return (
    <Section id="apply">
      <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-start">
        {/* left */}
        <FadeIn>
          <Label>Apply</Label>
          <h2 className="heading text-[clamp(2rem,5vw,3.25rem)] text-white mb-5">
            Ready to build<br />
            <span className="text-brand">your system?</span>
          </h2>
          <p className="text-[14px] text-white/38 leading-relaxed mb-8 max-w-sm">
            Fill in the form. We'll audit your setup for free and show you exactly what's holding you back — no pressure, no hard sell.
          </p>

          <ul className="space-y-3.5 mb-8">
            {[
              { icon: <Clock size={13} />, text: "Reply within 24 hours" },
              { icon: <Shield size={13} />, text: "No hard sell — we work with the right fit only" },
              { icon: <Star size={13} />, text: "Free audit included with every application" },
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-[13px] text-white/40">
                <span className="text-[#FF4500] opacity-60">{item.icon}</span>
                {item.text}
              </li>
            ))}
          </ul>

          <div className="border border-white/[0.07] rounded-2xl p-5 bg-[#0C0C0C]">
            <div className="flex -space-x-1.5 mb-3">
              {["JC", "SM", "MR", "PS", "TK"].map((av, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-[#FF4500] border-2 border-[#0C0C0C] flex items-center justify-center text-white text-[10px] font-black">
                  {av}
                </div>
              ))}
              <div className="w-8 h-8 rounded-full bg-white/[0.05] border-2 border-[#0C0C0C] flex items-center justify-center text-white/35 text-[10px] font-bold">
                +145
              </div>
            </div>
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => <Star key={i} size={10} className="text-[#FF4500] fill-[#FF4500]" />)}
              <span className="text-[11px] text-white/22 ml-1.5">4.9 from 140+ coaches</span>
            </div>
            <p className="text-[11px] text-white/28 italic leading-relaxed">
              "The best investment I've ever made in my coaching business." — Sarah M.
            </p>
          </div>
        </FadeIn>

        {/* right */}
        <FadeIn delay={0.1}>
          {done ? (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              className="border border-white/[0.07] rounded-2xl p-8 md:p-10 bg-[#0C0C0C] text-center" data-testid="apply-success">
              <div className="w-12 h-12 rounded-2xl bg-[#FF4500] flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={22} className="text-white" />
              </div>
              <h3 className="text-[1.2rem] font-black text-white mb-2">Application Received</h3>
              <p className="text-[13px] text-white/38 leading-relaxed max-w-xs mx-auto">
                We'll review your setup and be in touch within 24 hours with your free audit.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={form.handleSubmit(d => mut.mutate(d))}
              className="border border-white/[0.07] rounded-2xl p-5 md:p-6 bg-[#0C0C0C] space-y-4" data-testid="apply-form">
              <p className="text-[15px] font-bold text-white mb-1">Free System Audit</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lblCls}>Name</label>
                  <input {...form.register("name")} data-testid="input-name" placeholder="Your name" className={inputCls} />
                  {form.formState.errors.name && <p className="text-red-400/70 text-[11px] mt-1">{form.formState.errors.name.message}</p>}
                </div>
                <div>
                  <label className={lblCls}>Email</label>
                  <input {...form.register("email")} data-testid="input-email" type="email" placeholder="you@email.com" className={inputCls} />
                  {form.formState.errors.email && <p className="text-red-400/70 text-[11px] mt-1">{form.formState.errors.email.message}</p>}
                </div>
              </div>

              <div>
                <label className={lblCls}>Instagram</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/18 text-[13px] pointer-events-none font-mono">@</span>
                  <input {...form.register("instagram")} data-testid="input-instagram" placeholder="yourhandle" className={inputCls + " pl-7"} />
                </div>
              </div>

              <div>
                <label className={lblCls}>Current Monthly Revenue</label>
                <select {...form.register("currentRevenue")} data-testid="select-revenue"
                  className={inputCls + " appearance-none cursor-pointer"}>
                  <option value="">Select range...</option>
                  <option value="0-2k">$0 – $2,000</option>
                  <option value="2k-5k">$2,000 – $5,000</option>
                  <option value="5k-10k">$5,000 – $10,000</option>
                  <option value="10k-20k">$10,000 – $20,000</option>
                  <option value="20k+">$20,000+</option>
                </select>
                {form.formState.errors.currentRevenue && <p className="text-red-400/70 text-[11px] mt-1">{form.formState.errors.currentRevenue.message}</p>}
              </div>

              <div>
                <label className={lblCls}>6-Month Revenue Goal</label>
                <select {...form.register("goal")} data-testid="select-goal"
                  className={inputCls + " appearance-none cursor-pointer"}>
                  <option value="">Select goal...</option>
                  <option value="10k">$10,000 / month</option>
                  <option value="20k">$20,000 / month</option>
                  <option value="50k">$50,000 / month</option>
                  <option value="100k+">$100,000+ / month</option>
                </select>
                {form.formState.errors.goal && <p className="text-red-400/70 text-[11px] mt-1">{form.formState.errors.goal.message}</p>}
              </div>

              <div>
                <label className={lblCls}>
                  Biggest Challenge
                  <span className="text-white/15 normal-case tracking-normal font-normal ml-1">(optional)</span>
                </label>
                <textarea {...form.register("message")} data-testid="input-message"
                  placeholder="What's holding you back right now?" rows={3}
                  className={inputCls + " h-auto py-3 resize-none leading-relaxed"} />
              </div>

              <button type="submit" data-testid="button-submit" disabled={mut.isPending}
                className="w-full h-12 rounded-xl bg-[#FF4500] hover:bg-[#FF5A00] active:scale-[0.98] text-white text-[14px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {mut.isPending ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full" />
                    Submitting...
                  </>
                ) : "Submit Application"}
              </button>

              <p className="text-[11px] text-white/18 text-center pt-1">No spam. No hard sell. Just strategy.</p>
            </form>
          )}
        </FadeIn>
      </div>
    </Section>
  );
}

/* ── footer ── */
function Footer() {
  return (
    <footer className="border-t border-white/[0.06] px-4 md:px-8 pt-12 pb-8">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2">
            <Logo size="sm" />
            <p className="text-[12px] text-white/28 leading-relaxed mt-4 max-w-[220px]">
              Setting the standard for online fitness coaches worldwide.
            </p>
            <div className="flex gap-2 mt-5">
              {[
                { icon: <Instagram size={13} />, id: "footer-instagram" },
                { icon: <Mail size={13} />, id: "footer-mail" },
              ].map(item => (
                <a key={item.id} href="#" data-testid={item.id}
                  className="w-8 h-8 rounded-lg border border-white/[0.07] flex items-center justify-center text-white/28 hover:text-white/55 hover:border-white/14 transition-colors">
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="label-sm mb-4">Navigation</p>
            <div className="space-y-2">
              {[["system","System"],["services","Services"],["results","Results"],["pricing","Pricing"],["apply","Apply"]].map(([id, label]) => (
                <button key={id} onClick={() => goto(id)}
                  className="block text-[12px] text-white/28 hover:text-white/55 transition-colors py-0.5">
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="label-sm mb-4">Contact</p>
            <div className="space-y-2.5">
              {[
                { icon: <Mail size={11} />, text: "hello@hustlecorex.io" },
                { icon: <Instagram size={11} />, text: "@hustlecorex" },
                { icon: <Clock size={11} />, text: "Mon–Fri, 9am–6pm GMT" },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-[12px] text-white/28">
                  <span className="text-[#FF4500]/45">{c.icon}</span>
                  {c.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.05] pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-white/18">© {new Date().getFullYear()} HustleCoreX. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="text-[11px] text-white/18 hover:text-white/35 transition-colors">Privacy</a>
            <a href="#" className="text-[11px] text-white/18 hover:text-white/35 transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── page ── */
export default function Home() {
  return (
    <div className="min-h-screen bg-[#070707] text-foreground overflow-x-hidden">
      <Nav />
      <Hero />
      <Divider />
      <Problem />
      <Divider />
      <System />
      <Divider />
      <Services />
      <Divider />
      <Process />
      <Divider />
      <Results />
      <Divider />
      <Pricing />
      <Divider />
      <FAQ />
      <Divider />
      <CTAStrip />
      <Apply />
      <Footer />
    </div>
  );
}
