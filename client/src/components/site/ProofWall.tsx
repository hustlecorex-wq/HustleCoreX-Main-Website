import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Maximize2, Star, X } from "lucide-react";

import VideoFrame from "@/components/site/VideoFrame";

/**
 * ProofWall - everything we can actually show, in one collage.
 *
 * The page asks coaches to hand over their business, so the evidence has to
 * outweigh the copy. Rather than sorting the proof into bands - four clips
 * in a row, then four quotes, then the screenshots - it all sits in a single
 * mosaic: a filmed review next to a written one next to the profile and the
 * dashboard we built for that same coach. Mixed, it reads as a body of work.
 * Sorted, it reads as three lists.
 *
 * ── Adding proof ──────────────────────────────────────────────────────
 * TILES below is the collage, in the order it renders. Each entry declares
 * how many columns it takes on desktop, and *rows must add up to 12* - the
 * comments mark where each one ends. Stick to the spans already in SPAN and
 * the row stays flush; invent a new one and you get a ragged edge.
 *
 * Nothing in here may be invented. This section exists to be checked, and a
 * single fabricated tile would make the real ones worthless.
 *
 * Screenshots live in client/public/proof/. A tile whose file is missing
 * removes itself in production rather than leaving a broken frame, so the
 * collage is always safe to ship half-populated; in dev it shows a marker
 * instead so you can see what still needs dropping in.
 */

/* ── the collage ────────────────────────────────────────────────────
   clip  = filmed review   (9:16, 3 cols - sets the height of its row)
   quote = written review  (text, stretches to whatever the row is)
   shot  = screenshot      (wide 7 / narrow 5 / feature 12)
   ─────────────────────────────────────────────────────────────────── */

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
    }
  | {
      kind: "shot";
      span: 5 | 7 | 12;
      src: string;
      label: string;
      title: string;
      meta: string;
      /* Profiles and dashboards put everything that matters down the left
         edge, so they crop from the right rather than from both sides.
         Site heroes are composed centrally and don't. */
      anchor: "left" | "center";
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

  /* ── row 2 · 7 + 5 ─────────────────────────────────────────────── */
  {
    kind: "shot",
    span: 7,
    src: "/proof/site-pbelite.jpg",
    label: "Website",
    title: "PB Elite",
    meta: "Patrick Brody · patrickbrody.com",
    anchor: "center",
  },
  {
    kind: "shot",
    span: 5,
    src: "/proof/ig-patrickbrody.png",
    label: "Profile",
    title: "Patrick Brody",
    meta: "@_patrickbrody · 10.3k",
    anchor: "left",
  },

  /* ── row 3 · 5 + 7 ─────────────────────────────────────────────── */
  {
    kind: "shot",
    span: 5,
    src: "/proof/ig-kyleshayler.png",
    label: "Profile",
    title: "Kyle Shayler",
    meta: "@kyleshayler · 12.3k",
    anchor: "left",
  },
  {
    kind: "shot",
    span: 7,
    src: "/proof/site-kyleshayler.jpg",
    label: "Website",
    title: "Setting The Standard",
    meta: "Kyle Shayler · IFBB Pro",
    anchor: "center",
  },

  /* ── row 4 · 3 + 6 + 3 ─────────────────────────────────────────── */
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

  /* ── row 5 · 7 + 5 ─────────────────────────────────────────────── */
  {
    kind: "shot",
    span: 7,
    src: "/proof/dash-repwise.png",
    label: "System",
    title: "Lead & follow-up CRM",
    meta: "Pipeline, DMs and calls in one place",
    anchor: "left",
  },
  {
    kind: "shot",
    span: 5,
    src: "/proof/ig-tothcoaching.png",
    label: "Profile",
    title: "Bela Toth",
    meta: "@tothcoaching · 7.2k",
    anchor: "left",
  },

  /* ── row 6 · 5 + 7 ─────────────────────────────────────────────── */
  {
    kind: "shot",
    span: 5,
    src: "/proof/ig-benolaaa.png",
    label: "Profile",
    title: "Ben Ola",
    meta: "@benolaaa · 3.3k",
    anchor: "left",
  },
  {
    kind: "shot",
    span: 7,
    src: "/proof/dash-benola.png",
    label: "System",
    title: "Training & vault",
    meta: "42 programs, 1000 exercises, assigned automatically",
    anchor: "left",
  },

  /* ── row 7 · 6 + 6 ─────────────────────────────────────────────── */
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

  /* ── row 8 · 12 ────────────────────────────────────────────────── */
  {
    kind: "shot",
    span: 12,
    src: "/proof/site-benola.jpg",
    label: "Website",
    title: "Build a fitness lifestyle you can keep",
    meta: "Ben Ola · online coach for busy people",
    anchor: "center",
  },
];

