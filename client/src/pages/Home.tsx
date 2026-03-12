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

import logoImg from "@assets/ChatGPT_Image_Mar_11,_2026,_07_10_08_AM_1773295534839.png";
import heroImg from "@assets/generated_images/hero_coach.png";
import founderImg from "@assets/main_profile_pic_1773158514731.png";
import website1Img from "@assets/Snímek_obrazovky_2026-03-10_170325_1773158874311.png";
import website2Img from "@assets/Snímek_obrazovky_2026-03-10_170555_1773158874312.png";
import coach1Img from "@assets/580868512_17843744343613829_22300884961125480_n_1773149974233.jpg";
import coach2Img from "@assets/626956249_18573276355036228_693123345985490863_n_1773149974233.jpg";
import coach3Img from "@assets/637758797_17889993744428899_7709878898914652022_n_1773149974234.jpg";
import coach4Img from "@assets/641246630_18408593131131876_4631414787526160229_n_1773149974234.jpg";
import kyleProfileImg from "@assets/641246630_18408593131131876_4631414787526160229_n_1773161570730.jpg";
import reel1Img from "@assets/Snímek_obrazovky_2026-03-10_175400_1773161935655.png";
import reel2Img from "@assets/Snímek_obrazovky_2026-03-10_175420_1773161935656.png";
import reel3Img from "@assets/Snímek_obrazovky_2026-03-10_175429_1773161935657.png";
import proofChatImg from "@assets/Snímek_obrazovky_2026-03-10_181214_1773162828189.png";
import proofCalendarImg from "@assets/Snímek_obrazovky_2026-03-10_181222_1773162828190.png";

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



const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

