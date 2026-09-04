import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

import Container from "@/components/site/Container";
import SectionRule from "@/components/site/SectionRule";
import { goTo } from "@/components/site/Nav";

/**
 * Showcase - every finished build, running, on one screen you pan through.
 *
 * The section pins for as long as it takes to walk the row: scrolling
 * down moves the track sideways, one pixel of pan for one pixel of
 * scroll, so it reads as panning a shelf rather than as the page being
 * taken away. Anyone who would rather not walk it has a Skip in the
 * controls, and the segment row and the arrows jump straight to a build.
 *
 * What is in the frame is the build itself, not a picture of it. Each
 * one is loaded at 1440x900 - its real desktop width - and scaled down,
 * so a visitor can click into Katie's dashboard and use it. The frame is
 * covered until they do: an uncovered iframe eats the wheel, and a
 * carousel driven by the wheel would stop dead over every card.
 *
 * ── Adding a build ────────────────────────────────────────────────────
 * Append to BUILDS with a poster cut to 1440x900, and give it `live`
 * only if the host will actually be framed. Check before assuming:
 *
 *     curl -sI <url> | grep -i "x-frame-options\|content-security"
 *
 * Anything answering X-Frame-Options or frame-ancestors renders as a
 * blank box in the frame, with nothing in the page's own console to say
 * why. Those get the poster and the open-in-a-new-tab link instead,
 * which is what BOWT is doing here.
 *
 * Nothing in here may be invented. Every line describes something that
 * is visible in the build it sits next to.
 */

/* Where a build is embedded it renders at this size and is scaled to
   fit, so every card is the same shape whether it holds a dashboard, a
   website or a still. Posters are cut to match. */
const FRAME_W = 1440;

/* The pinned layout only makes sense where there is room for it: wide
   enough that a neighbouring card is visible, tall enough to hold a
   whole card without scrolling inside the pin. Under it the same track
   becomes an ordinary swipeable rail. Mirrored in index.css - change
   one and change the other. */
const PAN_QUERY = "(min-width: 1024px) and (min-height: 660px)";

type Build = {
  id: string;
  kind: "system" | "website";
  title: string;
  client: string;
  role: string;
  /* What goes in the window's chrome: the product's name for a system,
     the domain for a site. A site's chrome is an address bar with a
     padlock in it, so it may only ever hold a domain that resolves. */
  chrome: string;
  /* The app's own accent, so the mark in the title bar belongs to the
     product on screen rather than to this page. */
  glyph?: string;
  blurb: string;
  /* Where the build opens in a new tab. Every build has one. */
  href: string;
  /* What goes in the frame, when the host allows being framed. */
  live?: string;
  poster: string;
};

