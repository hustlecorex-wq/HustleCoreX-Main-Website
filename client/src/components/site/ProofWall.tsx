import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star } from "lucide-react";

import Container from "@/components/site/Container";
import SectionRule from "@/components/site/SectionRule";
import VideoFrame from "@/components/site/VideoFrame";

/**
 * ProofWall - the reviews, filmed and written, in one collage.
 *
 * The page asks coaches to hand over their business, so the evidence has
 * to outweigh the copy. Rather than sorting the proof into bands - four
 * clips in a row, then four quotes - it sits in a single mosaic, a filmed
 * review next to a written one. Mixed, it reads as a body of work.
 * Sorted, it reads as two lists.
 *
 * The work itself is not in here. Screenshots of the dashboards and the
 * sites live in Showcase.tsx, where all of it is on one screen; this
 * section is only what other people said.
 *
 * ── Adding proof ──────────────────────────────────────────────────────
 * TILES below is the collage, in the order it renders. Each entry declares
 * how many of the twelve columns it takes, and *rows must add up to 12* -
 * the comments mark where each one ends.
 *
 * Nothing in here may be invented. This section exists to be checked, and
 * a single fabricated tile would make the real ones worthless.
 */

type Tile =
  | {
      kind: "clip";
      span: 3;
      slug: string;
      name: string;
      role: string;
      handle: string;
      length: string;
      poster: string;
    }
  | {
      kind: "quote";
      span: 6;
      quote: string;
      name: string;
      role: string;
      source: string;
      stars: number;
    };

const TILES: Tile[] = [
  /* ── row 1 · 3 + 6 + 3 ─────────────────────────────────────────── */
  {
    kind: "clip",
    span: 3,
    slug: "ben-ola",
    name: "Ben Ola",
    role: "Online coach for busy professionals",
    handle: "@benolaaa",
    length: "1:56",
    poster: "/proof/ben-ola-poster.jpg",
  },
  {
    kind: "quote",
    span: 6,
    quote:
      "My brand didn't reflect the quality of my coaching-my IG was unclear and my website felt outdated. He rebuilt everything with clean branding, a professional site, and smooth automations that saved me time and made my business feel organized. Now my brand looks trustworthy and I show up with way more confidence.",
    name: "Kyle Swinburn",
    role: "Online fitness coach for busy dads",
    source: "Google review",
    stars: 5,
  },
  {
    kind: "clip",
    span: 3,
    slug: "anthony-grace",
    name: "Anthony Grace",
    role: "Fitness coach for busy professionals",
    handle: "Google review",
    length: "1:40",
    poster: "/proof/anthony-grace-poster.jpg",
  },

  /* ── row 2 · 3 + 6 + 3 ─────────────────────────────────────────── */
  {
    kind: "clip",
    span: 3,
    slug: "bela-toth",
    name: "Bela Toth",
    role: "Prep & posing coach",
    handle: "@tothcoaching",
    length: "3:23",
    poster: "/proof/bela-toth-poster.jpg",
  },
  {
    kind: "quote",
    span: 6,
    quote:
      "Overall, the HustleCoreX service has been amazing. The client support is the best I've experienced. He rebuilt my profile, website, and system. What stood out the most was his knowledge of automations and how he connected everything into one system that actually works. Everything runs smoothly now, and I'm consistently getting new clients.",
    name: "Anthony Grace",
    role: "Fitness coach for busy professionals",
    source: "Google review",
    stars: 5,
  },
  {
    kind: "clip",
    span: 3,
    slug: "patrick-brody",
    name: "Patrick Brody",
    role: "Online fitness coach",
    handle: "@_patrickbrody",
    length: "0:52",
    poster: "/proof/patrick-brody-poster.jpg",
  },

  /* ── row 3 · 6 + 6 ─────────────────────────────────────────────── */
  {
    kind: "quote",
    span: 6,
    quote:
      "Signed two new clients the week after we put the system in place. Honestly didn't expect it to do that well that quickly.",
    name: "Bela Toth",
    role: "Prep & posing coach · @tothcoaching",
    source: "Client",
    stars: 0,
  },
  {
    kind: "quote",
    span: 6,
    quote: "I'm impressed to be honest. Very impressed.",
    name: "Ben Ola",
    role: "Online coach for busy people · @benolaaa",
    source: "Instagram",
    stars: 0,
  },
];

