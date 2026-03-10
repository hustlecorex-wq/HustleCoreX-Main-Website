import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLeadSchema, type InsertLead } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight, CheckCircle2, ChevronDown, Menu, X,
  Instagram, Mail, Star, Shield, Clock,
  Target, BrainCircuit, Sparkles, Zap, Globe, Layers, TrendingUp,
} from "lucide-react";

import logoImg from "@assets/logo_transparent.png";
import founderImg from "@assets/main_profile_pic_20260225_150724_0000_1773138297391.png";
import coach1Img from "@assets/580868512_17843744343613829_22300884961125480_n_1773149974233.jpg";
import coach2Img from "@assets/626956249_18573276355036228_693123345985490863_n_1773149974233.jpg";
import coach3Img from "@assets/637758797_17889993744428899_7709878898914652022_n_1773149974234.jpg";
import coach4Img from "@assets/641246630_18408593131131876_4631414787526160229_n_1773149974234.jpg";

/* ─── utils ─────────────────────────────────────────────────── */

function FadeIn({ children, className = "", delay = 0 }: {
  children: React.ReactNode; className?: string; delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}


const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

/* ─── logo ──────────────────────────────────────────────────── */
function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <img src={logoImg} alt="HustleCoreX" className="w-8 h-8 object-contain flex-shrink-0" />
      <span className="font-black text-white text-[15px] tracking-[-0.025em]">HustleCoreX</span>
    </div>
  );
}

/* ─── nav ────────────────────────────────────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links: [string, string][] = [
    ["system", "System"], ["results", "Results"], ["pricing", "Pricing"],
  ];

  return (
    <header data-testid="navbar"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-[#080808]/92 backdrop-blur-2xl border-b border-white/[0.05]" : ""
      }`}>
      <div className="max-w-6xl mx-auto px-6 md:px-10 h-[62px] flex items-center justify-between">
        <button onClick={() => go("hero")} className="transition-opacity active:opacity-60">
          <Logo />
        </button>

        <nav className="hidden md:flex items-center gap-8">
          {links.map(([id, label]) => (
            <button key={id} data-testid={`nav-${id}`} onClick={() => go(id)}
              className="text-[13px] font-medium text-white/35 hover:text-white/70 transition-colors">
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button data-testid="nav-cta" onClick={() => go("apply")}
            className="hidden md:flex items-center gap-1.5 h-9 px-5 rounded-xl bg-[#FF4500] hover:bg-[#FF5A00] text-white text-[13px] font-bold transition-colors active:scale-[0.97]">
            Apply Now
          </button>
          <button data-testid="mobile-menu-toggle" onClick={() => setOpen(!open)}
            className="md:hidden w-10 h-10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
            {open ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {/* mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.16 }}
            className="md:hidden border-t border-white/[0.05] bg-[#080808]">
            <div className="max-w-6xl mx-auto px-6 py-2 pb-5">
              {[...links, ["apply", "Apply Now"] as [string, string]].map(([id, label]) => (
                <button key={id} data-testid={`mobile-nav-${id}`}
                  onClick={() => { go(id); setOpen(false); }}
                  className="flex w-full items-center justify-between py-4 text-[15px] font-semibold text-white/50 hover:text-white border-b border-white/[0.04] last:border-0 transition-colors">
                  {label} <ArrowRight size={13} className="text-white/18" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ─── hero ───────────────────────────────────────────────────── */
