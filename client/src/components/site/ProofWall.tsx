import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, useInView } from "framer-motion";
import { Maximize2, Star, X } from "lucide-react";

import VideoFrame from "@/components/site/VideoFrame";
import { Scramble, Typewriter } from "@/components/site/motion";

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

type Clip = Extract<Tile, { kind: "clip" }>;
type Quote = Extract<Tile, { kind: "quote" }>;
type Shot = Extract<Tile, { kind: "shot" }>;

/* ── what a card is ────────────────────────────────────────────────
   Two shapes, and only two:

     duo   a coach on camera, with their own written review beside them
     wide  a site we built, landscape, on its own

   Everything else that used to be in here - Instagram profiles and the two
   dashboards - is gone. Not by taste: those six screenshots were never
   added to the repo, so every one of them rendered as a card with a line of
   text and nothing else. They are excluded by rule below rather than by a
   hand-written list, so dropping the files in is all it takes to reconsider.

   Cards share a height so the row stays flush; the widths differ because a
   landscape site and a portrait clip are not the same object. */

const CARD_H = 540;
const CARD_GAP = 28;
/** Share of each card's slot spent held still, laid flat, before moving on. */
const DWELL = 0.55;
const DUO_W = 640;
const WIDE_W = 860;

type Card =
  | { id: string; kind: "duo"; clip: Clip; quote: Quote }
  | { id: string; kind: "wide"; shot: Shot };

/**
 * Pairs each clip with a review and mixes the two shapes so the wheel
 * alternates instead of running four talking heads in a row.
 *
 * Reviews are matched to the coach in the clip wherever one exists - a
 * coach on camera next to their own words is a stronger proof than two
 * unrelated people sharing a card. One pair is unavoidably mixed; both
 * halves carry their own name and source, so nobody is credited with words
 * they did not write.
 */
function buildCards(isAbsent: (src: string) => boolean): Card[] {
  const clips = TILES.filter((t): t is Clip => t.kind === "clip");
  const quotes = TILES.filter((t): t is Quote => t.kind === "quote");
  const sites = TILES.filter(
    (t): t is Shot => t.kind === "shot" && t.label === "Website",
  ).filter((s) => !isAbsent(s.src));

  const spare = [...quotes];
  const take = (name: string) => {
    const own = spare.findIndex((q) => q.name === name);
    const i = own !== -1 ? own : 0;
    return spare.splice(i, 1)[0];
  };

  const duos: Card[] = clips
    .map((clip) => {
      const quote = take(clip.name);
      return quote
        ? ({ id: `duo-${clip.slug}`, kind: "duo", clip, quote } as Card)
        : null;
    })
    .filter((c): c is Card => c !== null);

  const wides: Card[] = sites.map((shot) => ({
    id: `wide-${shot.src}`,
    kind: "wide",
    shot,
  }));

  // Ben Ola opens - his clip is the one that lies flat before the wheel
  // exists - then the two shapes alternate for as long as both last.
  const mixed: Card[] = [];
  for (let i = 0; i < Math.max(duos.length, wides.length); i++) {
    if (duos[i]) mixed.push(duos[i]);
    if (wides[i]) mixed.push(wides[i]);
  }
  return mixed;
}

const cardWidth = (card: Card, viewportW: number) =>
  Math.min(card.kind === "wide" ? WIDE_W : DUO_W, Math.max(260, viewportW - 48));

/* ── card bodies ──────────────────────────────────────────────────── */

function DuoCard({ clip, quote }: { clip: Clip; quote: Quote }) {
  return (
    <figure className="panel flex h-full w-full overflow-hidden rounded-3xl">
      <div className="flex w-[42%] shrink-0 items-center justify-center bg-black/40 p-3">
        <div className="h-full" style={{ aspectRatio: "9 / 16" }}>
          <VideoFrame
            src={`/proof/${clip.slug}.mp4`}
            poster={clip.poster}
            aspect="9 / 16"
            label={`Play · ${clip.length}`}
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between border-l border-white/[0.06] p-6">
        <div className="min-h-0">
          {quote.stars > 0 && (
            <div className="mb-3 flex gap-1">
              {Array.from({ length: quote.stars }).map((_, s) => (
                <Star key={s} size={12} className="fill-ember text-ember" />
              ))}
            </div>
          )}
          <blockquote className="line-clamp-[9] text-[14px] leading-[1.65] text-chalk/90">
            {quote.quote}
          </blockquote>
          <p className="mt-3 text-[13px] font-medium text-chalk">{quote.name}</p>
          <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ash-dim">
            {quote.source}
          </p>
        </div>

        <figcaption className="mt-5 shrink-0 border-t border-white/[0.06] pt-4">
          <p className="text-[14px] font-medium leading-tight text-chalk">
            {clip.name}
          </p>
          <p className="mt-1 line-clamp-1 text-[12.5px] text-ash-dim">
            {clip.role}
          </p>
          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ash-dim/80">
            {clip.handle}
          </p>
        </figcaption>
      </div>
    </figure>
  );
}

