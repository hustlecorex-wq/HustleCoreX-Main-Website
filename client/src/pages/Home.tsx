import { Suspense, lazy, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import Nav, { Logo, goTo } from "@/components/site/Nav";
import { HeroBeam, SiteBackdrop } from "@/components/site/Ambient";
import ApplyForm from "@/components/site/ApplyForm";
import ProofWall from "@/components/site/ProofWall";
import VideoFrame from "@/components/site/VideoFrame";
import AdminAccess from "@/components/site/AdminAccess";
import Cursor from "@/components/site/Cursor";
import Ignition from "@/components/site/Ignition";
import {
  CursorGlow,
  Scramble,
  Magnetic,
  MaskLine,
  Reveal,
  RiseIntoView,
  RiseWords,
  ScrollProgress,
  Spotlight,
  Stagger,
  StaggerItem,
  Tilt,
  useMotionOk,
} from "@/components/site/motion";

/* The two self-hosted videos. Files live in client/public/; see
   VideoFrame for how to encode a replacement. */
const HERO_VIDEO = "/walkthrough.mp4";
const HERO_POSTER = "/walkthrough-poster.jpg";
const HERO_ASPECT = "1900 / 948";

const BUILD_VIDEO = "/what-we-build.mp4";
const BUILD_POSTER = "/what-we-build-poster.jpg";
const BUILD_ASPECT = "16 / 9";

const EASE = [0.22, 1, 0.36, 1] as const;

/* The shader field is the heaviest thing on the page, so it is fetched
   after first paint and only where it will actually be seen. */
const EmberField = lazy(() => import("@/components/site/EmberField"));

/**
 * Whether to draw the shader field, and whether it is allowed to move.
 *
 * Note the split: reduced motion does NOT turn the field off, it freezes
 * it. A visitor who asked not to be moved still gets the brand; they just
 * get it as a still. Turning it off entirely left them looking at a page
 * that seemed unfinished.
 */
function useHeavyVisuals() {
  const motionOk = useMotionOk();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Runs after the first paint, which is also what defers the chunk.
    // `any-hover` rather than width alone: the question is whether there
    // is a cursor to react to, not how wide the screen is.
    const pointer = window.matchMedia("(any-hover: hover)").matches;
    const wide = window.matchMedia("(min-width: 768px)").matches;
    if (pointer && wide) setReady(true);
  }, []);

  return { field: ready, still: !motionOk };
}

/* Reveal, Stagger and the pointer-reactive wrappers all live in
   components/site/motion.tsx - see the note at the top of that file for
   why none of them re-render on pointer or scroll. */

