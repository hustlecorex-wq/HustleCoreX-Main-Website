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

/* ─── helpers ─────────────────────────────────────── */

function FadeIn({
  children, className = "", delay = 0, once = true,
}: { children: React.ReactNode; className?: string; delay?: number; once?: boolean }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}>
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
    const step = end / (1600 / 16);
    const t = setInterval(() => { c = Math.min(c + step, end); setN(Math.floor(c)); if (c >= end) clearInterval(t); }, 16);
    return () => clearInterval(t);
  }, [inView, end]);
  return <span ref={ref}>{prefix}{n.toLocaleString()}{suffix}</span>;
}

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

/* ─── navbar ─────────────────────────────────────── */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [["system", "System"], ["services", "Services"], ["results", "Results"], ["pricing", "Pricing"]];

  return (
    <header data-testid="navbar"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-white/[0.06] bg-[#0A0A0A]/95 backdrop-blur-md" : ""}`}>
      <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">

        <button onClick={() => scrollTo("hero")} className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-[#FF4500] flex items-center justify-center text-white font-mono font-bold text-[11px] leading-none flex-shrink-0">
            &gt;_
          </div>
          <span className="font-bold text-[15px] text-white tracking-tight">APEX</span>
        </button>

        <nav className="hidden md:flex items-center gap-8">
          {links.map(([id, label]) => (
            <button key={id} data-testid={`nav-${id}`} onClick={() => scrollTo(id)}
              className="text-[13px] text-white/45 hover:text-white/90 transition-colors font-medium tracking-wide">
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button data-testid="nav-cta" onClick={() => scrollTo("apply")}
            className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FF4500] hover:bg-[#FF5500] text-white text-[13px] font-semibold transition-colors">
            Apply Now
          </button>
          <button data-testid="mobile-menu-toggle" onClick={() => setOpen(!open)}
            className="md:hidden text-white/60 hover:text-white p-1">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }}
            className="md:hidden border-t border-white/[0.06] bg-[#0A0A0A] overflow-hidden">
            <div className="max-w-6xl mx-auto px-5 py-4 flex flex-col gap-0">
              {[...links, ["apply", "Apply Now"]].map(([id, label]) => (
                <button key={id} onClick={() => { scrollTo(id); setOpen(false); }}
                  className="text-left py-3.5 text-[15px] text-white/60 hover:text-white border-b border-white/[0.05] last:border-0 transition-colors">
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ─── hero ─────────────────────────────────────── */

function Hero() {
  return (
    <section id="hero" className="min-h-screen flex flex-col justify-center px-5 md:px-8 pt-20 pb-16 md:pt-0">
      <div className="max-w-6xl mx-auto w-full">
        <div className="max-w-3xl">
          <FadeIn>
            <div className="inline-flex items-center gap-2 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4500]" />
              <span className="text-[11px] font-semibold text-white/40 tracking-[0.14em] uppercase">
                The Agency for Online Fitness Coaches
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={0.08}>
            <h1 data-testid="hero-headline"
              className="text-[clamp(2.8rem,7vw,5.5rem)] font-black leading-[1.0] tracking-[-0.02em] text-white mb-7">
              Setting the<br />
              Standard<br />
              <span className="text-orange">for Online Coaches.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.16}>
            <p data-testid="hero-subheadline"
              className="text-[17px] md:text-[19px] text-white/45 leading-relaxed max-w-xl mb-10 font-light">
              We build the complete system — premium brand, elite website, automated lead engine — so the best coaches can do what they do best. Coach.
            </p>
          </FadeIn>

          <FadeIn delay={0.22}>
            <div className="flex flex-col sm:flex-row gap-3 mb-16">
              <button data-testid="hero-cta-primary" onClick={() => scrollTo("apply")}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#FF4500] hover:bg-[#FF5500] text-white text-[14px] font-semibold transition-colors">
                Get a Free Audit <ArrowRight size={16} />
              </button>
              <button data-testid="hero-cta-secondary" onClick={() => scrollTo("system")}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-[14px] font-medium transition-colors">
                See How It Works
              </button>
            </div>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { n: 150, s: "+", label: "Coaches Scaled" },
                { n: 12, p: "$", s: "M+", label: "Revenue Generated" },
                { n: 97, s: "%", label: "Client Retention" },
                { n: 90, s: " Days", label: "Full System Live" },
              ].map((s, i) => (
                <div key={i} data-testid={`hero-stat-${i}`}>
                  <div className="text-[1.75rem] font-black text-white tracking-tight leading-none mb-1">
                    <Counter end={s.n} suffix={s.s} prefix={s.p} />
                  </div>
                  <div className="text-[12px] text-white/35 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ─── divider ─────────────────────────────────────── */

function Divider() {
  return <div className="border-t border-white/[0.06] mx-5 md:mx-8" />;
}

/* ─── problem ─────────────────────────────────────── */

function Problem() {
  const items = [
    { icon: <Target size={16} />, before: "Posting and hoping someone reaches out", after: "Consistent, qualified leads every single day" },
    { icon: <Award size={16} />, before: "Looking like every other coach online", after: "A premium brand that commands premium prices" },
    { icon: <BrainCircuit size={16} />, before: "Manually chasing every lead yourself", after: "Automated sequences that nurture and close for you" },
    { icon: <Globe size={16} />, before: "A basic website that leaks clients", after: "A conversion engine that books calls overnight" },
    { icon: <TrendingUp size={16} />, before: "Stuck at $5–10k/month with no clear path", after: "A repeatable system hitting $30k+ every month" },
    { icon: <Clock size={16} />, before: "Working 10+ hours a day in your business", after: "Working on your business with real leverage" },
  ];

  return (
    <section className="py-24 md:py-32 px-5 md:px-8">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="mb-14">
          <p className="text-[11px] font-semibold text-white/30 tracking-[0.14em] uppercase mb-4">The Problem</p>
          <h2 className="text-[2.25rem] md:text-[3.5rem] font-black text-white leading-[1.05] tracking-tight">
            Great coaches.<br />Broken systems.
          </h2>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06] border border-white/[0.06] rounded-2xl overflow-hidden">
          {items.map((item, i) => (
            <FadeIn key={i} delay={i * 0.05}>
              <div data-testid={`problem-card-${i}`}
                className="bg-[#0A0A0A] p-6 md:p-7 h-full">
                <div className="text-[#FF4500] mb-4 opacity-80">{item.icon}</div>
                <div className="space-y-3">
                  <p className="text-[13px] text-white/25 line-through leading-snug">{item.before}</p>
                  <p className="text-[14px] text-white/80 font-medium leading-snug">{item.after}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── system ─────────────────────────────────────── */

function System() {
  const [active, setActive] = useState(0);

  const pillars = [
    {
      num: "01", label: "Brand",
      title: "Premium Brand Identity",
      body: "Your brand is the first impression every future client gets. We build a complete identity — visuals, voice, and positioning — that makes you the obvious, premium choice.",
      features: ["Logo & Visual Identity", "Brand Voice & Messaging", "Niche Positioning", "Content Pillars", "Authority Architecture"],
      icon: <Sparkles size={18} />,
    },
    {
      num: "02", label: "Website",
      title: "High-Converting Website",
      body: "Not just a pretty site. A sales machine. We design and build a premium website that impresses, qualifies, and converts visitors into booked calls around the clock.",
      features: ["Custom Design", "Conversion Copywriting", "Booking Integration", "Video Sales Letter", "Speed Optimised"],
      icon: <Globe size={18} />,
    },
    {
      num: "03", label: "Leads",
      title: "Lead Generation Engine",
      body: "We build a multi-channel lead machine — organic, outbound, and paid working together — so your pipeline is always full of warm, qualified prospects.",
      features: ["Instagram Overhaul", "Content-to-DM Funnel", "Outreach Scripts", "Paid Ad Strategy", "Lead Magnet"],
      icon: <Target size={18} />,
    },
    {
      num: "04", label: "Automation",
      title: "AutoNation System",
      body: "Every tool in your stack connected and automated. Leads come in, get nurtured, book a call, and onboard — all without you lifting a finger.",
      features: ["CRM Integration", "Email Sequences", "DM Automation", "Lead Scoring", "Onboarding Flow"],
      icon: <BrainCircuit size={18} />,
    },
    {
      num: "05", label: "Analytics",
      title: "Growth Analytics",
      body: "Full visibility into your pipeline. Know where your leads come from, where they drop off, and exactly where to focus your energy to grow faster.",
      features: ["Unified Dashboard", "Revenue Attribution", "Conversion Tracking", "Weekly Reports", "A/B Testing"],
      icon: <BarChart3 size={18} />,
    },
  ];

  return (
    <section id="system" className="py-24 md:py-32 px-5 md:px-8">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="mb-14">
          <p className="text-[11px] font-semibold text-white/30 tracking-[0.14em] uppercase mb-4">The System</p>
          <h2 className="text-[2.25rem] md:text-[3.5rem] font-black text-white leading-[1.05] tracking-tight">
            Five pillars.<br />One system.
          </h2>
        </FadeIn>

        {/* Tab row */}
        <div className="flex overflow-x-auto scrollbar-hide gap-1 mb-6 border-b border-white/[0.07] pb-0">
          {pillars.map((p, i) => (
            <button key={i} data-testid={`system-tab-${i}`} onClick={() => setActive(i)}
              className={`flex-shrink-0 px-4 py-3 text-[13px] font-semibold border-b-2 transition-all duration-200 -mb-px ${
                active === i
                  ? "border-[#FF4500] text-white"
                  : "border-transparent text-white/35 hover:text-white/60"
              }`}>
              <span className="text-[11px] font-mono opacity-40 mr-1.5">{p.num}</span>
              {p.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={active}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="grid md:grid-cols-2 gap-10 md:gap-16 pt-2" data-testid="system-content">
            <div>
              <div className="w-9 h-9 rounded-lg bg-[#FF4500]/10 border border-[#FF4500]/20 flex items-center justify-center text-[#FF4500] mb-5">
                {pillars[active].icon}
              </div>
              <h3 className="text-[1.5rem] font-black text-white mb-3 tracking-tight">{pillars[active].title}</h3>
              <p className="text-[15px] text-white/45 leading-relaxed">{pillars[active].body}</p>
            </div>
            <ul className="space-y-2">
              {pillars[active].features.map((f, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 py-3 border-b border-white/[0.05] last:border-0">
                  <CheckCircle2 size={14} className="text-[#FF4500] flex-shrink-0" />
                  <span className="text-[14px] text-white/70">{f}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ─── services ─────────────────────────────────────── */

function Services() {
  const list = [
    { icon: <Sparkles size={18} />, title: "Brand Identity", desc: "Complete visual system, messaging framework, and positioning strategy." },
    { icon: <Globe size={18} />, title: "Website Build", desc: "Custom-designed, conversion-optimised site with integrated booking." },
    { icon: <Target size={18} />, title: "Lead Generation", desc: "Multi-channel pipeline combining organic, outbound, and paid." },
    { icon: <BrainCircuit size={18} />, title: "AutoNation", desc: "Every tool connected. DMs, emails, follow-ups all automated." },
    { icon: <Instagram size={18} />, title: "Social Profiles", desc: "Instagram transformed into a consistent lead-generating asset." },
    { icon: <BarChart3 size={18} />, title: "Analytics", desc: "Full pipeline visibility so you always know where to double down." },
  ];

  return (
    <section id="services" className="py-24 md:py-32 px-5 md:px-8">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="mb-14">
          <p className="text-[11px] font-semibold text-white/30 tracking-[0.14em] uppercase mb-4">Services</p>
          <h2 className="text-[2.25rem] md:text-[3.5rem] font-black text-white leading-[1.05] tracking-tight">
            Everything you need.<br />Nothing you don't.
          </h2>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06] border border-white/[0.06] rounded-2xl overflow-hidden">
          {list.map((s, i) => (
            <FadeIn key={i} delay={i * 0.05}>
              <div data-testid={`service-card-${i}`}
                className="group bg-[#0A0A0A] hover:bg-[#0F0F0F] p-6 md:p-7 h-full transition-colors duration-200">
                <div className="text-[#FF4500] opacity-70 group-hover:opacity-100 mb-4 transition-opacity">{s.icon}</div>
                <h3 className="text-[15px] font-bold text-white mb-2">{s.title}</h3>
                <p className="text-[13px] text-white/35 leading-relaxed">{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── process ─────────────────────────────────────── */

function Process() {
  const steps = [
    { num: "01", title: "Free Audit", desc: "We analyse your current setup and map exactly what it'll take to hit your goals.", icon: <BrainCircuit size={16} /> },
    { num: "02", title: "Strategy Blueprint", desc: "Custom growth plan — brand positioning, channels, automation, 90-day revenue roadmap.", icon: <Layers size={16} /> },
    { num: "03", title: "Brand & Website", desc: "Full identity and premium website built. You look like a $100k/year coach from day one.", icon: <Globe size={16} /> },
    { num: "04", title: "System Activation", desc: "Lead gen engine launches. AutoNation goes live. Leads start flowing automatically.", icon: <Zap size={16} /> },
    { num: "05", title: "Scale & Optimise", desc: "Real data, real decisions. We compound what works and cut what doesn't.", icon: <TrendingUp size={16} /> },
  ];

  return (
    <section className="py-24 md:py-32 px-5 md:px-8">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="mb-14">
          <p className="text-[11px] font-semibold text-white/30 tracking-[0.14em] uppercase mb-4">The Process</p>
          <h2 className="text-[2.25rem] md:text-[3.5rem] font-black text-white leading-[1.05] tracking-tight">
            Zero to system<br />in 90 days.
          </h2>
        </FadeIn>

        <div className="space-y-0 border border-white/[0.06] rounded-2xl overflow-hidden divide-y divide-white/[0.06]">
          {steps.map((s, i) => (
            <FadeIn key={i} delay={i * 0.06}>
              <div data-testid={`process-step-${i}`}
                className="flex items-start gap-5 md:gap-8 p-5 md:p-7 bg-[#0A0A0A] hover:bg-[#0F0F0F] transition-colors duration-200">
                <div className="flex-shrink-0 pt-0.5">
                  <span className="text-[11px] font-mono text-white/20 font-semibold">{s.num}</span>
                </div>
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#FF4500]/8 border border-[#FF4500]/15 flex items-center justify-center text-[#FF4500] mt-0.5">
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-bold text-white mb-1">{s.title}</h3>
                  <p className="text-[13px] text-white/40 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── results ─────────────────────────────────────── */

function Results() {
  const cards = [
    { name: "James C.", role: "Fat Loss Coach", av: "JC", before: "$4.2k", after: "$31.5k", time: "4 months", quote: "APEX built me a real business. My system runs 24/7 and I've broken through $30k consistently." },
    { name: "Sarah M.", role: "PT & Nutrition", av: "SM", before: "$7.8k", after: "$52k", time: "6 months", quote: "I used to post and pray. Now I have a machine booking 3–5 calls per day without me touching anything." },
    { name: "Marcus R.", role: "Strength Coach", av: "MR", before: "$2.9k", after: "$18.4k", time: "3 months", quote: "The brand overhaul alone was worth 10x the investment. People say they've been watching me for months." },
    { name: "Priya S.", role: "Female Transformation", av: "PS", before: "$8.5k", after: "$67k", time: "5 months", quote: "From burnout to a business I'm proud of. APEX handles the heavy lifting — I just coach." },
  ];

  return (
    <section id="results" className="py-24 md:py-32 px-5 md:px-8">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="mb-14">
          <p className="text-[11px] font-semibold text-white/30 tracking-[0.14em] uppercase mb-4">Results</p>
          <h2 className="text-[2.25rem] md:text-[3.5rem] font-black text-white leading-[1.05] tracking-tight">
            Real coaches.<br />Real numbers.
          </h2>
        </FadeIn>

        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {cards.map((r, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div data-testid={`result-card-${i}`}
                className="border border-white/[0.07] rounded-2xl p-6 bg-[#0A0A0A] h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-[#FF4500] flex items-center justify-center text-white text-[11px] font-black flex-shrink-0">
                    {r.av}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-white leading-tight">{r.name}</p>
                    <p className="text-[12px] text-white/35">{r.role}</p>
                  </div>
                </div>

                <p className="text-[14px] text-white/50 leading-relaxed mb-5 italic">"{r.quote}"</p>

                <div className="flex items-center gap-3">
                  <div className="flex-1 rounded-xl p-3 border border-white/[0.06] bg-white/[0.02] text-center">
                    <p className="text-[10px] text-white/25 mb-0.5 uppercase tracking-wide">Before</p>
                    <p className="text-[14px] font-bold text-white">{r.before}<span className="text-[11px] text-white/30">/mo</span></p>
                  </div>
                  <ArrowRight size={13} className="text-white/20 flex-shrink-0" />
                  <div className="flex-1 rounded-xl p-3 border border-[#FF4500]/20 bg-[#FF4500]/5 text-center">
                    <p className="text-[10px] text-white/25 mb-0.5 uppercase tracking-wide">After</p>
                    <p className="text-[14px] font-bold text-[#FF4500]">{r.after}<span className="text-[11px] text-[#FF4500]/50">/mo</span></p>
                  </div>
                  <p className="text-[11px] text-white/20 flex-shrink-0 pl-1">{r.time}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.06] border border-white/[0.06] rounded-2xl overflow-hidden">
            {[
              { n: 150, s: "+", label: "Coaches Scaled" },
              { n: 12, p: "$", s: "M+", label: "Revenue Generated" },
              { n: 90, s: "%", label: "Hit $20k in 6 Months" },
              { n: 4, s: ".9/5", label: "Average Rating" },
            ].map((s, i) => (
              <div key={i} data-testid={`results-stat-${i}`} className="bg-[#0A0A0A] p-6 md:p-7 text-center">
                <p className="text-[1.75rem] md:text-[2.25rem] font-black text-white tracking-tight leading-none mb-1">
                  <Counter end={s.n} suffix={s.s} prefix={s.p} />
                </p>
                <p className="text-[12px] text-white/30">{s.label}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── pricing ─────────────────────────────────────── */

function Pricing() {
  const plans = [
    {
      name: "Launchpad",
      price: "2,497", note: "one-time",
      desc: "For coaches under $5k/month who need solid foundations.",
      features: ["Brand Identity", "Instagram Overhaul", "Lead Gen Strategy", "30-Day Content Framework", "DM Script Library"],
      missing: ["Website Build", "AutoNation Setup"],
      highlight: false, badge: "",
    },
    {
      name: "Growth System",
      price: "4,997", note: "one-time",
      desc: "The complete system for coaches ready to break $20k/month.",
      features: ["Everything in Launchpad", "Premium Website Build", "AutoNation Integration", "Email & DM Automation", "Analytics Dashboard", "3-Month Strategy Support"],
      missing: [],
      highlight: true, badge: "Most Popular",
    },
    {
      name: "Empire",
      price: "Custom", note: "bespoke",
      desc: "For coaches at $20k+ scaling to $100k/month.",
      features: ["Everything in Growth", "Full Ad Management", "Dedicated Strategist", "PR & Authority", "Team Building"],
      missing: [],
      highlight: false, badge: "For 6-Figure Coaches",
    },
  ];

  return (
    <section id="pricing" className="py-24 md:py-32 px-5 md:px-8">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="mb-14">
          <p className="text-[11px] font-semibold text-white/30 tracking-[0.14em] uppercase mb-4">Pricing</p>
          <h2 className="text-[2.25rem] md:text-[3.5rem] font-black text-white leading-[1.05] tracking-tight">
            Simple. Transparent.<br />No retainers.
          </h2>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-4 mb-5">
          {plans.map((p, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div data-testid={`pricing-card-${i}`}
                className={`rounded-2xl p-6 flex flex-col h-full ${
                  p.highlight
                    ? "border border-[#FF4500]/30 bg-[#FF4500]/[0.04]"
                    : "border border-white/[0.07] bg-[#0A0A0A]"
                }`}>
                {p.badge && (
                  <span className={`inline-block self-start text-[11px] font-bold px-2.5 py-1 rounded-full mb-4 ${
                    p.highlight ? "bg-[#FF4500] text-white" : "bg-white/[0.06] text-white/40 border border-white/[0.08]"
                  }`}>{p.badge}</span>
                )}
                <div className="mb-6">
                  <p className="text-[14px] font-bold text-white mb-2">{p.name}</p>
                  <div className="flex items-baseline gap-1 mb-2">
                    {p.price !== "Custom" && <span className="text-white/30 text-base">$</span>}
                    <span className={`font-black text-[2.5rem] leading-none tracking-tight ${p.highlight ? "text-[#FF4500]" : "text-white"}`}>
                      {p.price}
                    </span>
                    <span className="text-white/25 text-[13px] ml-1">/ {p.note}</span>
                  </div>
                  <p className="text-[13px] text-white/40">{p.desc}</p>
                </div>
                <ul className="flex-1 space-y-2.5 mb-7">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2.5">
                      <CheckCircle2 size={13} className={p.highlight ? "text-[#FF4500]" : "text-white/30"} />
                      <span className="text-[13px] text-white/65">{f}</span>
                    </li>
                  ))}
                  {p.missing.map((f, j) => (
                    <li key={j} className="flex items-center gap-2.5 opacity-25">
                      <X size={13} className="text-white/20" />
                      <span className="text-[13px] text-white/30 line-through">{f}</span>
                    </li>
                  ))}
                </ul>
                <button data-testid={`pricing-cta-${i}`} onClick={() => scrollTo("apply")}
                  className={`w-full py-3 rounded-xl text-[13px] font-semibold transition-colors ${
                    p.highlight
                      ? "bg-[#FF4500] hover:bg-[#FF5500] text-white"
                      : "border border-white/10 text-white/60 hover:border-white/20 hover:text-white"
                  }`}>
                  {p.name === "Empire" ? "Book a Call" : "Get Started"}
                </button>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn>
          <div className="flex items-center justify-center gap-2 text-[13px] text-white/25 py-3">
            <Shield size={13} className="text-[#FF4500]/60" />
            30-day results guarantee on all packages.
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── faq ─────────────────────────────────────── */

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: "How quickly will I see results?", a: "Most clients see their first inbound leads within 2–3 weeks of activation. Full results — consistent $20k+ months — typically arrive by month 3 to 5." },
    { q: "Do I need a big following?", a: "No. We've built systems for coaches starting from zero. The system works on quality targeting, not follower count. Some of our best results came from coaches with under 1,000 followers." },
    { q: "What is AutoNation?", a: "AutoNation is the automation platform we use to connect every tool in your stack — CRM, email, DMs, booking, and onboarding — into one seamless flow that runs 24/7." },
    { q: "How is this different from a social media manager?", a: "A social media manager posts content. We build a complete business system — brand, website, lead gen, automation, and analytics. It's the difference between one employee and a full machine." },
    { q: "Is there ongoing support?", a: "Yes. All packages include setup support. Growth System includes 3 months of strategy support. Empire includes a dedicated strategist and priority access." },
  ];

  return (
    <section className="py-24 md:py-32 px-5 md:px-8">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="mb-14">
          <p className="text-[11px] font-semibold text-white/30 tracking-[0.14em] uppercase mb-4">FAQ</p>
          <h2 className="text-[2.25rem] md:text-[3.5rem] font-black text-white leading-[1.05] tracking-tight">
            Common questions.
          </h2>
        </FadeIn>

        <div className="border border-white/[0.06] rounded-2xl overflow-hidden divide-y divide-white/[0.06]">
          {faqs.map((f, i) => (
            <FadeIn key={i}>
              <div data-testid={`faq-item-${i}`}>
                <button data-testid={`faq-toggle-${i}`} onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 bg-[#0A0A0A] hover:bg-[#0F0F0F] transition-colors text-left">
                  <span className="text-[14px] md:text-[15px] font-semibold text-white/80">{f.q}</span>
                  <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.18 }} className="flex-shrink-0">
                    <ChevronDown size={15} className={open === i ? "text-[#FF4500]" : "text-white/20"} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
                      className="overflow-hidden bg-[#0A0A0A]">
                      <p className="px-6 pb-5 text-[13px] text-white/40 leading-relaxed">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── apply ─────────────────────────────────────── */

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
    mutationFn: (data: InsertLead) => apiRequest("POST", "/api/leads", data),
    onSuccess: () => { setDone(true); toast({ title: "Application received", description: "We'll be in touch within 24 hours." }); },
    onError: () => toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" }),
  });

  const field = "w-full px-4 py-3 rounded-xl bg-[#111] border border-white/[0.08] text-[14px] text-white placeholder-white/20 focus:outline-none focus:border-[#FF4500]/40 transition-colors";
  const label = "block text-[11px] font-semibold text-white/35 tracking-widest uppercase mb-2";

  return (
    <section id="apply" className="py-24 md:py-32 px-5 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-start">
          {/* Left */}
          <FadeIn>
            <p className="text-[11px] font-semibold text-white/30 tracking-[0.14em] uppercase mb-4">Apply</p>
            <h2 className="text-[2.25rem] md:text-[3.5rem] font-black text-white leading-[1.05] tracking-tight mb-6">
              Ready to build<br />
              <span className="text-orange">your system?</span>
            </h2>
            <p className="text-[15px] text-white/40 leading-relaxed mb-10">
              Fill in the form and we'll audit your current setup — completely free. We'll show you exactly what's holding you back and what the path forward looks like. No pressure.
            </p>

            <ul className="space-y-4 mb-10">
              {[
                { icon: <Clock size={14} />, text: "Reply within 24 hours" },
                { icon: <Shield size={14} />, text: "No hard sell — we only work with the right fit" },
                { icon: <Star size={14} />, text: "Free system audit with every application" },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-[14px] text-white/40">
                  <span className="text-[#FF4500] opacity-70">{item.icon}</span>
                  {item.text}
                </li>
              ))}
            </ul>

            <div className="border border-white/[0.07] rounded-2xl p-5 bg-[#0A0A0A]">
              <div className="flex -space-x-2 mb-3">
                {["JC", "SM", "MR", "PS", "TK"].map((av, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-[#FF4500] border-2 border-[#0A0A0A] flex items-center justify-center text-white text-[10px] font-black">
                    {av}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full bg-white/[0.06] border-2 border-[#0A0A0A] flex items-center justify-center text-white/40 text-[10px] font-bold">
                  +145
                </div>
              </div>
              <div className="flex gap-0.5 mb-2">
                {[...Array(5)].map((_, i) => <Star key={i} size={11} className="text-[#FF4500] fill-[#FF4500]" />)}
                <span className="text-[11px] text-white/25 ml-2 self-center">4.9 from 140+ coaches</span>
              </div>
              <p className="text-[12px] text-white/30 italic">"The best investment I've made in my coaching business." — Sarah M.</p>
            </div>
          </FadeIn>

          {/* Right */}
          <FadeIn delay={0.12}>
            {done ? (
              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                className="border border-white/[0.07] rounded-2xl p-8 text-center bg-[#0A0A0A]" data-testid="apply-success">
                <div className="w-14 h-14 rounded-2xl bg-[#FF4500] flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 size={24} className="text-white" />
                </div>
                <h3 className="text-[1.25rem] font-black text-white mb-2">Application Received</h3>
                <p className="text-[14px] text-white/40 leading-relaxed">
                  We'll review your setup and be in touch within 24 hours with your free audit.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={form.handleSubmit(d => mut.mutate(d))}
                className="border border-white/[0.07] rounded-2xl p-6 md:p-7 bg-[#0A0A0A] space-y-5" data-testid="apply-form">
                <h3 className="text-[16px] font-bold text-white">Free System Audit</h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={label}>Name</label>
                    <input {...form.register("name")} data-testid="input-name" placeholder="Your name" className={field} />
                    {form.formState.errors.name && <p className="text-red-400/80 text-[11px] mt-1.5">{form.formState.errors.name.message}</p>}
                  </div>
                  <div>
                    <label className={label}>Email</label>
                    <input {...form.register("email")} data-testid="input-email" type="email" placeholder="you@email.com" className={field} />
                    {form.formState.errors.email && <p className="text-red-400/80 text-[11px] mt-1.5">{form.formState.errors.email.message}</p>}
                  </div>
                </div>

                <div>
                  <label className={label}>Instagram</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-[14px] pointer-events-none">@</span>
                    <input {...form.register("instagram")} data-testid="input-instagram" placeholder="yourhandle" className={field + " pl-8"} />
                  </div>
                </div>

                <div>
                  <label className={label}>Monthly Revenue</label>
                  <select {...form.register("currentRevenue")} data-testid="select-revenue"
                    className={field + " appearance-none cursor-pointer"}>
                    <option value="">Select range...</option>
                    <option value="0-2k">$0 – $2,000</option>
                    <option value="2k-5k">$2,000 – $5,000</option>
                    <option value="5k-10k">$5,000 – $10,000</option>
                    <option value="10k-20k">$10,000 – $20,000</option>
                    <option value="20k+">$20,000+</option>
                  </select>
                  {form.formState.errors.currentRevenue && <p className="text-red-400/80 text-[11px] mt-1.5">{form.formState.errors.currentRevenue.message}</p>}
                </div>

                <div>
                  <label className={label}>6-Month Goal</label>
                  <select {...form.register("goal")} data-testid="select-goal"
                    className={field + " appearance-none cursor-pointer"}>
                    <option value="">Select goal...</option>
                    <option value="10k">$10,000 / month</option>
                    <option value="20k">$20,000 / month</option>
                    <option value="50k">$50,000 / month</option>
                    <option value="100k+">$100,000+ / month</option>
                  </select>
                  {form.formState.errors.goal && <p className="text-red-400/80 text-[11px] mt-1.5">{form.formState.errors.goal.message}</p>}
                </div>

                <div>
                  <label className={label}>Biggest Challenge <span className="text-white/15 normal-case tracking-normal font-normal">(optional)</span></label>
                  <textarea {...form.register("message")} data-testid="input-message"
                    placeholder="What's holding you back right now?" rows={3}
                    className={field + " resize-none"} />
                </div>

                <button type="submit" data-testid="button-submit" disabled={mut.isPending}
                  className="w-full py-3.5 rounded-xl bg-[#FF4500] hover:bg-[#FF5500] text-white text-[14px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {mut.isPending ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                      Submitting...
                    </>
                  ) : "Submit Application"}
                </button>

                <p className="text-[11px] text-white/20 text-center">No spam. No hard sell. Just strategy.</p>
              </form>
            )}
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ─── cta strip ─────────────────────────────────────── */

function CTAStrip() {
  return (
    <section className="px-5 md:px-8 py-6">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <div className="border border-white/[0.07] rounded-2xl px-7 py-8 md:py-10 md:px-12 bg-[#0A0A0A] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="text-[11px] font-semibold text-white/25 tracking-[0.14em] uppercase mb-2">Limited to 5 clients per month</p>
              <h2 className="text-[1.5rem] md:text-[2rem] font-black text-white tracking-tight leading-tight">
                Your competition isn't waiting.
              </h2>
            </div>
            <button data-testid="cta-banner-button" onClick={() => scrollTo("apply")}
              className="flex-shrink-0 flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#FF4500] hover:bg-[#FF5500] text-white text-[14px] font-semibold transition-colors">
              Get a Free Audit <ArrowRight size={16} />
            </button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── footer ─────────────────────────────────────── */

function Footer() {
  return (
    <footer className="px-5 md:px-8 pt-14 pb-8 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#FF4500] flex items-center justify-center text-white font-mono font-bold text-[11px]">
                &gt;_
              </div>
              <span className="font-bold text-white text-[15px]">APEX</span>
            </div>
            <p className="text-[13px] text-white/30 leading-relaxed max-w-[260px]">
              Setting the standard for online fitness coaches.
            </p>
            <div className="flex gap-3 mt-5">
              {[
                { icon: <Instagram size={14} />, label: "footer-instagram" },
                { icon: <Mail size={14} />, label: "footer-mail" },
              ].map(item => (
                <a key={item.label} href="#" data-testid={item.label}
                  className="w-8 h-8 rounded-lg border border-white/[0.08] flex items-center justify-center text-white/30 hover:text-white/60 hover:border-white/15 transition-colors">
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-white/25 tracking-[0.14em] uppercase mb-4">Navigation</p>
            <div className="space-y-2.5">
              {[["system","System"],["services","Services"],["results","Results"],["pricing","Pricing"],["apply","Apply"]].map(([id,label]) => (
                <button key={id} onClick={() => scrollTo(id)}
                  className="block text-[13px] text-white/30 hover:text-white/60 transition-colors">
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-white/25 tracking-[0.14em] uppercase mb-4">Contact</p>
            <div className="space-y-2.5">
              {[
                { icon: <Mail size={12} />, text: "hello@apexcoaching.io" },
                { icon: <Instagram size={12} />, text: "@apexcoachingagency" },
                { icon: <Clock size={12} />, text: "Mon–Fri, 9am–6pm GMT" },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-[13px] text-white/25">
                  <span className="text-[#FF4500]/50">{c.icon}</span>
                  {c.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.05] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-white/20">© {new Date().getFullYear()} APEX Coaching Agency.</p>
          <div className="flex gap-5">
            <a href="#" className="text-[12px] text-white/20 hover:text-white/40 transition-colors">Privacy</a>
            <a href="#" className="text-[12px] text-white/20 hover:text-white/40 transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── page ─────────────────────────────────────── */

export default function Home() {
  return (
    <div className="min-h-screen bg-[#080808] text-foreground overflow-x-hidden">
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
