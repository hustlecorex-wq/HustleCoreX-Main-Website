import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";

import Nav, { goTo } from "@/components/site/Nav";
import { HeroBeam, SiteBackdrop } from "@/components/site/Ambient";
import Container from "@/components/site/Container";
import Footer from "@/components/site/Footer";
import ApplyForm from "@/components/site/ApplyForm";
import ProofWall from "@/components/site/ProofWall";
import SectionRule from "@/components/site/SectionRule";
import Showcase from "@/components/site/Showcase";
import AdminAccess from "@/components/site/AdminAccess";
import CostOfAdmin from "@/components/site/CostOfAdmin";

const EASE = [0.22, 1, 0.36, 1] as const;

/* Coaches whose work is on this page, in the order their proof appears.
   Names only - a follower count nobody can check is the kind of number
   that makes the checkable ones worth less. */
const ROSTER = [
  "Patrick Brody",
  "Kyle Shayler",
  "Bela Toth",
  "Ben Ola",
  "Anthony Grace",
  "Kyle Swinburn",
];

/* ─── reveal on scroll ─────────────────────────────────────────── */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ═══ HERO ═══════════════════════════════════════════════════════
   No video and no product shot. The headline is the thesis, the beam
   is the page's one light source, and the work itself starts one
   scroll-inch below where the beam lands - so the light is pointing
   at the thing we want looked at.
   ═══════════════════════════════════════════════════════════════ */

