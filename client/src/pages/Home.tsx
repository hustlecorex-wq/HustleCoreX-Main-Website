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
  TrendingUp, Award, ArrowUpRight,
} from "lucide-react";

import heroCoachImg from "@assets/generated_images/hero_coach.png";
import coach1Img from "@assets/stock_images/coach_james.jpg";
import coach2Img from "@assets/stock_images/coach_sarah.jpg";
import coach3Img from "@assets/stock_images/coach_marcus.jpg";
import coach4Img from "@assets/stock_images/coach_priya.jpg";

/* ─────────────────────────── helpers ─────────────────────────── */

function FadeIn({ children, className = "", delay = 0 }: {
  children: React.ReactNode; className?: string; delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}>
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
    const step = end / (1200 / 16);
    const t = setInterval(() => { c = Math.min(c + step, end); setN(Math.floor(c)); if (c >= end) clearInterval(t); }, 16);
    return () => clearInterval(t);
  }, [inView, end]);
  return <span ref={ref}>{prefix}{n.toLocaleString()}{suffix}</span>;
}

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-[#FF4500] flex items-center justify-center font-mono font-black text-white text-[9px] leading-none flex-shrink-0 tracking-tight">
        HCX
      </div>
      <span className="font-black text-white text-[15px] tracking-[-0.02em]">HustleCoreX</span>
    </div>
  );
}