function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-6 md:px-10 ${className}`}>
      {children}
    </div>
  );
}

/* ═══ HERO ═══════════════════════════════════════════════════════ */

function Hero() {
  const motionOk = useMotionOk();

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.85, ease: EASE, delay },
  });

  /* The headline is the one place that animates on load rather than on
     scroll - it is already in view, so whileInView would never fire. */
  const word = (i: number) => ({
    initial: { y: "108%" },
    animate: { y: "0%" },
    transition: { duration: 0.95, ease: EASE, delay: 0.18 + i * 0.055 },
  });

  const LINE_ONE = "We build the systems".split(" ");

  return (
    <section className="relative pt-[128px] md:pt-[150px]">
      <Container>
        {/* Beam anchor: the light strikes the bottom edge of this block */}
        <div className="relative pb-14 md:pb-16">
          <HeroBeam />

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <h1
              className="text-[clamp(1.95rem,7.4vw,4.6rem)]"
              aria-label="We build the systems online coaches run on"
            >
              {/* Line one is uncovered word by word. Line two is a single
                  clip: it carries a background-clip gradient (.text-lit),
                  and splitting it would restart that gradient per word. */}
              <span
                aria-hidden
                className="display-light block text-white/[0.72]"
              >
                {motionOk
                  ? LINE_ONE.map((w, i) => (
                      <span
                        key={w + i}
                        className="inline-block overflow-hidden pb-[0.14em] align-bottom"
                        style={{ marginBottom: "-0.14em" }}
                      >
                        <motion.span className="inline-block" {...word(i)}>
                          {w}
                          {i < LINE_ONE.length - 1 ? " " : ""}
                        </motion.span>
                      </span>
                    ))
                  : "We build the systems"}
              </span>

              <span aria-hidden className="block overflow-hidden">
                <motion.span
                  className="display text-lit block"
                  initial={
                    motionOk ? { clipPath: "inset(0 0 108% 0)", y: 12 } : false
                  }
                  animate={{ clipPath: "inset(0 0 -14% 0)", y: 0 }}
                  transition={{ duration: 1.15, ease: EASE, delay: 0.34 }}
                >
                  online coaches run on
                </motion.span>
              </span>
            </h1>

            <motion.p
              {...rise(0.52)}
              className="mx-auto mt-7 max-w-[520px] text-[16px] leading-[1.7] text-white/[0.58] md:text-[16.5px]"
            >
              Check-ins, lead follow-up and onboarding, handled automatically -
              so your hours go to coaching instead of admin.
            </motion.p>

            <motion.div
              {...rise(0.62)}
              className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              {/* Only the primary action is magnetic. If both buttons chase
                  the cursor, neither one reads as the thing to press. */}
              <Magnetic className="w-full sm:w-auto">
                <button
                  onClick={() => goTo("apply")}
                  className="btn-ember w-full rounded-full px-7 py-3.5 text-[14.5px] font-medium sm:w-auto"
                >
                  Apply for a free system
                </button>
              </Magnetic>
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
        transition={{ duration: 1.05, ease: EASE, delay: 0.72 }}
        className="relative z-10 mx-auto w-full max-w-[1240px] px-6 md:px-10"
      >
        {/* The frame sits in the beam, so it gets the full treatment: it
            leans toward the cursor and the ember pools where you point. */}
        <Tilt max={3.5} scale={1.008}>
          <Spotlight className="rounded-[26px]" radius={620}>
            <VideoFrame
              src={HERO_VIDEO}
              poster={HERO_POSTER}
              aspect={HERO_ASPECT}
              label="Watch the walkthrough · 4 min"
              className="max-w-[1160px]"
            />
          </Spotlight>
        </Tilt>
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
          <Scramble className="mono-label-ember mb-6 block" text="What we build" />
          {/* Two blocks rather than one string with a max-width: the line
              break here is a design decision, not a wrapping accident. */}
          <h2 className="heading text-[clamp(2rem,4.2vw,3.1rem)]">
            <RiseWords as="div" text="Kyle's" delay={0.08} />
            <RiseWords as="div" text="Lead Gen System" delay={0.135} />
          </h2>
        </Reveal>

        {/* Stands up out of the page as you scroll to it. */}
        <RiseIntoView className="mt-12 md:mt-14" tilt={7}>
          <Tilt max={3} scale={1.006}>
            <Spotlight className="rounded-[26px]" radius={620}>
              <VideoFrame
                src={BUILD_VIDEO}
                poster={BUILD_POSTER}
                aspect={BUILD_ASPECT}
                label="Watch a full system · 7 min"
              />
            </Spotlight>
          </Tilt>
        </RiseIntoView>
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
        {/* The rule draws itself out as the section arrives, rather than
            having been sitting there the whole time. */}
        <motion.div
          className="hairline-rule mb-14 md:mb-16"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-70px" }}
          transition={{ duration: 1.3, ease: EASE }}
        />
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <Scramble className="mono-label-ember mb-8 block" text="Why we do it" />
            <RiseWords
              as="div"
              text="A coach with their week back can take on more people - and be better for the ones they already have."
              className="display-light text-[clamp(1.75rem,4vw,2.9rem)] leading-[1.22]"
              step={0.035}
            />
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
              <Scramble className="mono-label-ember" text="The offer" />
              <span className="inline-flex items-center gap-2 rounded-full border border-ember/25 bg-ember/[0.08] px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-ember">
                <span className="live-dot h-1.5 w-1.5 rounded-full bg-ember" />
                2 spaces left
              </span>
            </div>

            <h2 className="heading text-[clamp(2rem,4.2vw,3.1rem)]">
              <RiseWords as="div" text="We'll build you" />
              <RiseWords as="div" text="one system. Free." delay={0.165} />
            </h2>

            <p className="mt-7 max-w-[420px] text-[16px] leading-[1.8] text-ash">
              If your business is the right fit, we'll pick the single system
              that gives you the most time back, build it properly, and hand it
              over. No fee and no obligation afterwards.
            </p>

            {/* The three steps arrive in order, which is the point of them. */}
            <Stagger as="ol" className="mt-12 space-y-8" step={0.12} delay={0.1}>
              {STEPS.map((s) => (
                <StaggerItem as="li" key={s.n} className="flex gap-5">
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
                </StaggerItem>
              ))}
            </Stagger>

            <p className="mt-12 max-w-[380px] border-l border-white/[0.08] pl-5 text-[13.5px] leading-[1.7] text-ash-dim">
              We only take a handful of free builds each month, so we're
              genuinely selective about fit. Applying costs you nothing either
              way.
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            {/* No tilt on the form - a text field that leans while you aim
                at it is a nuisance. The ember pool is enough. */}
            <Spotlight className="rounded-[26px]" radius={520}>
              <ApplyForm />
            </Spotlight>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/* ═══ FOOTER ═════════════════════════════════════════════════════ */

function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/[0.06] py-14">
      <Container>
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-[320px]">
            <Logo />
            <p className="mt-4 text-[13.5px] leading-[1.7] text-ash-dim">
              Systems and automation for online fitness coaches.
            </p>
          </div>

          <div className="flex gap-16">
            <div>
              <p className="mono-label mb-4">Site</p>
              <ul className="space-y-3">
                {[
                  { id: "system", label: "What we do" },
                  { id: "results", label: "Results" },
                  { id: "mission", label: "Mission" },
                  { id: "apply", label: "Apply" },
                ].map((l) => (
                  <li key={l.id}>
                    <button
                      onClick={() => goTo(l.id)}
                      className="text-[13.5px] text-ash transition-colors hover:text-chalk"
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mono-label mb-4">Contact</p>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://instagram.com/hustlecorex"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-[13.5px] text-ash transition-colors hover:text-chalk"
                  >
                    @hustlecorex
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:info@hustlecorex.com"
                    className="text-[13.5px] text-ash transition-colors hover:text-chalk"
                  >
                    info@hustlecorex.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/[0.05] pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] tracking-[0.1em] text-ash-dim">
            © {new Date().getFullYear()} HUSTLECOREX
          </p>
          <p className="font-mono text-[11px] tracking-[0.1em] text-ash-dim">
            Built for coaches who'd rather be coaching
          </p>
        </div>
      </Container>
    </footer>
  );
}

/* ═══ PAGE ═══════════════════════════════════════════════════════ */

export default function Home() {
  const { field, still } = useHeavyVisuals();

  return (
    <div className="relative min-h-screen bg-void">
      {/* Light, from the bottom up: the shader bed, then the grain and the
          fixed wash over it, then the pointer glow. Content sits above all
          three on z-10. */}
      {field && (
        <Suspense fallback={null}>
          <EmberField still={still} />
        </Suspense>
      )}
      <SiteBackdrop />
      <CursorGlow />
      <ScrollProgress />
      <Ignition />
      <Cursor />
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