/* Column spans, written out in full because Tailwind reads these as literal
   strings - a template like `lg:col-span-${n}` compiles to nothing.

   Desktop is a 12-column bed. Tablet drops to 6, where a screenshot or a
   quote goes full width and clips and profiles pair up; phones get 2, where
   only the clips still sit side by side. */
const SPAN: Record<number, string> = {
  3: "col-span-1 md:col-span-3 lg:col-span-3",
  5: "col-span-2 md:col-span-3 lg:col-span-5",
  6: "col-span-2 md:col-span-6 lg:col-span-6",
  7: "col-span-2 md:col-span-6 lg:col-span-7",
  12: "col-span-2 md:col-span-6 lg:col-span-12",
};

/* Aspect per shot width, tuned so a 7-wide and a 5-wide land on the same
   height and the row edge stays flush. At 1152px with a 20px gutter that's
   617x309 next to 435x311 - close enough that the seam disappears. */
const SHOT_ASPECT: Record<number, string> = {
  5: "aspect-[3/2] lg:aspect-[7/5]",
  7: "aspect-[2/1]",
  12: "aspect-[2/1]",
};

/* ── shared bits ────────────────────────────────────────────────── */

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
        <p className="text-[14px] font-medium leading-tight text-chalk">{c.name}</p>
        <p className="mt-1 text-[12.5px] leading-snug text-ash-dim">{c.role}</p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ash-dim/80">
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
    <figure className="panel flex h-full flex-col justify-between rounded-3xl p-6 transition-colors duration-300 hover:border-white/[0.12] md:p-8">
      <div>
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

/* ── shot tile ──────────────────────────────────────────────────── */

type Shot = Extract<Tile, { kind: "shot" }>;

