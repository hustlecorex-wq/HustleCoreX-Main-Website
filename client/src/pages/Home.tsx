import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";

import Nav, { goTo } from "@/components/site/Nav";
import { HeroBeam, SiteBackdrop } from "@/components/site/Ambient";
import Container from "@/components/site/Container";
import Footer from "@/components/site/Footer";
import ApplyForm from "@/components/site/ApplyForm";
import ProofWall from "@/components/site/ProofWall";
import VideoFrame from "@/components/site/VideoFrame";
import AdminAccess from "@/components/site/AdminAccess";

/* The two self-hosted videos. Files live in client/public/; see
   VideoFrame for how to encode a replacement. */
const HERO_VIDEO = "/walkthrough.mp4";
const HERO_POSTER = "/walkthrough-poster.jpg";
const HERO_ASPECT = "1900 / 948";

const BUILD_VIDEO = "/what-we-build.mp4";
const BUILD_POSTER = "/what-we-build-poster.jpg";
const BUILD_ASPECT = "16 / 9";

const EASE = [0.22, 1, 0.36, 1] as const;

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

/* ═══ HERO ═══════════════════════════════════════════════════════ */

function Hero() {
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.85, ease: EASE, delay },
  });

  return (
    <section className="relative pt-[128px] md:pt-[150px]">
      <Container>
        {/* Beam anchor: the light strikes the bottom edge of this block */}
        <div className="relative pb-14 md:pb-16">
          <HeroBeam />

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <motion.h1
              {...rise(0.14)}
              className="text-[clamp(1.95rem,7.4vw,4.6rem)]"
            >
              <span className="display-light block text-white/[0.72]">
                We build the systems
              </span>
              <span className="display text-lit block">
                online coaches run on
              </span>
            </motion.h1>

            <motion.p
              {...rise(0.24)}
              className="mx-auto mt-7 max-w-[520px] text-[16px] leading-[1.7] text-white/[0.58] md:text-[16.5px]"
            >
              Check-ins, lead follow-up and onboarding, handled automatically -
              so your hours go to coaching instead of admin.
            </motion.p>

            <motion.div
              {...rise(0.34)}
              className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
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
                See what we build
                <ArrowRight
                  size={15}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </button>
            </motion.div>
          </div>
        </div>
      </Container>

      {/* The video breaks out of the copy container - it's the thing the
          page is actually asking people to do, so it shouldn't be the
          narrowest element on the screen. */}
      <motion.div
        initial={{ opacity: 0, y: 34, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.05, ease: EASE, delay: 0.44 }}
        className="relative z-10 mx-auto w-full max-w-[1240px] px-6 md:px-10"
      >
        <VideoFrame
          src={HERO_VIDEO}
          poster={HERO_POSTER}
          aspect={HERO_ASPECT}
          label="Watch the walkthrough · 4 min"
          className="max-w-[1160px]"
        />
      </motion.div>
    </section>
  );
}

/* ═══ WHAT WE BUILD ══════════════════════════════════════════════
   The section the hero's "See what we build" button points at, so it
   shows one rather than describing four. A walkthrough of a finished
   system answers the same questions the capability cards used to, and
   answers them in the client's own dashboard instead of in copy.
   ═══════════════════════════════════════════════════════════════ */

function WhatWeBuild() {
  return (
    <section id="system" className="relative z-10 py-20 md:py-28">
      <Container>
        <Reveal>
          <p className="mono-label-ember mb-6">What we build</p>
          <h2 className="heading text-[clamp(2rem,4.2vw,3.1rem)]">
            Kyle's
            <br />
            Lead Gen System
          </h2>
        </Reveal>

        <Reveal delay={0.12} className="mt-12 md:mt-14">
          <VideoFrame
            src={BUILD_VIDEO}
            poster={BUILD_POSTER}
            aspect={BUILD_ASPECT}
            label="Watch a full system · 7 min"
          />
        </Reveal>
      </Container>
    </section>
  );
}

/* ═══ RESULTS ═══════════════════════════════════════════════════
   Lives in components/site/ProofWall.tsx - filmed reviews, written
   reviews and screenshots of the work, mixed into one collage.
   ═══════════════════════════════════════════════════════════════ */

/* ═══ MISSION ════════════════════════════════════════════════════ */

function Mission() {
  return (
    <section id="mission" className="relative z-10 py-20 md:py-28">
      <Container>
        <div className="hairline-rule mb-14 md:mb-16" />
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="mono-label-ember mb-8">Why we do it</p>
            <p className="display-light text-[clamp(1.75rem,4vw,2.9rem)] leading-[1.22]">
              A coach with their week back can take on more people - and be
              better for the ones they already have.
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mx-auto mt-10 max-w-[600px] text-[16px] leading-[1.85] text-ash md:text-[17px]">
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

/* ═══ APPLY ══════════════════════════════════════════════════════ */

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
                  <span className="font-mono text-[11px] leading-[1.6] tracking-[0.12em] text-ember">
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

export default function Home() {
  /* Arriving from a sub-page as /#apply: the sections don't exist until this
     component mounts, so the browser can't do the jump itself. It has to be
     instant - a smooth scroll started this early gets cancelled before it
     travels, which reads as the link doing nothing. */
  useEffect(() => {
    const id = window.location.hash.slice(1);
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
        <WhatWeBuild />
        <ProofWall />
        <Mission />
        <Apply />
      </main>
      <Footer />
      <AdminAccess />
    </div>
  );
}
