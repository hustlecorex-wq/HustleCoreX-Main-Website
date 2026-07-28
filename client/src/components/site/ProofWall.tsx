import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight, ChevronDown, Maximize2, Star, X } from "lucide-react";

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
      /* The live address, where we have one. Only ever set this to a site
         that is genuinely reachable there: a dead link on a proof tile is
         worse than no link, and this section exists to be checked. */
      url?: string;
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
    url: "https://patrickbrody.com",
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

/* ── the collage, for phones ────────────────────────────────────────
   Restored verbatim from the layout that is still live on production.

   The wheel is a desktop idea: it takes over vertical scrolling to move
   sideways, and on a phone that fights the one gesture people have. So
   small screens get the original dense grid back - the same tiles, the
   same order, reading top to bottom like the rest of the page.

   A screenshot whose file is missing removes itself here rather than
   leaving a broken frame, which is why the grid is safe to ship
   half-populated. In dev it leaves a marker instead, so what is still
   outstanding stays visible.
   ─────────────────────────────────────────────────────────────────── */

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


/**
 * A proof tile is a link when we know where the real thing lives, and a
 * button that opens the full-size image when we do not. Same markup either
 * way, so the tile looks and focuses identically.
 */
function Frame({
  url,
  onClick,
  children,
  ...rest
}: {
  url?: string;
  onClick: () => void;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} {...rest}>
      {children}
    </button>
  );
}

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
    <Frame
      url={s.url}
      onClick={() => onOpen(s)}
      aria-label={
        s.url ? `Visit ${s.title}` : `${s.title} - view full size`
      }
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
        {s.url ? <ArrowUpRight size={12} /> : <Maximize2 size={12} />}
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
    </Frame>
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
  /* The card goes to the live site when we have its address, and opens the
     full-size image when we do not. The magnifier is always there either
     way - and it sits outside the link rather than inside it, because a
     button nested in an anchor is invalid and behaves differently across
     browsers. */
  const body = (
    <>
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black/40 p-3">
        <img
          src={shot.src}
          onError={() => onMissing(shot.src)}
          loading="lazy"
          alt={`${shot.title} - ${shot.label.toLowerCase()} built by HustleCoreX`}
          className="max-h-full max-w-full object-contain"
        />
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
    </>
  );

  return (
    <figure className="panel group relative h-full w-full overflow-hidden rounded-3xl">
      {shot.url ? (
        <a
          href={shot.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-full w-full flex-col text-left"
          aria-label={`Visit ${shot.title}`}
        >
          {body}
        </a>
      ) : (
        <button
          type="button"
          onClick={() => onOpen(shot)}
          className="flex h-full w-full flex-col text-left"
          aria-label={`Open ${shot.title} full size`}
        >
          {body}
        </button>
      )}

      <button
        type="button"
        onClick={() => onOpen(shot)}
        aria-label={`${shot.title}, full size`}
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.12] bg-void/70 text-chalk/70 opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100"
      >
        <Maximize2 size={13} />
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
        /* Both numbers come from the same rect. offsetHeight is in layout
           pixels and innerHeight is in device pixels, and the page renders
           at zoom 1.1 - mixing the two made the wheel run 10% fast and
           finish before the section did. */
        const rect = section.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;

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
      const runway = section.getBoundingClientRect().height - window.innerHeight;
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
      {/* pt clears the floating nav: the cards used to start level with it, so
          scrolling the wheel ran them straight under the bar. */}
      <div className="sticky top-0 flex h-screen items-center overflow-hidden pt-24">
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

/* Every shot is probed, not only the ones the wheel uses: the phone
   collage shows profiles and dashboards too, and a tile whose file is
   missing has to know to remove itself. */
const ALL_SHOTS = TILES.filter((t): t is Shot => t.kind === "shot");

/** The phone layout: the original collage, unchanged. */
function Collage({
  gone,
  onOpen,
  onMissing,
}: {
  gone: string[];
  onOpen: (s: Shot) => void;
  onMissing: (src: string) => void;
}) {
  return (
    <div className="mt-14 grid grid-flow-row-dense grid-cols-2 gap-4 md:mt-16 md:grid-cols-6 md:gap-5 lg:grid-cols-12">
      {/* Absent shots are dropped rather than rendered empty. A tile whose
          card returns null still occupies its grid cell, which is what left
          the hole between the Anthony Grace review and Bela Toth. */}
      {TILES.filter(
        (t) => !(t.kind === "shot" && gone.includes(t.src)),
      ).map((t, i) => {
        const key =
          t.kind === "shot" ? t.src : t.kind === "clip" ? t.slug : t.name;
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
                onOpen={onOpen}
                onMissing={onMissing}
              />
            )}
          </Reveal>
        );
      })}
    </div>
  );
}

export default function ProofWall() {
  const [open, setOpen] = useState<Shot | null>(null);

  /* The wheel is desktop only. It drives sideways movement from vertical
     scroll, which on a phone competes with the only gesture there is - so
     phones get the collage instead. Read synchronously so the right one is
     there on the first paint, and kept in step with rotation. */
  const [onDesktop, setOnDesktop] = useState(
    () => window.matchMedia("(min-width: 768px)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setOnDesktop(mq.matches);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

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
      ALL_SHOTS.map((s) =>
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
    /* Extra room above the wheel so it does not crowd the heading, and less
     below it so "Why we do it" is already in view while you are still in
     the wheel. */
    <section id="results" className="relative z-10 pb-10 pt-20 md:pb-12 md:pt-28">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <Reveal>
          <Scramble className="mono-label-ember mb-6 block" text="Results" />
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <h2 className="heading max-w-xl text-[clamp(2rem,4.2vw,3.1rem)]">
              <Typewriter as="div" text="Coaches who stopped" />
              <Typewriter as="div" text="doing it by hand" delay={0.42} />
            </h2>
            {/* The caption that used to sit here has moved under the wheel,
                where it can say what happens next instead of what to do. */}
          </div>
        </Reveal>
      </div>

      {onDesktop && cards.length > 1 ? (
        <>
          <Wheel cards={cards} onOpen={setOpen} onMissing={noteMissing} />
          {/* Desktop only. The wheel holds the page for several viewports, so
              it has to say plainly that there is more underneath - otherwise
              the end of the wheel reads as the end of the site. */}
          <div className="mt-6 flex flex-col items-center gap-2">
            <span className="mono-label">Keep scrolling</span>
            <ChevronDown
              size={20}
              className="text-[color:var(--ember)] [animation:nudge_2.2s_ease-in-out_infinite]"
            />
          </div>
        </>
      ) : (
        <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
          <Collage gone={gone} onOpen={setOpen} onMissing={noteMissing} />
        </div>
      )}

      <Lightbox shot={open} onClose={() => setOpen(null)} />
    </section>
  );
}