function ShotCard({
  s,
  absent,
  onOpen,
  onMissing,
}: {
  s: Shot;
  absent: boolean;
  onOpen: (s: Shot) => void;
  onMissing: (src: string) => void;
}) {
  const [failed, setFailed] = useState(false);

  /* A screenshot that hasn't been dropped in yet shouldn't leave a broken
     frame on a live page - it just leaves the collage. In dev it stays put,
     labelled, so it's obvious what's still outstanding. */
  if (absent || failed) {
    if (!import.meta.env.DEV) return null;
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border border-dashed border-white/[0.14] bg-white/[0.015] p-6 text-center ${SHOT_ASPECT[s.span]}`}
      >
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ember/80">
            missing file
          </p>
          <p className="mt-2 font-mono text-[11px] text-ash">{s.src}</p>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(s)}
      aria-label={`${s.title} - view full size`}
      /* h-full alongside the aspect so the tile still contributes its own
         height to the row, then fills the row if its neighbour turns out
         to be taller. */
      className={`group relative block h-full w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-panel text-left transition-all duration-500 hover:border-white/[0.16] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember/60 ${SHOT_ASPECT[s.span]}`}
      style={{ boxShadow: "0 24px 60px -34px rgba(0,0,0,0.95)" }}
    >
      <img
        src={s.src}
        alt={`${s.title} - ${s.label.toLowerCase()} built by HustleCoreX`}
        loading="lazy"
        decoding="async"
        onError={() => {
          setFailed(true);
          onMissing(s.src);
        }}
        /* Duration and easing are written as arbitrary properties on
           purpose. Their shorthand forms are ambiguous to Tailwind, which
           cannot tell a transition from an animation and so emits neither
           rule - silently dropping this drift back to the default 150ms. */
        className={`h-full w-full object-cover transition-transform [transition-duration:900ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035] ${
          s.anchor === "left" ? "object-left-top" : "object-top"
        }`}
      />

      {/* Kind chip, top-left, so the collage reads at a glance */}
      <span className="pointer-events-none absolute left-3 top-3 rounded-full border border-white/[0.12] bg-void/70 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-chalk/85 backdrop-blur-md">
        {s.label}
      </span>

      <span className="pointer-events-none absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.12] bg-void/70 text-chalk/70 opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100">
        <Maximize2 size={12} />
      </span>

      {/* Caption sits on the image so the tiles stay flush in the mosaic */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
        style={{
          background:
            "linear-gradient(to top, rgba(7,7,10,0.92) 0%, rgba(7,7,10,0.55) 50%, transparent 100%)",
        }}
      />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
        <span className="min-w-0">
          <span className="block truncate text-[13.5px] font-medium text-chalk">
            {s.title}
          </span>
          <span className="mt-0.5 block truncate text-[11.5px] text-ash">{s.meta}</span>
        </span>
      </span>
    </button>
  );
}

/* Full-size viewer - a tile is unreadable at collage size, and an unreadable
   dashboard proves nothing. */
function Lightbox({ shot, onClose }: { shot: Shot | null; onClose: () => void }) {
  useEffect(() => {
    if (!shot) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", key);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = overflow;
    };
  }, [shot, onClose]);

  if (!shot) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="dialog"
      aria-modal="true"
      aria-label={shot.title}
      onClick={onClose}
      /* Above the nav (z-200), not below it. At z-90 the fixed header painted
         on top of this and ate the close button. */
      className="fixed inset-0 z-[340] flex items-center justify-center bg-void/90 p-4 backdrop-blur-md md:p-10"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.05] text-chalk/80 transition-colors hover:bg-white/[0.1] hover:text-chalk"
      >
        <X size={17} />
      </button>

      <motion.figure
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-full w-full max-w-6xl overflow-hidden"
      >
        <img
          src={shot.src}
          alt={`${shot.title} - ${shot.label.toLowerCase()} built by HustleCoreX`}
          className="mx-auto max-h-[78vh] w-auto max-w-full rounded-2xl border border-white/[0.1] object-contain"
        />
        <figcaption className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
          <span className="rounded-full border border-white/[0.1] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-ash">
            {shot.label}
          </span>
          <span className="text-[14px] font-medium text-chalk">{shot.title}</span>
          <span className="text-[13px] text-ash-dim">{shot.meta}</span>
        </figcaption>
      </motion.figure>
    </motion.div>
  );
}

/* ── the wall ───────────────────────────────────────────────────── */

const SHOTS = TILES.filter((t): t is Shot => t.kind === "shot");

export default function ProofWall() {
  const [open, setOpen] = useState<Shot | null>(null);

  /* Which screenshots are actually on the server.
   *
   * The per-tile onError would settle this on its own, but the images are
   * lazy - so a missing one wouldn't drop out of the collage until someone
   * scrolled level with it, re-flowing the rows under their eyes. A HEAD
   * sweep on mount settles it before anyone gets there and costs nothing:
   * no image bytes move. onError stays as a backstop for anything that
   * dies after the probe. */
  const [gone, setGone] = useState<string[]>([]);
  const noteMissing = useCallback(
    (src: string) => setGone((g) => (g.includes(src) ? g : [...g, src])),
    [],
  );

  useEffect(() => {
    let live = true;
    void Promise.all(
      SHOTS.map((s) =>
        fetch(s.src, { method: "HEAD" })
          /* A 200 is not enough. vercel.json rewrites everything it doesn't
             recognise to "/", so a screenshot that isn't there comes back as
             the index page with a cheerful 200 - it's the content type that
             tells you whether an actual image arrived. */
          .then((r) =>
            r.ok && r.headers.get("content-type")?.startsWith("image/")
              ? null
              : s.src,
          )
          .catch(() => s.src),
      ),
    ).then((res) => {
      const absent = res.filter((x): x is string => x !== null);
      if (live && absent.length)
        setGone((g) => g.concat(absent.filter((s) => !g.includes(s))));
    });
    return () => {
      live = false;
    };
  }, []);

  return (
    <section id="results" className="relative z-10 py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <Reveal>
          <p className="mono-label-ember mb-6">Results</p>
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <h2 className="heading max-w-xl text-[clamp(2rem,4.2vw,3.1rem)]">
              Coaches who stopped
              <br />
              doing it by hand
            </h2>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ash-dim md:pb-3">
              Tap any tile to open it full size
            </p>
          </div>
        </Reveal>

        {/* The collage. Dense flow so that if a screenshot hasn't been
            dropped in yet, the tiles behind it close the hole instead of
            leaving one. */}
        <div className="mt-14 grid grid-cols-2 grid-flow-row-dense gap-4 md:mt-16 md:grid-cols-6 md:gap-5 lg:grid-cols-12">
          {TILES.map((t, i) => {
            const key = t.kind === "shot" ? t.src : t.kind === "clip" ? t.slug : t.name;
            return (
              <Reveal
                key={`${t.kind}-${key}`}
                delay={0.04 * (i % 3)}
                className={SPAN[t.span]}
              >
                {t.kind === "clip" && <ClipCard c={t} />}
                {t.kind === "quote" && <QuoteCard t={t} />}
                {t.kind === "shot" && (
                  <ShotCard
                    s={t}
                    absent={gone.includes(t.src)}
                    onOpen={setOpen}
                    onMissing={noteMissing}
                  />
                )}
              </Reveal>
            );
          })}
        </div>
      </div>

      <Lightbox shot={open} onClose={() => setOpen(null)} />
    </section>
  );
}
