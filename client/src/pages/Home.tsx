import { useState, useEffect, useRef } from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLeadSchema, type InsertLead } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import brandLogo from "@assets/2_20260308_091502_0001_1773131295500.png";
import {
  Zap, Target, TrendingUp, Users, CheckCircle2, ArrowRight, Star,
  Instagram, Globe, BarChart3, Layers, ChevronDown, Terminal,
  Rocket, Shield, Clock, Award, DollarSign, MessageSquare,
  Play, X, Menu, Mail, Phone, Sparkles, BrainCircuit, MousePointer2
} from "lucide-react";

const ORANGE = "#FF4500";

function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
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
    let start = 0;
    const duration = 2000;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      setCount(Math.floor(start));
      if (start >= end) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <nav
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-black/90 backdrop-blur-xl border-b border-white/5 py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollTo("hero")}>
          <div className="w-9 h-9 rounded-xl bg-[#FF4500] flex items-center justify-center font-mono text-white font-bold text-sm glow-orange-sm">
            &gt;_
          </div>
          <span className="font-bold text-white text-xl tracking-tight">APEX<span className="text-[#FF4500]">.</span></span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["system", "services", "results", "pricing", "apply"].map(item => (
            <button
              key={item}
              data-testid={`nav-${item}`}
              onClick={() => scrollTo(item)}
              className="text-sm text-white/60 hover:text-white transition-colors capitalize tracking-wide font-medium"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button
            data-testid="nav-cta"
            onClick={() => scrollTo("apply")}
            className="px-5 py-2.5 rounded-full bg-[#FF4500] hover:bg-[#FF5500] text-white text-sm font-semibold transition-all duration-200 glow-orange-sm hover:scale-105 active:scale-95"
          >
            Apply Now
          </button>
        </div>

        <button
          data-testid="mobile-menu-toggle"
          className="md:hidden text-white p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-black/95 border-t border-white/5 px-6 py-4 flex flex-col gap-4"
        >
          {["system", "services", "results", "pricing", "apply"].map(item => (
            <button
              key={item}
              onClick={() => scrollTo(item)}
              className="text-white/70 hover:text-white text-left capitalize text-base font-medium py-1"
            >
              {item}
            </button>
          ))}
          <button
            onClick={() => scrollTo("apply")}
            className="mt-2 px-5 py-3 rounded-full bg-[#FF4500] text-white font-semibold"
          >
            Apply Now
          </button>
        </motion.div>
      )}
    </nav>
  );
}