function WideCard({
  shot,
  onOpen,
  onMissing,
}: {
  shot: Shot;
  onOpen: (s: Shot) => void;
  onMissing: (src: string) => void;
}) {
  return (
    <figure className="panel h-full w-full overflow-hidden rounded-3xl">
      <button
        type="button"
        onClick={() => onOpen(shot)}
        className="group flex h-full w-full flex-col text-left"
        aria-label={`Open ${shot.title} full size`}
      >
        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black/40 p-3">
          <img
            src={shot.src}
            onError={() => onMissing(shot.src)}
            loading="lazy"
            alt={`${shot.title} - ${shot.label.toLowerCase()} built by HustleCoreX`}
            className="max-h-full max-w-full object-contain"
          />
          <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.12] bg-void/70 text-chalk/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <Maximize2 size={13} />
          </span>
        </div>
        <span className="block shrink-0 border-t border-white/[0.06] px-6 py-4">
          <span className="block font-mono text-[9.5px] uppercase tracking-[0.16em] text-ember">
            {shot.label}
          </span>
          <span className="mt-1.5 block text-[15px] font-medium leading-tight text-chalk">
            {shot.title}
          </span>
          <span className="mt-1 block line-clamp-1 text-[12.5px] text-ash-dim">
            {shot.meta}
          </span>
        </span>
      </button>
    </figure>
  );
}

function CardBody({
  card,
  onOpen,
  onMissing,
}: {
  card: Card;
  onOpen: (s: Shot) => void;
  onMissing: (src: string) => void;
}) {
  return card.kind === "duo" ? (
    <DuoCard clip={card.clip} quote={card.quote} />
  ) : (
    <WideCard shot={card.shot} onOpen={onOpen} onMissing={onMissing} />
  );
}

/* ── the wheel ─────────────────────────────────────────────────────
   Scroll drives the track sideways, but not evenly. Each card gets a slot
   with a plateau in the middle of it, so the track arrives, settles, and
   holds before moving on. That hold is what makes a card read as laid flat
   rather than as something passing by.

   Flat and in-the-wheel are the two ends of one value, `focus`, measured
   from how far a card is from the middle of the viewport:

     focus 1   square on, full size, upright, lit
     focus 0   turned, dropped onto the arc, smaller, dimmed

   So a card rises out of the wheel, lies flat while the track holds, and
   turns back into the wheel as the next one comes forward. */

/* One frame loop, writing transforms straight onto the elements.

   This deliberately does not use framer motion values. On the machine this
   was built on, framer's animation loop sat idle - motion values were set
   and never rendered - and the wheel stayed parked at x=0 no matter where
   the page was scrolled. Chasing that through three layers of abstraction
   cost more than owning the ten lines it replaces. A loop that reads the
   section's rect and writes `transform` has nothing in between to go wrong,
   and it is trivial to inspect: the track carries data-p with the current
   progress. */