/* Column spans, written out in full because Tailwind reads these as literal
   strings - a template like `lg:col-span-${n}` compiles to nothing.

   Desktop is a 12-column bed. Tablet drops to 6, where a quote goes full
   width and the clips pair up; phones get 2, where only the clips still
   sit side by side. */
const SPAN: Record<number, string> = {
  3: "col-span-1 md:col-span-3 lg:col-span-3",
  6: "col-span-2 md:col-span-6 lg:col-span-6",
};

const CLIPS = TILES.filter((t) => t.kind === "clip").length;
const QUOTES = TILES.filter((t) => t.kind === "quote").length;

const EASE = [0.22, 1, 0.36, 1] as const;

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

/* ── clip tile ──────────────────────────────────────────────────── */

type Clip = Extract<Tile, { kind: "clip" }>;

function ClipCard({ c }: { c: Clip }) {
  return (
    <figure className="group">
      <VideoFrame
        src={`/proof/${c.slug}.mp4`}
        poster={c.poster}
        aspect="9 / 16"
        label={`Play · ${c.length}`}
      />
      <figcaption className="mt-4 px-0.5">
        <p className="text-[14px] font-medium leading-tight text-chalk">
          {c.name}
        </p>
        <p className="mt-1 text-[12.5px] leading-snug text-ash-dim">{c.role}</p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ash-faint">
          {c.handle}
        </p>
      </figcaption>
    </figure>
  );
}

/* ── quote tile ─────────────────────────────────────────────────── */

type Quote = Extract<Tile, { kind: "quote" }>;

function QuoteCard({ t }: { t: Quote }) {
  return (
    <figure className="panel flex h-full flex-col rounded-3xl p-6 transition-colors duration-300 hover:border-white/[0.12] md:p-8">
      {/* A quote sitting beside a 9:16 clip has far more height than it
          needs, so it centres in what it is given rather than stranding
          the reader with a column of empty panel. */}
      <div className="flex flex-1 flex-col justify-center">
        {t.stars > 0 && (
          <div className="mb-4 flex gap-1">
            {Array.from({ length: t.stars }).map((_, s) => (
              <Star key={s} size={12} className="fill-ember text-ember" />
            ))}
          </div>
        )}
        <blockquote className="text-[14.5px] leading-[1.7] text-chalk/90 md:text-[15px]">
          {t.quote}
        </blockquote>
      </div>

      <figcaption className="mt-7 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-[12px] font-semibold text-ash">
          {t.name
            .split(" ")
            .map((w) => w[0])
            .join("")}
        </span>
        <div className="min-w-0">
          <p className="text-[13.5px] font-medium text-chalk">{t.name}</p>
          <p className="truncate text-[12px] text-ash-dim">{t.role}</p>
        </div>
        <span className="ml-auto shrink-0 rounded-full border border-white/[0.06] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-ash-dim">
          {t.source}
        </span>
      </figcaption>
    </figure>
  );
}

/* ── the wall ───────────────────────────────────────────────────── */

export default function ProofWall() {
  return (
    <section id="results" className="relative z-10 py-20 md:py-28">
      <Container>
        <Reveal>
          <SectionRule
            label="Results"
            meta={`${CLIPS} filmed · ${QUOTES} written`}
          />

          <h2 className="heading mt-9 max-w-xl text-[clamp(2rem,4.4vw,3.2rem)] md:mt-11">
            Coaches who stopped doing it by hand
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-4 md:mt-16 md:grid-cols-6 md:gap-5 lg:grid-cols-12">
          {TILES.map((t, i) => {
            const key = t.kind === "clip" ? t.slug : t.name;
            return (
              <Reveal
                key={`${t.kind}-${key}`}
                delay={0.04 * (i % 3)}
                className={SPAN[t.span]}
              >
                {t.kind === "clip" ? <ClipCard c={t} /> : <QuoteCard t={t} />}
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