/* ─────────────────────────── site header (announcement + nav) ─────────────────────────── */
function SiteHeader() {
  const [barVis, setBarVis] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links: [string, string][] = [["system","System"],["services","Services"],["results","Results"],["pricing","Pricing"]];

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      {/* announcement bar */}
      <AnimatePresence>
        {barVis && (
          <motion.div initial={{ height: "auto" }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden">
            <div className="relative bg-[#0E0E0E] border-b border-white/[0.06] px-4 py-2.5 flex items-center justify-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4500] animate-pulse flex-shrink-0" />
              <p className="text-[12px] text-white/50 text-center">
                Now accepting Q2 2026 clients —{" "}
                <button onClick={() => scrollTo("apply")} className="text-white/75 underline underline-offset-2 hover:text-white transition-colors">
                  3 spots remaining
                </button>
              </p>
              <button onClick={() => setBarVis(false)} className="absolute right-4 text-white/20 hover:text-white/45 transition-colors">
                <X size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* nav */}
      <nav data-testid="navbar"
        className={`transition-all duration-300 ${
          scrolled ? "bg-[#070707]/96 backdrop-blur-xl border-b border-white/[0.06]" : "bg-[#070707]/70 backdrop-blur-sm"
        }`}>
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-[58px] flex items-center justify-between">
          <button onClick={() => scrollTo("hero")} className="active:opacity-70 transition-opacity">
            <Logo />
          </button>

          <div className="hidden md:flex items-center gap-8">
            {links.map(([id, label]) => (
              <button key={id} data-testid={`nav-${id}`} onClick={() => scrollTo(id)}
                className="text-[13px] font-medium text-white/38 hover:text-white/75 transition-colors">
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button data-testid="nav-cta" onClick={() => scrollTo("apply")}
              className="hidden md:flex items-center gap-1.5 h-[34px] px-4 rounded-xl bg-white text-[#070707] text-[13px] font-bold hover:bg-white/90 active:scale-[0.97] transition-all">
              Apply Now
            </button>
            <button data-testid="mobile-menu-toggle" onClick={() => setOpen(!open)}
              className="md:hidden w-10 h-10 flex items-center justify-center text-white/45 hover:text-white active:opacity-60 transition-colors">
              {open ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}
              className="md:hidden border-t border-white/[0.06] bg-[#070707]">
              <div className="max-w-6xl mx-auto px-5 pb-4">
                {[...links, ["apply","Apply Now"] as [string,string]].map(([id, label]) => (
                  <button key={id} data-testid={`mobile-nav-${id}`} onClick={() => { scrollTo(id); setOpen(false); }}
                    className="flex w-full items-center justify-between py-3.5 text-[15px] font-semibold text-white/55 hover:text-white border-b border-white/[0.05] last:border-0 transition-colors active:opacity-60">
                    {label}
                    <ArrowRight size={13} className="text-white/20" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}

/* ─────────────────────────── hero ─────────────────────────── */
function Hero() {
  return (
    <section id="hero" className="min-h-[100svh] flex flex-col lg:flex-row items-stretch pt-[97px] overflow-hidden">

      {/* ── Left: text panel ── */}
      <div className="flex-1 flex items-center px-5 md:px-10 lg:px-14 xl:px-20 py-14 lg:py-0 z-10">
        <div className="max-w-[560px]">

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="flex items-center gap-2.5 mb-8">
            <div className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4500]" />
              <span className="eyebrow !text-white/45 !mb-0">The Standard for Online Coaches</span>
            </div>
          </motion.div>

          <motion.h1 data-testid="hero-headline"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08 }}
            className="display text-[clamp(3rem,6.5vw,6rem)] text-white mb-6">
            The System Behind<br />
            <span className="text-brand">6-Figure</span><br />
            Coaches.
          </motion.h1>

          <motion.p data-testid="hero-subheadline"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.16 }}
            className="text-[16px] md:text-[17px] text-white/40 leading-[1.7] max-w-[440px] mb-9 font-light">
            We build premium brands, elite websites, and automated lead engines for the world's top online fitness coaches — all connected into one scalable system.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.24 }}
            className="flex flex-col sm:flex-row gap-3 mb-12">
            <button data-testid="hero-cta-primary" onClick={() => scrollTo("apply")}
              className="flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[#FF4500] hover:bg-[#FF5500] active:scale-[0.97] text-white text-[14px] font-bold transition-all shadow-[0_0_32px_rgba(255,69,0,0.22)]">
              Get a Free Audit <ArrowRight size={15} />
            </button>
            <button data-testid="hero-cta-secondary" onClick={() => scrollTo("results")}
              className="flex items-center justify-center gap-2 h-12 px-6 rounded-xl border border-white/[0.09] text-white/50 hover:text-white/80 hover:border-white/16 active:scale-[0.97] text-[14px] font-medium transition-all">
              See Client Results
            </button>
          </motion.div>

          {/* social proof */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.35 }}
            className="flex items-center gap-4 pt-6 border-t border-white/[0.06]">
            <div className="flex -space-x-2">
              {[coach1Img, coach2Img, coach3Img, coach4Img].map((src, i) => (
                <img key={i} src={src} alt="coach"
                  className="w-8 h-8 rounded-full object-cover border-2 border-[#070707]" />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={10} className="text-[#FF4500] fill-[#FF4500]" />)}
                <span className="text-[11px] text-white/25 ml-1.5 font-mono">4.9</span>
              </div>
              <p className="text-[11px] text-white/28">Trusted by 150+ coaches worldwide</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Right: photo panel ── */}
      <div className="w-full h-[55vw] max-h-[520px] lg:h-auto lg:max-h-none lg:w-[42%] xl:w-[40%] relative flex-shrink-0">
        <img src={heroCoachImg} alt="Professional fitness coach" data-testid="hero-image"
          className="absolute inset-0 w-full h-full object-cover object-center" />
        {/* gradient blends: left edge into dark bg */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070707] via-[#070707]/20 to-transparent" />
        {/* bottom gradient for mobile */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#070707] to-transparent lg:hidden" />
        {/* subtle overlay for the right edges on desktop */}
        <div className="hidden lg:block absolute inset-0 bg-gradient-to-b from-[#070707]/60 via-transparent to-[#070707]/60" />

        {/* Stats floating card — bottom left of image */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
          className="hidden lg:block absolute bottom-10 left-[-1px] bg-[#0C0C0C]/90 backdrop-blur-sm border border-white/[0.08] rounded-2xl p-4 z-10">
          <div className="grid grid-cols-2 gap-4">
            {[
              { n: 150, s: "+", label: "Coaches" },
              { n: 12, p: "$", s: "M+", label: "Revenue" },
              { n: 97, s: "%", label: "Retention" },
              { n: 90, s: " days", label: "To Live" },
            ].map((s, i) => (
              <div key={i} data-testid={`hero-stat-${i}`} className="text-center">
                <p className="text-[1.1rem] font-black text-white leading-none tracking-tight mb-0.5">
                  <Counter end={s.n} suffix={s.s} prefix={s.p} />
                </p>
                <p className="text-[10px] text-white/28">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* mobile stats row */}
      <div className="lg:hidden grid grid-cols-4 border-t border-white/[0.06] bg-[#0A0A0A]">
        {[
          { n: 150, s: "+", label: "Coaches" },
          { n: 12, p: "$", s: "M+", label: "Revenue" },
          { n: 97, s: "%", label: "Retention" },
          { n: 90, s: " days", label: "To Live" },
        ].map((s, i) => (
          <div key={i} data-testid={`hero-stat-mob-${i}`}
            className={`py-4 text-center ${i < 3 ? "border-r border-white/[0.06]" : ""}`}>
            <p className="text-[1.1rem] font-black text-white leading-none tracking-tight mb-0.5">
              <Counter end={s.n} suffix={s.s} prefix={s.p} />
            </p>
            <p className="text-[9px] text-white/28 uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────── ticker ─────────────────────────── */
function Ticker() {
  const items = [
    "James C. scaled to $31.5k/month in 4 months",
    "Sarah M. went from $7.8k to $52k/month",
    "Marcus R. tripled revenue in 90 days",
    "Priya S. hit $67k/month in 5 months",
    "Tom K. booked 5+ calls daily on autopilot",
    "Rachel L. built a $40k/month machine while on holiday",
    "Daniel W. went from 3 clients to 47 in 6 months",
    "Aisha M. launched and hit $25k in her first 90 days",
  ];
  const doubled = [...items, ...items];

  return (
    <div className="ticker-wrap relative overflow-hidden border-y border-white/[0.06] bg-[#0A0A0A] py-3.5">
      <div className="flex animate-ticker gap-0 whitespace-nowrap">
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-5 flex-shrink-0">
            <span className="text-[12px] md:text-[13px] text-white/38 font-medium px-2">{item}</span>
            <span className="text-[#FF4500]/35 flex-shrink-0">◆</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── problem ─────────────────────────── */
function Problem() {
  const items = [
    { icon: <Target size={14} />, before: "Posting content, praying someone DMs", after: "Qualified leads arriving on autopilot, every day" },
    { icon: <Award size={14} />, before: "Blending in with every other coach online", after: "A premium brand that commands premium prices" },
    { icon: <BrainCircuit size={14} />, before: "Manually chasing every prospect yourself", after: "Automated sequences that nurture and close for you" },
    { icon: <Globe size={14} />, before: "A basic website that loses you clients", after: "A conversion engine booking calls 24/7" },
    { icon: <TrendingUp size={14} />, before: "Stuck at $5–10k/month with no clear path up", after: "A repeatable system clearing $30k+ every month" },
    { icon: <Clock size={14} />, before: "Working inside your business 10+ hours a day", after: "Leverage — your business runs while you sleep" },
  ];

  return (
    <section className="px-5 md:px-8 py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[300px_1fr] gap-10 md:gap-16 items-start">

          <FadeIn>
            <p className="eyebrow mb-5">The Problem</p>
            <h2 className="display text-[clamp(2.2rem,4.5vw,3.5rem)] text-white mb-5">
              You're working hard<br />in the wrong places.
            </h2>
            <p className="text-[14px] text-white/35 leading-relaxed">
              Most coaches are one system away from doubling their income. The problem isn't your coaching — it's your business infrastructure.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 gap-0 border border-white/[0.07] rounded-2xl overflow-hidden divide-y divide-white/[0.07]">
            {items.map((item, i) => (
              <FadeIn key={i} delay={i * 0.04}>
                <div data-testid={`problem-card-${i}`}
                  className={`card-hover bg-[#0C0C0C] p-5 md:p-6 h-full ${
                    i % 2 === 0 ? "sm:border-r border-white/[0.07]" : ""
                  }`}>
                  <span className="text-[#FF4500]/50 block mb-3.5">{item.icon}</span>
                  <p className="text-[12px] text-white/20 line-through leading-snug mb-2">{item.before}</p>
                  <p className="text-[13px] md:text-[14px] text-white/80 font-semibold leading-snug">{item.after}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── system ─────────────────────────── */
function System() {
  const [active, setActive] = useState(0);
  const pillars = [
    { num: "01", tab: "Brand", title: "Premium Brand Identity", icon: <Sparkles size={16} />,
      body: "Your brand is the very first impression every future client gets. We build a complete identity — visuals, voice, and positioning — that makes you the obvious premium choice.",
      features: ["Logo & Visual Identity","Brand Voice & Messaging","Niche Positioning","Content Pillars","Authority Architecture"] },
    { num: "02", tab: "Website", title: "High-Converting Website", icon: <Globe size={16} />,
      body: "Not just a beautiful site — a sales machine. We design and build a premium website that impresses, qualifies, and converts visitors into booked calls, around the clock.",
      features: ["Custom Premium Design","Conversion Copywriting","Automated Booking","Video Sales Letter","Mobile Optimised"] },
    { num: "03", tab: "Leads", title: "Lead Generation Engine", icon: <Target size={16} />,
      body: "A multi-channel lead machine — organic, outbound, and paid — working together so your pipeline is always full of warm, qualified prospects ready to invest.",
      features: ["Instagram Overhaul","Content-to-DM Funnel","Strategic Outreach","Paid Ad Strategy","Lead Magnet Creation"] },
    { num: "04", tab: "AutoNation", title: "AutoNation Automation", icon: <BrainCircuit size={16} />,
      body: "Every tool in your stack connected and intelligent. Leads arrive, get nurtured, book a call, and onboard — all without you lifting a finger.",
      features: ["Full CRM Integration","Email Automation","DM Auto-Responses","Lead Scoring","Onboarding Flow"] },
    { num: "05", tab: "Analytics", title: "Growth Analytics", icon: <BarChart3 size={16} />,
      body: "Full visibility into your pipeline. Know exactly where your leads come from, where they drop off, and where to invest your energy to accelerate growth.",
      features: ["Unified Dashboard","Revenue Attribution","Conversion Tracking","Weekly Reports","Continuous Optimisation"] },
  ];

  return (
    <section id="system" className="px-5 md:px-8 py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[300px_1fr] gap-10 md:gap-16 items-start">

          <FadeIn>
            <p className="eyebrow mb-5">The System</p>
            <h2 className="display text-[clamp(2.2rem,4.5vw,3.5rem)] text-white mb-5">
              Five pillars.<br />One system.
            </h2>
            <p className="text-[14px] text-white/35 leading-relaxed">
              Everything built to work together — not five tools duct-taped, but one end-to-end machine.
            </p>
          </FadeIn>

          <div>
            {/* tabs */}
            <div className="flex overflow-x-auto scrollbar-hide border-b border-white/[0.07] mb-8 -mx-5 px-5 md:mx-0 md:px-0">
              {pillars.map((p, i) => (
                <button key={i} data-testid={`system-tab-${i}`} onClick={() => setActive(i)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 text-[13px] font-semibold border-b-2 -mb-px transition-all ${
                    active === i ? "border-[#FF4500] text-white" : "border-transparent text-white/28 hover:text-white/50"
                  }`}>
                  <span className="font-mono text-[9px] text-white/20">{p.num}</span>
                  {p.tab}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={active} data-testid="system-content"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid sm:grid-cols-2 gap-8">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-[#FF4500]/10 border border-[#FF4500]/20 flex items-center justify-center text-[#FF4500] mb-5">
                    {pillars[active].icon}
                  </div>
                  <h3 className="text-[1.3rem] font-black text-white tracking-tight mb-3">{pillars[active].title}</h3>
                  <p className="text-[13px] md:text-[14px] text-white/38 leading-relaxed">{pillars[active].body}</p>
                </div>
                <ul className="divide-y divide-white/[0.05]">
                  {pillars[active].features.map((f, i) => (
                    <motion.li key={f} initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center gap-3 py-3">
                      <CheckCircle2 size={12} className="text-[#FF4500]/70 flex-shrink-0" />
                      <span className="text-[13px] text-white/60">{f}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── services ─────────────────────────── */
function Services() {
  const services = [
    { icon: <Sparkles size={17} />, title: "Brand Identity", desc: "Complete visual system — logo, colors, fonts, and voice — that positions you as the premium choice." },
    { icon: <Globe size={17} />, title: "Website Build", desc: "Custom-designed, conversion-optimised site with integrated booking, VSL, and copy." },
    { icon: <Target size={17} />, title: "Lead Generation", desc: "Multi-channel pipeline combining organic content, strategic outreach, and paid acquisition." },
    { icon: <BrainCircuit size={17} />, title: "AutoNation", desc: "Every tool connected. DMs, emails, follow-ups, and onboarding flow — fully automated." },
    { icon: <Instagram size={17} />, title: "Social Media", desc: "Instagram optimised into a consistent, high-converting lead machine from day one." },
    { icon: <BarChart3 size={17} />, title: "Growth Analytics", desc: "Unified dashboard tracking every lead, every conversion, every pound of revenue." },
  ];

  return (
    <section id="services" className="px-5 md:px-8 py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="grid lg:grid-cols-[300px_1fr] gap-10 md:gap-16 items-start">
          <div>
            <p className="eyebrow mb-5">Services</p>
            <h2 className="display text-[clamp(2.2rem,4.5vw,3.5rem)] text-white mb-5">
              Everything you<br />need. Nothing<br />you don't.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-0 border border-white/[0.07] rounded-2xl overflow-hidden">
            {services.map((s, i) => (
              <div key={i} data-testid={`service-card-${i}`}
                className={`card-hover group bg-[#0C0C0C] p-5 md:p-6 h-full
                  ${[0,1,3,4].includes(i) ? "border-r border-white/[0.07]" : ""}
                  ${i < 3 ? "border-b border-white/[0.07]" : ""}
                  ${i === 2 || i === 5 ? "border-r-0" : ""}
                `}>
                <span className="text-[#FF4500] opacity-50 group-hover:opacity-80 transition-opacity block mb-4">{s.icon}</span>
                <p className="text-[14px] font-bold text-white mb-1.5 tracking-tight">{s.title}</p>
                <p className="text-[12px] md:text-[13px] text-white/32 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─────────────────────────── process ─────────────────────────── */
function Process() {
  const steps = [
    { num: "01", title: "Free System Audit", desc: "We dig into your setup, find the gaps, and map exactly what it takes to hit your goals.", icon: <BrainCircuit size={14} /> },
    { num: "02", title: "Strategy Blueprint", desc: "Custom 90-day growth plan — brand positioning, channels, automation map, and revenue roadmap.", icon: <Layers size={14} /> },
    { num: "03", title: "Brand & Website", desc: "Full brand identity and premium website built. You'll look like a $100k/year coach from day one.", icon: <Globe size={14} /> },
    { num: "04", title: "System Activation", desc: "Lead gen engine launches. AutoNation goes live. Your pipeline fills automatically.", icon: <Zap size={14} /> },
    { num: "05", title: "Scale & Optimise", desc: "Real data, real decisions. We double down on what works and cut what doesn't — monthly.", icon: <TrendingUp size={14} /> },
  ];

  return (
    <section className="px-5 md:px-8 py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[300px_1fr] gap-10 md:gap-16 items-start">
          <FadeIn>
            <p className="eyebrow mb-5">The Process</p>
            <h2 className="display text-[clamp(2.2rem,4.5vw,3.5rem)] text-white mb-5">
              Zero to system<br />in 90 days.
            </h2>
            <p className="text-[14px] text-white/35 leading-relaxed">
              A proven sequence that has worked for 150+ coaches across every niche.
            </p>
          </FadeIn>

          <div className="border border-white/[0.07] rounded-2xl overflow-hidden divide-y divide-white/[0.07]">
            {steps.map((s, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div data-testid={`process-step-${i}`}
                  className="card-hover flex items-start gap-5 px-5 py-5 md:px-6 bg-[#0C0C0C]">
                  <span className="font-mono text-[10px] text-white/15 pt-1 flex-shrink-0 w-5 text-right">{s.num}</span>
                  <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-white/[0.03] border border-white/[0.07] flex items-center justify-center text-[#FF4500]/60">
                    {s.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-white mb-1 tracking-tight">{s.title}</p>
                    <p className="text-[12px] md:text-[13px] text-white/32 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── results ─────────────────────────── */
function Results() {
  const cards = [
    { name: "James C.", role: "Fat Loss Coach · London", img: coach1Img, before: "$4.2k", after: "$31.5k", time: "4 months",
      quote: "HustleCoreX built me a real business. My system runs 24/7 and I've broken past $30k consistently every single month since." },
    { name: "Sarah M.", role: "PT & Nutrition · Manchester", img: coach2Img, before: "$7.8k", after: "$52k", time: "6 months",
      quote: "I used to post and pray. Now I have a machine booking 3–5 calls daily without me touching a thing. The ROI is insane." },
    { name: "Marcus R.", role: "Strength Coach · New York", img: coach3Img, before: "$2.9k", after: "$18.4k", time: "3 months",
      quote: "The brand transformation alone changed how people perceive me. The automation closes them before I even jump on the call." },
    { name: "Priya S.", role: "Female Transformation · Dubai", img: coach4Img, before: "$8.5k", after: "$67k", time: "5 months",
      quote: "From burnout to a business I'm genuinely proud of. HustleCoreX handles the systems — I just do the coaching." },
  ];

  return (
    <section id="results" className="px-5 md:px-8 py-16 md:py-24">
      <div className="max-w-6xl mx-auto">

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-10">
          <FadeIn>
            <p className="eyebrow mb-5">Results</p>
            <h2 className="display text-[clamp(2.2rem,4.5vw,3.5rem)] text-white">
              Real coaches.<br />Real numbers.
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <button onClick={() => scrollTo("apply")}
              className="flex items-center gap-1.5 text-[13px] text-white/38 hover:text-white/65 transition-colors font-medium flex-shrink-0 mb-0.5">
              See all results <ArrowUpRight size={13} />
            </button>
          </FadeIn>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          {cards.map((r, i) => (
            <FadeIn key={i} delay={i * 0.07}>
              <div data-testid={`result-card-${i}`}
                className="border border-white/[0.07] rounded-2xl overflow-hidden bg-[#0C0C0C] h-full flex flex-col card-hover">
                {/* top bar */}
                <div className="flex items-center justify-between p-5 pb-4 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <img src={r.img} alt={r.name}
                      className="w-10 h-10 rounded-full object-cover object-top border border-white/10 flex-shrink-0" />
                    <div>
                      <p className="text-[14px] font-bold text-white leading-tight">{r.name}</p>
                      <p className="text-[11px] text-white/28">{r.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {[...Array(5)].map((_, j) => <Star key={j} size={9} className="text-[#FF4500] fill-[#FF4500]" />)}
                  </div>
                </div>

                {/* quote */}
                <div className="flex-1 p-5">
                  <p className="text-[13px] md:text-[14px] text-white/50 italic leading-relaxed mb-5">
                    "{r.quote}"
                  </p>
                  {/* results */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-xl bg-white/[0.03] border border-white/[0.07] p-3 text-center">
                      <p className="text-[9px] text-white/20 uppercase tracking-wider mb-1">Before</p>
                      <p className="text-[15px] font-black text-white">{r.before}<span className="text-[10px] text-white/25">/mo</span></p>
                    </div>
                    <ArrowRight size={11} className="text-white/15 flex-shrink-0" />
                    <div className="flex-1 rounded-xl bg-[#FF4500]/[0.07] border border-[#FF4500]/20 p-3 text-center">
                      <p className="text-[9px] text-white/20 uppercase tracking-wider mb-1">After</p>
                      <p className="text-[15px] font-black text-[#FF4500]">{r.after}<span className="text-[10px] text-[#FF4500]/40">/mo</span></p>
                    </div>
                    <p className="text-[10px] text-white/18 flex-shrink-0 ml-1">{r.time}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* aggregate stats */}
        <FadeIn>
          <div className="grid grid-cols-2 sm:grid-cols-4 border border-white/[0.07] rounded-2xl overflow-hidden divide-x divide-y sm:divide-y-0 divide-white/[0.07]">
            {[
              { n: 150, s: "+", label: "Coaches Scaled" },
              { n: 12, p: "$", s: "M+", label: "Revenue Generated" },
              { n: 90, s: "%", label: "Hit $20k in 6 Months" },
              { n: 97, s: "%", label: "Client Retention" },
            ].map((s, i) => (
              <div key={i} data-testid={`results-stat-${i}`}
                className="bg-[#0C0C0C] p-5 md:p-7 text-center">
                <p className="display text-[1.8rem] md:text-[2.2rem] text-white mb-1">
                  <Counter end={s.n} suffix={s.s} prefix={s.p} />
                </p>
                <p className="text-[11px] text-white/25">{s.label}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─────────────────────────── pricing ─────────────────────────── */
function Pricing() {
  const plans = [
    {
      name: "Launchpad", price: "2,497", note: "one-time",
      desc: "For coaches under $5k/month who need solid foundations first.",
      features: ["Brand Identity Package", "Instagram Overhaul", "Lead Gen Strategy", "30-Day Content Plan", "DM Script Library"],
      missing: ["Website Build", "AutoNation Setup"], highlight: false, badge: "",
    },
    {
      name: "Growth System", price: "4,997", note: "one-time",
      desc: "The complete system for coaches ready to break $20k/month.",
      features: ["Everything in Launchpad", "Premium Website Build", "AutoNation Integration", "Email & DM Automation", "Analytics Dashboard", "3-Month Support"],
      missing: [], highlight: true, badge: "Most Popular",
    },
    {
      name: "Empire", price: "Custom", note: "bespoke",
      desc: "For coaches scaling past $20k/month toward $100k+.",
      features: ["Everything in Growth", "Full Ad Management", "Dedicated Strategist", "PR & Authority Building", "Team Systems"],
      missing: [], highlight: false, badge: "6-Figure Track",
    },
  ];

  return (
    <section id="pricing" className="px-5 md:px-8 py-16 md:py-24">
      <div className="max-w-6xl mx-auto">

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <FadeIn>
            <p className="eyebrow mb-5">Pricing</p>
            <h2 className="display text-[clamp(2.2rem,4.5vw,3.5rem)] text-white">
              Invest once.<br />Own your system.
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={12} className="text-[#FF4500]/50" />
              <span className="text-[12px] text-white/25">30-day results guarantee</span>
            </div>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          {plans.map((p, i) => (
            <FadeIn key={i} delay={i * 0.06}>
              <div data-testid={`pricing-card-${p.name.replace(" ","").toLowerCase()}`}
                className={`rounded-2xl p-5 md:p-6 flex flex-col h-full ${
                  p.highlight
                    ? "border border-[#FF4500]/30 bg-[#FF4500]/[0.04]"
                    : "border border-white/[0.07] bg-[#0C0C0C]"
                }`}>

                {p.badge && (
                  <span className={`self-start text-[11px] font-bold px-2.5 py-1 rounded-full mb-5 ${
                    p.highlight ? "bg-[#FF4500] text-white" : "bg-white/[0.06] text-white/35 border border-white/[0.08]"
                  }`}>{p.badge}</span>
                )}

                <div className="mb-6">
                  <p className="text-[14px] font-bold text-white mb-3">{p.name}</p>
                  <div className="flex items-baseline gap-1 mb-3">
                    {p.price !== "Custom" && <span className="text-white/22 text-[18px]">$</span>}
                    <span className={`font-black leading-none tracking-tight text-[2.8rem] ${
                      p.highlight ? "text-[#FF4500]" : "text-white"
                    }`}>{p.price}</span>
                    <span className="text-white/20 text-[12px] ml-1">/ {p.note}</span>
                  </div>
                  <p className="text-[12px] text-white/32 leading-relaxed">{p.desc}</p>
                </div>

                <ul className="flex-1 space-y-2.5 mb-6">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2.5">
                      <CheckCircle2 size={12} className={`mt-0.5 flex-shrink-0 ${p.highlight ? "text-[#FF4500]" : "text-[#FF4500]/45"}`} />
                      <span className="text-[12px] md:text-[13px] text-white/55">{f}</span>
                    </li>
                  ))}
                  {p.missing.map((f, j) => (
                    <li key={j} className="flex items-start gap-2.5 opacity-20">
                      <X size={12} className="mt-0.5 flex-shrink-0 text-white/20" />
                      <span className="text-[12px] md:text-[13px] text-white/25 line-through">{f}</span>
                    </li>
                  ))}
                </ul>

                <button data-testid={`pricing-cta-${p.name.replace(" ","").toLowerCase()}`} onClick={() => scrollTo("apply")}
                  className={`w-full h-11 rounded-xl text-[13px] font-bold transition-all active:scale-[0.97] ${
                    p.highlight
                      ? "bg-[#FF4500] hover:bg-[#FF5500] text-white"
                      : "border border-white/[0.09] text-white/45 hover:text-white/70 hover:border-white/16"
                  }`}>
                  {p.name === "Empire" ? "Book a Strategy Call" : "Get Started"}
                </button>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── faq ─────────────────────────── */
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: "How quickly will I see results?",
      a: "Most clients see inbound leads within 2–3 weeks of launch. Consistent $20k+ months typically arrive by month 3 to 5 as the system compounds and your pipeline fills." },
    { q: "Do I need a big following to start?",
      a: "Not at all. We've built systems for coaches starting from zero. The system works on quality targeting — some of our best results came from coaches with under 1,000 followers." },
    { q: "What is AutoNation?",
      a: "AutoNation is our proprietary automation system that connects every tool in your stack — CRM, email, DMs, booking, and onboarding — into one seamless, intelligent flow running 24/7." },
    { q: "How are you different from a social media manager?",
      a: "A social media manager posts content. We build a complete business system — brand, website, lead gen, automation, and analytics. It's the difference between one employee and a full revenue machine." },
    { q: "Is there ongoing support after launch?",
      a: "Yes. All packages include setup and onboarding support. Growth System includes 3 months of strategy support. Empire includes a dedicated strategist with priority access and monthly reviews." },
    { q: "What if I'm not happy with the results?",
      a: "We offer a 30-day results guarantee on all packages. If we don't deliver what we promised, we'll keep working at no additional cost until we do — or refund you in full." },
  ];

  return (
    <section className="px-5 md:px-8 py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[300px_1fr] gap-10 md:gap-16 items-start">
          <FadeIn>
            <p className="eyebrow mb-5">FAQ</p>
            <h2 className="display text-[clamp(2.2rem,4.5vw,3.5rem)] text-white mb-5">
              Common<br />questions.
            </h2>
            <p className="text-[14px] text-white/32 leading-relaxed">
              Can't find what you're looking for?{" "}
              <button onClick={() => scrollTo("apply")} className="text-white/55 underline underline-offset-2 hover:text-white transition-colors">
                Ask us directly.
              </button>
            </p>
          </FadeIn>

          <div className="border border-white/[0.07] rounded-2xl overflow-hidden divide-y divide-white/[0.07]">
            {faqs.map((f, i) => (
              <FadeIn key={i}>
                <div data-testid={`faq-item-${i}`}>
                  <button data-testid={`faq-toggle-${i}`} onClick={() => setOpen(open === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-5 md:px-6 py-4 md:py-5 bg-[#0C0C0C] hover:bg-[#111] active:bg-[#111] transition-colors text-left">
                    <span className="text-[14px] font-semibold text-white/70 pr-4 leading-snug">{f.q}</span>
                    <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.18 }} className="flex-shrink-0">
                      <ChevronDown size={14} className={open === i ? "text-[#FF4500]" : "text-white/18"} />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {open === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
                        className="overflow-hidden bg-[#0A0A0A]">
                        <p className="px-5 md:px-6 py-4 text-[13px] md:text-[14px] text-white/35 leading-relaxed">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── cta band ─────────────────────────── */
function CTABand() {
  return (
    <section className="px-5 md:px-8 py-5">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <div className="relative overflow-hidden border border-white/[0.08] rounded-2xl px-7 py-8 md:px-12 md:py-10 bg-[#0C0C0C]
            flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            {/* subtle radial glow */}
            <div className="absolute right-0 top-0 w-80 h-80 bg-[#FF4500]/[0.06] rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />
            <div className="relative z-10">
              <p className="eyebrow mb-3">3 Spots Left — Q2 2026</p>
              <h2 className="display text-[1.5rem] md:text-[2rem] text-white leading-tight">
                Your competition isn't<br className="hidden md:block" /> waiting.
              </h2>
            </div>
            <button data-testid="cta-banner-button" onClick={() => scrollTo("apply")}
              className="relative z-10 flex-shrink-0 flex items-center gap-2 h-12 px-6 rounded-xl bg-[#FF4500] hover:bg-[#FF5500] active:scale-[0.97] text-white text-[14px] font-bold transition-all shadow-[0_0_32px_rgba(255,69,0,0.2)]">
              Get a Free Audit <ArrowRight size={15} />
            </button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─────────────────────────── apply ─────────────────────────── */
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
    onSuccess: () => { setDone(true); toast({ title: "Application received!", description: "We'll be in touch within 24 hours." }); },
    onError: () => toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" }),
  });

  const inputCls = "w-full h-11 px-4 rounded-xl bg-[#111] border border-white/[0.08] text-[14px] text-white placeholder-white/18 focus:outline-none focus:border-[#FF4500]/40 transition-colors";

  return (
    <section id="apply" className="px-5 md:px-8 py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* ── Left ── */}
          <FadeIn>
            <p className="eyebrow mb-5">Apply Now</p>
            <h2 className="display text-[clamp(2.2rem,4.5vw,3.5rem)] text-white mb-5">
              Ready to build<br />
              <span className="text-brand">your system?</span>
            </h2>
            <p className="text-[14px] text-white/35 leading-relaxed mb-8 max-w-sm">
              Fill in the form. We'll audit your current setup for free and show you exactly what it takes to reach your goal — no pressure, no hard sell.
            </p>

            <ul className="space-y-4 mb-10">
              {[
                { icon: <Clock size={13} />, t: "Reply within 24 hours, guaranteed" },
                { icon: <Shield size={13} />, t: "No hard sell — we only work with the right fit" },
                { icon: <Star size={13} />, t: "Free audit included with every application" },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FF4500]/8 border border-[#FF4500]/14 flex items-center justify-center text-[#FF4500]/60 flex-shrink-0">
                    {item.icon}
                  </div>
                  <span className="text-[13px] text-white/40">{item.t}</span>
                </li>
              ))}
            </ul>

            {/* testimonial card */}
            <div className="border border-white/[0.07] rounded-2xl p-5 bg-[#0C0C0C]">
              <div className="flex items-center gap-3 mb-4">
                <img src={coach2Img} alt="Sarah M."
                  className="w-10 h-10 rounded-full object-cover object-top border border-white/10" />
                <div>
                  <p className="text-[13px] font-bold text-white">Sarah M.</p>
                  <p className="text-[11px] text-white/28">PT & Nutrition Coach</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} size={10} className="text-[#FF4500] fill-[#FF4500]" />)}
                </div>
              </div>
              <p className="text-[12px] text-white/38 italic leading-relaxed">
                "From $7.8k to $52k a month in 6 months. The best investment I've ever made in my coaching business. Apply now — you won't regret it."
              </p>
            </div>
          </FadeIn>

          {/* ── Right: form ── */}
          <FadeIn delay={0.1}>
            {done ? (
              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                className="border border-white/[0.07] rounded-2xl p-10 md:p-12 bg-[#0C0C0C] text-center" data-testid="apply-success">
                <div className="w-14 h-14 rounded-2xl bg-[#FF4500] flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={26} className="text-white" />
                </div>
                <h3 className="text-[1.3rem] font-black text-white mb-2.5 tracking-tight">Application Received</h3>
                <p className="text-[13px] text-white/35 leading-relaxed max-w-xs mx-auto">
                  We'll review your setup and reach out within 24 hours with your personalised free audit.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={form.handleSubmit(d => mut.mutate(d))}
                className="border border-white/[0.07] rounded-2xl p-5 md:p-6 bg-[#0C0C0C] space-y-4" data-testid="apply-form">
                <div className="mb-2">
                  <p className="text-[16px] font-black text-white tracking-tight">Free System Audit</p>
                  <p className="text-[12px] text-white/28 mt-0.5">Takes 2 minutes. No commitment.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="eyebrow block mb-2">Name</label>
                    <input {...form.register("name")} data-testid="input-name" placeholder="Your name" className={inputCls} />
                    {form.formState.errors.name && <p className="text-red-400/70 text-[11px] mt-1.5">{form.formState.errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="eyebrow block mb-2">Email</label>
                    <input {...form.register("email")} data-testid="input-email" type="email" placeholder="you@email.com" className={inputCls} />
                    {form.formState.errors.email && <p className="text-red-400/70 text-[11px] mt-1.5">{form.formState.errors.email.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="eyebrow block mb-2">Instagram Handle</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/18 text-[13px] pointer-events-none">@</span>
                    <input {...form.register("instagram")} data-testid="input-instagram" placeholder="yourhandle" className={inputCls + " pl-7"} />
                  </div>
                </div>

                <div>
                  <label className="eyebrow block mb-2">Current Monthly Revenue</label>
                  <select {...form.register("currentRevenue")} data-testid="select-revenue"
                    className={inputCls + " appearance-none cursor-pointer"}>
                    <option value="">Select range...</option>
                    <option value="0-2k">$0 – $2,000</option>
                    <option value="2k-5k">$2,000 – $5,000</option>
                    <option value="5k-10k">$5,000 – $10,000</option>
                    <option value="10k-20k">$10,000 – $20,000</option>
                    <option value="20k+">$20,000+</option>
                  </select>
                  {form.formState.errors.currentRevenue && <p className="text-red-400/70 text-[11px] mt-1.5">{form.formState.errors.currentRevenue.message}</p>}
                </div>

                <div>
                  <label className="eyebrow block mb-2">6-Month Revenue Goal</label>
                  <select {...form.register("goal")} data-testid="select-goal"
                    className={inputCls + " appearance-none cursor-pointer"}>
                    <option value="">Select goal...</option>
                    <option value="10k">$10,000 / month</option>
                    <option value="20k">$20,000 / month</option>
                    <option value="50k">$50,000 / month</option>
                    <option value="100k+">$100,000+ / month</option>
                  </select>
                  {form.formState.errors.goal && <p className="text-red-400/70 text-[11px] mt-1.5">{form.formState.errors.goal.message}</p>}
                </div>

                <div>
                  <label className="eyebrow block mb-2">
                    Biggest Challenge
                    <span className="text-white/15 normal-case tracking-normal font-normal ml-1.5">(optional)</span>
                  </label>
                  <textarea {...form.register("message")} data-testid="input-message"
                    placeholder="What's your biggest bottleneck right now?" rows={3}
                    className={inputCls + " h-auto py-3 resize-none leading-relaxed"} />
                </div>

                <button type="submit" data-testid="button-submit" disabled={mut.isPending}
                  className="w-full h-12 rounded-xl bg-[#FF4500] hover:bg-[#FF5500] active:scale-[0.97] text-white text-[14px] font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                  {mut.isPending ? (
                    <><div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full"
                      style={{ animation: "spin 0.7s linear infinite" }} />Submitting...</>
                  ) : <>Submit Application <ArrowRight size={14} /></>}
                </button>
                <p className="text-[11px] text-white/18 text-center">No spam. No hard sell. Just strategy.</p>
              </form>
            )}
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── footer ─────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-white/[0.06] px-5 md:px-8 pt-14 pb-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2">
            <Logo />
            <p className="text-[12px] text-white/25 leading-relaxed mt-4 max-w-[220px]">
              Setting the standard for online fitness coaches worldwide.
            </p>
            <div className="flex gap-2 mt-5">
              <a href="#" data-testid="footer-instagram"
                className="w-9 h-9 rounded-xl border border-white/[0.07] flex items-center justify-center text-white/25 hover:text-white/50 hover:border-white/14 transition-colors">
                <Instagram size={14} />
              </a>
              <a href="#" data-testid="footer-mail"
                className="w-9 h-9 rounded-xl border border-white/[0.07] flex items-center justify-center text-white/25 hover:text-white/50 hover:border-white/14 transition-colors">
                <Mail size={14} />
              </a>
            </div>
          </div>

          <div>
            <p className="eyebrow mb-5">Navigation</p>
            <div className="space-y-2.5">
              {[["system","System"],["services","Services"],["results","Results"],["pricing","Pricing"],["apply","Apply"]].map(([id, label]) => (
                <button key={id} onClick={() => scrollTo(id)}
                  className="block text-[13px] text-white/25 hover:text-white/55 transition-colors">{label}</button>
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow mb-5">Contact</p>
            <div className="space-y-3">
              {[
                { icon: <Mail size={11} />, text: "hello@hustlecorex.io" },
                { icon: <Instagram size={11} />, text: "@hustlecorex" },
                { icon: <Clock size={11} />, text: "Mon–Fri · 9am–6pm GMT" },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-2.5 text-[12px] text-white/25">
                  <span className="text-[#FF4500]/40 flex-shrink-0">{c.icon}</span>
                  {c.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.05] pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-white/16">© {new Date().getFullYear()} HustleCoreX. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="text-[11px] text-white/16 hover:text-white/35 transition-colors">Privacy Policy</a>
            <a href="#" className="text-[11px] text-white/16 hover:text-white/35 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────── page ─────────────────────────── */
export default function Home() {
  return (
    <div className="min-h-screen bg-[#070707] overflow-x-hidden">
      <SiteHeader />
      <Hero />
      <Ticker />
      <div className="border-t border-white/[0.05]" />
      <Problem />
      <div className="border-t border-white/[0.05]" />
      <System />
      <div className="border-t border-white/[0.05]" />
      <Services />
      <div className="border-t border-white/[0.05]" />
      <Process />
      <div className="border-t border-white/[0.05]" />
      <Results />
      <div className="border-t border-white/[0.05]" />
      <Pricing />
      <div className="border-t border-white/[0.05]" />
      <FAQ />
      <div className="border-t border-white/[0.05]" />
      <CTABand />
      <Apply />
      <Footer />
    </div>
  );
}
