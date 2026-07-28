import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Maximize2, Star, X } from "lucide-react";

import VideoFrame from "@/components/site/VideoFrame";
import { Scramble, Typewriter, useMotionOk } from "@/components/site/motion";

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

/* ── one card, one size ────────────────────────────────────────────
   Every proof now sits in the same box. Three kinds of evidence at three
   different shapes is what made the old collage read as a mood board;
   identical cards let them be compared instead of just looked at.

   Screenshots are fitted, never cropped - a proof with its edge cut off
   proves less. */

type Clip = Extract<Tile, { kind: "clip" }>;
type Quote = Extract<Tile, { kind: "quote" }>;
type Shot = Extract<Tile, { kind: "shot" }>;

const CARD_W = 380;
const CARD_GAP = 24;
const CARD_H = 540;

type Absent = (src: string) => boolean;

function ClipBody({ c }: { c: Clip }) {
  return (
    <>
      <div className="flex min-h-0 flex-1 items-center justify-center bg-black/40 p-3">
        <div className="h-full" style={{ aspectRatio: "9 / 16" }}>
          <VideoFrame
            src={`/proof/${c.slug}.mp4`}
            poster={c.poster}
            aspect="9 / 16"
            label={`Play · ${c.length}`}
          />
        </div>
      </div>
      <figcaption className="shrink-0 border-t border-white/[0.06] px-5 py-4">
        <p className="text-[14px] font-medium leading-tight text-chalk">{c.name}</p>
        <p className="mt-1 line-clamp-1 text-[12.5px] text-ash-dim">{c.role}</p>
        <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ash-dim/80">
          {c.handle}
        </p>
      </figcaption>
    </>
  );
}

function QuoteBody({ t }: { t: Quote }) {
  return (
    <div className="flex h-full flex-col justify-between p-6 md:p-7">
      <div className="min-h-0">
        {t.stars > 0 && (
          <div className="mb-4 flex gap-1">
            {Array.from({ length: t.stars }).map((_, s) => (
              <Star key={s} size={12} className="fill-ember text-ember" />
            ))}
          </div>
        )}
        <blockquote className="line-clamp-[11] text-[14.5px] leading-[1.7] text-chalk/90">
          {t.quote}
        </blockquote>
      </div>
      <figcaption className="mt-6 shrink-0">
        <p className="text-[14px] font-medium text-chalk">{t.name}</p>
        <p className="mt-1 line-clamp-1 text-[12.5px] text-ash-dim">{t.role}</p>
        <p className="mt-2 font-mono text-[9.5px] uppercase tracking-[0.16em] text-ash-dim/80">
          {t.source}
        </p>
      </figcaption>
    </div>
  );
}

function ShotBody({
  s,
  onOpen,
  onMissing,
}: {
  s: Shot;
  onOpen: (s: Shot) => void;
  onMissing: (src: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(s)}
      className="group flex h-full w-full flex-col text-left"
      aria-label={`Open ${s.title} full size`}
    >
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black/40 p-3">
        <img
          src={s.src}
          onError={() => onMissing(s.src)}
          loading="lazy"
          alt={`${s.title} - ${s.label.toLowerCase()} built by HustleCoreX`}
          className="max-h-full max-w-full object-contain"
        />
        <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.12] bg-void/70 text-chalk/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Maximize2 size={13} />
        </span>
      </div>
      <span className="block shrink-0 border-t border-white/[0.06] px-5 py-4">
        <span className="block font-mono text-[9.5px] uppercase tracking-[0.16em] text-ember">
          {s.label}
        </span>
        <span className="mt-1.5 block text-[14px] font-medium leading-tight text-chalk">
          {s.title}
        </span>
        <span className="mt-1 block line-clamp-1 text-[12.5px] text-ash-dim">
          {s.meta}
        </span>
      </span>
    </button>
  );
}