function Wheel({
  cards,
  onOpen,
  onMissing,
}: {
  cards: Card[];
  onOpen: (s: Shot) => void;
  onMissing: (src: string) => void;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [viewportW, setViewportW] = useState(0);

  useEffect(() => {
    const measure = () => setViewportW(viewportRef.current?.clientWidth ?? 0);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Widths differ per card, so positions are accumulated rather than indexed.
  const layout = useMemo(() => {
    let cursor = 0;
    return cards.map((card) => {
      const w = cardWidth(card, viewportW);
      const centre = cursor + w / 2;
      cursor += w + CARD_GAP;
      return { centre, width: w };
    });
  }, [cards, viewportW]);

  const live = useRef({ layout, viewportW, n: cards.length });
  live.current = { layout, viewportW, n: cards.length };

  /* The loop only ever *improves* on the resting state. Cards render
     visible and unrotated; if no frame ever runs - a browser that is not
     presenting, a tab that never composites - what is left is a plain row
     of readable cards, not a blank section. Base visibility must never
     depend on an animation loop. */
  useLayoutEffect(() => {
    let raf = 0;
    let shown = 0; // eased x, so the track arrives rather than jumps
    let first = true;

    const apply = () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      const { layout: L, viewportW: vw, n } = live.current;

      if (section && track && n && vw) {
        const total = section.offsetHeight - window.innerHeight;
        const p =
          total > 0
            ? Math.min(1, Math.max(0, -section.getBoundingClientRect().top / total))
            : 0;

        const slot = 1 / n;
        const at = (i: number) => -(L[i].centre - vw / 2);
        const i = Math.min(n - 1, Math.floor(p / slot));
        const within = (p - i * slot) / slot;

        let target: number;
        if (within <= DWELL || i === n - 1) {
          target = at(i);
        } else {
          const t = (within - DWELL) / (1 - DWELL);
          // Ease the hand-over, so a card leaves and the next arrives.
          const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          target = at(i) + (at(i + 1) - at(i)) * e;
        }

        shown = first ? target : shown + (target - shown) * 0.16;
        first = false;

        track.style.transform = `translate3d(${shown.toFixed(2)}px,0,0)`;
        track.dataset.p = p.toFixed(4);

        // Nothing but the lead card is on stage until it starts to give way.
        const revealed = Math.min(1, p / (slot * DWELL || 1));

        cardRefs.current.forEach((el, idx) => {
          if (!el || !L[idx]) return;
          const { centre, width } = L[idx];
          const dist = centre + shown - vw / 2;
          const focus = Math.max(0, 1 - Math.abs(dist) / (width * 0.85));

          const y = (1 - focus) * 74;
          const rot = Math.max(-11, Math.min(11, (dist / (width * 1.1)) * 11));
          const scale = 0.84 + focus * 0.16;
          const dim = 0.22 + focus * 0.78;

          el.style.transform = `translate3d(0,${y.toFixed(1)}px,0) rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
          el.style.opacity = String(idx === 0 ? dim : dim * revealed);
          el.style.zIndex = String(Math.round(focus * 100));
        });
      }

    };

    const frame = () => {
      apply();
      raf = requestAnimationFrame(frame);
    };

    // One placement straight away, so the wheel is correct before the first
    // frame ever arrives - and correct even if none does.
    apply();
    raf = requestAnimationFrame(frame);

    /* Scroll and resize drive it too, not just the frame loop. Belt and
       braces on purpose: a browser that throttles rAF but still dispatches
       scroll gets a working wheel, and one that does the reverse also does.
       Neither path is required for the cards to be readable. */
    window.addEventListener("scroll", apply, { passive: true });
    window.addEventListener("resize", apply);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", apply);
      window.removeEventListener("resize", apply);
    };
  }, [viewportW, cards.length]);

  const step = useCallback(
    (dir: 1 | -1) => {
      const section = sectionRef.current;
      if (!section || !cards.length) return;
      const runway = section.offsetHeight - window.innerHeight;
      window.scrollBy({ top: (dir * runway) / cards.length, behavior: "smooth" });
    },
    [cards.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const section = sectionRef.current;
      if (!section) return;
      const r = section.getBoundingClientRect();
      if (r.top > 0 || r.bottom < window.innerHeight) return;
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

  /* Just under a viewport of scroll per card, so each gets the same share of
     the runway - and the section ends and hands scrolling straight back. */
  const runway = cards.length * 90;

  return (
    <div ref={sectionRef} style={{ height: `calc(100vh + ${runway}vh)` }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div ref={viewportRef} className="w-full overflow-hidden px-6 md:px-10">
          <div ref={trackRef} className="flex items-center will-change-transform">
            {cards.map((card, i) => (
              <div
                key={card.id}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="shrink-0 will-change-transform"
                style={{
                  width: layout[i]?.width ?? DUO_W,
                  marginRight: CARD_GAP,
                  height: CARD_H,
                }}
              >
                <CardBody card={card} onOpen={onOpen} onMissing={onMissing} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Fallback for anything that cannot run the wheel: the same cards, stacked. */
function CardList({
  cards,
  onOpen,
  onMissing,
}: {
  cards: Card[];
  onOpen: (s: Shot) => void;
  onMissing: (src: string) => void;
}) {
  return (
    <div className="mt-14 flex flex-col gap-6">
      {cards.map((card) => (
        <div key={card.id} style={{ height: CARD_H }}>
          <CardBody card={card} onOpen={onOpen} onMissing={onMissing} />
        </div>
      ))}
    </div>
  );
}

/* Full-size viewer - a site is unreadable at card size, and an unreadable
   site proves nothing. */
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

const SITE_SHOTS = TILES.filter(
  (t): t is Shot => t.kind === "shot" && t.label === "Website",
);

export default function ProofWall() {
  const [open, setOpen] = useState<Shot | null>(null);

  /* Which site screenshots are actually on the server.
   *
   * onError alone would settle this, but the images are lazy - a missing one
   * would not drop out until someone scrolled level with it, re-flowing the
   * wheel under their eyes. A HEAD sweep on mount settles it first and costs
   * nothing: no image bytes move. onError stays as a backstop. */
  const [gone, setGone] = useState<string[]>([]);
  const noteMissing = useCallback(
    (src: string) => setGone((g) => (g.includes(src) ? g : [...g, src])),
    [],
  );
  const isAbsent = useCallback((src: string) => gone.includes(src), [gone]);

  useEffect(() => {
    let live = true;
    void Promise.all(
      SITE_SHOTS.map((s) =>
        fetch(s.src, { method: "HEAD" })
          /* A 200 is not enough. vercel.json rewrites anything it does not
             recognise to "/", so a screenshot that isn't there comes back as
             the index page with a cheerful 200 - the content type is what
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

  const cards = useMemo(() => buildCards(isAbsent), [isAbsent]);

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
            <p className="mono-label md:pb-3">Scroll to run the wheel</p>
          </div>
        </Reveal>
      </div>

      {cards.length > 1 ? (
        <Wheel cards={cards} onOpen={setOpen} onMissing={noteMissing} />
      ) : (
        <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
          <CardList cards={cards} onOpen={setOpen} onMissing={noteMissing} />
        </div>
      )}

      <Lightbox shot={open} onClose={() => setOpen(null)} />
    </section>
  );
}
