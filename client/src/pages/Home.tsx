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
import heroImg from "@assets/generated_images/hero_coach.png";
import coach1Img from "@assets/580868512_17843744343613829_22300884961125480_n_1773149974233.jpg";
import coach2Img from "@assets/626956249_18573276355036228_693123345985490863_n_1773149974233.jpg";
import coach3Img from "@assets/637758797_17889993744428899_7709878898914652022_n_1773149974234.jpg";
import coach4Img from "@assets/641246630_18408593131131876_4631414787526160229_n_1773149974234.jpg";

/* ─── animation constants ─────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1] as const;

const childVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.62, ease: EASE } },
};
const childVariantsScale = {
  hidden: { opacity: 0, y: 18, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.62, ease: EASE } },
};
const childVariantsLeft = {
  hidden: { opacity: 0, x: -22 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.62, ease: EASE } },
};
const childVariantsRight = {
  hidden: { opacity: 0, x: 22 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.62, ease: EASE } },
};

function staggerContainer(stagger = 0.08, delay = 0) {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };
}

/* ─── utils ─────────────────────────────────────────────────── */
function FadeIn({ children, className = "", delay = 0, from = "below" }: {
  children: React.ReactNode; className?: string; delay?: number;
  from?: "below" | "left" | "right" | "scale";
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const variants = { below: childVariants, left: childVariantsLeft, right: childVariantsRight, scale: childVariantsScale };
  return (
    <motion.div ref={ref} className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants[from]}
      transition={{ delay }}>
      {children}
    </motion.div>
  );
}

/* ─── scroll progress bar ─────────────────────────────────────── */
function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setPct(max > 0 ? (window.scrollY / max) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 z-[300] h-[2px] pointer-events-none"
      style={{
        width: `${pct}%`,
        background: "linear-gradient(90deg, #FF4500, #FF7A00)",
        boxShadow: "0 0 8px rgba(255,69,0,0.55)",
        transition: "width 0.08s linear",
      }} />
  );
}

/* ─── page ambient ───────────────────────────────────────────── */
function PageAmbient() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="absolute -top-[20%] -right-[10%] w-[55vw] h-[55vw] max-w-[680px] max-h-[680px]"
        style={{
          background: "radial-gradient(circle, rgba(255,69,0,0.055) 0%, transparent 65%)",
          animation: "orb-float-1 28s ease-in-out infinite",
        }} />
      <div className="absolute bottom-[10%] -left-[8%] w-[45vw] h-[45vw] max-w-[560px] max-h-[560px]"
        style={{
          background: "radial-gradient(circle, rgba(255,100,0,0.035) 0%, transparent 65%)",
          animation: "orb-float-2 38s ease-in-out infinite",
        }} />
    </div>
  );
}

/* ─── intro overlay ──────────────────────────────────────────── */
function IntroOverlay() {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGone(true), 650);
    return () => clearTimeout(t);
  }, []);
  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          className="fixed inset-0 z-[200] bg-[#080808] flex items-center justify-center pointer-events-none"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: EASE }}>
          <motion.img
            src={logoImg} alt="HustleCoreX"
            className="w-12 h-12 object-contain"
            initial={{ opacity: 0, scale: 0.7, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.15, filter: "blur(4px)" }}
            transition={{ duration: 0.38, ease: EASE }} />
        </motion.div>
      )}
    </AnimatePresence>
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
    <motion.header data-testid="navbar"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.85, ease: EASE }}
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
    </motion.header>
  );
}