function HeroSection() {
  const words = ["COACHES.", "BRANDS.", "SYSTEMS.", "EMPIRES."];
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setWordIdx(i => (i + 1) % words.length), 2500);
    return () => clearInterval(t);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-60" />
      <div className="absolute inset-0 radial-glow-orange" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#FF4500]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FF4500]/30 bg-[#FF4500]/10 text-[#FF4500] text-sm font-semibold mb-8 tracking-widest uppercase"
          data-testid="hero-badge"
        >
          <span className="w-2 h-2 rounded-full bg-[#FF4500] animate-pulse" />
          The #1 Agency for Online Fitness Coaches
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight mb-6"
          data-testid="hero-headline"
        >
          WE DON'T JUST<br />
          GROW
          <span className="relative inline-block ml-4">
            <motion.span
              key={wordIdx}
              initial={{ opacity: 0, y: 20, rotateX: -40 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="gradient-text-orange text-glow-orange"
            >
              {words[wordIdx]}
            </motion.span>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto mb-10 leading-relaxed font-light"
          data-testid="hero-subheadline"
        >
          We build the complete automated system that turns online fitness coaches into
          <span className="text-white font-medium"> premium brands</span> — generating leads, nurturing them, and converting them on autopilot.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <button
            data-testid="hero-cta-primary"
            onClick={() => scrollTo("apply")}
            className="group flex items-center gap-3 px-8 py-4 rounded-full bg-[#FF4500] hover:bg-[#FF5500] text-white font-bold text-lg transition-all duration-200 glow-orange hover:scale-105 active:scale-95"
          >
            Apply For Your Free System Audit
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            data-testid="hero-cta-secondary"
            onClick={() => scrollTo("system")}
            className="flex items-center gap-3 px-8 py-4 rounded-full border border-white/15 text-white hover:border-white/30 font-semibold text-base transition-all duration-200 hover:bg-white/5"
          >
            <Play size={16} className="text-[#FF4500]" />
            See The System
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
        >
          {[
            { val: 150, suffix: "+", label: "Coaches Scaled" },
            { val: 12, suffix: "M+", prefix: "$", label: "Revenue Generated" },
            { val: 97, suffix: "%", label: "Client Retention" },
            { val: 90, suffix: "Days", label: "To Full System" },
          ].map((s, i) => (
            <div key={i} className="glass-card rounded-2xl p-4 stat-card" data-testid={`hero-stat-${i}`}>
              <div className="text-2xl md:text-3xl font-black text-white">
                <Counter end={s.val} suffix={s.suffix} prefix={s.prefix} />
              </div>
              <div className="text-white/50 text-xs mt-1 font-medium tracking-wide">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
        onClick={() => scrollTo("ticker")}
      >
        <span className="text-white/30 text-xs tracking-widest uppercase">Scroll</span>
        <ChevronDown size={16} className="text-[#FF4500] animate-bounce" />
      </motion.div>
    </section>
  );
}

function TickerSection() {
  const items = [
    "Lead Generation", "Premium Branding", "Website Design", "Sales Funnels",
    "Content Systems", "DM Automation", "Email Sequences", "Profile Optimization",
    "Client Onboarding", "Analytics Dashboard", "Ad Strategy", "Authority Building",
  ];

  return (
    <section id="ticker" className="py-5 border-y border-white/5 bg-black overflow-hidden">
      <div className="flex ticker-wrap">
        <div className="ticker-inner">
          {[...items, ...items].map((item, i) => (
            <span key={i} className="flex items-center gap-4 px-6 text-white/40 font-medium text-sm uppercase tracking-widest whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4500] flex-shrink-0" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  const problems = [
    {
      old: "Posting content hoping someone notices",
      new: "A targeted lead-gen machine running 24/7",
      icon: <Target size={20} />,
    },
    {
      old: "Looking like every other fitness coach",
      new: "A premium brand that commands premium prices",
      icon: <Award size={20} />,
    },
    {
      old: "Manually DMing and following up every day",
      new: "Automated nurture sequences that close for you",
      icon: <MessageSquare size={20} />,
    },
    {
      old: "A basic website that loses you clients",
      new: "A conversion machine that books calls on autopilot",
      icon: <Globe size={20} />,
    },
    {
      old: "5-10k/month stuck wondering why it's not scaling",
      new: "A predictable system hitting $30-100k/month",
      icon: <TrendingUp size={20} />,
    },
    {
      old: "Working in your business 12 hours a day",
      new: "Working on your business from a place of leverage",
      icon: <Clock size={20} />,
    },
  ];

  return (
    <section className="py-32 relative" id="problem">
      <div className="absolute inset-0 radial-glow-center opacity-50" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <AnimatedSection className="text-center mb-20">
          <span className="text-[#FF4500] text-sm font-bold tracking-widest uppercase">The Reality Check</span>
          <h2 className="text-4xl md:text-6xl font-black text-white mt-4 leading-tight">
            The Old Way Is<br />
            <span className="gradient-text-orange">Killing Your Business</span>
          </h2>
          <p className="text-white/50 text-xl mt-6 max-w-2xl mx-auto">
            Most online fitness coaches are grinding daily with no system. Here's what changes when you work with APEX.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((p, i) => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <div className="glass-card rounded-2xl p-6 hover:border-[#FF4500]/20 transition-all duration-300 group h-full" data-testid={`problem-card-${i}`}>
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[#FF4500]/10 border border-[#FF4500]/20 flex items-center justify-center text-[#FF4500] flex-shrink-0">
                    {p.icon}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <X size={14} className="text-red-400/70 mt-1 flex-shrink-0" />
                    <span className="text-white/40 text-sm line-through">{p.old}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={14} className="text-[#FF4500] mt-1 flex-shrink-0" />
                    <span className="text-white font-semibold text-sm group-hover:text-white/90">{p.new}</span>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function SystemSection() {
  const [active, setActive] = useState(0);

  const pillars = [
    {
      num: "01",
      title: "Premium Brand Identity",
      desc: "We architect your entire brand from the ground up — visual identity, messaging, positioning, and authority architecture that makes you the obvious choice in your market.",
      features: ["Brand Identity & Logo System", "Signature Color Palette & Typography", "Brand Voice & Messaging Framework", "Positioning Strategy", "Content Pillars & Authority Angles"],
      icon: <Sparkles size={24} />,
    },
    {
      num: "02",
      title: "High-Converting Website",
      desc: "Your website is your digital sales rep. We build a premium, fast, conversion-optimised site that qualifies, impresses, and books calls — while you sleep.",
      features: ["Custom Design (not templates)", "Sales-Optimised Copy", "Automated Booking System", "VSL Integration", "Mobile-First Performance"],
      icon: <Globe size={24} />,
    },
    {
      num: "03",
      title: "Lead Gen Machine",
      desc: "We build and activate a multi-channel lead generation system — organic, ads, and outbound working together to deliver a consistent pipeline of qualified prospects.",
      features: ["Instagram Profile Optimisation", "Content-to-DM Funnel", "Targeted Outreach Sequences", "Paid Ad Strategy", "Lead Magnet Creation"],
      icon: <Target size={24} />,
    },
    {
      num: "04",
      title: "Automated Nurture System",
      desc: "Using AutoNation, we connect every tool and touchpoint into one seamless system — emails, DMs, follow-ups, and onboarding all running without you lifting a finger.",
      features: ["Full CRM Integration", "Automated Email Sequences", "DM Automation Flows", "Lead Scoring & Segmentation", "Booking & Onboarding Automation"],
      icon: <BrainCircuit size={24} />,
    },
    {
      num: "05",
      title: "Analytics & Optimisation",
      desc: "You can't scale what you can't see. We install a complete analytics layer so you know exactly what's working, what to double down on, and where your next clients are coming from.",
      features: ["Unified Analytics Dashboard", "Revenue Attribution", "Conversion Rate Tracking", "Weekly Performance Reports", "Continuous A/B Testing"],
      icon: <BarChart3 size={24} />,
    },
  ];

  return (
    <section id="system" className="py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FF4500]/3 to-transparent" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <AnimatedSection className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FF4500]/30 bg-[#FF4500]/10 text-[#FF4500] text-sm font-bold mb-6 tracking-widest uppercase">
            <Terminal size={14} /> The APEX System
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
            One System.<br />
            <span className="gradient-text-orange">Infinite Leverage.</span>
          </h2>
          <p className="text-white/50 text-xl mt-6 max-w-2xl mx-auto">
            We don't do isolated fixes. We build the complete infrastructure that turns your expertise into a scalable, automated business.
          </p>
        </AnimatedSection>

        <div className="grid lg:grid-cols-5 gap-4 mb-6">
          {pillars.map((p, i) => (
            <button
              key={i}
              data-testid={`system-tab-${i}`}
              onClick={() => setActive(i)}
              className={`p-4 rounded-2xl border text-left transition-all duration-300 ${
                active === i
                  ? "border-[#FF4500]/40 bg-[#FF4500]/10 glow-orange-sm"
                  : "border-white/8 bg-white/3 hover:border-white/15"
              }`}
            >
              <div className={`text-sm font-mono mb-2 ${active === i ? "text-[#FF4500]" : "text-white/30"}`}>{p.num}</div>
              <div className={`font-bold text-sm leading-tight ${active === i ? "text-white" : "text-white/60"}`}>{p.title}</div>
            </button>
          ))}
        </div>

        <AnimatedSection>
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-card-orange rounded-3xl p-8 md:p-12"
            data-testid="system-content"
          >
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#FF4500]/20 border border-[#FF4500]/30 flex items-center justify-center text-[#FF4500] mb-6">
                  {pillars[active].icon}
                </div>
                <h3 className="text-3xl font-black text-white mb-4">{pillars[active].title}</h3>
                <p className="text-white/60 text-lg leading-relaxed">{pillars[active].desc}</p>
              </div>
              <div className="space-y-3">
                {pillars[active].features.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/8"
                  >
                    <CheckCircle2 size={16} className="text-[#FF4500] flex-shrink-0" />
                    <span className="text-white/80 text-sm font-medium">{f}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function ServicesSection() {
  const services = [
    {
      icon: <Sparkles size={28} />,
      title: "Premium Branding",
      desc: "Full brand identity system — logo, colours, typography, positioning, and the story that makes clients choose you over everyone else.",
      tags: ["Identity Design", "Positioning", "Messaging"],
    },
    {
      icon: <Globe size={28} />,
      title: "Elite Website Build",
      desc: "Custom-designed, conversion-optimised website with integrated booking, VSL, and social proof that sells while you sleep.",
      tags: ["Custom Design", "Copywriting", "CRO"],
    },
    {
      icon: <Target size={28} />,
      title: "Lead Generation System",
      desc: "Multi-channel approach combining Instagram optimisation, content funnels, strategic outreach, and paid acquisition.",
      tags: ["Instagram", "Ads", "Outreach"],
    },
    {
      icon: <BrainCircuit size={28} />,
      title: "AutoNation Integration",
      desc: "We connect all your tools into one automated system — DMs, emails, follow-ups, and onboarding — removing you from the daily grind.",
      tags: ["Automation", "CRM", "AI"],
    },
    {
      icon: <Instagram size={28} />,
      title: "Social Profile Overhaul",
      desc: "Transform your Instagram and social profiles into lead-generating assets that attract premium clients with every piece of content.",
      tags: ["Instagram", "Profile", "Content"],
    },
    {
      icon: <BarChart3 size={28} />,
      title: "Growth Analytics",
      desc: "Complete visibility into your pipeline. Know exactly where your leads come from, where they drop off, and how to fix it.",
      tags: ["Analytics", "Reporting", "Optimisation"],
    },
  ];

  return (
    <section id="services" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection className="text-center mb-20">
          <span className="text-[#FF4500] text-sm font-bold tracking-widest uppercase">What We Build</span>
          <h2 className="text-4xl md:text-6xl font-black text-white mt-4">
            Every Weapon in<br />
            <span className="gradient-text-orange">Your Arsenal</span>
          </h2>
          <p className="text-white/50 text-xl mt-6 max-w-xl mx-auto">
            Six interconnected services. One mission — scale your coaching business.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <AnimatedSection key={i} delay={i * 0.08}>
              <div
                data-testid={`service-card-${i}`}
                className="glass-card rounded-2xl p-7 group hover:border-[#FF4500]/25 transition-all duration-300 hover:-translate-y-1 cursor-default h-full flex flex-col"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#FF4500]/10 border border-[#FF4500]/20 flex items-center justify-center text-[#FF4500] mb-5 group-hover:bg-[#FF4500]/20 group-hover:glow-orange-sm transition-all duration-300">
                  {s.icon}
                </div>
                <h3 className="text-xl font-black text-white mb-3">{s.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-5 flex-1">{s.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {s.tags.map((t, j) => (
                    <span key={j} className="px-3 py-1 rounded-full bg-[#FF4500]/8 border border-[#FF4500]/15 text-[#FF4500] text-xs font-semibold tracking-wide">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  const steps = [
    {
      num: "01",
      title: "Free System Audit",
      desc: "We analyse your current setup, identify the exact gaps in your funnel, and map out what's needed to hit your income goals.",
      duration: "Day 1–3",
      icon: <BrainCircuit size={20} />,
    },
    {
      num: "02",
      title: "Custom Strategy Build",
      desc: "We create your complete growth strategy — brand positioning, lead gen channels, automation map, and 90-day revenue roadmap.",
      duration: "Day 4–10",
      icon: <Layers size={20} />,
    },
    {
      num: "03",
      title: "Brand & Website Launch",
      desc: "We execute the brand identity and build your premium website. You'll look like a $100k/year coach from day one.",
      duration: "Day 11–30",
      icon: <Globe size={20} />,
    },
    {
      num: "04",
      title: "System Activation",
      desc: "We launch your lead gen machine and activate all automations through AutoNation. The system starts generating and nurturing leads.",
      duration: "Day 31–60",
      icon: <Zap size={20} />,
    },
    {
      num: "05",
      title: "Scale & Optimise",
      desc: "With data flowing in, we double down on what's working and cut what isn't — scaling your revenue predictably month over month.",
      duration: "Day 61–90+",
      icon: <TrendingUp size={20} />,
    },
  ];

  return (
    <section className="py-32 relative bg-gradient-to-b from-transparent via-black/50 to-transparent">
      <div className="max-w-5xl mx-auto px-6">
        <AnimatedSection className="text-center mb-20">
          <span className="text-[#FF4500] text-sm font-bold tracking-widest uppercase">The Journey</span>
          <h2 className="text-4xl md:text-6xl font-black text-white mt-4">
            From Zero to System<br />
            <span className="gradient-text-orange">In 90 Days</span>
          </h2>
        </AnimatedSection>

        <div className="relative">
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#FF4500]/50 via-[#FF4500]/20 to-transparent md:-translate-x-px" />

          <div className="space-y-12">
            {steps.map((step, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className={`flex gap-8 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} items-center`} data-testid={`process-step-${i}`}>
                  <div className={`hidden md:block flex-1 ${i % 2 === 0 ? "text-right" : "text-left"}`}>
                    {i % 2 === 0 ? (
                      <div className={`${i % 2 === 0 ? "ml-auto" : ""} max-w-xs`}>
                        <div className="text-[#FF4500] text-xs font-bold tracking-widest uppercase mb-2">{step.duration}</div>
                        <h3 className="text-xl font-black text-white mb-2">{step.title}</h3>
                        <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
                      </div>
                    ) : null}
                  </div>

                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-[#FF4500] border-4 border-background flex items-center justify-center text-white glow-orange-sm z-10 relative">
                      {step.icon}
                    </div>
                  </div>

                  <div className={`flex-1 ${i % 2 === 0 ? "" : "md:text-right"}`}>
                    <div className="md:hidden mb-1">
                      <div className="text-[#FF4500] text-xs font-bold tracking-widest uppercase">{step.duration}</div>
                    </div>
                    <div className={`${i % 2 === 0 ? "md:hidden" : ""}`}>
                      <h3 className="text-xl font-black text-white mb-2">{step.title}</h3>
                      <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                    {i % 2 !== 0 && (
                      <div className="hidden md:block">
                        <div className="text-[#FF4500] text-xs font-bold tracking-widest uppercase mb-2">{step.duration}</div>
                        <h3 className="text-xl font-black text-white mb-2 md:text-right">{step.title}</h3>
                        <p className="text-white/50 text-sm leading-relaxed md:text-right">{step.desc}</p>
                      </div>
                    )}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultsSection() {
  const results = [
    {
      name: "James Carter",
      niche: "Fat Loss Coach",
      avatar: "JC",
      before: "$4,200/mo",
      after: "$31,500/mo",
      timeframe: "4 months",
      quote: "APEX didn't just help me get more clients — they built me a real business. My brand looks elite, my system runs 24/7, and I've finally broken past $30k.",
      metric: "650%",
      metricLabel: "Revenue Increase",
    },
    {
      name: "Sarah Mitchell",
      niche: "Online PT & Nutrition",
      avatar: "SM",
      before: "$7,800/mo",
      after: "$52,000/mo",
      timeframe: "6 months",
      quote: "Before APEX I was posting content praying it would convert. Now I have a machine. My website books 3-5 calls a day without me doing anything.",
      metric: "567%",
      metricLabel: "Revenue Increase",
    },
    {
      name: "Marcus Reid",
      niche: "Strength & Performance",
      avatar: "MR",
      before: "$2,900/mo",
      after: "$18,400/mo",
      timeframe: "3 months",
      quote: "The brand overhaul alone was worth 10x the investment. People reach out saying they've been following me for months. The automations close them.",
      metric: "534%",
      metricLabel: "Revenue Increase",
    },
    {
      name: "Priya Sharma",
      niche: "Female Transformation",
      avatar: "PS",
      before: "$8,500/mo",
      after: "$67,000/mo",
      timeframe: "5 months",
      quote: "I went from burnout to running a 7-figure business. APEX's system handles lead gen, follow-up, and onboarding. I just coach my premium clients.",
      metric: "688%",
      metricLabel: "Revenue Increase",
    },
  ];

  return (
    <section id="results" className="py-32 relative">
      <div className="absolute inset-0 radial-glow-orange opacity-30" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <AnimatedSection className="text-center mb-20">
          <span className="text-[#FF4500] text-sm font-bold tracking-widest uppercase">Proof</span>
          <h2 className="text-4xl md:text-6xl font-black text-white mt-4">
            Coaches We've<br />
            <span className="gradient-text-orange">Transformed</span>
          </h2>
          <p className="text-white/50 text-xl mt-6 max-w-xl mx-auto">
            Real results. Real coaches. Real systems.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {results.map((r, i) => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <div
                data-testid={`result-card-${i}`}
                className="glass-card rounded-2xl p-7 hover:border-[#FF4500]/20 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF4500] to-[#FF7700] flex items-center justify-center text-white font-black text-sm">
                      {r.avatar}
                    </div>
                    <div>
                      <div className="text-white font-bold">{r.name}</div>
                      <div className="text-white/40 text-sm">{r.niche}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#FF4500] font-black text-2xl">{r.metric}</div>
                    <div className="text-white/40 text-xs">{r.metricLabel}</div>
                  </div>
                </div>

                <blockquote className="text-white/70 text-sm leading-relaxed mb-6 italic border-l-2 border-[#FF4500]/40 pl-4">
                  "{r.quote}"
                </blockquote>

                <div className="grid grid-cols-3 gap-3">
                  <div className="glass-card-orange rounded-xl p-3 text-center">
                    <div className="text-white/40 text-xs mb-1">Before</div>
                    <div className="text-white font-bold text-sm">{r.before}</div>
                  </div>
                  <div className="flex items-center justify-center">
                    <ArrowRight size={16} className="text-[#FF4500]" />
                  </div>
                  <div className="rounded-xl p-3 text-center" style={{ background: "rgba(255,69,0,0.12)", border: "1px solid rgba(255,69,0,0.2)" }}>
                    <div className="text-white/40 text-xs mb-1">After</div>
                    <div className="text-[#FF4500] font-black text-sm">{r.after}</div>
                  </div>
                </div>

                <div className="mt-3 text-center text-white/30 text-xs">
                  Achieved in {r.timeframe}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { val: 150, suffix: "+", label: "Coaches Scaled", sub: "and counting" },
              { val: 12, prefix: "$", suffix: "M+", label: "Revenue Generated", sub: "for our clients" },
              { val: 90, suffix: "%", label: "Hit $20k+/month", sub: "within 6 months" },
              { val: 4.9, suffix: "/5", label: "Average Rating", sub: "from 140+ reviews" },
            ].map((s, i) => (
              <div key={i} className="glass-card-orange rounded-2xl p-6 text-center stat-card" data-testid={`results-stat-${i}`}>
                <div className="text-3xl md:text-4xl font-black text-white mb-1">
                  {s.val === 4.9 ? "4.9" : <Counter end={s.val} suffix={s.suffix} prefix={s.prefix} />}
                  {s.val !== 4.9 ? "" : s.suffix}
                </div>
                <div className="text-white font-semibold text-sm mb-1">{s.label}</div>
                <div className="text-white/30 text-xs">{s.sub}</div>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function PricingSection() {
  const plans = [
    {
      name: "Launchpad",
      price: "2,497",
      period: "one-time",
      desc: "Perfect for coaches under $5k/month who need the foundations.",
      features: [
        "Brand Identity Package",
        "Instagram Profile Overhaul",
        "Lead Gen Strategy Session",
        "Content Framework (30 Days)",
        "DM Script Library",
        "Onboarding Workflow Template",
      ],
      notIncluded: ["Website Build", "AutoNation Setup", "Done-For-You Automation"],
      highlight: false,
      badge: null,
      cta: "Get Started",
    },
    {
      name: "Growth System",
      price: "4,997",
      period: "one-time",
      desc: "The complete system for coaches ready to break $20k+/month.",
      features: [
        "Everything in Launchpad",
        "Premium Website Build",
        "Sales Funnel & Booking System",
        "AutoNation Full Integration",
        "Email & DM Automation",
        "3-Month Strategy Support",
        "Analytics Dashboard Setup",
        "Weekly Performance Reviews",
      ],
      notIncluded: [],
      highlight: true,
      badge: "Most Popular",
      cta: "Apply Now",
    },
    {
      name: "Empire",
      price: "Custom",
      period: "investment",
      desc: "For coaches at $20k+ who want to scale to $100k/month and beyond.",
      features: [
        "Everything in Growth System",
        "Bespoke Brand Campaign",
        "Full Ad Account Management",
        "Dedicated Growth Strategist",
        "PR & Authority Building",
        "Team Systems & Hiring Support",
        "Monthly Strategy Calls",
        "Priority 24/7 Support",
      ],
      notIncluded: [],
      highlight: false,
      badge: "For 6-Figure Coaches",
      cta: "Book a Call",
    },
  ];

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="pricing" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection className="text-center mb-20">
          <span className="text-[#FF4500] text-sm font-bold tracking-widest uppercase">Investment</span>
          <h2 className="text-4xl md:text-6xl font-black text-white mt-4">
            Simple, Transparent<br />
            <span className="gradient-text-orange">Pricing</span>
          </h2>
          <p className="text-white/50 text-xl mt-6 max-w-xl mx-auto">
            No retainers. No hidden fees. You pay for the system once, and it works for you forever.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <div
                data-testid={`pricing-card-${i}`}
                className={`rounded-2xl p-7 flex flex-col h-full transition-all duration-300 ${
                  plan.highlight
                    ? "bg-gradient-to-b from-[#FF4500]/15 to-[#FF4500]/5 border border-[#FF4500]/40 glow-orange-sm"
                    : "glass-card hover:border-white/15"
                }`}
              >
                {plan.badge && (
                  <div className={`inline-flex self-start px-3 py-1 rounded-full text-xs font-bold mb-4 ${
                    plan.highlight
                      ? "bg-[#FF4500] text-white"
                      : "bg-white/10 text-white/60 border border-white/10"
                  }`}>
                    {plan.badge}
                  </div>
                )}

                <div className="mb-6">
                  <div className="text-white font-black text-xl mb-1">{plan.name}</div>
                  <div className="flex items-baseline gap-2 mb-3">
                    {plan.price !== "Custom" && <span className="text-white/40 text-xl">$</span>}
                    <span className={`font-black text-4xl ${plan.highlight ? "text-[#FF4500] text-glow-orange" : "text-white"}`}>
                      {plan.price}
                    </span>
                    <span className="text-white/40 text-sm">/ {plan.period}</span>
                  </div>
                  <p className="text-white/50 text-sm">{plan.desc}</p>
                </div>

                <div className="flex-1 space-y-2.5 mb-8">
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex items-start gap-2.5">
                      <CheckCircle2 size={14} className={`mt-0.5 flex-shrink-0 ${plan.highlight ? "text-[#FF4500]" : "text-[#FF4500]/70"}`} />
                      <span className="text-white/75 text-sm">{f}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((f, j) => (
                    <div key={j} className="flex items-start gap-2.5 opacity-40">
                      <X size={14} className="mt-0.5 flex-shrink-0 text-white/30" />
                      <span className="text-white/40 text-sm line-through">{f}</span>
                    </div>
                  ))}
                </div>

                <button
                  data-testid={`pricing-cta-${i}`}
                  onClick={() => scrollTo("apply")}
                  className={`w-full py-3.5 rounded-full font-bold text-sm transition-all duration-200 ${
                    plan.highlight
                      ? "bg-[#FF4500] hover:bg-[#FF5500] text-white glow-orange-sm hover:scale-105 active:scale-95"
                      : "border border-white/15 text-white hover:border-white/30 hover:bg-white/5"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection>
          <div className="mt-10 p-6 rounded-2xl border border-white/8 bg-white/3 text-center">
            <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
              <Shield size={16} className="text-[#FF4500]" />
              All packages include a 30-day results guarantee. If we don't deliver, you don't pay.
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  const faqs = [
    {
      q: "How quickly will I see results?",
      a: "Most clients see their first wave of new leads within 2-3 weeks of system activation. Full results compound over 60-90 days as the automation sequences mature and your brand gains authority.",
    },
    {
      q: "Do I need to already have a big following?",
      a: "No. We've built systems for coaches starting from 0 followers. The system works on quality, not quantity — we target the right people, not just more people.",
    },
    {
      q: "What is AutoNation and how does it work?",
      a: "AutoNation is the automation backbone we use to connect every tool in your stack — your CRM, email platform, Instagram DMs, booking system, and onboarding. Once set up, leads move through your entire funnel without you touching anything.",
    },
    {
      q: "How is this different from hiring a social media manager?",
      a: "A social media manager creates content. We build a complete system — brand, website, lead generation, automation, and analytics. We're the difference between having a marketing employee and having a marketing machine.",
    },
    {
      q: "Do you offer ongoing support after the system is built?",
      a: "Yes. All packages include onboarding and setup support. Growth System includes 3 months of strategy support, and the Empire package includes dedicated ongoing management.",
    },
    {
      q: "What if my niche is very specific?",
      a: "Good. The more specific your niche, the more powerful the system. We've built systems for powerlifting coaches, menopause fitness coaches, high-performance executives, new mums, and everything in between.",
    },
  ];

  return (
    <section className="py-32 relative">
      <div className="max-w-3xl mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white">
            Frequently Asked<br />
            <span className="gradient-text-orange">Questions</span>
          </h2>
        </AnimatedSection>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <AnimatedSection key={i} delay={i * 0.05}>
              <div
                data-testid={`faq-item-${i}`}
                className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${open === i ? "border-[#FF4500]/20" : ""}`}
              >
                <button
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 group"
                  onClick={() => setOpen(open === i ? null : i)}
                  data-testid={`faq-toggle-${i}`}
                >
                  <span className="font-semibold text-white group-hover:text-[#FF4500] transition-colors">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: open === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={18} className={open === i ? "text-[#FF4500]" : "text-white/30"} />
                  </motion.div>
                </button>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-5"
                  >
                    <p className="text-white/55 text-sm leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function ApplySection() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<InsertLead>({
    resolver: zodResolver(insertLeadSchema.extend({
      name: insertLeadSchema.shape.name.min(2, "Name is required"),
      email: insertLeadSchema.shape.email.email("Valid email required"),
      currentRevenue: insertLeadSchema.shape.currentRevenue.min(1, "Required"),
      goal: insertLeadSchema.shape.goal.min(1, "Required"),
    })),
    defaultValues: {
      name: "",
      email: "",
      instagram: "",
      currentRevenue: "",
      goal: "",
      message: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: InsertLead) => apiRequest("POST", "/api/leads", data),
    onSuccess: () => {
      setSubmitted(true);
      toast({ title: "Application received!", description: "We'll be in touch within 24 hours." });
    },
    onError: () => {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    },
  });

  const onSubmit = form.handleSubmit((data) => mutation.mutate(data));

  return (
    <section id="apply" className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 radial-glow-orange opacity-40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#FF4500]/8 blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <AnimatedSection>
            <span className="text-[#FF4500] text-sm font-bold tracking-widest uppercase">Apply Today</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mt-4 leading-tight">
              Ready to Build<br />
              Your <span className="gradient-text-orange">Empire?</span>
            </h2>
            <p className="text-white/55 text-lg mt-5 leading-relaxed">
              Fill out the form and we'll do a free audit of your current setup — identifying exactly what's holding you back and what it'll take to hit your goals.
            </p>

            <div className="mt-8 space-y-4">
              {[
                { icon: <Clock size={16} />, text: "Response within 24 hours" },
                { icon: <Shield size={16} />, text: "No pressure, no hard sell" },
                { icon: <Star size={16} />, text: "Free system audit included" },
                { icon: <Award size={16} />, text: "30-day results guarantee" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-white/60 text-sm">
                  <div className="w-7 h-7 rounded-full bg-[#FF4500]/15 border border-[#FF4500]/20 flex items-center justify-center text-[#FF4500]">
                    {item.icon}
                  </div>
                  {item.text}
                </div>
              ))}
            </div>

            <div className="mt-10 p-5 rounded-2xl glass-card-orange">
              <div className="flex -space-x-2 mb-3">
                {["JC", "SM", "MR", "PS", "TK"].map((av, i) => (
                  <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF4500] to-[#FF7700] border-2 border-background flex items-center justify-center text-white text-xs font-black">
                    {av}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1 mb-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={13} className="text-[#FF4500] fill-[#FF4500]" />)}
              </div>
              <p className="text-white/60 text-xs">Joined by 150+ coaches who have scaled past $20k/month</p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card-orange rounded-3xl p-10 text-center"
                data-testid="apply-success"
              >
                <div className="w-16 h-16 rounded-full bg-[#FF4500] flex items-center justify-center mx-auto mb-6 glow-orange">
                  <CheckCircle2 size={30} className="text-white" />
                </div>
                <h3 className="text-2xl font-black text-white mb-3">Application Received!</h3>
                <p className="text-white/60 text-sm">
                  We'll review your application and reach out within 24 hours with your free system audit.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={onSubmit} className="glass-card rounded-3xl p-8 space-y-5" data-testid="apply-form">
                <h3 className="text-xl font-black text-white mb-2">Get Your Free System Audit</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/50 text-xs font-medium mb-2 uppercase tracking-wide">Full Name *</label>
                    <input
                      {...form.register("name")}
                      data-testid="input-name"
                      placeholder="Your name"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#FF4500]/50 focus:bg-[#FF4500]/5 transition-all"
                    />
                    {form.formState.errors.name && (
                      <p className="text-red-400 text-xs mt-1">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs font-medium mb-2 uppercase tracking-wide">Email *</label>
                    <input
                      {...form.register("email")}
                      data-testid="input-email"
                      type="email"
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#FF4500]/50 focus:bg-[#FF4500]/5 transition-all"
                    />
                    {form.formState.errors.email && (
                      <p className="text-red-400 text-xs mt-1">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-white/50 text-xs font-medium mb-2 uppercase tracking-wide">Instagram Handle</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">@</span>
                    <input
                      {...form.register("instagram")}
                      data-testid="input-instagram"
                      placeholder="yourhandle"
                      className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#FF4500]/50 focus:bg-[#FF4500]/5 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/50 text-xs font-medium mb-2 uppercase tracking-wide">Current Monthly Revenue *</label>
                  <select
                    {...form.register("currentRevenue")}
                    data-testid="select-revenue"
                    className="w-full px-4 py-3 rounded-xl bg-[#111] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF4500]/50 transition-all appearance-none"
                  >
                    <option value="" className="bg-[#111]">Select range...</option>
                    <option value="0-2k" className="bg-[#111]">$0 – $2,000/month</option>
                    <option value="2k-5k" className="bg-[#111]">$2,000 – $5,000/month</option>
                    <option value="5k-10k" className="bg-[#111]">$5,000 – $10,000/month</option>
                    <option value="10k-20k" className="bg-[#111]">$10,000 – $20,000/month</option>
                    <option value="20k+" className="bg-[#111]">$20,000+/month</option>
                  </select>
                  {form.formState.errors.currentRevenue && (
                    <p className="text-red-400 text-xs mt-1">{form.formState.errors.currentRevenue.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white/50 text-xs font-medium mb-2 uppercase tracking-wide">6-Month Revenue Goal *</label>
                  <select
                    {...form.register("goal")}
                    data-testid="select-goal"
                    className="w-full px-4 py-3 rounded-xl bg-[#111] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF4500]/50 transition-all appearance-none"
                  >
                    <option value="" className="bg-[#111]">Select goal...</option>
                    <option value="10k" className="bg-[#111]">$10,000/month</option>
                    <option value="20k" className="bg-[#111]">$20,000/month</option>
                    <option value="50k" className="bg-[#111]">$50,000/month</option>
                    <option value="100k+" className="bg-[#111]">$100,000+/month</option>
                  </select>
                  {form.formState.errors.goal && (
                    <p className="text-red-400 text-xs mt-1">{form.formState.errors.goal.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white/50 text-xs font-medium mb-2 uppercase tracking-wide">Biggest Challenge (optional)</label>
                  <textarea
                    {...form.register("message")}
                    data-testid="input-message"
                    placeholder="What's your biggest obstacle right now?"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#FF4500]/50 focus:bg-[#FF4500]/5 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  data-testid="button-submit"
                  disabled={mutation.isPending}
                  className="w-full py-4 rounded-full bg-[#FF4500] hover:bg-[#FF5500] text-white font-bold text-base transition-all duration-200 glow-orange hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {mutation.isPending ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Get My Free Audit
                      <Rocket size={18} />
                    </>
                  )}
                </button>

                <p className="text-white/25 text-xs text-center">
                  No spam. No pressure. Just strategy.
                </p>
              </form>
            )}
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

function CTABanner() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <section className="py-6 section-divider">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection>
          <div className="relative rounded-3xl overflow-hidden p-12 md:p-16 text-center" style={{
            background: "linear-gradient(135deg, rgba(255,69,0,0.15) 0%, rgba(255,69,0,0.05) 50%, rgba(255,69,0,0.12) 100%)",
            border: "1px solid rgba(255,69,0,0.25)"
          }}>
            <div className="absolute inset-0 grid-pattern opacity-30" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#FF4500]/10 blur-[80px]" />
            <div className="relative z-10">
              <div className="text-[#FF4500] text-sm font-bold tracking-widest uppercase mb-4">Limited Spots Available</div>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-4">
                Your Competition<br />Won't Wait
              </h2>
              <p className="text-white/55 text-xl mb-8 max-w-xl mx-auto">
                Every day without a system is a day you're leaving money on the table. Get your free audit and see exactly what's possible.
              </p>
              <button
                data-testid="cta-banner-button"
                onClick={() => scrollTo("apply")}
                className="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-[#FF4500] hover:bg-[#FF5500] text-white font-black text-lg transition-all duration-200 glow-orange hover:scale-105 active:scale-95"
              >
                Apply For Free Audit
                <ArrowRight size={20} />
              </button>
              <div className="mt-5 text-white/30 text-sm">
                Only taking 5 new clients per month
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function Footer() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <footer className="pt-16 pb-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[#FF4500] flex items-center justify-center font-mono text-white font-bold text-sm">
                &gt;_
              </div>
              <span className="font-bold text-white text-xl tracking-tight">APEX<span className="text-[#FF4500]">.</span></span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              The #1 agency for online fitness coaches who want systems, premium branding, and predictable scale.
            </p>
            <div className="flex items-center gap-4 mt-5">
              <a href="#" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-[#FF4500] hover:border-[#FF4500]/40 transition-colors" data-testid="footer-instagram">
                <Instagram size={15} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-[#FF4500] hover:border-[#FF4500]/40 transition-colors" data-testid="footer-mail">
                <Mail size={15} />
              </a>
            </div>
          </div>

          <div>
            <div className="text-white font-semibold text-sm mb-4 tracking-wide">Navigation</div>
            <div className="space-y-2.5">
              {[["system", "The System"], ["services", "Services"], ["results", "Results"], ["pricing", "Pricing"], ["apply", "Apply"]].map(([id, label]) => (
                <button key={id} onClick={() => scrollTo(id)} className="block text-white/40 hover:text-white text-sm transition-colors">
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-white font-semibold text-sm mb-4 tracking-wide">Get In Touch</div>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-white/40 text-sm">
                <Mail size={13} className="text-[#FF4500]" />
                hello@apexcoaching.io
              </div>
              <div className="flex items-center gap-2 text-white/40 text-sm">
                <Instagram size={13} className="text-[#FF4500]" />
                @apexcoachingagency
              </div>
              <div className="flex items-center gap-2 text-white/40 text-sm">
                <Clock size={13} className="text-[#FF4500]" />
                Mon–Fri, 9am–6pm GMT
              </div>
            </div>
          </div>
        </div>

        <div className="section-divider mb-6" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-white/25 text-xs">
            © {new Date().getFullYear()} APEX Coaching Agency. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-white/25 hover:text-white/50 text-xs transition-colors">Privacy Policy</a>
            <a href="#" className="text-white/25 hover:text-white/50 text-xs transition-colors">Terms of Service</a>
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
      <HeroSection />
      <TickerSection />
      <ProblemSection />
      <SystemSection />
      <ServicesSection />
      <ProcessSection />
      <ResultsSection />
      <PricingSection />
      <FAQSection />
      <CTABanner />
      <ApplySection />
      <Footer />
    </div>
  );
}
