import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLeadSchema, type InsertLead } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Zap, Target, TrendingUp, CheckCircle2, ArrowRight, Star,
  Instagram, Globe, BarChart3, Layers, ChevronDown, Terminal,
  Rocket, Shield, Clock, Award, MessageSquare,
  Play, X, Menu, Mail, Sparkles, BrainCircuit,
} from "lucide-react";

function AnimateIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Counter({ end, suffix = "", prefix = "" }: { end: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let c = 0;
    const step = end / (1800 / 16);
    const t = setInterval(() => {
      c = Math.min(c + step, end);
      setCount(Math.floor(c));
      if (c >= end) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [inView, end]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const to = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); };

  return (
    <nav
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-black/95 backdrop-blur-xl border-b border-white/[0.06] py-3" : "bg-transparent py-5"}`}
    >
      <div className="max-w-7xl mx-auto px-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => to("hero")}>
          <div className="w-8 h-8 rounded-xl bg-[#FF4500] flex items-center justify-center font-mono text-white font-bold text-xs" style={{ boxShadow: "0 0 16px rgba(255,69,0,0.4)" }}>
            &gt;_
          </div>
          <span className="font-black text-white text-lg tracking-tight">APEX<span className="text-[#FF4500]">.</span></span>
        </div>

        <div className="hidden md:flex items-center gap-7">
          {[["system","System"],["services","Services"],["results","Results"],["pricing","Pricing"]].map(([id,label]) => (
            <button key={id} data-testid={`nav-${id}`} onClick={() => to(id)}
              className="text-sm text-white/50 hover:text-white transition-colors font-medium">{label}</button>
          ))}
        </div>

        <div className="hidden md:block">
          <button data-testid="nav-cta" onClick={() => to("apply")}
            className="px-5 py-2.5 rounded-full bg-[#FF4500] hover:bg-[#FF5500] text-white text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ boxShadow: "0 0 20px rgba(255,69,0,0.35)" }}>
            Apply Now →
          </button>
        </div>

        <button data-testid="mobile-menu-toggle" className="md:hidden text-white p-2 rounded-lg active:bg-white/5" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/98 border-t border-white/[0.06] overflow-hidden">
            <div className="px-5 py-5 flex flex-col gap-1">
              {[["system","The System"],["services","Services"],["results","Results"],["pricing","Pricing"],["apply","Apply Now"]].map(([id,label]) => (
                <button key={id} onClick={() => to(id)}
                  className="text-white/70 hover:text-white text-left text-base font-medium py-3 border-b border-white/[0.04] last:border-0">
                  {label}
                </button>
              ))}
              <button onClick={() => to("apply")}
                className="mt-3 py-3.5 rounded-full bg-[#FF4500] text-white font-bold text-base">
                Get Free Audit →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function Hero() {
  const to = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const [shown, setShown] = useState(false);
  useEffect(() => { setTimeout(() => setShown(true), 100); }, []);

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-5 pt-28 pb-20">
      {/* BG layers */}
      <div className="absolute inset-0" style={{
        backgroundImage: "linear-gradient(rgba(255,69,0,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,69,0,0.035) 1px, transparent 1px)",
        backgroundSize: "60px 60px"
      }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,69,0,0.18) 0%, transparent 70%)" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

      <div className="relative z-10 max-w-5xl mx-auto text-center w-full">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={shown ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#FF4500]/30 bg-[#FF4500]/10 text-[#FF4500] text-xs font-bold mb-7 tracking-[0.15em] uppercase"
          data-testid="hero-badge">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF4500] animate-pulse" />
          The Standard Has Been Set
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={shown ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.65, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-[88px] font-black text-white leading-[0.93] tracking-[-0.02em] mb-5"
          data-testid="hero-headline">
          Setting the<br />
          <span style={{
            background: "linear-gradient(135deg, #FF4500 0%, #FF7A00 50%, #FF4500 100%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            Standard
          </span>{" "}
          for<br />
          Online Coaches.
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={shown ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.65, delay: 0.22 }}
          className="text-lg sm:text-xl md:text-2xl text-white/55 max-w-2xl mx-auto mb-9 leading-relaxed font-light"
          data-testid="hero-subheadline">
          We build the complete system — premium brand, elite website, automated lead engine — so great coaches can focus on what they do best.
          <span className="text-white/80 font-medium"> Coaching.</span>
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={shown ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.65, delay: 0.32 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
          <button data-testid="hero-cta-primary" onClick={() => to("apply")}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-4 rounded-full bg-[#FF4500] hover:bg-[#FF5500] text-white font-bold text-base transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ boxShadow: "0 0 40px rgba(255,69,0,0.45), 0 4px 20px rgba(255,69,0,0.2)" }}>
            Get Your Free Audit
            <ArrowRight size={18} />
          </button>
          <button data-testid="hero-cta-secondary" onClick={() => to("system")}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-4 rounded-full border border-white/15 text-white hover:border-white/30 font-semibold text-base transition-all hover:bg-white/5">
            <div className="w-5 h-5 rounded-full bg-[#FF4500]/20 border border-[#FF4500]/40 flex items-center justify-center">
              <Play size={8} className="text-[#FF4500] ml-0.5" />
            </div>
            See How It Works
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={shown ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: 0.46 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
          {[
            { val: 150, suffix: "+", label: "Coaches Scaled" },
            { val: 12, suffix: "M+", prefix: "$", label: "Revenue Created" },
            { val: 97, suffix: "%", label: "Client Retention" },
            { val: 90, suffix: " days", label: "Full System Live" },
          ].map((s, i) => (
            <div key={i} data-testid={`hero-stat-${i}`}
              className="rounded-2xl p-4 text-center"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="text-xl sm:text-2xl font-black text-white">
                <Counter end={s.val} suffix={s.suffix} prefix={s.prefix} />
              </div>
              <div className="text-white/40 text-xs mt-0.5 font-medium">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.button initial={{ opacity: 0 }} animate={shown ? { opacity: 1 } : {}} transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
        onClick={() => to("ticker")}>
        <span className="text-white/20 text-[10px] tracking-widest uppercase">Scroll</span>
        <ChevronDown size={14} className="text-[#FF4500] animate-bounce" />
      </motion.button>
    </section>
  );
}

function Ticker() {
  const items = [
    "Lead Generation", "Premium Branding", "Elite Website", "Sales Automation",
    "Content Systems", "DM Sequences", "Email Nurture", "Profile Optimisation",
    "Client Onboarding", "Analytics", "Authority Building", "AutoNation",
  ];
  return (
    <section id="ticker" className="py-4 border-y border-white/[0.06] bg-black overflow-hidden">
      <div className="flex overflow-hidden">
        <div className="flex animate-ticker whitespace-nowrap">
          {[...items, ...items, ...items, ...items].map((item, i) => (
            <span key={i} className="flex items-center gap-3 px-5 text-white/35 font-medium text-xs uppercase tracking-widest flex-shrink-0">
              <span className="w-1 h-1 rounded-full bg-[#FF4500] flex-shrink-0" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Problem() {
  const comparisons = [
    { icon: <Target size={18} />, before: "Posting content and hoping someone reaches out", after: "A targeted machine generating qualified leads every day" },
    { icon: <Award size={18} />, before: "Looking like every other fitness coach online", after: "A premium brand that stands out and commands higher prices" },
    { icon: <MessageSquare size={18} />, before: "Manually following up with every lead yourself", after: "Automated sequences that nurture and close for you" },
    { icon: <Globe size={18} />, before: "A basic website that's losing you clients", after: "A conversion engine that books calls on autopilot" },
    { icon: <TrendingUp size={18} />, before: "Stuck at $5–10k/month and not sure why", after: "A clear, repeatable path to $30k+ every single month" },
    { icon: <Clock size={18} />, before: "Working in the business 10+ hours a day", after: "Working on the business from a position of real leverage" },
  ];

  return (
    <section className="py-24 md:py-32 relative">
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(255,69,0,0.07) 0%, transparent 70%)" }} />
      <div className="max-w-7xl mx-auto px-5 relative z-10">
        <AnimateIn className="text-center mb-14 md:mb-20">
          <span className="text-[#FF4500] text-xs font-bold tracking-[0.15em] uppercase">The Honest Truth</span>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mt-3 leading-tight">
            Stop Grinding.<br />
            <span style={{ background: "linear-gradient(135deg,#FF4500,#FF7A00,#FF4500)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Start Building.
            </span>
          </h2>
          <p className="text-white/45 text-lg mt-5 max-w-xl mx-auto leading-relaxed">
            Most talented coaches are stuck not because of their coaching — but because they have no system. Here's what we change.
          </p>
        </AnimateIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {comparisons.map((c, i) => (
            <AnimateIn key={i} delay={i * 0.07}>
              <div data-testid={`problem-card-${i}`}
                className="rounded-2xl p-5 h-full flex flex-col gap-4 group hover:border-[#FF4500]/20 transition-all duration-300"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[#FF4500] flex-shrink-0"
                  style={{ background: "rgba(255,69,0,0.1)", border: "1px solid rgba(255,69,0,0.18)" }}>
                  {c.icon}
                </div>
                <div className="flex items-start gap-2.5">
                  <X size={12} className="text-red-400/50 mt-1 flex-shrink-0" />
                  <span className="text-white/35 text-sm line-through leading-snug">{c.before}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={12} className="text-[#FF4500] mt-1 flex-shrink-0" />
                  <span className="text-white/85 text-sm font-semibold leading-snug">{c.after}</span>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function System() {
  const [active, setActive] = useState(0);
  const pillars = [
    {
      num: "01", title: "Brand Identity", shortTitle: "Brand",
      desc: "Your brand is the very first impression every future client gets. We build a complete identity — visuals, voice, and positioning — that makes you the obvious, premium choice in your niche.",
      features: ["Logo & Visual Identity System", "Brand Voice & Messaging", "Niche Positioning Strategy", "Content Pillars", "Authority Architecture"],
      icon: <Sparkles size={22} />,
    },
    {
      num: "02", title: "Elite Website", shortTitle: "Website",
      desc: "Not just a pretty site — a sales machine. We design and build a premium website that impresses, qualifies, and converts visitors into booked calls, around the clock.",
      features: ["Custom Premium Design", "Conversion-Optimised Copy", "Automated Booking Integration", "Video Sales Letter Setup", "Speed & Mobile Optimised"],
      icon: <Globe size={22} />,
    },
    {
      num: "03", title: "Lead Generation", shortTitle: "Leads",
      desc: "We build a multi-channel lead generation engine — organic, outbound, and paid — so your pipeline is always full of warm, qualified prospects ready to work with you.",
      features: ["Instagram Profile Overhaul", "Content-to-DM Funnel", "Strategic Outreach Scripts", "Paid Ad Strategy", "Lead Magnet Creation"],
      icon: <Target size={22} />,
    },
    {
      num: "04", title: "AutoNation System", shortTitle: "Automation",
      desc: "Using AutoNation, we connect every tool in your stack into one intelligent, seamless system. Leads come in, get nurtured, book a call, and onboard — all without you lifting a finger.",
      features: ["Full CRM Integration", "Email Automation Sequences", "DM Auto-Responses", "Lead Scoring & Tagging", "Onboarding Automation"],
      icon: <BrainCircuit size={22} />,
    },
    {
      num: "05", title: "Analytics", shortTitle: "Analytics",
      desc: "Data tells the real story. We set up a complete analytics layer so you always know where your leads come from, where they drop off, and exactly where to invest your energy.",
      features: ["Unified Dashboard", "Revenue Attribution", "Conversion Tracking", "Weekly Reports", "Ongoing Optimisation"],
      icon: <BarChart3 size={22} />,
    },
  ];

  return (
    <section id="system" className="py-24 md:py-32 relative">
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent, rgba(255,69,0,0.04), transparent)" }} />
      <div className="max-w-7xl mx-auto px-5 relative z-10">
        <AnimateIn className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#FF4500]/30 bg-[#FF4500]/10 text-[#FF4500] text-xs font-bold mb-5 tracking-[0.12em] uppercase">
            <Terminal size={12} /> The APEX System
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white leading-tight">
            Five Pillars.<br />
            <span style={{ background: "linear-gradient(135deg,#FF4500,#FF7A00,#FF4500)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              One System.
            </span>
          </h2>
          <p className="text-white/45 text-lg mt-4 max-w-xl mx-auto">
            We don't do band-aid fixes. We build the complete infrastructure your coaching business needs to scale without burning out.
          </p>
        </AnimateIn>

        {/* Tab buttons — scrollable on mobile */}
        <div className="flex overflow-x-auto gap-2 pb-2 mb-5 scrollbar-hide snap-x">
          {pillars.map((p, i) => (
            <button key={i} data-testid={`system-tab-${i}`} onClick={() => setActive(i)}
              className={`flex-shrink-0 snap-start px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-300 ${
                active === i
                  ? "border-[#FF4500]/40 bg-[#FF4500]/12 text-white"
                  : "border-white/8 bg-white/3 text-white/45 hover:border-white/15 hover:text-white/70"
              }`}>
              <span className="font-mono text-[10px] mr-1.5 opacity-50">{p.num}</span>
              {p.shortTitle}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }}
            className="rounded-2xl md:rounded-3xl p-6 md:p-10" data-testid="system-content"
            style={{ background: "rgba(255,69,0,0.06)", border: "1px solid rgba(255,69,0,0.18)" }}>
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-[#FF4500] mb-5"
                  style={{ background: "rgba(255,69,0,0.15)", border: "1px solid rgba(255,69,0,0.25)" }}>
                  {pillars[active].icon}
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">{pillars[active].title}</h3>
                <p className="text-white/55 text-base leading-relaxed">{pillars[active].desc}</p>
              </div>
              <div className="space-y-2.5">
                {pillars[active].features.map((f, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                    className="flex items-center gap-3 p-3.5 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <CheckCircle2 size={15} className="text-[#FF4500] flex-shrink-0" />
                    <span className="text-white/80 text-sm font-medium">{f}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function Services() {
  const list = [
    { icon: <Sparkles size={24} />, title: "Premium Brand Identity", desc: "Full brand system — logo, colours, typography, positioning, and a story that makes clients choose you over anyone else in your niche." },
    { icon: <Globe size={24} />, title: "Elite Website Build", desc: "Custom-designed, conversion-focused website with integrated booking, video sales letter, and social proof that sells while you sleep." },
    { icon: <Target size={24} />, title: "Lead Gen Machine", desc: "Multi-channel approach combining Instagram, content funnels, strategic outreach, and paid ads to keep your pipeline full." },
    { icon: <BrainCircuit size={24} />, title: "AutoNation Integration", desc: "Every tool connected. DMs, emails, follow-ups, and onboarding automated into one seamless system that runs without you." },
    { icon: <Instagram size={24} />, title: "Social Profile Overhaul", desc: "We transform your Instagram into a lead-generating asset that attracts the right clients with every piece of content you post." },
    { icon: <BarChart3 size={24} />, title: "Growth Analytics", desc: "Full visibility into your pipeline. Know what's working, what isn't, and exactly where your next clients are coming from." },
  ];

  return (
    <section id="services" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-5">
        <AnimateIn className="text-center mb-14">
          <span className="text-[#FF4500] text-xs font-bold tracking-[0.15em] uppercase">What We Build</span>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mt-3">
            Everything You Need.<br />
            <span style={{ background: "linear-gradient(135deg,#FF4500,#FF7A00,#FF4500)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Nothing You Don't.
            </span>
          </h2>
        </AnimateIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((s, i) => (
            <AnimateIn key={i} delay={i * 0.07}>
              <div data-testid={`service-card-${i}`}
                className="rounded-2xl p-6 group hover:-translate-y-1 transition-all duration-300 h-full flex flex-col"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[#FF4500] mb-4 transition-all duration-300 group-hover:scale-110"
                  style={{ background: "rgba(255,69,0,0.1)", border: "1px solid rgba(255,69,0,0.18)" }}>
                  {s.icon}
                </div>
                <h3 className="text-lg font-black text-white mb-2.5">{s.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed flex-1">{s.desc}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function Process() {
  const steps = [
    { num: "01", title: "Free System Audit", desc: "We dig into your current setup, find the gaps, and map out exactly what it'll take to hit your goals. No fluff, no pressure.", duration: "Day 1–3", icon: <BrainCircuit size={18} /> },
    { num: "02", title: "Strategy Blueprint", desc: "We create your complete growth plan — brand positioning, lead gen channels, automation map, and a 90-day revenue roadmap tailored to you.", duration: "Day 4–10", icon: <Layers size={18} /> },
    { num: "03", title: "Brand & Website", desc: "We execute the full brand identity and build your premium website. You'll look and feel like a $100k/year coach from day one.", duration: "Week 2–4", icon: <Globe size={18} /> },
    { num: "04", title: "System Activation", desc: "We launch your lead gen engine and activate all automations via AutoNation. Your system starts generating and nurturing leads immediately.", duration: "Month 2", icon: <Zap size={18} /> },
    { num: "05", title: "Scale & Optimise", desc: "With real data flowing, we double down on what's working and cut what isn't — growing your revenue predictably month after month.", duration: "Month 3+", icon: <TrendingUp size={18} /> },
  ];

  return (
    <section className="py-24 md:py-32">
      <div className="max-w-3xl mx-auto px-5">
        <AnimateIn className="text-center mb-14">
          <span className="text-[#FF4500] text-xs font-bold tracking-[0.15em] uppercase">The Journey</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mt-3">
            From Scattered to<br />
            <span style={{ background: "linear-gradient(135deg,#FF4500,#FF7A00,#FF4500)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Scaled in 90 Days
            </span>
          </h2>
          <p className="text-white/45 text-base mt-4 max-w-md mx-auto">A clear, proven path. No guesswork, no surprises — just results.</p>
        </AnimateIn>

        <div className="relative">
          <div className="absolute left-5 md:left-6 top-0 bottom-0 w-px" style={{ background: "linear-gradient(to bottom, #FF4500, rgba(255,69,0,0.1))" }} />
          <div className="space-y-8">
            {steps.map((s, i) => (
              <AnimateIn key={i} delay={i * 0.1}>
                <div className="flex gap-5 md:gap-7" data-testid={`process-step-${i}`}>
                  <div className="relative flex-shrink-0 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-[#FF4500] flex items-center justify-center text-white z-10 relative flex-shrink-0"
                      style={{ boxShadow: "0 0 20px rgba(255,69,0,0.45), 0 0 40px rgba(255,69,0,0.15)" }}>
                      {s.icon}
                    </div>
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="text-[#FF4500] text-[10px] font-bold tracking-widest uppercase mb-1">{s.duration}</div>
                    <h3 className="text-lg font-black text-white mb-1.5">{s.title}</h3>
                    <p className="text-white/45 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Results() {
  const cards = [
    {
      name: "James Carter", niche: "Fat Loss Coach", avatar: "JC",
      before: "$4,200/mo", after: "$31,500/mo", time: "4 months", pct: "650%",
      quote: "APEX built me a real business. My brand looks elite, my system works 24/7, and I've finally broken past $30k consistently."
    },
    {
      name: "Sarah Mitchell", niche: "Online PT & Nutrition", avatar: "SM",
      before: "$7,800/mo", after: "$52,000/mo", time: "6 months", pct: "567%",
      quote: "I used to post content hoping it would convert. Now I have a machine. My website books 3–5 calls a day without me doing anything."
    },
    {
      name: "Marcus Reid", niche: "Strength & Performance", avatar: "MR",
      before: "$2,900/mo", after: "$18,400/mo", time: "3 months", pct: "534%",
      quote: "The brand transformation alone was worth 10x the investment. People say they've been watching me for months before booking — the automation closes them."
    },
    {
      name: "Priya Sharma", niche: "Female Transformation", avatar: "PS",
      before: "$8,500/mo", after: "$67,000/mo", time: "5 months", pct: "688%",
      quote: "I went from total burnout to a business I'm proud of. APEX's system handles the heavy lifting — I just show up and coach."
    },
  ];

  return (
    <section id="results" className="py-24 md:py-32 relative">
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,69,0,0.1) 0%, transparent 65%)" }} />
      <div className="max-w-7xl mx-auto px-5 relative z-10">
        <AnimateIn className="text-center mb-14">
          <span className="text-[#FF4500] text-xs font-bold tracking-[0.15em] uppercase">Real Coaches, Real Results</span>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mt-3">
            The Proof Is in<br />
            <span style={{ background: "linear-gradient(135deg,#FF4500,#FF7A00,#FF4500)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              the Numbers
            </span>
          </h2>
        </AnimateIn>

        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {cards.map((r, i) => (
            <AnimateIn key={i} delay={i * 0.09}>
              <div data-testid={`result-card-${i}`}
                className="rounded-2xl p-6 h-full"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#FF4500] to-[#FF7700] flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                      {r.avatar}
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">{r.name}</div>
                      <div className="text-white/35 text-xs">{r.niche}</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[#FF4500] font-black text-xl">{r.pct}</div>
                    <div className="text-white/30 text-[10px]">revenue up</div>
                  </div>
                </div>

                <p className="text-white/60 text-sm leading-relaxed mb-5 italic border-l-2 border-[#FF4500]/30 pl-3">
                  "{r.quote}"
                </p>

                <div className="flex items-center gap-3">
                  <div className="flex-1 rounded-xl p-2.5 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="text-white/35 text-[10px] mb-0.5">Before</div>
                    <div className="text-white font-bold text-sm">{r.before}</div>
                  </div>
                  <ArrowRight size={14} className="text-[#FF4500] flex-shrink-0" />
                  <div className="flex-1 rounded-xl p-2.5 text-center" style={{ background: "rgba(255,69,0,0.1)", border: "1px solid rgba(255,69,0,0.2)" }}>
                    <div className="text-white/35 text-[10px] mb-0.5">After</div>
                    <div className="text-[#FF4500] font-black text-sm">{r.after}</div>
                  </div>
                  <div className="flex-shrink-0 text-white/25 text-[10px]">{r.time}</div>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>

        {/* Bottom stats row */}
        <AnimateIn>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { n: 150, s: "+", label: "Coaches Scaled" },
              { n: 12, p: "$", s: "M+", label: "Revenue Generated" },
              { n: 90, s: "%", label: "Hit $20k/month" },
            ].map((s, i) => (
              <div key={i} data-testid={`results-stat-${i}`}
                className="rounded-2xl p-5 text-center"
                style={{ background: "rgba(255,69,0,0.07)", border: "1px solid rgba(255,69,0,0.15)" }}>
                <div className="text-2xl sm:text-3xl font-black text-white mb-1">
                  <Counter end={s.n} suffix={s.s} prefix={s.p} />
                </div>
                <div className="text-white/40 text-xs font-medium">{s.label}</div>
              </div>
            ))}
            <div className="rounded-2xl p-5 text-center"
              style={{ background: "rgba(255,69,0,0.07)", border: "1px solid rgba(255,69,0,0.15)" }}>
              <div className="text-2xl sm:text-3xl font-black text-white mb-1">4.9<span className="text-base text-white/40">/5</span></div>
              <div className="text-white/40 text-xs font-medium">Client Rating</div>
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}

function Pricing() {
  const to = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const plans = [
    {
      name: "Launchpad",
      price: "2,497", period: "one-time",
      desc: "For coaches under $5k/month who need the right foundations to grow.",
      features: ["Brand Identity Package", "Instagram Profile Overhaul", "Lead Gen Strategy Session", "30-Day Content Framework", "DM Script Library", "Onboarding Workflow"],
      excluded: ["Custom Website Build", "AutoNation Automation"],
      highlight: false, badge: null, cta: "Get Started",
    },
    {
      name: "Growth System",
      price: "4,997", period: "one-time",
      desc: "The complete system for coaches ready to break $20k+ per month.",
      features: ["Everything in Launchpad", "Premium Website Build", "Sales Funnel & Booking", "AutoNation Integration", "Email & DM Automation", "3-Month Strategy Support", "Analytics Dashboard", "Weekly Check-ins"],
      excluded: [],
      highlight: true, badge: "Most Popular", cta: "Apply Now",
    },
    {
      name: "Empire",
      price: "Custom", period: "investment",
      desc: "For coaches at $20k+ ready to scale to $100k/month and build a team.",
      features: ["Everything in Growth", "Bespoke Brand Campaign", "Full Ad Management", "Dedicated Strategist", "PR & Authority Building", "Team Systems & Hiring", "Monthly Strategy Calls", "Priority Support"],
      excluded: [],
      highlight: false, badge: "6-Figure Coaches", cta: "Book a Call",
    },
  ];

  return (
    <section id="pricing" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-5">
        <AnimateIn className="text-center mb-14">
          <span className="text-[#FF4500] text-xs font-bold tracking-[0.15em] uppercase">Investment</span>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mt-3">
            Clear. Transparent.<br />
            <span style={{ background: "linear-gradient(135deg,#FF4500,#FF7A00,#FF4500)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Worth Every Penny.
            </span>
          </h2>
          <p className="text-white/45 text-lg mt-4 max-w-lg mx-auto">
            Pay once. Own your system forever. No monthly retainers, no surprises.
          </p>
        </AnimateIn>

        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan, i) => (
            <AnimateIn key={i} delay={i * 0.1}>
              <div data-testid={`pricing-card-${i}`}
                className={`rounded-2xl p-6 flex flex-col h-full transition-all duration-300 ${
                  plan.highlight
                    ? "border border-[#FF4500]/40"
                    : "border border-white/[0.07]"
                }`}
                style={plan.highlight
                  ? { background: "linear-gradient(160deg, rgba(255,69,0,0.14) 0%, rgba(255,69,0,0.05) 100%)", boxShadow: "0 0 40px rgba(255,69,0,0.12)" }
                  : { background: "rgba(255,255,255,0.025)" }}>

                {plan.badge && (
                  <span className={`inline-block self-start px-3 py-1 rounded-full text-xs font-bold mb-4 ${plan.highlight ? "bg-[#FF4500] text-white" : "bg-white/8 text-white/50 border border-white/10"}`}>
                    {plan.badge}
                  </span>
                )}

                <div className="mb-6">
                  <div className="text-white font-black text-xl mb-2">{plan.name}</div>
                  <div className="flex items-baseline gap-1 mb-2">
                    {plan.price !== "Custom" && <span className="text-white/35 text-lg">$</span>}
                    <span className={`font-black text-4xl ${plan.highlight ? "text-[#FF4500]" : "text-white"}`}>{plan.price}</span>
                    <span className="text-white/35 text-sm">/ {plan.period}</span>
                  </div>
                  <p className="text-white/45 text-sm">{plan.desc}</p>
                </div>

                <div className="flex-1 space-y-2.5 mb-7">
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex items-start gap-2.5">
                      <CheckCircle2 size={13} className={`mt-0.5 flex-shrink-0 ${plan.highlight ? "text-[#FF4500]" : "text-[#FF4500]/60"}`} />
                      <span className="text-white/70 text-sm">{f}</span>
                    </div>
                  ))}
                  {plan.excluded.map((f, j) => (
                    <div key={j} className="flex items-start gap-2.5 opacity-30">
                      <X size={13} className="mt-0.5 flex-shrink-0 text-white/30" />
                      <span className="text-white/35 text-sm line-through">{f}</span>
                    </div>
                  ))}
                </div>

                <button data-testid={`pricing-cta-${i}`} onClick={() => to("apply")}
                  className={`w-full py-3.5 rounded-full font-bold text-sm transition-all duration-200 ${
                    plan.highlight
                      ? "bg-[#FF4500] hover:bg-[#FF5500] text-white hover:scale-105 active:scale-95"
                      : "border border-white/12 text-white hover:border-white/25 hover:bg-white/5"
                  }`}
                  style={plan.highlight ? { boxShadow: "0 0 24px rgba(255,69,0,0.3)" } : {}}>
                  {plan.cta}
                </button>
              </div>
            </AnimateIn>
          ))}
        </div>

        <AnimateIn>
          <div className="mt-6 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center gap-2.5">
            <Shield size={14} className="text-[#FF4500] flex-shrink-0" />
            <span className="text-white/40 text-sm">30-day results guarantee — if we don't deliver, you don't pay.</span>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: "How quickly will I see results?", a: "Most clients start seeing inbound leads within 2–3 weeks of activation. The full compound effect — consistent $20k+ months — typically arrives by month 3 to 5. We set realistic expectations from day one." },
    { q: "Do I need a big following to start?", a: "Not at all. We've built systems for coaches starting from zero. The system works on quality and targeting, not follower count. Some of our best results have come from coaches with under 1,000 followers." },
    { q: "What exactly is AutoNation?", a: "AutoNation is the automation platform we use to connect every tool in your stack — CRM, email, Instagram DMs, booking system, and client onboarding — into one seamless, intelligent flow. Once it's set up, it works 24/7 without you." },
    { q: "How is APEX different from a social media manager?", a: "A social media manager posts content. We build a complete business system — brand, website, lead generation, automation, and analytics. It's the difference between having one marketing employee and having a fully automated marketing machine." },
    { q: "What if I'm already at $20k+ a month?", a: "The Empire package is built exactly for you. We focus on scaling intelligently — better ad strategy, team systems, PR and authority building, and the infrastructure to take you to $100k+ without sacrificing your freedom." },
    { q: "Is there ongoing support?", a: "Yes. All packages include setup support and onboarding. Growth System includes 3 months of strategy support. Empire includes a dedicated ongoing strategist and priority access to our team." },
  ];

  return (
    <section className="py-24 md:py-32">
      <div className="max-w-2xl mx-auto px-5">
        <AnimateIn className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Got Questions?<br />
            <span style={{ background: "linear-gradient(135deg,#FF4500,#FF7A00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              We've Got Answers.
            </span>
          </h2>
        </AnimateIn>

        <div className="space-y-2.5">
          {faqs.map((f, i) => (
            <AnimateIn key={i} delay={i * 0.04}>
              <div data-testid={`faq-item-${i}`}
                className="rounded-xl overflow-hidden transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.025)", border: open === i ? "1px solid rgba(255,69,0,0.2)" : "1px solid rgba(255,255,255,0.06)" }}>
                <button className="w-full text-left px-5 py-4 flex items-center justify-between gap-4" onClick={() => setOpen(open === i ? null : i)} data-testid={`faq-toggle-${i}`}>
                  <span className="font-semibold text-white text-sm sm:text-base leading-snug">{f.q}</span>
                  <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
                    <ChevronDown size={16} className={open === i ? "text-[#FF4500]" : "text-white/25"} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28 }}>
                      <p className="px-5 pb-4 text-white/50 text-sm leading-relaxed">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTABanner() {
  const to = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <section className="px-5 py-8">
      <div className="max-w-5xl mx-auto">
        <AnimateIn>
          <div className="relative rounded-2xl md:rounded-3xl overflow-hidden p-8 md:p-14 text-center"
            style={{ background: "linear-gradient(135deg, rgba(255,69,0,0.18) 0%, rgba(255,69,0,0.06) 50%, rgba(255,69,0,0.15) 100%)", border: "1px solid rgba(255,69,0,0.25)" }}>
            <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(255,69,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,69,0,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
            <div className="relative z-10">
              <div className="text-[#FF4500] text-xs font-bold tracking-[0.15em] uppercase mb-4">Limited Spots — 5 New Clients Per Month</div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                Your Competition<br />Isn't Waiting.
              </h2>
              <p className="text-white/50 text-base md:text-lg mb-8 max-w-lg mx-auto leading-relaxed">
                Every day without a system is revenue you're leaving behind. Let's fix that — starting with a free audit.
              </p>
              <button data-testid="cta-banner-button" onClick={() => to("apply")}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#FF4500] hover:bg-[#FF5500] text-white font-black text-base transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ boxShadow: "0 0 40px rgba(255,69,0,0.4)" }}>
                Get My Free Audit
                <ArrowRight size={18} />
              </button>
              <div className="mt-4 text-white/25 text-sm">No commitment. No hard sell. Just clarity.</div>
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}

function Apply() {
  const { toast } = useToast();
  const [done, setDone] = useState(false);

  const form = useForm<InsertLead>({
    resolver: zodResolver(insertLeadSchema.extend({
      name: insertLeadSchema.shape.name.min(2, "Please enter your name"),
      email: insertLeadSchema.shape.email.email("Please enter a valid email"),
      currentRevenue: insertLeadSchema.shape.currentRevenue.min(1, "Please select your revenue"),
      goal: insertLeadSchema.shape.goal.min(1, "Please select your goal"),
    })),
    defaultValues: { name: "", email: "", instagram: "", currentRevenue: "", goal: "", message: "" },
  });

  const mutation = useMutation({
    mutationFn: (data: InsertLead) => apiRequest("POST", "/api/leads", data),
    onSuccess: () => { setDone(true); toast({ title: "We've got your application!", description: "Expect a reply within 24 hours." }); },
    onError: () => toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" }),
  });

  const inputClass = "w-full px-4 py-3.5 rounded-xl text-white placeholder-white/25 text-sm focus:outline-none transition-all"
    + " bg-white/[0.04] border border-white/[0.08] focus:border-[#FF4500]/40 focus:bg-[#FF4500]/[0.04]";

  const labelClass = "block text-white/40 text-[10px] font-bold mb-1.5 uppercase tracking-widest";

  return (
    <section id="apply" className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255,69,0,0.1) 0%, transparent 70%)" }} />
      <div className="max-w-6xl mx-auto px-5 relative z-10">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
          <AnimateIn>
            <span className="text-[#FF4500] text-xs font-bold tracking-[0.15em] uppercase">Apply Today</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mt-3 leading-tight mb-5">
              Ready to Build<br />
              Something{" "}
              <span style={{ background: "linear-gradient(135deg,#FF4500,#FF7A00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Real?
              </span>
            </h2>
            <p className="text-white/50 text-base leading-relaxed mb-8">
              Fill in the form and we'll review your setup. We'll come back with a free audit — showing exactly what's holding you back and what the path forward looks like. Completely free. No pressure.
            </p>

            <div className="space-y-4 mb-8">
              {[
                { icon: <Clock size={15} />, t: "We reply within 24 hours, usually much faster" },
                { icon: <Shield size={15} />, t: "No hard sell, ever — we only work with the right fit" },
                { icon: <Star size={15} />, t: "Free system audit included with every application" },
                { icon: <Award size={15} />, t: "30-day results guarantee on all packages" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-white/50 text-sm">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#FF4500] flex-shrink-0"
                    style={{ background: "rgba(255,69,0,0.1)", border: "1px solid rgba(255,69,0,0.18)" }}>
                    {item.icon}
                  </div>
                  {item.t}
                </div>
              ))}
            </div>

            {/* Social proof block */}
            <div className="rounded-2xl p-5" style={{ background: "rgba(255,69,0,0.07)", border: "1px solid rgba(255,69,0,0.15)" }}>
              <div className="flex -space-x-2 mb-3">
                {["JC", "SM", "MR", "PS", "TK"].map((av, i) => (
                  <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF4500] to-[#FF7700] border-2 border-background flex items-center justify-center text-white text-xs font-black">
                    {av}
                  </div>
                ))}
                <div className="w-9 h-9 rounded-full border-2 border-[#FF4500]/30 bg-[#FF4500]/10 flex items-center justify-center text-[#FF4500] text-xs font-bold">
                  +145
                </div>
              </div>
              <div className="flex items-center gap-1 mb-1.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-[#FF4500] fill-[#FF4500]" />)}
                <span className="text-white/40 text-xs ml-1">4.9 from 140+ coaches</span>
              </div>
              <p className="text-white/45 text-xs leading-relaxed">"The best investment I've ever made in my business." — Sarah M.</p>
            </div>
          </AnimateIn>

          <AnimateIn delay={0.15}>
            {done ? (
              <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl p-8 text-center" data-testid="apply-success"
                style={{ background: "rgba(255,69,0,0.07)", border: "1px solid rgba(255,69,0,0.2)" }}>
                <div className="w-16 h-16 rounded-full bg-[#FF4500] flex items-center justify-center mx-auto mb-5"
                  style={{ boxShadow: "0 0 30px rgba(255,69,0,0.5)" }}>
                  <CheckCircle2 size={28} className="text-white" />
                </div>
                <h3 className="text-2xl font-black text-white mb-3">Application Received!</h3>
                <p className="text-white/55 text-sm leading-relaxed">
                  We'll review your setup and reach out within 24 hours with your free system audit. Exciting things ahead.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={form.handleSubmit(d => mutation.mutate(d))}
                className="rounded-2xl p-6 md:p-7 space-y-5" data-testid="apply-form"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <h3 className="text-lg font-black text-white">Get Your Free System Audit</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Your Name *</label>
                    <input {...form.register("name")} data-testid="input-name" placeholder="Full name" className={inputClass} />
                    {form.formState.errors.name && <p className="text-red-400 text-xs mt-1">{form.formState.errors.name.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Email *</label>
                    <input {...form.register("email")} data-testid="input-email" type="email" placeholder="you@email.com" className={inputClass} />
                    {form.formState.errors.email && <p className="text-red-400 text-xs mt-1">{form.formState.errors.email.message}</p>}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Instagram Handle</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 text-sm pointer-events-none">@</span>
                    <input {...form.register("instagram")} data-testid="input-instagram" placeholder="yourhandle" className={inputClass + " pl-8"} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Current Monthly Revenue *</label>
                  <select {...form.register("currentRevenue")} data-testid="select-revenue"
                    className="w-full px-4 py-3.5 rounded-xl bg-[#0D0D0D] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FF4500]/40 transition-all appearance-none cursor-pointer">
                    <option value="">Select your range...</option>
                    <option value="0-2k">$0 – $2,000 / month</option>
                    <option value="2k-5k">$2,000 – $5,000 / month</option>
                    <option value="5k-10k">$5,000 – $10,000 / month</option>
                    <option value="10k-20k">$10,000 – $20,000 / month</option>
                    <option value="20k+">$20,000+ / month</option>
                  </select>
                  {form.formState.errors.currentRevenue && <p className="text-red-400 text-xs mt-1">{form.formState.errors.currentRevenue.message}</p>}
                </div>

                <div>
                  <label className={labelClass}>6-Month Revenue Goal *</label>
                  <select {...form.register("goal")} data-testid="select-goal"
                    className="w-full px-4 py-3.5 rounded-xl bg-[#0D0D0D] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#FF4500]/40 transition-all appearance-none cursor-pointer">
                    <option value="">Select your goal...</option>
                    <option value="10k">$10,000 / month</option>
                    <option value="20k">$20,000 / month</option>
                    <option value="50k">$50,000 / month</option>
                    <option value="100k+">$100,000+ / month</option>
                  </select>
                  {form.formState.errors.goal && <p className="text-red-400 text-xs mt-1">{form.formState.errors.goal.message}</p>}
                </div>

                <div>
                  <label className={labelClass}>Biggest Challenge Right Now</label>
                  <textarea {...form.register("message")} data-testid="input-message"
                    placeholder="What's the main thing holding you back?" rows={3}
                    className={inputClass + " resize-none"} />
                </div>

                <button type="submit" data-testid="button-submit" disabled={mutation.isPending}
                  className="w-full py-4 rounded-full bg-[#FF4500] hover:bg-[#FF5500] text-white font-bold text-base transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
                  style={{ boxShadow: "0 0 30px rgba(255,69,0,0.35)" }}>
                  {mutation.isPending ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                      Submitting...
                    </>
                  ) : (
                    <>Get My Free Audit <Rocket size={17} /></>
                  )}
                </button>

                <p className="text-white/20 text-xs text-center">No spam. No pressure. Just an honest conversation.</p>
              </form>
            )}
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const to = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <footer className="pt-14 pb-8 border-t border-white/[0.05]">
      <div className="max-w-7xl mx-auto px-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-[#FF4500] flex items-center justify-center font-mono text-white font-bold text-xs">
                &gt;_
              </div>
              <span className="font-black text-white text-lg tracking-tight">APEX<span className="text-[#FF4500]">.</span></span>
            </div>
            <p className="text-white/35 text-sm leading-relaxed max-w-xs">
              Setting the standard for online fitness coaches who want premium brands, automated systems, and predictable scale.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="#" data-testid="footer-instagram" className="w-9 h-9 rounded-full border border-white/8 flex items-center justify-center text-white/35 hover:text-[#FF4500] hover:border-[#FF4500]/30 transition-colors">
                <Instagram size={14} />
              </a>
              <a href="#" data-testid="footer-mail" className="w-9 h-9 rounded-full border border-white/8 flex items-center justify-center text-white/35 hover:text-[#FF4500] hover:border-[#FF4500]/30 transition-colors">
                <Mail size={14} />
              </a>
            </div>
          </div>

          <div>
            <div className="text-white/60 font-semibold text-sm mb-4">Navigation</div>
            <div className="space-y-2">
              {[["system","The System"],["services","Services"],["results","Results"],["pricing","Pricing"],["apply","Apply"]].map(([id,label]) => (
                <button key={id} onClick={() => to(id)} className="block text-white/35 hover:text-white text-sm transition-colors py-0.5">{label}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-white/60 font-semibold text-sm mb-4">Contact</div>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-white/35 text-sm"><Mail size={12} className="text-[#FF4500]" />hello@apexcoaching.io</div>
              <div className="flex items-center gap-2 text-white/35 text-sm"><Instagram size={12} className="text-[#FF4500]" />@apexcoachingagency</div>
              <div className="flex items-center gap-2 text-white/35 text-sm"><Clock size={12} className="text-[#FF4500]" />Mon–Fri, 9am–6pm GMT</div>
            </div>
          </div>
        </div>

        <div className="h-px mb-6" style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)" }} />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-white/20 text-xs">© {new Date().getFullYear()} APEX Coaching Agency. All rights reserved.</div>
          <div className="flex items-center gap-5">
            <a href="#" className="text-white/20 hover:text-white/40 text-xs transition-colors">Privacy</a>
            <a href="#" className="text-white/20 hover:text-white/40 text-xs transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <NavBar />
      <Hero />
      <Ticker />
      <Problem />
      <System />
      <Services />
      <Process />
      <Results />
      <Pricing />
      <FAQ />
      <CTABanner />
      <Apply />
      <Footer />
    </div>
  );
}