/* ─── network animation ──────────────────────────────────────── */
function NetworkAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;
    const isMob = () => W() < 768;
    const count = () => isMob() ? 38 : 70;
    const connDist = () => isMob() ? 110 : 148;

    interface Node { x: number; y: number; vx: number; vy: number; r: number; special: boolean; phase: number; phaseSpeed: number; }
    interface Packet { fi: number; ti: number; t: number; speed: number; }

    let nodes: Node[] = [];
    let packets: Packet[] = [];

    const init = () => {
      nodes = Array.from({ length: count() }, () => ({
        x: Math.random() * W(), y: Math.random() * H(),
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.2 + 0.6,
        special: Math.random() < 0.07,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.018 + Math.random() * 0.016,
      }));
    };
    init();

    let pktTimer = 0;
    const spawnPacket = () => {
      const fi = Math.floor(Math.random() * nodes.length);
      const candidates: { i: number; d: number }[] = [];
      for (let i = 0; i < nodes.length; i++) {
        if (i === fi) continue;
        const d = Math.hypot(nodes[i].x - nodes[fi].x, nodes[i].y - nodes[fi].y);
        if (d < connDist()) candidates.push({ i, d });
      }
      if (!candidates.length) return;
      candidates.sort((a, b) => a.d - b.d);
      const ti = candidates[Math.floor(Math.random() * Math.min(4, candidates.length))].i;
      packets.push({ fi, ti, t: 0, speed: 0.007 + Math.random() * 0.01 });
    };

    const draw = () => {
      const w = W(), h = H(), cd = connDist();
      ctx.clearRect(0, 0, w, h);

      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy; n.phase += n.phaseSpeed;
        if (n.x < 0 || n.x > w) { n.vx *= -1; n.x = Math.max(0, Math.min(w, n.x)); }
        if (n.y < 0 || n.y > h) { n.vy *= -1; n.y = Math.max(0, Math.min(h, n.y)); }
      }

      pktTimer++;
      if (pktTimer > 45 && packets.length < (isMob() ? 4 : 8)) { spawnPacket(); pktTimer = 0; }
      for (let i = packets.length - 1; i >= 0; i--) {
        packets[i].t += packets[i].speed;
        if (packets[i].t >= 1) packets.splice(i, 1);
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x, dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist >= cd) continue;
          const t = 1 - dist / cd;
          const isHot = nodes[i].special || nodes[j].special;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = isHot ? `rgba(255,90,20,${t * 0.28})` : `rgba(255,255,255,${t * 0.13})`;
          ctx.lineWidth = isHot ? 0.75 : 0.45;
          ctx.stroke();
        }
      }

      for (const p of packets) {
        const fn = nodes[p.fi], tn = nodes[p.ti];
        const px = fn.x + (tn.x - fn.x) * p.t, py = fn.y + (tn.y - fn.y) * p.t;
        const trail = ctx.createRadialGradient(px, py, 0, px, py, 7);
        trail.addColorStop(0, "rgba(255,80,0,0.28)");
        trail.addColorStop(1, "rgba(255,80,0,0)");
        ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2);
        ctx.fillStyle = trail; ctx.fill();
        ctx.beginPath(); ctx.arc(px, py, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,110,30,0.95)"; ctx.fill();
      }

      for (const n of nodes) {
        const pulse = Math.sin(n.phase);
        if (n.special) {
          const gr = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 10);
          gr.addColorStop(0, `rgba(255,69,0,${0.18 + pulse * 0.1})`);
          gr.addColorStop(1, "rgba(255,69,0,0)");
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 10, 0, Math.PI * 2);
          ctx.fillStyle = gr; ctx.fill();
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r * (1 + pulse * 0.35), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,100,30,${0.85 + pulse * 0.12})`; ctx.fill();
        } else {
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(animId); ro.disconnect(); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ opacity: 0.88 }} />;
}

/* ─── hero ───────────────────────────────────────────────────── */
function Hero() {
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section id="hero" className="relative min-h-[100svh] flex flex-col justify-center items-center overflow-hidden pt-[62px]">

      {/* ══ Ambient orbs — symmetrical ══ */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* top-center dominant glow */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 3, delay: 0 }}
          className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[90vw] h-[90vw] max-w-[900px] max-h-[900px]"
          style={{
            background: "radial-gradient(circle, rgba(255,69,0,0.11) 0%, rgba(255,69,0,0.04) 38%, transparent 65%)",
            animation: "orb-float-1 26s ease-in-out infinite",
          }} />
        {/* bottom-left secondary */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 3.5, delay: 0.5 }}
          className="absolute bottom-[-10%] left-[-8%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px]"
          style={{
            background: "radial-gradient(circle, rgba(255,100,0,0.07) 0%, transparent 62%)",
            animation: "orb-float-2 32s ease-in-out infinite",
          }} />
        {/* bottom-right accent */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 3, delay: 0.8 }}
          className="absolute bottom-[-5%] right-[-5%] w-[45vw] h-[45vw] max-w-[480px] max-h-[480px]"
          style={{
            background: "radial-gradient(circle, rgba(255,60,0,0.05) 0%, transparent 60%)",
            animation: "orb-float-3 28s ease-in-out infinite",
          }} />
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#080808] to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-[#080808] to-transparent" />
      </div>

      {/* ══ Network canvas ══ */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <NetworkAnimation />
      </div>

      {/* ══ Content — fully centered ══ */}
      <div className="relative z-10 w-full max-w-[860px] mx-auto px-5 sm:px-8 py-16 lg:py-24 flex flex-col items-center text-center">

        {/* Badge */}
        <motion.div data-testid="hero-badge"
          initial={{ opacity: 0, y: -12, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.55, delay: 0.05, ease }}
          className="inline-flex items-center gap-2.5 px-4 py-2 mb-8 sm:mb-10 rounded-full border border-white/[0.1] bg-white/[0.03] backdrop-blur-md">
          <span className="relative flex-shrink-0 w-[7px] h-[7px]">
            <span className="absolute inset-0 rounded-full bg-[#FF4500] opacity-70"
              style={{ animation: "pulse-dot 2s ease-in-out infinite" }} />
            <span className="relative block w-full h-full rounded-full bg-[#FF4500]" />
          </span>
          <span className="text-[11px] sm:text-[12px] font-semibold text-white/45 tracking-[0.06em] uppercase whitespace-nowrap">
            Premium Agency for Online Fitness Coaches
          </span>
        </motion.div>

        {/* Headline */}
        <h1 data-testid="hero-headline"
          className="display text-center text-[clamp(3.2rem,11.5vw,8.5rem)] text-white mb-6 sm:mb-7 leading-[0.9] overflow-hidden">
          {[
            { text: "The System", d: 0.14 },
            { text: "Behind", d: 0.24 },
            { text: "6-Figure", d: 0.34, shimmer: true },
            { text: "Coaches.", d: 0.44 },
          ].map((line, i) => (
            <span key={i} className="block overflow-hidden text-center">
              <motion.span className="block text-center"
                initial={{ y: "108%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{ duration: 0.7, delay: line.d, ease }}>
                {line.shimmer
                  ? <span className="shimmer-text">{line.text}</span>
                  : line.text}
              </motion.span>
            </span>
          ))}
        </h1>

        {/* Subheadline */}
        <motion.p data-testid="hero-subheadline"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.58, ease }}
          className="text-center text-[14px] sm:text-[16px] md:text-[17px] text-white/38 leading-[1.75] max-w-[520px] mb-8 sm:mb-10">
          Brand. Website. Lead generation. Automation. We build the complete business system so you can focus on coaching.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.68 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10 sm:mb-12 w-full max-w-[440px]">
          <button data-testid="hero-cta-primary" onClick={() => go("apply")}
            className="btn-glow relative w-full sm:w-auto flex items-center justify-center gap-2.5 h-13 sm:h-[52px] px-8 rounded-2xl bg-[#FF4500] hover:bg-[#FF5500] active:scale-[0.97] text-white text-[14px] sm:text-[15px] font-bold transition-colors overflow-hidden group shadow-[0_0_40px_rgba(255,69,0,0.25)]">
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
            Get Your Free Audit <ArrowRight size={15} />
          </button>
          <button data-testid="hero-cta-secondary" onClick={() => go("results")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 h-13 sm:h-[52px] px-7 rounded-2xl border border-white/[0.1] text-white/45 hover:text-white/70 hover:border-white/[0.18] text-[14px] sm:text-[15px] font-medium transition-all active:scale-[0.97] backdrop-blur-sm">
            See Client Results
          </button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.8 }}
          className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {[coach1Img, coach2Img, coach3Img, coach4Img].map((src, i) => (
                <img key={i} src={src} alt="coach"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover object-top border-2 border-[#080808]" />
              ))}
            </div>
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={11} className="fill-[#FF4500]/80 text-[#FF4500]/80" />
              ))}
              <span className="text-[11px] text-white/25 ml-1.5 font-semibold">5.0</span>
            </div>
          </div>
          <p className="text-[12px] sm:text-[13px] text-white/25 tracking-[0.02em]">
            Trusted by <span className="text-white/45 font-semibold">50+ coaches</span> across 12 countries
          </p>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[10px] text-white/18 uppercase tracking-[0.2em] font-semibold">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/20 to-transparent" />
        </motion.div>

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
    { before: "Posting content, praying for leads", after: "Qualified prospects showing up every single day" },
    { before: "Looking like every other coach online", after: "A brand people actually pay premium prices for" },
    { before: "Chasing every lead manually", after: "Follow-up running on its own, around the clock" },
    { before: "A website that loses you clients", after: "A website that books calls while you sleep" },
    { before: "Stuck at $5–10k with no clear path up", after: "Hitting $30k+ months and knowing exactly how" },
    { before: "Working in your business all day", after: "Working on your business, not buried inside it" },
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
              Most coaches who come to us say the same thing: the coaching is great, everything else is a mess. That's the gap. That's what we fix.
            </p>
          </FadeIn>

          <motion.div
            className="grid sm:grid-cols-2 gap-0 border border-white/[0.05] rounded-2xl overflow-hidden"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer(0.07, 0.1)}>
            {items.map((item, i) => (
              <motion.div key={i} variants={childVariants}>
                <div data-testid={`problem-card-${i}`}
                  className={`p-6 md:p-7 h-full bg-[#0D0D0D] hover:bg-[#0F0F0F] transition-colors
                    ${i % 2 === 0 ? "sm:border-r border-white/[0.05]" : ""}
                    ${i < items.length - 2 ? "border-b border-white/[0.05]" : ""}
                  `}>
                  <p className="text-[12px] text-white/18 line-through leading-snug mb-3 font-medium">{item.before}</p>
                  <p className="text-[13px] md:text-[14px] text-white/75 font-semibold leading-snug">{item.after}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
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
      body: "First impressions either win clients or lose them. We build you a brand that makes the decision easy - the logo, the positioning, the voice that tells people exactly who you are before you say a word.",
      points: ["Logo & Visual Identity", "Brand Voice & Messaging", "Niche Positioning Strategy", "Content Pillars", "Authority Architecture"] },
    { n: "02", tab: "Website", title: "High-Converting Website", icon: <Globe size={16} />,
      body: "Your website should be doing the selling at 2am on a Tuesday. Ours do. We build sites with copy that actually converts, so browsers become bookings without you doing anything.",
      points: ["Custom Premium Design", "Conversion Copywriting", "Automated Booking System", "Video Sales Letter", "Speed & Mobile Optimised"] },
    { n: "03", tab: "Leads", title: "Lead Generation Engine", icon: <Target size={16} />,
      body: "We build your Instagram presence and paid ads from scratch - or take over what's already there. Either way, the goal is the same: real people who want to hire you, coming to you.",
      points: ["Instagram Overhaul", "Content-to-DM Funnel", "Strategic Outreach System", "Paid Ad Strategy", "Lead Magnet Creation"] },
    { n: "04", tab: "AutoNation", title: "AutoNation System", icon: <BrainCircuit size={16} />,
      body: "Once a lead comes in, everything else happens on its own. They get the follow-up. They book. They onboard. You don't touch any of it - the whole thing runs while you're coaching.",
      points: ["Full CRM Integration", "Email Automation", "DM Auto-Responses", "Lead Scoring & Routing", "Onboarding Flow"] },
  ];

  return (
    <section id="system" className="border-t border-white/[0.05] px-6 md:px-10 py-24 md:py-36">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[380px_1fr] gap-12 lg:gap-20 items-start">

          <FadeIn>
            <p className="label-accent mb-6">The System</p>
            <h2 className="display text-[clamp(2.8rem,5.5vw,4.5rem)] text-white mb-6">
              Four pillars.<br />One system.
            </h2>
            <p className="text-[14px] md:text-[15px] text-white/35 leading-[1.8] max-w-[300px]">
              Everything talks to everything else. That's the point.
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
      quote: "I had great coaching but zero business. HCX fixed that. Three months straight over $30k and I haven't had to chase a single lead." },
    { name: "Sarah M.", role: "PT & Nutrition · Manchester", img: coach2Img,
      before: "$7.8k", after: "$52k", time: "6 months",
      quote: "I used to post every day and get nothing back. Now I wake up to booked calls. I haven't chased a lead in months." },
    { name: "Marcus R.", role: "Strength Coach · New York", img: coach3Img,
      before: "$2.9k", after: "$18.4k", time: "3 months",
      quote: "Honestly the brand work alone changed everything. People started taking me seriously before we'd even spoken. The rest just followed." },
    { name: "Priya S.", role: "Female Transformation · Dubai", img: coach4Img,
      before: "$8.5k", after: "$67k", time: "5 months",
      quote: "I was running on empty and nearly quit. Six months later I have my best months ever and I actually enjoy the work again." },
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
              These aren't outliers. These are coaches who were right where you are.
            </p>
          </FadeIn>
        </div>

        <motion.div className="grid sm:grid-cols-2 gap-4 mb-16"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer(0.1, 0.05)}>
          {cards.map((r, i) => (
            <motion.div key={i} variants={childVariantsScale}>
              <div data-testid={`result-card-${i}`}
                className="card-lift border border-white/[0.05] rounded-2xl bg-[#0D0D0D] overflow-hidden h-full flex flex-col">

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
            </motion.div>
          ))}
        </motion.div>
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
      desc: "Brand, Instagram, and a lead gen strategy. The right starting point before you build up.",
      features: ["Brand Identity System", "Instagram Overhaul", "Lead Gen Strategy", "30-Day Content Framework", "DM Script Library"],
      missing: ["Website Build", "AutoNation Setup"],
      highlight: false,
    },
    {
      name: "Growth System", price: "4,997", note: "one-time",
      tag: "Most Popular",
      desc: "Everything you need to hit $20k+ a month and keep it there.",
      features: ["Everything in Launchpad", "Premium Website Build", "AutoNation Integration", "Email & DM Automation", "Analytics Dashboard", "3-Month Strategy Support"],
      missing: [],
      highlight: true,
    },
    {
      name: "Empire", price: "Custom", note: "bespoke",
      tag: "6-Figure Track",
      desc: "You're already doing well. This is how you take it somewhere serious.",
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

        <motion.div className="grid md:grid-cols-3 gap-4"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer(0.1, 0.05)}>
          {plans.map((p, i) => (
            <motion.div key={i} variants={childVariantsScale}>
              <div data-testid={`pricing-card-${p.name.replace(" ", "").toLowerCase()}`}
                className={`card-lift rounded-2xl p-6 md:p-8 flex flex-col h-full relative overflow-hidden ${
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
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── faq ────────────────────────────────────────────────────── */
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const items = [
    { q: "How quickly will I see results?",
      a: "Most clients start seeing leads come in within 2-3 weeks of going live. Consistent $20k months usually click into place around month 3 to 5, once everything has had time to build and compound." },
    { q: "Do I need a big following to start?",
      a: "Nope. We've taken coaches from zero - no following, no email list, nothing. The system doesn't rely on you already being known. Part of what we build is the audience itself." },
    { q: "What is AutoNation?",
      a: "AutoNation is our automation layer. It wires up your CRM, email, DMs, booking, and onboarding so the whole thing runs without you doing it manually. Lead comes in, gets followed up, books a call, onboards - all without you." },
    { q: "How are you different from a social media manager?",
      a: "A social media manager posts content and hopes something sticks. We build the whole business behind it - the brand, the site, the lead flow, the automation. It's not a single piece. It's the whole thing." },
    { q: "Is there ongoing support after launch?",
      a: "Yes. Everything includes a proper setup and handover so you understand what you've got. Growth System includes 3 months of ongoing strategy. Empire clients get a dedicated strategist who's always on hand." },
    { q: "What's your guarantee?",
      a: "Simple: if we don't hit what we said we would, we keep going at no extra cost until we do. If we still can't get there, you get your money back in full. That's it." },
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

          <motion.div className="border border-white/[0.05] rounded-2xl overflow-hidden divide-y divide-white/[0.05]"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}
            variants={staggerContainer(0.06, 0.05)}>
            {items.map((item, i) => (
              <motion.div key={i} variants={childVariants}>
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
              </motion.div>
            ))}
          </motion.div>
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
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: EASE }}>
          <div className="relative rounded-2xl border border-white/[0.07] bg-[#0D0D0D] overflow-hidden px-8 md:px-14 py-12 md:py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            {/* subtle glow */}
            <div className="absolute right-0 top-0 w-[500px] h-[300px] bg-[#FF4500]/[0.04] rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/4" />
            <div className="relative">
              <p className="label-accent mb-4">3 Spots Left - Q2 2026</p>
              <h2 className="display text-[clamp(1.8rem,4vw,3rem)] text-white leading-[1.0]">
                While you're reading<br />this, someone else<br />is building their system.
              </h2>
            </div>
            <button data-testid="cta-banner-button" onClick={() => go("apply")}
              className="btn-glow relative flex-shrink-0 flex items-center gap-2 h-12 px-7 rounded-xl bg-[#FF4500] hover:bg-[#FF5500] text-white text-[14px] font-bold transition-colors active:scale-[0.97]">
              Get a Free Audit <ArrowRight size={15} />
            </button>
          </div>
        </motion.div>
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
          <FadeIn from="left">
            <p className="label-accent mb-6">Apply Now</p>
            <h2 className="display text-[clamp(2.8rem,5.5vw,4.5rem)] text-white mb-7">
              Let's see if<br />we're a fit.
            </h2>
            <p className="text-[14px] md:text-[15px] text-white/35 leading-[1.8] mb-10 max-w-[360px]">
              Fill in the form below. We'll take a proper look at where you're at and tell you honestly what needs to change. No pitch, no pressure - just a real conversation.
            </p>

            <ul className="space-y-5 mb-12">
              {[
                { icon: <Clock size={13} />, text: "We reply within 24 hours, always" },
                { icon: <Shield size={13} />, text: "We only work with coaches we can genuinely help" },
                { icon: <Star size={13} />, text: "Every application gets a free audit" },
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
              <img src={heroImg} alt="Founder"
                className="w-12 h-12 rounded-full object-cover object-center border border-white/[0.08] flex-shrink-0" />
              <div>
                <p className="text-[13px] text-white/50 italic leading-relaxed mb-1.5">
                  "Every coach who applies gets an honest audit - not a pitch."
                </p>
                <p className="text-[11px] text-white/25 font-semibold">HustleCoreX Founder</p>
              </div>
            </div>
          </FadeIn>

          {/* form */}
          <FadeIn from="right" delay={0.1}>
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
              We build the businesses behind the coaches.
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
      <ScrollProgress />
      <PageAmbient />
      <IntroOverlay />
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