const BUILDS: Build[] = [
  {
    id: "pulsecheck",
    kind: "system",
    title: "Check-in dashboard",
    client: "Katie",
    role: "Online coach",
    chrome: "PulseCheck",
    glyph: "#7C5CFF",
    blurb:
      "Check-ins arrive already read. The roster is ranked by who needs her today, and the reply is drafted out of the client's own answers.",
    href: "https://pulsecheck-dashboard.vercel.app/#/clients",
    live: "https://pulsecheck-dashboard.vercel.app/#/clients",
    poster: "/work/live-pulsecheck.jpg",
  },
  {
    id: "repwise",
    kind: "system",
    title: "Lead and follow-up CRM",
    client: "Kyle",
    role: "Head coach",
    chrome: "Repwise",
    glyph: "#1F7A46",
    blurb:
      "Every lead, DM and booked call in one pipeline, with the follow-up already written - so nothing sits unanswered while he is on the gym floor.",
    href: "https://repwise-lead-manager.vercel.app/",
    live: "https://repwise-lead-manager.vercel.app/",
    poster: "/work/live-repwise.jpg",
  },
  {
    id: "bowt",
    kind: "system",
    title: "Client retention board",
    client: "Ben Ola",
    role: "Online coach",
    chrome: "BOWT",
    glyph: "#D7F03A",
    /* BOWT answers X-Frame-Options: SAMEORIGIN, so this one is a still
       and a link rather than a frame. */
    blurb:
      "The client list ordered by who is closest to leaving. Every card carries the reason - quiet three days, workouts missed - and a message ready to send.",
    href: "https://bowt-preview.vercel.app/preview/coach?view=home",
    poster: "/work/live-bowt.jpg",
  },
  {
    id: "sts",
    kind: "website",
    title: "Setting The Standard",
    client: "Kyle Shayler",
    role: "IFBB Pro",
    chrome: "kyleshayler.com",
    blurb:
      "A pro bodybuilder's site that had to carry the physique without turning into a photo gallery. One enquiry route, and the standard set in three words.",
    href: "https://kyleshayler.com/",
    live: "https://kyleshayler.com/",
    poster: "/work/live-kyleshayler.jpg",
  },
  {
    id: "benola",
    kind: "website",
    title: "Ben Ola Fitness",
    client: "Ben Ola",
    role: "Online coach for busy people",
    chrome: "benolafitness.com",
    blurb:
      "Built on one promise - a routine you can keep - and one action. The free content sits underneath for anyone who is not ready to book yet.",
    href: "https://www.benolafitness.com/",
    live: "https://www.benolafitness.com/",
    poster: "/work/live-benola.jpg",
  },
  {
    id: "pbelite",
    kind: "website",
    title: "PB Elite",
    client: "Patrick Brody",
    role: "Online fitness coach",
    chrome: "patrickbrody.com",
    blurb:
      "Written for men who run companies and are short on time. The offer, the length of a session and the free call are all settled above the fold.",
    href: "https://patrickbrody.com/",
    live: "https://patrickbrody.com/",
    poster: "/work/live-pbelite.jpg",
  },
];

const N = BUILDS.length;
const AT = new Map(BUILDS.map((b, i) => [b.id, i]));

/* Counted rather than typed out, so the line under the eyebrow stays
   true when a build is added to the list above. */
const TALLY = `${N} builds · ${
  BUILDS.filter((b) => b.kind === "system").length
} systems · ${BUILDS.filter((b) => b.kind === "website").length} sites`;

const EASE = [0.22, 1, 0.36, 1] as const;

const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

const pad = (n: number) => String(n).padStart(2, "0");

/* The poster is the evidence on this page rather than decoration, so it
   gets read out. */
const posterAlt = (b: Build) =>
  b.kind === "system"
    ? `${b.chrome}, the ${b.title.toLowerCase()} built for ${b.client}`
    : `${b.title}, the website built for ${b.client}`;

/* ── window chrome ─────────────────────────────────────────────────
   A system is an app, so its bar carries the product's mark and name. A
   site is a page, so its bar carries window buttons and its address.
   Both are real: the name is the product's and the address is a domain
   that resolves. */

function BarActions({
  build,
  engaged,
  onRelease,
}: {
  build: Build;
  engaged: boolean;
  onRelease: () => void;
}) {
  return (
    <span className="ml-auto flex shrink-0 items-center gap-1.5 pl-1">
      {engaged ? (
        <button type="button" onClick={onRelease} className="bar-chip bar-chip-live">
          Release
          <kbd className="rounded border border-white/15 px-1 py-px font-mono text-[8px] not-italic">
            esc
          </kbd>
        </button>
      ) : (
        build.live && (
          <span className="bar-chip">
            <span className="live-dot" aria-hidden />
            Live
          </span>
        )
      )}
      <a
        href={build.href}
        target="_blank"
        rel="noreferrer noopener"
        className="bar-icon"
        aria-label={`Open ${build.chrome} in a new tab`}
      >
        <ArrowUpRight className="h-[15px] w-[15px]" />
      </a>
    </span>
  );
}

function SystemBar(props: {
  build: Build;
  engaged: boolean;
  onRelease: () => void;
}) {
  const { build } = props;
  return (
    <div className="window-bar">
      <span className="flex min-w-0 items-center gap-2.5">
        <span
          aria-hidden
          className="h-[13px] w-[13px] shrink-0 rounded-[4px]"
          style={{
            background: build.glyph,
            boxShadow: `0 0 10px -2px ${build.glyph}`,
          }}
        />
        <span className="truncate text-[12.5px] font-medium tracking-[-0.01em] text-chalk/85">
          {build.chrome}
        </span>
      </span>
      <BarActions {...props} />
    </div>
  );
}