function ProofCard({
  tile,
  absent,
  onOpen,
  onMissing,
}: {
  tile: Tile;
  absent: Absent;
  onOpen: (s: Shot) => void;
  onMissing: (src: string) => void;
}) {
  const missing = tile.kind === "shot" && absent(tile.src);

  return (
    <figure className="panel flex h-full w-full flex-col overflow-hidden rounded-3xl">
      {tile.kind === "clip" && <ClipBody c={tile} />}
      {tile.kind === "quote" && <QuoteBody t={tile} />}
      {tile.kind === "shot" &&
        (missing ? (
          <div className="flex h-full items-center justify-center p-6 text-center">
            <p className="font-mono text-[11px] text-ash-dim">{tile.title}</p>
          </div>
        ) : (
          <ShotBody s={tile} onOpen={onOpen} onMissing={onMissing} />
        ))}
    </figure>
  );
}

/* ── the carousel ──────────────────────────────────────────────────
   Vertical scroll drives the track sideways. The cards sit on a shallow
   arc - further from the middle means lower and slightly turned - so the
   row reads as the top of a large wheel rather than a filmstrip.

   Card centres are computed from the fixed card width, not measured per
   frame. Reading offsetLeft inside the transform would force a layout on
   every card on every frame. */

function ArcCard({
  index,
  viewportW,
  x,
  intro,
  children,
}: {
  index: number;
  viewportW: number;
  x: MotionValue<number>;
  intro: MotionValue<number>;
  children: React.ReactNode;
}) {
  const centre = index * (CARD_W + CARD_GAP) + CARD_W / 2;
  const dist = useTransform(x, (v) => centre + v - viewportW / 2);

  // A parabola through the middle of the row. 9000 is the radius in
  // disguise: large enough that the arc is felt rather than seen.
  const y = useTransform(dist, (d) => (d * d) / 9000);
  const rotate = useTransform(dist, (d) => (d / 9000) * 90);
  const arcScale = useTransform(dist, (d) => 1 - Math.min(0.14, Math.abs(d) / 5200));
  const near = useTransform(dist, (d) => 1 - Math.min(0.62, Math.abs(d) / 1900));

  // The lead card stands alone and large until the intro beat is over, and
  // the rest arrive with it. That is the "window pops small, wheel appears".
  const introScale = useTransform(intro, (p) => (index === 0 ? 1.34 - 0.34 * p : 1));
  const introFade = useTransform(intro, (p) => (index === 0 ? 1 : p));

  const scale = useTransform([arcScale, introScale], (v) => {
    const [a, b] = v as number[];
    return a * b;
  });
  const opacity = useTransform([near, introFade], (v) => {
    const [a, b] = v as number[];
    return a * b;
  });

  return (
    <motion.div
      className="shrink-0"
      style={{ width: CARD_W, marginRight: CARD_GAP, y, rotate, scale, opacity }}
    >
      {children}
    </motion.div>
  );
}