/* ─── logo ──────────────────────────────────────────────────── */
function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <img src={logoImg} alt="HustleCoreX" className="w-8 h-8 object-cover rounded-full flex-shrink-0" />
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
    ["system", "System"], ["results", "Results"],
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
            Free Trial
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
              {[...links, ["apply", "Free Trial"] as [string, string]].map(([id, label]) => (
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

      {/* ══ Background layers ══ */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* central spotlight — draws the eye into the headline */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 2.5 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] w-[110vw] h-[110vw] max-w-[1100px] max-h-[1100px]"
          style={{ background: "radial-gradient(ellipse 70% 55% at 50% 50%, rgba(255,69,0,0.13) 0%, rgba(255,69,0,0.04) 40%, transparent 68%)" }}
        />
        {/* bottom warmth */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 3, delay: 0.4 }}
          className="absolute bottom-[-12%] left-1/2 -translate-x-1/2 w-[100vw] h-[50vw] max-h-[500px]"
          style={{
            background: "radial-gradient(ellipse, rgba(255,69,0,0.07) 0%, transparent 65%)",
            animation: "orb-float-2 38s ease-in-out infinite",
          }}
        />
        {/* left accent */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 3, delay: 0.7 }}
          className="absolute top-[15%] -left-[12%] w-[55vw] h-[55vw] max-w-[560px]"
          style={{
            background: "radial-gradient(circle, rgba(255,80,0,0.05) 0%, transparent 60%)",
            animation: "orb-float-3 30s ease-in-out infinite",
          }}
        />
        {/* right accent */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 3, delay: 1 }}
          className="absolute top-[20%] -right-[10%] w-[48vw] h-[48vw] max-w-[500px]"
          style={{
            background: "radial-gradient(circle, rgba(255,60,0,0.04) 0%, transparent 60%)",
            animation: "orb-float-1 34s ease-in-out infinite",
          }}
        />
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#080808] to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-52 bg-gradient-to-t from-[#080808] to-transparent" />
      </div>

      {/* ══ Network canvas ══ */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <NetworkAnimation />
      </div>

      {/* ══ Main content ══ */}
      <div className="relative z-10 w-full max-w-[960px] mx-auto px-5 sm:px-8 py-8 sm:py-14 lg:py-20 flex flex-col items-center text-center">

        {/* Agency label with flanking lines */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.6 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.7, ease }}
          className="flex items-center gap-4 mb-7 sm:mb-10 w-full max-w-[260px]">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#FF4500]/30 to-[#FF4500]/30" />
          <span data-testid="hero-badge" className="text-[9px] sm:text-[10px] font-bold text-[#FF4500]/55 uppercase tracking-[0.22em] whitespace-nowrap">
            HustleCoreX
          </span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#FF4500]/30 to-[#FF4500]/30" />
        </motion.div>

        {/* ══ Headline — 3-tier typographic display ══ */}
        <div className="mb-6 sm:mb-9 w-full">

          {/* Line 1: ghost/outline — contextual */}
          <div className="overflow-hidden">
            <motion.p
              initial={{ y: "105%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.75, delay: 0.08, ease }}
              className="display text-outline text-[clamp(1.7rem,5vw,5.5rem)] leading-[0.92] text-center tracking-[-0.04em]">
              THE FUTURE OF
            </motion.p>
          </div>

          {/* Line 2: dominant element, orange shimmer */}
          <div className="overflow-hidden">
            <motion.p
              initial={{ y: "105%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.78, delay: 0.2, ease }}
              className="display shimmer-text text-[clamp(2.2rem,7.5vw,8rem)] leading-[0.88] text-center tracking-[-0.05em]">
              ONLINE COACHING
            </motion.p>
          </div>

          {/* Line 3: solid white, grounds the headline */}
          <div className="overflow-hidden">
            <motion.p
              initial={{ y: "105%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.75, delay: 0.32, ease }}
              className="display text-white text-[clamp(1.7rem,5vw,5.5rem)] leading-[0.92] text-center tracking-[-0.04em]">
              IS HERE.
            </motion.p>
          </div>
        </div>

        {/* Thin divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.48, ease }}
          className="w-10 h-px bg-gradient-to-r from-transparent via-[#FF4500]/40 to-transparent mb-5 sm:mb-7"
        />

        {/* Subheadline */}
        <motion.p data-testid="hero-subheadline"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.52, ease }}
          className="text-[15px] sm:text-[18px] md:text-[21px] text-white/40 leading-[1.6] max-w-[480px] mb-7 sm:mb-10 font-light tracking-[-0.01em]">
          The system that scales online coaches to consistent 5-figure months.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.62 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8 sm:mb-12 w-full max-w-[400px]">
          <button data-testid="hero-cta-primary" onClick={() => go("apply")}
            className="btn-glow relative w-full sm:flex-1 flex items-center justify-center gap-2.5 h-[50px] sm:h-[54px] px-7 rounded-2xl bg-[#FF4500] hover:bg-[#FF5500] active:scale-[0.97] text-white text-[14px] sm:text-[15px] font-bold transition-colors overflow-hidden group shadow-[0_0_60px_rgba(255,69,0,0.35),0_0_20px_rgba(255,69,0,0.2)]">
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
            Free Trial <ArrowRight size={15} />
          </button>
          <button data-testid="hero-cta-secondary" onClick={() => go("system")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 h-[50px] sm:h-[54px] px-6 rounded-2xl border border-white/[0.09] text-white/38 hover:text-white/65 hover:border-white/[0.17] text-[14px] sm:text-[15px] font-medium transition-all active:scale-[0.97]">
            See How It Works
          </button>
        </motion.div>

        {/* Social proof row */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.88 }}
          className="flex items-center justify-center gap-4">
          <div className="flex items-center">
            {[coach1Img, coach2Img, coach3Img, coach4Img].map((src, i) => (
              <div key={i} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-[#080808] overflow-hidden flex-shrink-0" style={{ marginLeft: i === 0 ? 0 : "-10px", zIndex: i }}>
                <img src={src} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <p className="text-[12px] sm:text-[13px] text-white/40 font-medium leading-snug">
            Trusted by <span className="text-white/70 font-semibold">50+ coaches</span> worldwide
          </p>
        </motion.div>

        {/* Scroll hint — hidden on short screens */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="hidden sm:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-2">
          <span className="text-[9px] text-white/15 uppercase tracking-[0.28em] font-bold">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />
        </motion.div>

      </div>
    </section>
  );
}

/* ─── ticker ─────────────────────────────────────────────────── */
function Ticker() {
  const items = [
    "Bela Toth → 2 new clients signed in week 1",
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
    { before: "Stuck at $5–10k with no clear path up", after: "Hitting consistent $15k+ months and scaling" },
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

/* ─── system pillar visuals ──────────────────────────────────── */
function BrandVisual() {
  return (
    <div className="relative rounded-2xl border border-white/[0.07] bg-[#090909] overflow-hidden">
      {/* red ambient glow at top */}
      <div className="absolute top-0 inset-x-0 h-36 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 90% 100% at 50% -10%, rgba(160,0,0,0.22) 0%, transparent 70%)" }} />

      <div className="relative p-6">

        {/* Profile row */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-shrink-0 w-[56px] h-[56px] rounded-full overflow-hidden"
            style={{ boxShadow: "0 0 0 2px rgba(180,0,0,0.5), 0 0 20px rgba(160,0,0,0.35)" }}>
            <img src={kyleProfileImg} alt="Kyle Shayler" className="w-full h-full object-cover object-top scale-110" />
          </div>
          <div>
            <p className="text-[16px] font-black text-white leading-tight tracking-[-0.02em]">Kyle Shayler</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5" style={{ color: "#CC1500" }}>Elite Athletes Coaching</p>
            <p className="text-[10px] text-white/22 mt-0.5">@kyleshayler</p>
          </div>
        </div>

        {/* Brand palette */}
        <div className="mb-5">
          <p className="text-[9px] text-white/18 uppercase tracking-[0.22em] mb-2.5 font-semibold">Brand Palette</p>
          <div className="flex items-end gap-2">
            {[
              { c: "#CC1100", h: "h-9" },
              { c: "#8B0000", h: "h-7" },
              { c: "#111111", h: "h-9" },
              { c: "#252525", h: "h-7" },
              { c: "#FFFFFF", h: "h-9" },
            ].map(({ c, h }, i) => (
              <div key={i} className={`flex-1 ${h} rounded-lg border border-white/[0.06]`} style={{ background: c }} />
            ))}
          </div>
        </div>

        {/* Typography */}
        <div className="mb-5 pb-5 border-b border-white/[0.05]">
          <p className="text-[9px] text-white/18 uppercase tracking-[0.22em] mb-2 font-semibold">Typography</p>
          <p className="text-[10px] font-bold text-white/22 uppercase tracking-[0.34em] mb-0.5">Setting The</p>
          <p className="text-[28px] font-black text-white leading-none tracking-[-0.03em]">STANDARD.</p>
          <p className="text-[9px] text-white/18 mt-2 uppercase tracking-[0.26em]">Bold · Condensed · Elite</p>
        </div>

        {/* Reel / content covers */}
        <div>
          <p className="text-[9px] text-white/18 uppercase tracking-[0.22em] mb-2.5 font-semibold">Content Style</p>
          <div className="grid grid-cols-3 gap-2">
            {[reel1Img, reel2Img, reel3Img].map((src, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-white/[0.07] aspect-[9/16]">
                <img src={src} alt={`reel ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function WebsiteVisual() {
  return (
    <div className="relative">
      <div className="relative z-10 rounded-xl overflow-hidden border border-white/[0.1] shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#181818] border-b border-white/[0.06]">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
          <div className="w-3 h-3 rounded-full bg-[#28C840]" />
          <div className="flex-1 mx-3 h-5 rounded-md bg-white/[0.06] flex items-center px-2.5">
            <span className="text-[9px] text-white/25 font-mono">kyleshaylerelite.com</span>
          </div>
        </div>
        <img src={website1Img} alt="Kyle Shayler coaching website" className="w-full block" />
      </div>
      <div className="relative z-20 mt-[-40px] ml-6 sm:ml-12 rounded-xl overflow-hidden border border-white/[0.1] shadow-[0_24px_80px_rgba(0,0,0,0.7)]">
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#181818] border-b border-white/[0.06]">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
          <div className="w-3 h-3 rounded-full bg-[#28C840]" />
          <div className="flex-1 mx-3 h-5 rounded-md bg-white/[0.06] flex items-center px-2.5">
            <span className="text-[9px] text-white/25 font-mono">patrickbrody.coach</span>
          </div>
        </div>
        <img src={website2Img} alt="Patrick Brody coaching website" className="w-full block" />
      </div>
      <div className="absolute -bottom-3 left-4 right-4 h-8 bg-gradient-to-t from-[#080808] to-transparent pointer-events-none" />
    </div>
  );
}

function LeadsVisual() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const countRef = useRef(0);
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setup = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * devicePixelRatio;
      canvas.height = rect.height * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      return { W: rect.width, H: rect.height };
    };

    let { W, H } = setup();
    let cx = W / 2;
    let cy = H / 2;
    const centerR = 34;
    let spawnR = Math.min(W, H) * 0.42;

    type Particle = {
      x: number; y: number; vx: number; vy: number;
      r: number; alpha: number; hue: number;
      absorbed: boolean; age: number; spin: number;
      tailX: number[]; tailY: number[];
    };
    type Ripple = { r: number; alpha: number };
    type Notif = { text: string; x: number; y: number; alpha: number };

    const particles: Particle[] = [];
    const ripples: Ripple[] = [];
    const notifs: Notif[] = [];
    const notifLabels = ["Call Booked"];
    let frame = 0;
    let raf: number;

    const spawn = () => {
      const angle = Math.random() * Math.PI * 2;
      const jitter = (Math.random() - 0.5) * 20;
      const x = cx + Math.cos(angle) * (spawnR + jitter);
      const y = cy + Math.sin(angle) * (spawnR + jitter);
      const hue = 15 + Math.random() * 30; // orange to red-orange
      particles.push({
        x, y, vx: 0, vy: 0,
        r: 2.8 + Math.random() * 2.2,
        alpha: 0, hue,
        absorbed: false, age: 0,
        spin: Math.random() > 0.5 ? 1 : -1,
        tailX: [x], tailY: [y],
      });
    };

    // Pre-populate
    for (let i = 0; i < 5; i++) setTimeout(spawn, i * 300);

    const drawCenter = () => {
      const pulse = Math.sin(frame * 0.045) * 0.5 + 0.5;

      // Outer glow
      const glowR = centerR + 14 + pulse * 5;
      const glow = ctx.createRadialGradient(cx, cy, centerR - 4, cx, cy, glowR + 12);
      glow.addColorStop(0, `rgba(255,69,0,${0.28 * pulse})`);
      glow.addColorStop(1, "rgba(255,69,0,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, glowR + 12, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Pulse ring
      ctx.beginPath();
      ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,80,0,${0.18 * pulse})`;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Instagram gradient fill
      const grad = ctx.createLinearGradient(cx - centerR, cy + centerR, cx + centerR, cy - centerR);
      grad.addColorStop(0, "#f09433");
      grad.addColorStop(0.3, "#e6683c");
      grad.addColorStop(0.6, "#dc2743");
      grad.addColorStop(0.85, "#cc2366");
      grad.addColorStop(1, "#bc1888");
      ctx.beginPath();
      ctx.arc(cx, cy, centerR, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Instagram camera icon (rounded square outline)
      const s = centerR * 0.62;
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.88)";
      ctx.lineWidth = 1.8;
      ctx.lineJoin = "round";
      const bx = cx - s, by = cy - s, bw = s * 2, bh = s * 2, br = s * 0.28;
      ctx.beginPath();
      ctx.moveTo(bx + br, by);
      ctx.lineTo(bx + bw - br, by);
      ctx.arcTo(bx + bw, by, bx + bw, by + br, br);
      ctx.lineTo(bx + bw, by + bh - br);
      ctx.arcTo(bx + bw, by + bh, bx + bw - br, by + bh, br);
      ctx.lineTo(bx + br, by + bh);
      ctx.arcTo(bx, by + bh, bx, by + bh - br, br);
      ctx.lineTo(bx, by + br);
      ctx.arcTo(bx, by, bx + br, by, br);
      ctx.closePath();
      ctx.stroke();
      // Lens circle
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.44, 0, Math.PI * 2);
      ctx.stroke();
      // Top-right dot
      ctx.beginPath();
      ctx.arc(cx + s * 0.52, cy - s * 0.52, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.88)";
      ctx.fill();
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      frame++;

      // Spawn every ~115 frames
      if (frame % 115 === 0) spawn();

      drawCenter();

      // Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        ctx.beginPath();
        ctx.arc(cx, cy, r.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,80,0,${r.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        r.r += 2.2;
        r.alpha -= 0.018;
        if (r.alpha <= 0) ripples.splice(i, 1);
      }

      // Notifications
      for (let i = notifs.length - 1; i >= 0; i--) {
        const n = notifs[i];
        n.y -= 0.55;
        n.alpha -= 0.011;
        if (n.alpha <= 0) { notifs.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = n.alpha;
        ctx.font = `500 9.5px "Space Grotesk", system-ui, sans-serif`;
        const tw = ctx.measureText(n.text).width;
        const pw = tw + 18, ph = 19;
        const nx = n.x - pw / 2, ny = n.y - ph / 2, nr = 9;
        ctx.fillStyle = "rgba(22,22,22,0.92)";
        ctx.strokeStyle = "rgba(255,80,0,0.35)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(nx + nr, ny); ctx.lineTo(nx + pw - nr, ny);
        ctx.arcTo(nx + pw, ny, nx + pw, ny + nr, nr);
        ctx.lineTo(nx + pw, ny + ph - nr);
        ctx.arcTo(nx + pw, ny + ph, nx + pw - nr, ny + ph, nr);
        ctx.lineTo(nx + nr, ny + ph);
        ctx.arcTo(nx, ny + ph, nx, ny + ph - nr, nr);
        ctx.lineTo(nx, ny + nr);
        ctx.arcTo(nx, ny, nx + nr, ny, nr);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,0.72)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(n.text, n.x, n.y);
        ctx.restore();
      }

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (p.absorbed) { particles.splice(i, 1); continue; }
        p.age++;
        p.alpha = Math.min(1, p.age / 18);

        const dx = cx - p.x, dy = cy - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < centerR + p.r - 2) {
          p.absorbed = true;
          countRef.current++;
          setDisplayCount(c => c + 1);
          ripples.push({ r: centerR + 2, alpha: 0.75 });
          if (notifs.length < 3) {
            notifs.push({
              text: notifLabels[countRef.current % notifLabels.length],
              x: cx + (Math.random() - 0.5) * 70,
              y: cy - centerR - 18,
              alpha: 1,
            });
          }
          continue;
        }

        // Movement — curved path toward center
        const speed = 0.85 + (1 - Math.min(1, dist / spawnR)) * 1.4;
        const nx = dx / dist, ny2 = dy / dist;
        const curveFactor = 0.28 * (dist / spawnR);
        const px = -ny2 * p.spin * curveFactor;
        const py = nx * p.spin * curveFactor;
        p.vx = p.vx * 0.82 + (nx + px) * speed * 0.18;
        p.vy = p.vy * 0.82 + (ny2 + py) * speed * 0.18;
        p.x += p.vx + nx * speed * 0.65;
        p.y += p.vy + ny2 * speed * 0.65;

        // Trail
        p.tailX.push(p.x); p.tailY.push(p.y);
        if (p.tailX.length > 14) { p.tailX.shift(); p.tailY.shift(); }

        if (p.tailX.length > 2) {
          for (let t = 1; t < p.tailX.length; t++) {
            const tA = (t / p.tailX.length) * 0.3 * p.alpha;
            ctx.beginPath();
            ctx.moveTo(p.tailX[t - 1], p.tailY[t - 1]);
            ctx.lineTo(p.tailX[t], p.tailY[t]);
            ctx.strokeStyle = `hsla(${p.hue},100%,55%,${tA})`;
            ctx.lineWidth = p.r * 0.7;
            ctx.lineCap = "round";
            ctx.stroke();
          }
        }

        // Particle glow
        const glowG = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3.5);
        glowG.addColorStop(0, `hsla(${p.hue},100%,55%,${0.45 * p.alpha})`);
        glowG.addColorStop(1, `hsla(${p.hue},100%,55%,0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = glowG;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},100%,62%,${p.alpha})`;
        ctx.fill();

        // Highlight
        ctx.beginPath();
        ctx.arc(p.x - p.r * 0.28, p.y - p.r * 0.28, p.r * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.4 * p.alpha})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0A0A0A] overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-[260px] sm:h-[300px]" />
      <div className="px-5 py-4 border-t border-white/[0.05]">
        <div className="flex items-end justify-between gap-3 mb-1">
          <div className="flex items-baseline gap-2">
            <p className="text-[36px] sm:text-[40px] font-black text-white leading-none tracking-tight">10+</p>
            <p className="text-[13px] sm:text-[14px] font-bold text-white/50 leading-tight mb-1">calls booked<br />per week</p>
          </div>
          <p className="text-[10px] text-[#FF4500]/60 font-semibold uppercase tracking-[0.14em] text-right mb-1.5">All qualified.<br />All inbound.</p>
        </div>
        <p className="text-[10px] text-white/20 uppercase tracking-[0.14em]">Average coach using the system</p>
      </div>
    </div>
  );
}

function AutoNationVisual() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    const W = rect.width;
    const H = rect.height;

    const NR = Math.min(W * 0.075, 26);
    const lx = W * 0.24;
    const rx = W * 0.73;
    const ys = [H * 0.10, H * 0.29, H * 0.50, H * 0.70, H * 0.89];

    type AgentNode = {
      cx: number; cy: number;
      label: string; sub: string;
      color: string; rgba: string;
      spinDir: number; glow: number; pulse: number;
    };

    const nodes: AgentNode[] = [
      { cx: lx, cy: ys[0], label: "Lead Comes In", sub: "IG DM · Website Form", color: "#FF4500", rgba: "rgba(255,69,0", spinDir: 1, glow: 0, pulse: 0 },
      { cx: rx, cy: ys[1], label: "CRM Entry", sub: "Auto-tagged · Segmented", color: "#818CF8", rgba: "rgba(129,140,248", spinDir: -1, glow: 0, pulse: 0.4 },
      { cx: lx, cy: ys[2], label: "Follow-Up Sequence", sub: "Email + DM within 60s", color: "#C084FC", rgba: "rgba(192,132,252", spinDir: 1, glow: 0, pulse: 0.8 },
      { cx: rx, cy: ys[3], label: "Call Booked", sub: "Calendar link sent", color: "#FBBF24", rgba: "rgba(251,191,36", spinDir: -1, glow: 0, pulse: 1.2 },
      { cx: lx, cy: ys[4], label: "Onboarded", sub: "Welcome flow triggers", color: "#34D399", rgba: "rgba(52,211,153", spinDir: 1, glow: 0, pulse: 1.6 },
    ];

    type Packet = { from: number; to: number; t: number; trail: { x: number; y: number }[] };
    const packets: Packet[] = [];
    let frame = 0;
    let raf: number;

    const spawnChain = () => {
      for (let i = 0; i < nodes.length - 1; i++) {
        setTimeout(() => packets.push({ from: i, to: i + 1, t: 0, trail: [] }), i * 500);
      }
    };
    spawnChain();

    const drawRR = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arcTo(x + w, y, x + w, y + r, r);
      ctx.lineTo(x + w, y + h - r);
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
      ctx.lineTo(x + r, y + h);
      ctx.arcTo(x, y + h, x, y + h - r, r);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.closePath();
    };

    const drawNode = (nd: AgentNode, idx: number) => {
      const { cx, cy, glow, color, rgba, spinDir, label, sub } = nd;
      const pulse = (Math.sin(frame * 0.04 + nd.pulse) * 0.5 + 0.5);

      // Outer atmospheric glow
      if (glow > 0.02 || pulse > 0.6) {
        const g = ctx.createRadialGradient(cx, cy, NR, cx, cy, NR + 22);
        g.addColorStop(0, `${rgba},${(glow * 0.4 + pulse * 0.08)})`);
        g.addColorStop(1, `${rgba},0)`);
        ctx.beginPath();
        ctx.arc(cx, cy, NR + 22, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }

      // Node background circle
      ctx.beginPath();
      ctx.arc(cx, cy, NR, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(12,12,12,0.97)";
      ctx.fill();

      // Border ring
      ctx.beginPath();
      ctx.arc(cx, cy, NR, 0, Math.PI * 2);
      ctx.strokeStyle = `${rgba},${0.28 + glow * 0.62 + pulse * 0.08})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Spinning outer arc (processing indicator)
      const spinA = frame * 0.032 * spinDir + nd.pulse;
      ctx.beginPath();
      ctx.arc(cx, cy, NR + 5, spinA, spinA + Math.PI * 1.25);
      ctx.strokeStyle = `${rgba},${0.35 + glow * 0.45 + pulse * 0.1})`;
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      ctx.stroke();

      // Second counter-arc (smaller)
      ctx.beginPath();
      ctx.arc(cx, cy, NR + 5, spinA + Math.PI * 1.5, spinA + Math.PI * 1.75);
      ctx.strokeStyle = `${rgba},${0.18 + pulse * 0.06})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Inner filled core
      const coreR = NR * 0.38;
      const coreG = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      coreG.addColorStop(0, `${rgba},${0.9 + pulse * 0.1})`);
      coreG.addColorStop(1, `${rgba},${0.5 + glow * 0.3})`);
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fillStyle = coreG;
      ctx.fill();

      // Step number
      ctx.font = `700 9px "Space Grotesk", system-ui, sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${idx + 1}`, cx, cy);

      // Label position - left nodes go right, right nodes go left
      const goRight = cx < W * 0.5;
      const lx2 = goRight ? cx + NR + 11 : cx - NR - 11;
      const align = goRight ? "left" : "right";

      // Label card background (subtle pill)
      const labelW = goRight ? Math.min(W - lx2 - 6, 150) : Math.min(lx2 - 6, 150);
      const lCardX = goRight ? lx2 - 6 : lx2 - labelW + 6;
      drawRR(lCardX, cy - 20, labelW, 36, 7);
      ctx.fillStyle = "rgba(255,255,255,0.025)";
      ctx.fill();

      ctx.textAlign = align;
      ctx.textBaseline = "middle";
      ctx.font = `600 11px "Space Grotesk", system-ui, sans-serif`;
      ctx.fillStyle = `rgba(255,255,255,${0.68 + glow * 0.32})`;
      ctx.fillText(label, lx2, cy - 6.5);

      ctx.font = `400 9.5px "Space Grotesk", system-ui, sans-serif`;
      ctx.fillStyle = `rgba(255,255,255,${0.26 + glow * 0.12})`;
      ctx.fillText(sub, lx2, cy + 7.5);
    };

    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      frame++;

      if (frame % 280 === 0) spawnChain();

      // Draw connection lines (dashed)
      for (let i = 0; i < nodes.length - 1; i++) {
        const a = nodes[i];
        const b = nodes[i + 1];
        const dx = b.cx - a.cx;
        const dy = b.cy - a.cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const nx = dx / dist;
        const ny = dy / dist;
        const x1 = a.cx + nx * (NR + 7);
        const y1 = a.cy + ny * (NR + 7);
        const x2 = b.cx - nx * (NR + 7);
        const y2 = b.cy - ny * (NR + 7);

        // Gradient line
        const lineG = ctx.createLinearGradient(x1, y1, x2, y2);
        lineG.addColorStop(0, `${a.rgba},0.1)`);
        lineG.addColorStop(1, `${b.rgba},0.08)`);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = lineG;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Update + draw packets
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.t += 0.007;

        if (p.t >= 1) {
          nodes[p.to].glow = 1.0;
          packets.splice(i, 1);
          continue;
        }

        const fn = nodes[p.from];
        const tn = nodes[p.to];
        const px = fn.cx + (tn.cx - fn.cx) * p.t;
        const py = fn.cy + (tn.cy - fn.cy) * p.t;

        p.trail.push({ x: px, y: py });
        if (p.trail.length > 10) p.trail.shift();

        // Trail
        for (let t = 1; t < p.trail.length; t++) {
          const ta = (t / p.trail.length) * 0.5;
          ctx.beginPath();
          ctx.moveTo(p.trail[t - 1].x, p.trail[t - 1].y);
          ctx.lineTo(p.trail[t].x, p.trail[t].y);
          ctx.strokeStyle = `${fn.rgba},${ta})`;
          ctx.lineWidth = 1.5;
          ctx.lineCap = "round";
          ctx.stroke();
        }

        // Packet glow
        const pg = ctx.createRadialGradient(px, py, 0, px, py, 9);
        pg.addColorStop(0, `${fn.rgba},0.85)`);
        pg.addColorStop(1, `${fn.rgba},0)`);
        ctx.beginPath();
        ctx.arc(px, py, 9, 0, Math.PI * 2);
        ctx.fillStyle = pg;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = fn.color;
        ctx.fill();

        // White highlight
        ctx.beginPath();
        ctx.arc(px - 1, py - 1, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.fill();
      }

      // Decay glow
      nodes.forEach(n => { if (n.glow > 0) n.glow = Math.max(0, n.glow - 0.018); });

      // Draw all nodes
      nodes.forEach(drawNode);

      // Footer
      ctx.font = `500 9px "Space Grotesk", system-ui, sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.16)";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText("RUNS 24 / 7  ·  ZERO MANUAL INPUT", W / 2, H - 7);

      raf = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0A0A0A] overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-[390px]" />
    </div>
  );
}

/* ─── system section ─────────────────────────────────────────── */
function PillarRow({ n, label, title, body, points, visual, flip }:
  { n: string; label: string; title: string; body: string; points: string[]; visual: React.ReactNode; flip: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const ease = [0.22, 1, 0.36, 1] as const;
  return (
    <div ref={ref} className="py-16 md:py-24 border-b border-white/[0.05] last:border-0">
      <div className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${flip ? "lg:grid-flow-dense" : ""}`}>
        <motion.div
          className={flip ? "lg:col-start-2" : ""}
          initial={{ opacity: 0, x: flip ? 36 : -36 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.75, ease }}>
          <div className="flex items-center gap-3 mb-6">
            <span className="font-mono text-[11px] font-bold text-[#FF4500]/70 tracking-[0.2em]">{n}</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[10px] font-semibold text-white/20 uppercase tracking-[0.18em]">{label}</span>
          </div>
          <h3 className="display text-[clamp(1.8rem,3.8vw,2.9rem)] text-white mb-5 leading-[1.0]">{title}</h3>
          <p className="text-[14px] md:text-[15px] text-white/38 leading-[1.82] mb-8">{body}</p>
          <ul className="space-y-3">
            {points.map((pt) => (
              <li key={pt} className="flex items-center gap-3">
                <CheckCircle2 size={13} className="text-[#FF4500]/55 flex-shrink-0" />
                <span className="text-[13px] text-white/52">{pt}</span>
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div
          className={flip ? "lg:col-start-1 lg:row-start-1" : ""}
          initial={{ opacity: 0, x: flip ? -36 : 36 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.75, delay: 0.1, ease }}>
          {visual}
        </motion.div>
      </div>
    </div>
  );
}

function System() {
  return (
    <section id="system" className="border-t border-white/[0.05] px-6 md:px-10 pt-24 md:pt-36 pb-0">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <p className="label-accent mb-6">The System</p>
          <h2 className="display text-[clamp(2.8rem,5.5vw,4.5rem)] text-white mb-5">
            Four pillars.<br />One system.
          </h2>
        </FadeIn>

        <PillarRow n="01" label="Brand" flip={false}
          title="A brand that commands respect."
          body="First impressions either win clients or lose them. We build you a brand that makes the decision easy - the logo, the positioning, the voice that tells people exactly who you are before you say a word."
          points={["Logo & Visual Identity","Brand Voice & Messaging","Niche Positioning Strategy","Content Pillars","Authority Architecture"]}
          visual={<BrandVisual />} />

        <PillarRow n="02" label="Website" flip={true}
          title="A website that closes while you sleep."
          body="Your website should be doing the selling at 2am on a Tuesday. Ours do. We build sites with copy that actually converts, so browsers become bookings without you lifting a finger."
          points={["Custom Premium Design","Conversion Copywriting","Automated Booking System","Video Sales Letter","Speed & Mobile Optimised"]}
          visual={<WebsiteVisual />} />

        <PillarRow n="03" label="Leads" flip={false}
          title="10+ qualified enquiries a week. On average."
          body="Most coaches post consistently for months and barely get a serious DM. We look at why that's happening, fix it, and build a system that brings the right people to you. People who can afford coaching, who are serious about it, and who reach out already half-sold on working with you."
          points={["Instagram Overhaul","Content-to-DM Funnel","Strategic Outreach System","Paid Ad Strategy","Lead Magnet Creation"]}
          visual={<LeadsVisual />} />

        <PillarRow n="04" label="AutoNation" flip={true}
          title="The admin runs itself."
          body="The moment a lead comes in, the follow-up goes out, the call gets booked, the onboarding kicks off. None of that needs you. Your calls, your content, your coaching - that still does. And that's exactly how it should be."
          points={["Full CRM Integration","Email Automation","DM Auto-Responses","Lead Scoring & Routing","Onboarding Flow"]}
          visual={<AutoNationVisual />} />
      </div>
    </section>
  );
}

/* ─── results (testimonials) ─────────────────────────────────── */
function Results() {
  const cards = [
    { name: "Bela Toth", role: "Online Fitness Coach · @belatoth", img: coach1Img,
      quote: "Working with HustleCoreX has been great. Signed two new clients the week after we put the system in place. Honestly didn't expect it to do that well that quickly." },
  ];

  return (
    <section id="results" className="border-t border-white/[0.05] px-6 md:px-10 py-24 md:py-36">
      <div className="max-w-6xl mx-auto">

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14 md:mb-16">
          <FadeIn>
            <p className="label-accent mb-6">Results</p>
            <h2 className="display text-[clamp(2.8rem,5.5vw,4.5rem)] text-white">
              Results.
            </h2>
          </FadeIn>
        </div>

        <motion.div className="max-w-md mb-16"
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
                <div className="border-t border-white/[0.05] px-6 md:px-8 py-4 flex items-center gap-3">
                  <img src={r.img} alt={r.name}
                    className="w-9 h-9 rounded-full object-cover object-top border border-white/[0.08] flex-shrink-0" />
                  <div>
                    <p className="text-[13px] font-bold text-white leading-tight">{r.name}</p>
                    <p className="text-[11px] text-white/25">{r.role}</p>
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
              Free Trial <ArrowRight size={15} />
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
            <div className="flex items-center gap-3 mb-6">
              <p className="label-accent">Free Trial</p>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF4500]/10 border border-[#FF4500]/25 text-[10px] font-bold text-[#FF4500] uppercase tracking-[0.14em]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF4500] animate-pulse inline-block" />
                2 Spaces Left
              </span>
            </div>
            <h2 className="display text-[clamp(2.8rem,5.5vw,4.5rem)] text-white mb-7">
              Start your<br />free trial.
            </h2>
            <p className="text-[14px] md:text-[15px] text-white/35 leading-[1.8] mb-10 max-w-[360px]">
              We'll get your website built, go through your profile, and put the foundations of the system in place.
            </p>

            <ul className="space-y-5 mb-12">
              {[
                { icon: <Globe size={13} />, text: "Website" },
                { icon: <Target size={13} />, text: "Profile Audit" },
                { icon: <Zap size={13} />, text: "Basic Custom System Setup" },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-lg border border-white/[0.06] flex items-center justify-center text-white/25 flex-shrink-0">
                    {item.icon}
                  </div>
                  <span className="text-[13px] text-white/38">{item.text}</span>
                </li>
              ))}
            </ul>

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
                  <p className="heading text-[1.1rem] text-white">Claim Your Free Trial</p>
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
              {[["system","System"],["results","Results"],["apply","Apply"]].map(([id, label]) => (
                <button key={id} onClick={() => go(id)}
                  className="block text-[13px] text-white/22 hover:text-white/45 transition-colors">{label}</button>
              ))}
            </div>
          </div>

          <div>
            <p className="label mb-5">Contact</p>
            <div className="space-y-3">
              {[
                { icon: <Mail size={11} />, t: "info@hustlecorex.com" },
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

      <Nav />
      <Hero />
      <Ticker />
      <Problem />
      <System />
      <Results />
      <FAQ />
      <CTAStrip />
      <Apply />
      <Footer />
    </div>
  );
}