function BrowserBar(props: {
  build: Build;
  engaged: boolean;
  onRelease: () => void;
}) {
  const { build } = props;
  return (
    <div className="window-bar">
      <span aria-hidden className="flex shrink-0 items-center gap-[6px] pr-0.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-[9px] w-[9px] rounded-full bg-[#3E3E48]" />
        ))}
      </span>
      <span className="flex min-w-0 flex-1 items-center gap-2 rounded-md bg-black/40 px-2.5 py-1">
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          className="h-[11px] w-[11px] shrink-0 text-ash-faint"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        >
          <rect x="2.4" y="5.2" width="7.2" height="5" rx="1.4" />
          <path d="M4.2 5.2V3.9a1.8 1.8 0 0 1 3.6 0v1.3" />
        </svg>
        <span className="truncate font-mono text-[11px] tracking-[0.02em] text-ash-dim">
          {build.chrome}
        </span>
      </span>
      <BarActions {...props} />
    </div>
  );
}

/* ── a card ────────────────────────────────────────────────────── */

function Card({
  build,
  index,
  active,
  canEmbed,
  embed,
  engaged,
  onEngage,
  onRelease,
}: {
  build: Build;
  index: number;
  active: boolean;
  /* Whether this screen frames builds at all. A phone does not: a
     dashboard drawn 335px wide is not a dashboard, and the live thing
     is one tap away in its own tab instead. */
  canEmbed: boolean;
  /* Whether this build's frame is in the DOM right now - see the mount
     window in Showcase below. */
  embed: boolean;
  engaged: boolean;
  onEngage: () => void;
  onRelease: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  /* pointer-events keeps the mouse out of a frame nobody has asked for.
     inert is what keeps the tab key out of it as well - otherwise
     tabbing through the page walks into a dashboard's whole sidebar. */
  useEffect(() => {
    frameRef.current?.toggleAttribute("inert", !engaged);
  }, [engaged, embed]);

  /* Whether this build can be used in place at all, and whether its
     frame is up yet. Anything that cannot be used in place gets the
     same cue pointing at its own tab, so no card is a dead picture. */
  const tryable = Boolean(build.live) && canEmbed;
  const live = Boolean(build.live) && embed;

  return (
    <figure
      data-card
      data-active={active || undefined}
      data-engaged={engaged || undefined}
      className="showcase-card"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${N}. ${build.title}, ${build.client}`}
    >
      <div className="window" data-window>
        {build.kind === "system" ? (
          <SystemBar build={build} engaged={engaged} onRelease={onRelease} />
        ) : (
          <BrowserBar build={build} engaged={engaged} onRelease={onRelease} />
        )}

        <div className="window-frame">
          {/* The poster holds the frame's shape while the build loads,
              and stays put for a build that will not be framed. */}
          <img
            src={build.poster}
            alt={posterAlt(build)}
            loading={index < 2 ? "eager" : "lazy"}
            decoding="async"
            className="window-poster"
            style={{ opacity: live && loaded ? 0 : 1 }}
          />

          {live && (
            <iframe
              ref={frameRef}
              src={build.live}
              title={`${build.chrome}, running`}
              loading="lazy"
              onLoad={() => setLoaded(true)}
              tabIndex={engaged ? 0 : -1}
              className="window-embed"
              style={{
                opacity: loaded ? 1 : 0,
                pointerEvents: engaged ? "auto" : "none",
              }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          )}

          {tryable
            ? !engaged && (
                <button
                  type="button"
                  className="window-shield"
                  onClick={onEngage}
                  aria-label={`Use the live ${build.chrome} build`}
                >
                  <span className="window-cue">
                    <span className="live-dot" aria-hidden />
                    Click to try it
                  </span>
                </button>
              )
            : (
                <a
                  href={build.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="window-shield"
                >
                  <span className="window-cue">
                    Open the live build
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </a>
              )}
        </div>
      </div>

      {/* Left says what it is and whose it is, right says what it does,
          so the eye can stop at either one. */}
      <figcaption className="mt-5 md:mt-6 md:min-h-[7.5rem]">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full border px-2.5 py-[3px] font-mono text-[9px] uppercase tracking-[0.16em] ${
              build.kind === "system"
                ? "border-ember/25 bg-ember/[0.07] text-ember"
                : "border-white/[0.09] text-ash-dim"
            }`}
          >
            {build.kind === "system" ? "System" : "Website"}
          </span>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ash-dim">
            {build.client} · {build.role}
          </span>
        </div>

        <div className="mt-3.5 flex items-baseline justify-between gap-5">
          <h3 className="heading text-[clamp(1.2rem,1.9vw,1.6rem)]">
            {build.title}
          </h3>
          <a
            href={build.href}
            target="_blank"
            rel="noreferrer noopener"
            className="group inline-flex shrink-0 items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-ash-dim transition-colors duration-300 hover:text-chalk"
          >
            Open
            <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover:-translate-y-px group-hover:translate-x-px" />
          </a>
        </div>

        <p className="mt-2.5 line-clamp-3 text-[14px] leading-[1.7] text-ash">
          {build.blurb}
        </p>
      </figcaption>
    </figure>
  );
}