function Hero() {
  const badgeWords = "The future of online coaching is here.".split(" ");

  const headlineLines = [
    { text: "The System", delay: 0.55 },
    { text: "Behind", delay: 0.70 },
    { text: "6-Figure", delay: 0.85, shimmer: true },
    { text: "Coaches.", delay: 1.0 },
  ];

  return (
    <section id="hero" className="relative min-h-[100svh] flex flex-col lg:flex-row items-stretch overflow-hidden">

      {/* ══ Animated background layer ══ */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* dot-grid */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.022) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          }} />

        {/* Orb 1 - large orange, top-right */}
        <div className="absolute -top-[15%] -right-[10%] w-[75vw] h-[75vw] max-w-[760px] max-h-[760px]"
          style={{
            background: "radial-gradient(circle, rgba(255,69,0,0.11) 0%, rgba(255,69,0,0.03) 45%, transparent 70%)",
            animation: "orb-float-1 20s ease-in-out infinite",
          }} />

        {/* Orb 2 - warm amber, bottom-left */}
        <div className="absolute -bottom-[20%] -left-[15%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px]"
          style={{
            background: "radial-gradient(circle, rgba(255,120,0,0.07) 0%, transparent 65%)",
            animation: "orb-float-2 28s ease-in-out infinite",
          }} />

        {/* Orb 3 - subtle, center-left on mobile */}
        <div className="lg:hidden absolute top-[30%] left-[50%] -translate-x-1/2 w-[90vw] h-[90vw]"
          style={{
            background: "radial-gradient(circle, rgba(255,69,0,0.06) 0%, transparent 65%)",
            animation: "orb-float-3 22s ease-in-out infinite",
          }} />

        {/* top edge vignette */}
        <div className="absolute top-0 inset-x-0 h-[80px] bg-gradient-to-b from-[#080808] to-transparent" />
        {/* bottom edge vignette */}
        <div className="absolute bottom-0 inset-x-0 h-[120px] bg-gradient-to-t from-[#080808] to-transparent" />
      </div>

      {/* ══ Left - content ══ */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 md:px-10 lg:px-14 xl:px-20 pt-[80px] pb-12 lg:pb-0 lg:pt-0">
        <div className="max-w-[560px]">

          {/* Status badge */}
          <motion.div data-testid="hero-badge"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2.5 px-4 py-2 mb-8 md:mb-10 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm">
            <span className="w-[7px] h-[7px] rounded-full bg-[#FF4500] flex-shrink-0"
              style={{ animation: "pulse-dot 2s ease-in-out infinite" }} />
            <span className="text-[11px] md:text-[12px] font-medium text-white/38 tracking-[0.01em]">
              {badgeWords.map((word, i) => (
                <motion.span key={i}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.055, duration: 0.3 }}
                  className="inline-block mr-[0.25em]">
                  {word}
                </motion.span>
              ))}
            </span>
          </motion.div>

          {/* Main headline - line by line */}
          <h1 data-testid="hero-headline"
            className="display text-[clamp(2.9rem,10vw,7.2rem)] text-white mb-7 md:mb-8 leading-[0.93]">
            {headlineLines.map((line, i) => (
              <motion.span key={i} className="block"
                initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: line.delay, ease: [0.22, 1, 0.36, 1] }}>
                {line.shimmer
                  ? <span className="shimmer-text">{line.text}</span>
                  : line.text}
              </motion.span>
            ))}
          </h1>

          {/* Sub */}
          <motion.p data-testid="hero-subheadline"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.12, ease: [0.22, 1, 0.36, 1] }}
            className="text-[14px] md:text-[16px] text-white/35 leading-[1.78] max-w-[390px] mb-9 md:mb-10">
            Premium brand. Elite website. Automated lead engine. One system built exclusively for online fitness coaches.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.24 }}
            className="flex flex-col sm:flex-row gap-3 mb-10 md:mb-12">
            <button data-testid="hero-cta-primary" onClick={() => go("apply")}
              className="relative flex items-center justify-center gap-2 h-12 px-7 rounded-xl bg-[#FF4500] hover:bg-[#FF5500] active:scale-[0.97] text-white text-[14px] font-bold transition-colors overflow-hidden group">
              {/* shimmer sweep on hover */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              Get Your Free Audit <ArrowRight size={14} />
            </button>
            <button data-testid="hero-cta-secondary" onClick={() => go("results")}
              className="flex items-center justify-center gap-2 h-12 px-7 rounded-xl border border-white/[0.08] text-white/40 hover:text-white/65 hover:border-white/[0.13] text-[14px] font-medium transition-all active:scale-[0.97]">
              See Results
            </button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.38 }}
            className="flex items-center gap-5 pt-8 border-t border-white/[0.05]">
            <div className="flex -space-x-2 flex-shrink-0">
              {[coach1Img, coach2Img, coach3Img, coach4Img].map((src, i) => (
                <img key={i} src={src} alt="coach"
                  className="w-8 h-8 rounded-full object-cover object-top border-2 border-[#080808]" />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-0.5 mb-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={10} className="fill-[#FF4500]/75 text-[#FF4500]/75" />
                ))}
                <span className="text-[11px] text-white/20 ml-1.5 font-medium">5.0</span>
              </div>
              <p className="text-[12px] text-white/24">Trusted by 50+ coaches worldwide</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ══ Right - founder photo (desktop only) ══ */}
      <div className="hidden lg:block w-[44%] xl:w-[41%] relative flex-shrink-0 z-10">
        <img src={founderImg} alt="HustleCoreX founder" data-testid="hero-image"
          className="absolute inset-0 w-full h-full object-cover object-top" />
        {/* left edge blend */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/12 to-transparent" />
        {/* top/bottom depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/55 via-transparent to-[#080808]/28" />
      </div>

    </section>
  );
}

/* ─── ticker ─────────────────────────────────────────────────── */
function Ticker() {
  const items = [
    "James C. → $31.5k/month in 4 months",
    "Sarah M. → $52k/month in 6 months",
    "Marcus R. tripled revenue in 90 days",
    "Priya S. → $67k/month in 5 months",
    "Tom K. books 5+ calls daily on autopilot",
    "Rachel L. built $40k/month while on holiday",
    "Daniel W. → 47 clients in 6 months",
    "Aisha M. → $25k in her first 90 days",
  ];
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden border-b border-white/[0.05] py-3.5">
      <div className="flex animate-ticker gap-0 whitespace-nowrap">
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-6 flex-shrink-0">
            <span className="text-[12px] text-white/28 font-medium px-2">{item}</span>
            <span className="text-white/10 flex-shrink-0">◆</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── problem ────────────────────────────────────────────────── */
function Problem() {
  const items = [
    { before: "Posting content, praying for leads", after: "Qualified prospects arriving every day" },
    { before: "Looking like every other coach online", after: "A premium brand that justifies premium prices" },
    { before: "Chasing every lead manually", after: "Automated follow-up running 24/7" },
    { before: "A website that loses you clients", after: "A conversion machine that books calls while you sleep" },
    { before: "Stuck at $5–10k with no clear path up", after: "A repeatable system clearing $30k+ every month" },
    { before: "Working in your business all day", after: "Working on your business from a position of leverage" },
  ];

  return (
    <section className="px-6 md:px-10 py-24 md:py-36">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[380px_1fr] gap-12 lg:gap-20 items-start">

          <FadeIn>
            <p className="label-accent mb-6">The Problem</p>
            <h2 className="display text-[clamp(2.8rem,5.5vw,4.5rem)] text-white mb-6">
              You're working<br />hard in the<br />wrong places.
            </h2>
            <p className="text-[14px] md:text-[15px] text-white/35 leading-[1.8] max-w-[300px]">
              Most coaches are one system away from doubling their income. The problem isn't your coaching - it's your infrastructure.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 gap-0 border border-white/[0.05] rounded-2xl overflow-hidden">
            {items.map((item, i) => (
              <FadeIn key={i} delay={i * 0.04}>
                <div data-testid={`problem-card-${i}`}
                  className={`p-6 md:p-7 h-full bg-[#0D0D0D] hover:bg-[#0F0F0F] transition-colors
                    ${i % 2 === 0 ? "sm:border-r border-white/[0.05]" : ""}
                    ${i < items.length - 2 ? "border-b border-white/[0.05]" : ""}
                  `}>
                  <p className="text-[12px] text-white/18 line-through leading-snug mb-3 font-medium">{item.before}</p>
                  <p className="text-[13px] md:text-[14px] text-white/75 font-semibold leading-snug">{item.after}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── system ─────────────────────────────────────────────────── */
function System() {
  const [active, setActive] = useState(0);
  const pillars = [
    { n: "01", tab: "Brand", title: "Premium Brand Identity", icon: <Sparkles size={16} />,
      body: "Your brand is the first impression every future client sees. We build a complete visual identity, voice, and market position that makes you the obvious premium choice in your niche.",
      points: ["Logo & Visual Identity", "Brand Voice & Messaging", "Niche Positioning Strategy", "Content Pillars", "Authority Architecture"] },
    { n: "02", tab: "Website", title: "High-Converting Website", icon: <Globe size={16} />,
      body: "Not just a beautiful site - a sales machine. We design and build a premium website that qualifies visitors and converts them into booked calls, 24 hours a day.",
      points: ["Custom Premium Design", "Conversion Copywriting", "Automated Booking System", "Video Sales Letter", "Speed & Mobile Optimised"] },
    { n: "03", tab: "Leads", title: "Lead Generation Engine", icon: <Target size={16} />,
      body: "A multi-channel pipeline - organic, outbound, and paid - built to keep your calendar full of warm, qualified prospects ready to invest in your coaching.",
      points: ["Instagram Overhaul", "Content-to-DM Funnel", "Strategic Outreach System", "Paid Ad Strategy", "Lead Magnet Creation"] },
    { n: "04", tab: "AutoNation", title: "AutoNation System", icon: <BrainCircuit size={16} />,
      body: "Every tool in your stack intelligently connected. Leads come in, get nurtured, book a call, and onboard - entirely without you lifting a finger.",
      points: ["Full CRM Integration", "Email Automation", "DM Auto-Responses", "Lead Scoring & Routing", "Onboarding Flow"] },
  ];

  return (
    <section id="system" className="border-t border-white/[0.05] px-6 md:px-10 py-24 md:py-36">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[380px_1fr] gap-12 lg:gap-20 items-start">

          <FadeIn>
            <p className="label-accent mb-6">The System</p>
            <h2 className="display text-[clamp(2.8rem,5.5vw,4.5rem)] text-white mb-6">
              Five pillars.<br />One system.
            </h2>
            <p className="text-[14px] md:text-[15px] text-white/35 leading-[1.8] max-w-[300px]">
              Built to work as one end-to-end machine - not five tools duct-taped together.
            </p>
          </FadeIn>

          <div>
            {/* tabs */}
            <div className="flex overflow-x-auto scrollbar-hide border-b border-white/[0.05] -mx-6 px-6 md:mx-0 md:px-0 mb-10">
              {pillars.map((p, i) => (
                <button key={i} data-testid={`system-tab-${i}`} onClick={() => setActive(i)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 text-[13px] font-semibold border-b-2 -mb-px transition-all whitespace-nowrap ${
                    active === i ? "border-white text-white" : "border-transparent text-white/25 hover:text-white/45"
                  }`}>
                  <span className="font-mono text-[9px] text-white/18">{p.n}</span> {p.tab}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={active} data-testid="system-content"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="grid sm:grid-cols-2 gap-10">
                <div>
                  <div className="w-9 h-9 rounded-xl border border-white/[0.07] flex items-center justify-center text-white/40 mb-5">
                    {pillars[active].icon}
                  </div>
                  <h3 className="heading text-[1.35rem] text-white mb-3">{pillars[active].title}</h3>
                  <p className="text-[14px] text-white/35 leading-[1.8]">{pillars[active].body}</p>
                </div>
                <ul className="divide-y divide-white/[0.04]">
                  {pillars[active].points.map((f, i) => (
                    <motion.li key={f}
                      initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-center gap-3 py-3.5">
                      <CheckCircle2 size={12} className="text-white/25 flex-shrink-0" />
                      <span className="text-[13px] text-white/55">{f}</span>
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

/* ─── results (testimonials) ─────────────────────────────────── */
function Results() {
  const cards = [
    { name: "James C.", role: "Fat Loss Coach · London", img: coach1Img,
      before: "$4.2k", after: "$31.5k", time: "4 months",
      quote: "HustleCoreX built me a real business. My system runs 24/7 and I've broken past $30k consistently every month since." },
    { name: "Sarah M.", role: "PT & Nutrition · Manchester", img: coach2Img,
      before: "$7.8k", after: "$52k", time: "6 months",
      quote: "I used to post and pray. Now I have a machine booking 3–5 calls daily without me touching a thing. The ROI is insane." },
    { name: "Marcus R.", role: "Strength Coach · New York", img: coach3Img,
      before: "$2.9k", after: "$18.4k", time: "3 months",
      quote: "The brand transformation changed how people perceive me overnight. The automation closes prospects before I even get on the call." },
    { name: "Priya S.", role: "Female Transformation · Dubai", img: coach4Img,
      before: "$8.5k", after: "$67k", time: "5 months",
      quote: "From total burnout to a business I'm genuinely proud of. HustleCoreX handles all the heavy lifting - I just do the coaching." },
  ];

  return (
    <section id="results" className="border-t border-white/[0.05] px-6 md:px-10 py-24 md:py-36">
      <div className="max-w-6xl mx-auto">

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14 md:mb-16">
          <FadeIn>
            <p className="label-accent mb-6">Results</p>
            <h2 className="display text-[clamp(2.8rem,5.5vw,4.5rem)] text-white">
              Real coaches.<br />Real numbers.
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-[13px] text-white/28 max-w-[260px] leading-relaxed">
              Every result below came from a coach who was exactly where you are now.
            </p>
          </FadeIn>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-16">
          {cards.map((r, i) => (
            <FadeIn key={i} delay={i * 0.06}>
              <div data-testid={`result-card-${i}`}
                className="border border-white/[0.05] rounded-2xl bg-[#0D0D0D] overflow-hidden h-full flex flex-col hover:border-white/[0.09] transition-colors">

                {/* quote */}
                <div className="flex-1 p-6 md:p-8">
                  <div className="flex gap-0.5 mb-5">
                    {[...Array(5)].map((_, j) => <Star key={j} size={11} className="text-[#FF4500]/70 fill-[#FF4500]/70" />)}
                  </div>
                  <p className="text-[14px] md:text-[15px] text-white/55 leading-[1.8] italic mb-0">
                    "{r.quote}"
                  </p>
                </div>

                {/* bottom bar */}
                <div className="border-t border-white/[0.05] px-6 md:px-8 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={r.img} alt={r.name}
                      className="w-9 h-9 rounded-full object-cover object-top border border-white/[0.08] flex-shrink-0" />
                    <div>
                      <p className="text-[13px] font-bold text-white leading-tight">{r.name}</p>
                      <p className="text-[11px] text-white/25">{r.role}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[18px] font-black text-white tracking-tight leading-none">{r.after}<span className="text-[11px] text-white/22">/mo</span></p>
                    <p className="text-[11px] text-white/22 mt-0.5">from {r.before} · {r.time}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── pricing ────────────────────────────────────────────────── */
function Pricing() {
  const plans = [
    {
      name: "Launchpad", price: "2,497", note: "one-time",
      tag: "",
      desc: "The foundation every serious coach needs to get started.",
      features: ["Brand Identity System", "Instagram Overhaul", "Lead Gen Strategy", "30-Day Content Framework", "DM Script Library"],
      missing: ["Website Build", "AutoNation Setup"],
      highlight: false,
    },
    {
      name: "Growth System", price: "4,997", note: "one-time",
      tag: "Most Popular",
      desc: "The complete system for coaches ready to break $20k/month.",
      features: ["Everything in Launchpad", "Premium Website Build", "AutoNation Integration", "Email & DM Automation", "Analytics Dashboard", "3-Month Strategy Support"],
      missing: [],
      highlight: true,
    },
    {
      name: "Empire", price: "Custom", note: "bespoke",
      tag: "6-Figure Track",
      desc: "For coaches scaling past $20k/month toward $100k and beyond.",
      features: ["Everything in Growth", "Full Ad Management", "Dedicated Strategist", "PR & Authority Building", "Team & Hiring Systems"],
      missing: [],
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="border-t border-white/[0.05] px-6 md:px-10 py-24 md:py-36">
      <div className="max-w-6xl mx-auto">

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14 md:mb-16">
          <FadeIn>
            <p className="label-accent mb-6">Pricing</p>
            <h2 className="display text-[clamp(2.8rem,5.5vw,4.5rem)] text-white">
              Invest once.<br />Own the system.
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={12} className="text-white/22" />
              <span className="text-[13px] text-white/25">30-day results guarantee on all packages</span>
            </div>
          </FadeIn>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((p, i) => (
            <FadeIn key={i} delay={i * 0.07}>
              <div data-testid={`pricing-card-${p.name.replace(" ", "").toLowerCase()}`}
                className={`rounded-2xl p-6 md:p-8 flex flex-col h-full relative overflow-hidden ${
                  p.highlight
                    ? "border border-white/[0.12] bg-[#0D0D0D]"
                    : "border border-white/[0.05] bg-[#0D0D0D]"
                }`}>
                {/* subtle top accent line for highlight */}
                {p.highlight && (
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF4500]/40 to-transparent" />
                )}

                {p.tag && (
                  <span className={`self-start text-[11px] font-bold px-3 py-1.5 rounded-full mb-6 ${
                    p.highlight
                      ? "bg-[#FF4500] text-white"
                      : "border border-white/[0.07] text-white/30"
                  }`}>{p.tag}</span>
                )}

                {!p.tag && <div className="mb-6 h-[30px]" />}

                <div className="mb-8">
                  <p className="text-[13px] font-bold text-white/55 mb-3 tracking-tight">{p.name}</p>
                  <div className="flex items-baseline gap-1 mb-3">
                    {p.price !== "Custom" && <span className="text-white/20 text-[1.1rem]">$</span>}
                    <span className={`display leading-none text-[3.2rem] ${p.highlight ? "text-white" : "text-white"}`}>
                      {p.price}
                    </span>
                    <span className="text-white/18 text-[12px] ml-1">/ {p.note}</span>
                  </div>
                  <p className="text-[13px] text-white/28 leading-relaxed">{p.desc}</p>
                </div>

                <ul className="flex-1 space-y-3 mb-8">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <CheckCircle2 size={12} className="mt-0.5 flex-shrink-0 text-white/30" />
                      <span className="text-[13px] text-white/55">{f}</span>
                    </li>
                  ))}
                  {p.missing.map((f, j) => (
                    <li key={j} className="flex items-start gap-3 opacity-20">
                      <X size={12} className="mt-0.5 flex-shrink-0 text-white/20" />
                      <span className="text-[13px] text-white/25 line-through">{f}</span>
                    </li>
                  ))}
                </ul>

                <button data-testid={`pricing-cta-${p.name.replace(" ", "").toLowerCase()}`}
                  onClick={() => go("apply")}
                  className={`w-full h-11 rounded-xl text-[13px] font-bold transition-all active:scale-[0.97] ${
                    p.highlight
                      ? "bg-[#FF4500] hover:bg-[#FF5500] text-white"
                      : "border border-white/[0.08] text-white/40 hover:text-white/65 hover:border-white/14"
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

/* ─── faq ────────────────────────────────────────────────────── */
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const items = [
    { q: "How quickly will I see results?",
      a: "Most clients see inbound leads within 2–3 weeks of launch. Consistent $20k+ months typically arrive by month 3 to 5 as the system compounds and your pipeline matures." },
    { q: "Do I need a big following to start?",
      a: "Not at all. We've scaled coaches from zero followers. The system works on precision targeting - some of our best results came from coaches with under 1,000 followers." },
    { q: "What is AutoNation?",
      a: "AutoNation is the automation system that connects every tool in your stack - CRM, email, DMs, booking, and onboarding - into one seamless, intelligent flow that runs 24/7 without you." },
    { q: "How are you different from a social media manager?",
      a: "A social media manager posts content. We build a complete business system - brand, website, lead gen, automation, and analytics. It's the difference between one employee and a full revenue machine." },
    { q: "Is there ongoing support after launch?",
      a: "Yes. All packages include setup and onboarding. Growth System includes 3 months of strategy support. Empire includes a dedicated strategist with priority access and monthly performance reviews." },
    { q: "What's your guarantee?",
      a: "We offer a 30-day results guarantee. If we don't deliver what we promised, we'll keep working at no additional cost until we do - or refund you in full. No questions asked." },
  ];

  return (
    <section className="border-t border-white/[0.05] px-6 md:px-10 py-24 md:py-36">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[380px_1fr] gap-12 lg:gap-20 items-start">
          <FadeIn>
            <p className="label-accent mb-6">FAQ</p>
            <h2 className="display text-[clamp(2.8rem,5.5vw,4.5rem)] text-white mb-6">
              Common<br />questions.
            </h2>
            <p className="text-[14px] text-white/30 leading-[1.8]">
              Something else on your mind?{" "}
              <button onClick={() => go("apply")} className="text-white/50 underline-offset-2 underline hover:text-white/70 transition-colors">
                Ask us directly.
              </button>
            </p>
          </FadeIn>

          <div className="border border-white/[0.05] rounded-2xl overflow-hidden divide-y divide-white/[0.05]">
            {items.map((item, i) => (
              <FadeIn key={i}>
                <div data-testid={`faq-item-${i}`}>
                  <button data-testid={`faq-toggle-${i}`}
                    onClick={() => setOpen(open === i ? null : i)}
                    className="w-full flex items-center justify-between gap-5 px-6 md:px-8 py-5 bg-[#0D0D0D] hover:bg-[#0F0F0F] text-left transition-colors">
                    <span className="text-[14px] font-semibold text-white/65 leading-snug">{item.q}</span>
                    <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
                      <ChevronDown size={14} className="text-white/20" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {open === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
                        className="overflow-hidden bg-[#0A0A0A]">
                        <p className="px-6 md:px-8 py-5 text-[13px] md:text-[14px] text-white/32 leading-[1.8]">{item.a}</p>
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

/* ─── cta strip ──────────────────────────────────────────────── */
function CTAStrip() {
  return (
    <section className="border-t border-white/[0.05] px-6 md:px-10 py-20 md:py-28">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <div className="relative rounded-2xl border border-white/[0.07] bg-[#0D0D0D] overflow-hidden px-8 md:px-14 py-12 md:py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            {/* subtle glow */}
            <div className="absolute right-0 top-0 w-[500px] h-[300px] bg-[#FF4500]/[0.04] rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/4" />
            <div className="relative">
              <p className="label-accent mb-4">3 Spots Left - Q2 2026</p>
              <h2 className="display text-[clamp(1.8rem,4vw,3rem)] text-white leading-[1.0]">
                Your competition<br />isn't waiting.
              </h2>
            </div>
            <button data-testid="cta-banner-button" onClick={() => go("apply")}
              className="relative flex-shrink-0 flex items-center gap-2 h-12 px-7 rounded-xl bg-[#FF4500] hover:bg-[#FF5500] text-white text-[14px] font-bold transition-colors active:scale-[0.97] shadow-[0_0_40px_rgba(255,69,0,0.18)]">
              Get a Free Audit <ArrowRight size={15} />
            </button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── apply ──────────────────────────────────────────────────── */
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

  const inputCls = "w-full h-11 px-4 rounded-xl bg-[#111] border border-white/[0.07] text-[14px] text-white placeholder-white/16 focus:outline-none focus:border-white/18 transition-colors";

  return (
    <section id="apply" className="border-t border-white/[0.05] px-6 md:px-10 py-24 md:py-36">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-24 items-start">

          {/* left */}
          <FadeIn>
            <p className="label-accent mb-6">Apply Now</p>
            <h2 className="display text-[clamp(2.8rem,5.5vw,4.5rem)] text-white mb-7">
              Ready to build<br />your system?
            </h2>
            <p className="text-[14px] md:text-[15px] text-white/35 leading-[1.8] mb-10 max-w-[360px]">
              Fill in the form. We'll audit your current setup for free and show you exactly what it takes to hit your target - no pressure, no hard sell.
            </p>

            <ul className="space-y-5 mb-12">
              {[
                { icon: <Clock size={13} />, text: "Reply within 24 hours" },
                { icon: <Shield size={13} />, text: "No hard sell - we only take on the right fit" },
                { icon: <Star size={13} />, text: "Free audit included with every application" },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-lg border border-white/[0.06] flex items-center justify-center text-white/25 flex-shrink-0">
                    {item.icon}
                  </div>
                  <span className="text-[13px] text-white/38">{item.text}</span>
                </li>
              ))}
            </ul>

            {/* founder photo + quote */}
            <div className="flex items-center gap-4 p-5 rounded-2xl border border-white/[0.05] bg-[#0D0D0D]">
              <img src={founderImg} alt="Founder"
                className="w-12 h-12 rounded-full object-cover object-top border border-white/[0.08] flex-shrink-0" />
              <div>
                <p className="text-[13px] text-white/50 italic leading-relaxed mb-1.5">
                  "Every coach who applies gets a real audit - not a sales pitch."
                </p>
                <p className="text-[11px] text-white/25 font-semibold">HustleCoreX Founder</p>
              </div>
            </div>
          </FadeIn>

          {/* form */}
          <FadeIn delay={0.1}>
            {done ? (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                className="border border-white/[0.05] rounded-2xl p-10 md:p-14 bg-[#0D0D0D] text-center" data-testid="apply-success">
                <div className="w-14 h-14 rounded-2xl bg-[#FF4500] flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={26} className="text-white" />
                </div>
                <h3 className="heading text-[1.4rem] text-white mb-3">Application Received</h3>
                <p className="text-[14px] text-white/32 leading-relaxed max-w-xs mx-auto">
                  We'll be in touch within 24 hours with your personalised free audit.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={form.handleSubmit(d => mut.mutate(d))}
                data-testid="apply-form"
                className="border border-white/[0.05] rounded-2xl p-6 md:p-8 bg-[#0D0D0D] space-y-5">
                <div className="mb-2">
                  <p className="heading text-[1.1rem] text-white">Free System Audit</p>
                  <p className="text-[12px] text-white/25 mt-1">2 minutes. No commitment required.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label block mb-2">Name</label>
                    <input {...form.register("name")} data-testid="input-name" placeholder="Your name" className={inputCls} />
                    {form.formState.errors.name && <p className="text-red-400/60 text-[11px] mt-1.5">{form.formState.errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="label block mb-2">Email</label>
                    <input {...form.register("email")} data-testid="input-email" type="email" placeholder="you@email.com" className={inputCls} />
                    {form.formState.errors.email && <p className="text-red-400/60 text-[11px] mt-1.5">{form.formState.errors.email.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="label block mb-2">Instagram</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/16 text-[13px] pointer-events-none">@</span>
                    <input {...form.register("instagram")} data-testid="input-instagram" placeholder="yourhandle" className={inputCls + " pl-7"} />
                  </div>
                </div>

                <div>
                  <label className="label block mb-2">Current Monthly Revenue</label>
                  <Controller control={form.control} name="currentRevenue" render={({ field }) => (
                    <select {...field} data-testid="select-revenue"
                      className={inputCls + " appearance-none cursor-pointer"}>
                      <option value="">Select range...</option>
                      <option value="0-2k">$0 – $2,000</option>
                      <option value="2k-5k">$2,000 – $5,000</option>
                      <option value="5k-10k">$5,000 – $10,000</option>
                      <option value="10k-20k">$10,000 – $20,000</option>
                      <option value="20k+">$20,000+</option>
                    </select>
                  )} />
                  {form.formState.errors.currentRevenue && <p className="text-red-400/60 text-[11px] mt-1.5">{form.formState.errors.currentRevenue.message}</p>}
                </div>

                <div>
                  <label className="label block mb-2">6-Month Revenue Goal</label>
                  <Controller control={form.control} name="goal" render={({ field }) => (
                    <select {...field} data-testid="select-goal"
                      className={inputCls + " appearance-none cursor-pointer"}>
                      <option value="">Select goal...</option>
                      <option value="10k">$10,000 / month</option>
                      <option value="20k">$20,000 / month</option>
                      <option value="50k">$50,000 / month</option>
                      <option value="100k+">$100,000+ / month</option>
                    </select>
                  )} />
                  {form.formState.errors.goal && <p className="text-red-400/60 text-[11px] mt-1.5">{form.formState.errors.goal.message}</p>}
                </div>

                <div>
                  <label className="label block mb-2">
                    Biggest Bottleneck
                    <span className="text-white/14 normal-case tracking-normal font-normal ml-2">(optional)</span>
                  </label>
                  <textarea {...form.register("message")} data-testid="input-message"
                    placeholder="What's holding you back right now?" rows={3}
                    className={inputCls + " h-auto py-3 resize-none leading-relaxed"} />
                </div>

                <button type="submit" data-testid="button-submit" disabled={mut.isPending}
                  className="w-full h-12 rounded-xl bg-[#FF4500] hover:bg-[#FF5500] active:scale-[0.97] text-white text-[14px] font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                  {mut.isPending
                    ? <><div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full" style={{ animation: "spin 0.7s linear infinite" }} />Submitting...</>
                    : <>Submit Application <ArrowRight size={14} /></>}
                </button>
                <p className="text-[11px] text-white/16 text-center">No spam. No hard sell. Just strategy.</p>
              </form>
            )}
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ─── footer ─────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-white/[0.05] px-6 md:px-10 pt-16 pb-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          <div className="col-span-2">
            <Logo />
            <p className="text-[13px] text-white/22 leading-[1.8] mt-4 max-w-[200px]">
              Setting the standard for online fitness coaches worldwide.
            </p>
            <div className="flex gap-2 mt-6">
              {[
                { icon: <Instagram size={13} />, id: "footer-instagram" },
                { icon: <Mail size={13} />, id: "footer-mail" },
              ].map(item => (
                <a key={item.id} href="#" data-testid={item.id}
                  className="w-8 h-8 rounded-xl border border-white/[0.06] flex items-center justify-center text-white/22 hover:text-white/45 hover:border-white/10 transition-colors">
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="label mb-5">Navigation</p>
            <div className="space-y-3">
              {[["system","System"],["results","Results"],["pricing","Pricing"],["apply","Apply"]].map(([id, label]) => (
                <button key={id} onClick={() => go(id)}
                  className="block text-[13px] text-white/22 hover:text-white/45 transition-colors">{label}</button>
              ))}
            </div>
          </div>

          <div>
            <p className="label mb-5">Contact</p>
            <div className="space-y-3">
              {[
                { icon: <Mail size={11} />, t: "hello@hustlecorex.io" },
                { icon: <Instagram size={11} />, t: "@hustlecorex" },
                { icon: <Clock size={11} />, t: "Mon–Fri · 9am–6pm GMT" },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-2.5 text-[12px] text-white/22">
                  <span className="text-white/16">{c.icon}</span>
                  {c.t}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.04] pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-white/14">© {new Date().getFullYear()} HustleCoreX. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-[11px] text-white/14 hover:text-white/30 transition-colors">Privacy</a>
            <a href="#" className="text-[11px] text-white/14 hover:text-white/30 transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── page ───────────────────────────────────────────────────── */
export default function Home() {
  return (
    <div className="min-h-screen bg-[#080808] overflow-x-hidden">
      <Nav />
      <Hero />
      <Ticker />
      <Problem />
      <System />
      <Results />
      <Pricing />
      <FAQ />
      <CTAStrip />
      <Apply />
      <Footer />
    </div>
  );
}