function Carousel({
  absent,
  onOpen,
  onMissing,
}: {
  absent: Absent;
  onOpen: (s: Shot) => void;
  onMissing: (src: string) => void;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [geom, setGeom] = useState({ maxX: 0, viewportW: 0 });

  useEffect(() => {
    const measure = () => {
      const vp = viewportRef.current;
      if (!vp) return;
      const viewportW = vp.clientWidth;
      const trackW = TILES.length * (CARD_W + CARD_GAP) - CARD_GAP;
      setGeom({ maxX: Math.max(0, trackW - viewportW), viewportW });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // The first slice of the runway is the intro; the rest moves the track.
  const intro = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
  const rawX = useTransform(scrollYProgress, [0, 0.1, 1], [0, 0, -geom.maxX]);
  const x = useSpring(rawX, { stiffness: 140, damping: 30, mass: 0.4 });

  /* Keyboard. The track is driven by page scroll, so moving one card along
     means moving the page by one card's worth of runway. */
  const step = useCallback(
    (dir: 1 | -1) => {
      const section = sectionRef.current;
      if (!section || geom.maxX <= 0) return;
      const runway = section.offsetHeight - window.innerHeight;
      const perCard = (runway * (CARD_W + CARD_GAP)) / geom.maxX;
      window.scrollBy({ top: dir * perCard, behavior: "smooth" });
    },
    [geom.maxX],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const section = sectionRef.current;
      if (!section) return;
      const r = section.getBoundingClientRect();
      const pinned = r.top <= 0 && r.bottom >= window.innerHeight;
      if (!pinned) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  return (
    <div
      ref={sectionRef}
      /* One pixel of page scroll per pixel of sideways travel, plus one
         viewport for the intro. The runway ends and hands scrolling back -
         nobody gets held in here. */
      style={{ height: `calc(100vh + ${Math.round(geom.maxX)}px)` }}
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div ref={viewportRef} className="w-full overflow-hidden px-6 md:px-10">
          <motion.div className="flex items-stretch" style={{ x }}>
            {TILES.map((tile, i) => (
              <ArcCard
                key={`${tile.kind}-${i}`}
                index={i}
                viewportW={geom.viewportW}
                x={x}
                intro={intro}
              >
                <div style={{ height: CARD_H }}>
                  <ProofCard
                    tile={tile}
                    absent={absent}
                    onOpen={onOpen}
                    onMissing={onMissing}
                  />
                </div>
              </ArcCard>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* Reduced motion: the same cards, stacked, scrolling like any other page.
   Driving the page sideways is exactly the kind of movement that setting is
   asking us not to do. */
function ProofList({
  absent,
  onOpen,
  onMissing,
}: {
  absent: Absent;
  onOpen: (s: Shot) => void;
  onMissing: (src: string) => void;
}) {
  return (
    <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {TILES.map((tile, i) => (
        <div key={`${tile.kind}-${i}`} style={{ height: CARD_H }}>
          <ProofCard
            tile={tile}
            absent={absent}
            onOpen={onOpen}
            onMissing={onMissing}
          />
        </div>
      ))}
    </div>
  );
}

/* Full-size viewer - a card is unreadable at carousel size, and an
   unreadable dashboard proves nothing. */
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
      /* Above the nav (z-200), not below it. At z-90 the fixed header
         painted over this and ate the close button. */
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
  const motionOk = useMotionOk();

  /* Which screenshots are actually on the server.
   *
   * The per-card onError would settle this on its own, but the images are
   * lazy - so a missing one wouldn't drop out until someone scrolled level
   * with it, re-flowing the row under their eyes. A HEAD sweep on mount
   * settles it before anyone gets there and costs nothing: no image bytes
   * move. onError stays as a backstop for anything that dies after. */
  const [gone, setGone] = useState<string[]>([]);
  const noteMissing = useCallback(
    (src: string) => setGone((g) => (g.includes(src) ? g : [...g, src])),
    [],
  );
  const absent = useCallback((src: string) => gone.includes(src), [gone]);

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
      const missing = res.filter((x): x is string => x !== null);
      if (live && missing.length)
        setGone((g) => g.concat(missing.filter((s) => !g.includes(s))));
    });
    return () => {
      live = false;
    };
  }, []);

  return (
    <section id="results" className="relative z-10 py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <Reveal>
          <Scramble className="mono-label-ember mb-6 block" text="Results" />
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <h2 className="heading max-w-xl text-[clamp(2rem,4.2vw,3.1rem)]">
              <Typewriter as="div" text="Coaches who stopped" />
              <Typewriter as="div" text="doing it by hand" delay={0.42} />
            </h2>
            <p className="mono-label md:pb-3">
              {motionOk
                ? "Scroll to run the wheel"
                : "Tap any card to open it full size"}
            </p>
          </div>
        </Reveal>
      </div>

      {motionOk ? (
        <Carousel absent={absent} onOpen={setOpen} onMissing={noteMissing} />
      ) : (
        <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
          <ProofList absent={absent} onOpen={setOpen} onMissing={noteMissing} />
        </div>
      )}

      <Lightbox shot={open} onClose={() => setOpen(null)} />
    </section>
  );
}