/* ── the section ───────────────────────────────────────────────── */

export default function Showcase() {
  /* The section root, which also carries the CSS custom properties the
     measure effect writes. */
  const rootRef = useRef<HTMLElement>(null);
  /* The tall block the pin runs the length of. */
  const panRef = useRef<HTMLDivElement>(null);
  /* The viewport-height box the cards sit in, pinned or not. */
  const railRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const reduced = useReducedMotion() ?? false;
  /* Read on the first render rather than in an effect, so a wide screen
     never paints the swipe layout for a frame before switching. */
  const [wide, setWide] = useState(
    () =>
      typeof window !== "undefined" && window.matchMedia(PAN_QUERY).matches,
  );
  /* Scroll-driving the track is motion someone can ask not to have. The
     frames are not, so they stay either way. */
  const pan = wide && !reduced;

  const [active, setActive] = useState(0);
  const [engaged, setEngaged] = useState<string | null>(null);
  const [armed, setArmed] = useState(false);
  const [travel, setTravel] = useState(0);
  /* Which builds are allowed a frame right now. */
  const [mounted, setMounted] = useState<string[]>([]);

  const travelAt = useRef(0);
  const stepAt = useRef(0);
  const panAt = useRef(pan);
  panAt.current = pan;
  const reducedAt = useRef(reduced);
  reducedAt.current = reduced;

  useEffect(() => {
    const mq = window.matchMedia(PAN_QUERY);
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /* ── measurement ────────────────────────────────────────────────
     Three numbers come out of the layout rather than being assumed:
     the page's own margin, how far a 1440px render has to shrink to
     fit the frame it ended up in, and how far the track has to travel
     to bring its last card to the right-hand edge. */
  const measure = useCallback(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;

    const w = root.clientWidth;
    /* The track is full bleed, so it has to be told where the page's
       margin is or the first card will not line up with the paragraph
       above it. Measured off the element rather than taken from 100vw,
       which counts a scrollbar the content does not have. */
    const gutter = `${Math.max(w >= 768 ? 40 : 24, (w - 1152) / 2 + 40)}px`;
    if (root.style.getPropertyValue("--gutter") !== gutter) {
      root.style.setProperty("--gutter", gutter);
    }

    const cards = Array.from(
      track.querySelectorAll<HTMLElement>("[data-card]"),
    );
    const first = cards[0];
    if (!first) return;

    const frame = first.querySelector<HTMLElement>(".window-frame");
    if (frame?.clientWidth) {
      root.style.setProperty("--fit", `${frame.clientWidth / FRAME_W}`);
    }

    stepAt.current =
      cards.length > 1 ? cards[1].offsetLeft - first.offsetLeft : first.offsetWidth;

    /* The trailing margin is a member of the track rather than padding
       on it, because a flex container drops its end padding out of
       scrollWidth and the last card would stop short of the edge. */
    const tail = track.lastElementChild as HTMLElement | null;
    const width = tail ? tail.offsetLeft + tail.offsetWidth : track.scrollWidth;
    const next = panAt.current ? Math.max(0, Math.round(width - w)) : 0;
    travelAt.current = next;
    setTravel(next);
  }, []);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    if (rootRef.current) ro.observe(rootRef.current);
    return () => ro.disconnect();
  }, [measure, pan]);

  /* ── the pan ────────────────────────────────────────────────────
     One pixel of track for one pixel of scroll. The position is read
     off the block's own rectangle every frame rather than off a cached
     offset: an image loading higher up the page moves it, and a pan
     that is one image out of step is worse than one that costs a read. */
  useEffect(() => {
    const track = trackRef.current;
    if (!pan) {
      track?.style.removeProperty("transform");
      return;
    }

    let frame = 0;
    const apply = () => {
      frame = 0;
      const block = panRef.current;
      if (!block || !track) return;
      const t = travelAt.current;
      const p = t > 0 ? clamp(-block.getBoundingClientRect().top / t, 0, 1) : 0;
      track.style.transform = `translate3d(${-(p * t)}px,0,0)`;
      if (stepAt.current > 0) {
        setActive(clamp(Math.round((p * t) / stepAt.current), 0, N - 1));
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pan, travel]);

  /* The swipe layout has no pan to read, so the rail's own scroll says
     which card is being looked at. */
  const railFrame = useRef(0);
  const onRailScroll = useCallback(() => {
    if (railFrame.current) return;
    railFrame.current = requestAnimationFrame(() => {
      railFrame.current = 0;
      const rail = railRef.current;
      if (!rail || stepAt.current <= 0) return;
      setActive(clamp(Math.round(rail.scrollLeft / stepAt.current), 0, N - 1));
    });
  }, []);

  /* Both layouts are driven by a scroll position, so jumping to a build
     means scrolling to where that build already is - there is no second
     idea of "which one is showing" that could drift out of step. */
  const jumpTo = useCallback((i: number) => {
    const next = clamp(i, 0, N - 1);
    const behavior: ScrollBehavior = reducedAt.current ? "instant" : "smooth";
    const step = stepAt.current;

    if (panAt.current) {
      const block = panRef.current;
      if (!block) return;
      const top = block.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: top + Math.min(next * step, travelAt.current),
        behavior,
      });
    } else {
      railRef.current?.scrollTo({ left: next * step, behavior });
      setActive(next);
    }
  }, []);

  /* Nothing is framed until the section is nearly on screen, so the page
     loads at the cost of six stills rather than six applications. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root || armed) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setArmed(true);
          io.disconnect();
        }
      },
      { rootMargin: "500px 0px" },
    );
    io.observe(root);
    return () => io.disconnect();
  }, [armed]);

  /* The mount window: the build being read and its neighbours, so the
     next one is already up by the time it arrives, and anything more
     than two away is dropped. Four applications running at once is the
     ceiling; six was enough to make an older laptop stutter mid-pan. */
  useEffect(() => {
    if (!armed || !wide) return;
    setMounted((prev) => {
      const keep = prev.filter(
        (id) => Math.abs((AT.get(id) ?? 0) - active) <= 2,
      );
      for (let d = -1; d <= 1; d += 1) {
        const b = BUILDS[active + d];
        if (b?.live && !keep.includes(b.id)) keep.push(b.id);
      }
      const same = (a: string[]) => [...a].sort().join("|");
      return same(prev) === same(keep) ? prev : keep;
    });
  }, [armed, wide, active]);

  /* The pointer goes back to the page when the build being read changes,
     when Escape is pressed, and when anything outside a window is
     clicked - so nobody is left holding a frame they cannot scroll out
     of. Escape pressed inside the frame never reaches us, which is why
     the window bar carries a Release button as well. */
  useEffect(() => {
    setEngaged(null);
  }, [active]);

  useEffect(() => {
    if (!engaged) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEngaged(null);
    };
    const onDown = (e: MouseEvent) => {
      const el = e.target as Element | null;
      if (!el?.closest?.("[data-window]")) setEngaged(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown, true);
    };
  }, [engaged]);

  const gutters = { paddingInline: "var(--gutter)" } as const;

  return (
    <section
      id="system"
      ref={rootRef}
      className="showcase relative z-10 pt-16 md:pt-20"
    >
      <Container>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <SectionRule label="Selected work" meta={TALLY} />

          <div className="mt-9 grid gap-6 md:mt-11 md:grid-cols-[1fr_auto] md:items-end md:gap-14">
            <h2 className="heading max-w-[16ch] text-[clamp(2rem,4.4vw,3.2rem)]">
              Everything we have handed over
            </h2>
            <p className="max-w-[44ch] text-[15px] leading-[1.75] text-ash md:pb-2 md:text-right">
              The dashboards coaches run their week from and the sites their
              clients land on. Most of them are running inside this page - click
              into one and use it.
            </p>
          </div>
        </motion.div>
      </Container>

      <div
        ref={panRef}
        style={pan ? { height: `calc(100svh + ${travel}px)` } : undefined}
        className="relative mt-12 md:mt-14"
      >
        <div
          className={
            pan
              ? "sticky top-0 flex h-[100svh] flex-col overflow-hidden pb-7 pt-[92px]"
              : "flex flex-col"
          }
        >
          {/* Pinned, the section loses the heading it scrolled in under,
              so it keeps a one-line version of it. */}
          {pan && (
            <div style={gutters} className="shrink-0">
              <SectionRule
                label="Selected work"
                meta={`${pad(active + 1)} / ${pad(N)}`}
              />
            </div>
          )}

          <div
            ref={railRef}
            onScroll={pan ? undefined : onRailScroll}
            className={
              pan
                ? "flex min-h-0 flex-1 items-center overflow-hidden"
                : "showcase-rail scrollbar-hide flex snap-x snap-mandatory overflow-x-auto"
            }
          >
            <div
              ref={trackRef}
              data-pan={pan || undefined}
              className="showcase-track"
            >
              <span aria-hidden className="showcase-edge" />
              {BUILDS.map((b, i) => (
                <Card
                  key={b.id}
                  build={b}
                  index={i}
                  active={i === active}
                  canEmbed={wide}
                  embed={mounted.includes(b.id)}
                  engaged={engaged === b.id}
                  onEngage={() => setEngaged(b.id)}
                  onRelease={() => setEngaged(null)}
                />
              ))}
              <span aria-hidden className="showcase-edge" />
            </div>
          </div>

          {/* Where you are and where you can go, on one line. */}
          <div
            style={gutters}
            className="mt-7 flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-4"
          >
            <div className="-ml-1 flex items-center">
              {BUILDS.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  className="seg"
                  data-on={i === active || undefined}
                  aria-current={i === active ? "true" : undefined}
                  aria-label={`Show ${b.title}, ${b.client}`}
                  onClick={() => jumpTo(i)}
                >
                  <span aria-hidden className="seg-name">
                    {b.title}
                  </span>
                  <span aria-hidden className="seg-bar" />
                </button>
              ))}
            </div>

            <div className="flex shrink-0 items-center gap-2.5">
              {/* On a phone the row is swiped and the arrows are only in
                  the way of the one control that has to fit. */}
              <button
                type="button"
                className="step-btn hidden items-center justify-center sm:inline-flex"
                disabled={active === 0}
                onClick={() => jumpTo(active - 1)}
                aria-label="Previous build"
              >
                <ArrowLeft className="h-[15px] w-[15px]" />
              </button>
              <button
                type="button"
                className="step-btn hidden items-center justify-center sm:inline-flex"
                disabled={active === N - 1}
                onClick={() => jumpTo(active + 1)}
                aria-label="Next build"
              >
                <ArrowRight className="h-[15px] w-[15px]" />
              </button>

              {/* The way out for anyone who would rather not walk the
                  whole row. */}
              <button
                type="button"
                onClick={() => goTo("build")}
                className="group sm:ml-1.5 inline-flex items-center gap-2 rounded-full border border-white/[0.09] px-3.5 py-[7px] font-mono text-[9px] uppercase tracking-[0.16em] text-ash-dim transition-colors duration-300 hover:border-white/20 hover:text-chalk"
              >
                Skip ahead
                <ArrowDown className="h-3 w-3 transition-transform duration-300 group-hover:translate-y-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