function Hero() {
  return (
    <section className="relative pt-[124px] md:pt-[152px]">
      <Container>
        {/* Beam anchor: the light strikes the bottom edge of this block,
            which is the line the showcase sits on. */}
        <div className="relative pb-16 md:pb-24">
          <HeroBeam />

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <h1 className="text-[clamp(2.05rem,7.6vw,4.7rem)]">
              <span className="line-mask">
                <span
                  className="line-rise display-soft text-white/[0.68]"
                  style={{ "--rise-delay": "0.12s" } as React.CSSProperties}
                >
                  We help coaches build
                </span>
              </span>
              <span className="line-mask">
                <span
                  className="line-rise display text-lit"
                  style={{ "--rise-delay": "0.24s" } as React.CSSProperties}
                >
                  a healthier, happier world.
                </span>
              </span>
            </h1>

            <p
              style={{ "--rise-delay": "0.46s" } as React.CSSProperties}
              className="rise-in mx-auto mt-8 max-w-[520px] text-[16px] leading-[1.75] text-white/[0.6] md:text-[16.5px]"
            >
              Every hour a coach spends on admin is an hour nobody gets
              coached.
            </p>

            <div
              style={{ "--rise-delay": "0.6s" } as React.CSSProperties}
              className="rise-in mx-auto mt-10 max-w-[560px] md:mt-12"
            >
              <CostOfAdmin />
            </div>

            <div
              style={{ "--rise-delay": "0.78s" } as React.CSSProperties}
              className="rise-in mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <button
                onClick={() => goTo("apply")}
                className="btn-ember w-full rounded-full px-7 py-3.5 text-[14.5px] font-medium sm:w-auto"
              >
                Apply for a free system
              </button>
              <button
                onClick={() => goTo("system")}
                className="btn-ghost group flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[14.5px] font-medium sm:w-auto"
              >
                See the work
                <ArrowRight
                  size={15}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </button>
            </div>
          </div>

          {/* The roster, lit from below by the strike point. */}
          <div
            style={{ "--rise-delay": "0.98s" } as React.CSSProperties}
            className="rise-in relative z-10 mt-14 md:mt-16"
          >
            <p className="mono-label mb-5 text-center text-ash-faint">
              Coaches we build for
            </p>
            {/* Spacing separates the names rather than bullets. A wrapped
                list with separators starts its second line on a stray
                bullet, and there is no way to spot the wrap in CSS. */}
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 md:gap-x-9">
              {ROSTER.map((name) => (
                <li
                  key={name}
                  className="text-[13px] font-medium tracking-[-0.01em] text-white/[0.44] md:text-[13.5px]"
                >
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ═══ WHAT WE BUILD ══════════════════════════════════════════════
   Four sentences, no cards. The showcase above has already shown
   what these turn into, so this only has to name them.
   ═══════════════════════════════════════════════════════════════ */

const CAPABILITIES = [
  {
    name: "Check-ins",
    body: "Clients answer once. It arrives scored, ranked by who needs you, and ready to reply to.",
  },
  {
    name: "Lead follow-up",
    body: "DMs, enquiries and booked calls in one pipeline, with the next message already written.",
  },
  {
    name: "Onboarding",
    body: "Someone pays and everything they need is waiting for them, without you sending any of it.",
  },
  {
    name: "Site and profile",
    body: "The page people land on once they have decided to check whether you are the real thing.",
  },
];

function Capabilities() {
  return (
    /* The showcase's Skip lands here, so this section needs a name to
       land on. */
    <section id="build" className="relative z-10 py-20 md:py-28">
      <Container>
        <Reveal>
          <SectionRule label="What we build" />
        </Reveal>

        <div className="mt-12 grid gap-px md:mt-14 md:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map((c, i) => (
            <Reveal key={c.name} delay={0.06 * i}>
              <div className="h-full border-t border-white/[0.07] pr-6 pt-6 md:pt-7">
                <h3 className="heading text-[16.5px]">{c.name}</h3>
                <p className="mt-3 max-w-[34ch] text-[14px] leading-[1.75] text-ash-dim">
                  {c.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ═══ RESULTS ═══════════════════════════════════════════════════
   Lives in components/site/ProofWall.tsx - the filmed reviews and
   the written ones, in one collage.
   ═══════════════════════════════════════════════════════════════ */

/* ═══ MISSION ════════════════════════════════════════════════════ */

function Mission() {
  return (
    <section id="mission" className="relative z-10 py-20 md:py-28">
      <Container>
        <div className="hairline-rule mb-16 md:mb-20" />
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="mono-label-ember mb-8">Why we do it</p>
            <p className="heading-soft text-[clamp(1.7rem,3.9vw,2.8rem)]">
              A coach with their week back can take on more people - and be
              better for the ones they already have.
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mx-auto mt-10 max-w-[600px] text-[16px] leading-[1.85] text-ash md:text-[16.5px]">
              For most people, an online coach is the closest thing they have to
              a health professional who actually knows them. The ceiling on that
              isn't ambition - it's capacity. Every hour spent copying data
              between apps is an hour not spent coaching. Give enough of those
              hours back, to enough coaches, and you get a measurably healthier
              world. That is the entire reason this company exists.
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/* ═══ APPLY ══════════════════════════════════════════════════════
   Numbered, because this one really is a sequence - each step only
   happens if the one before it did.
   ═══════════════════════════════════════════════════════════════ */

const STEPS = [
  {
    n: "01",
    title: "You apply",
    body: "Two minutes, no call, no pitch. Just enough for us to understand the business.",
  },
  {
    n: "02",
    title: "We review it",
    body: "We look at your roster, your revenue and where your week is going.",
  },
  {
    n: "03",
    title: "We build one system",
    body: "If you're a fit, we pick the system that saves you the most time and build it. Usually live inside two weeks.",
  },
];

function Apply() {
  return (
    <section id="apply" className="relative z-10 py-20 md:py-28">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1fr] lg:gap-20">
          <Reveal>
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <p className="mono-label-ember">The offer</p>
              <span className="inline-flex items-center gap-2 rounded-full border border-ember/25 bg-ember/[0.08] px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-ember">
                <span className="live-dot h-1.5 w-1.5 rounded-full bg-ember" />
                2 spaces left
              </span>
            </div>

            <h2 className="heading text-[clamp(2rem,4.2vw,3.1rem)]">
              We'll build you
              <br />
              one system. Free.
            </h2>

            <p className="mt-7 max-w-[420px] text-[16px] leading-[1.8] text-ash">
              If your business is the right fit, we'll pick the single system
              that gives you the most time back, build it properly, and hand it
              over. No fee and no obligation afterwards.
            </p>

            <ol className="mt-12 space-y-8">
              {STEPS.map((s) => (
                <li key={s.n} className="flex gap-5">
                  <span className="tabular font-mono text-[11px] leading-[1.6] tracking-[0.12em] text-ember">
                    {s.n}
                  </span>
                  <div>
                    <p className="mb-1.5 text-[15px] font-medium text-chalk">
                      {s.title}
                    </p>
                    <p className="max-w-[330px] text-[14px] leading-[1.7] text-ash-dim">
                      {s.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <p className="mt-12 max-w-[380px] border-l border-white/[0.08] pl-5 text-[13.5px] leading-[1.7] text-ash-dim">
              We only take a handful of free builds each month, so we're
              genuinely selective about fit. Applying costs you nothing either
              way.
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <ApplyForm />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/* ═══ PAGE ═══════════════════════════════════════════════════════ */

/* Bare paths that are really a section of this page. /apply is the link we
   hand out on its own, so it has to land on the form without a hash. */
const PATH_SECTIONS: Record<string, string> = {
  "/apply": "apply",
};

export default function Home() {
  /* Arriving as /#apply or /apply: the sections don't exist until this
     component mounts, so the browser can't do the jump itself. It has to be
     instant - a smooth scroll started this early gets cancelled before it
     travels, which reads as the link doing nothing. */
  useEffect(() => {
    const path = window.location.pathname.replace(/\/+$/, "").toLowerCase();
    const id = window.location.hash.slice(1) || PATH_SECTIONS[path] || "";
    if (!id) return;

    const jump = () => {
      const el = document.getElementById(id);
      if (!el) return;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY,
        behavior: "instant",
      });
    };

    jump();
    // On a cold load, media above the target can settle after the first
    // paint - pin it again once everything has its final height.
    if (document.readyState === "complete") return;
    window.addEventListener("load", jump);
    return () => window.removeEventListener("load", jump);
  }, []);

  return (
    <div className="relative min-h-screen bg-void">
      <SiteBackdrop />
      <Nav />
      <main className="relative z-10">
        <Hero />
        <Showcase />
        <Capabilities />
        <ProofWall />
        <Mission />
        <Apply />
      </main>
      <Footer />
      <AdminAccess />
    </div>
  );
}
