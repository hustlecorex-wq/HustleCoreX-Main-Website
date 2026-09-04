import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

import Container from "@/components/site/Container";
import SectionRule from "@/components/site/SectionRule";

/**
 * Showcase - every finished build in one screen.
 *
 * The dashboards and the websites are not two kinds of work, so they are
 * not two sections. They are one showcase, and what tells them apart is
 * the chrome each one is framed in: a system gets an app window with the
 * product's own section tabs across the top, a site gets a browser window
 * with its address bar. Same stage, same rail, one list.
 *
 * The whole section is one screen tall no matter how many builds are in
 * it. The rail along the bottom carries all of them at once, so nothing
 * is hidden behind a scroll - picking a build swaps the stage rather than
 * adding another 700px to the page.
 *
 * ── Adding a build ────────────────────────────────────────────────────
 * Append to BUILDS. A system takes as many screens as it has tabs; a site
 * takes one. Stills live in client/public/work/ and must all be cut to
 * the same aspect as .window-stage (1680x712) or they will be cropped by
 * object-cover.
 *
 * Nothing in here may be invented. Every line describes something that is
 * visible in the still it sits next to.
 */

type Screen = { tab: string; src: string };

type Build = {
  id: string;
  kind: "system" | "website";
  title: string;
  client: string;
  role: string;
  /* What goes in the window's chrome: a product name for a system, an
     address for a site. Only a domain we actually know - a plausible
     looking one nobody owns is worse than no address at all. */
  chrome: string;
  /* The app's own accent, so the glyph in the title bar belongs to the
     product on screen rather than to this page. */
  glyph?: string;
  blurb: string;
  screens: Screen[];
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
      "Clients send a check-in and it arrives already read. The roster is ranked by who needs her today, risk is scored before she logs in, and the reply is drafted out of their own answers.",
    screens: [
      { tab: "Today", src: "/work/pulsecheck-today.jpg" },
      { tab: "Check-Ins", src: "/work/pulsecheck-review.jpg" },
      { tab: "Automations", src: "/work/pulsecheck-automations.jpg" },
    ],
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
      "Every lead, DM and booked call in one pipeline. Instagram and WhatsApp land in the same inbox with the follow-up already written, so nothing sits unanswered while he is on the gym floor.",
    screens: [
      { tab: "Dashboard", src: "/work/repwise-dashboard.jpg" },
      { tab: "Pipeline", src: "/work/repwise-pipeline.jpg" },
      { tab: "Follow-ups", src: "/work/repwise-followups.jpg" },
    ],
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
    screens: [{ tab: "Home", src: "/work/site-pbelite.jpg" }],
  },
  {
    id: "sts",
    kind: "website",
    title: "Setting The Standard",
    client: "Kyle Shayler",
    role: "IFBB Pro",
    chrome: "Setting The Standard",
    blurb:
      "A pro bodybuilder's site that had to carry the physique without turning into a photo gallery. One enquiry route, and the standard set in the first three words.",
    screens: [{ tab: "Home", src: "/work/site-kyleshayler.jpg" }],
  },
  {
    id: "benola",
    kind: "website",
    title: "Ben Ola",
    client: "Ben Ola",
    role: "Online coach for busy people",
    chrome: "Ben Ola",
    blurb:
      "Built around one promise - a routine you can keep - and one action. The free content sits underneath for anyone who is not ready to book yet.",
    screens: [{ tab: "Home", src: "/work/site-benola.jpg" }],
  },
];

/* How long a build holds the stage before the next one takes it. Long
   enough to read the blurb; it stops for good the moment anyone picks a
   build themselves. */
const DWELL = 7000;

/* Counted rather than typed out, so the line under the eyebrow stays
   true when a build is added to the list above. */
const TALLY = `${BUILDS.length} builds · ${
  BUILDS.filter((b) => b.kind === "system").length
} systems · ${BUILDS.filter((b) => b.kind === "website").length} sites`;

const EASE = [0.22, 1, 0.36, 1] as const;

/* The stage is the single panel every tab in the window bar switches, so
   it needs one id the tabs can point at. */
const STAGE_ID = "showcase-stage";

/* Alt text per still, keyed by the file it describes. The stills are the
   evidence on this page rather than decoration, so they get read out -
   but only the one currently on the stage; see the render below. */
const ALT: Record<string, string> = Object.fromEntries(
  BUILDS.flatMap((b) =>
    b.screens.map((s) => [
      s.src,
      b.kind === "system"
        ? `${b.chrome}, the ${b.title.toLowerCase()} built for ${b.client} - ${s.tab} screen`
        : `${b.title}, the website built for ${b.client}`,
    ]),
  ),
);

/* ── window chrome ─────────────────────────────────────────────────
   A system is an app, so its bar carries the app's mark and its own
   section tabs. A site is a page, so its bar carries window buttons and
   an address. Both are real: the tabs are the product's actual sections
   and the address is only ever a domain we know exists. */

function SystemBar({
  build,
  screen,
  onPick,
}: {
  build: Build;
  screen: number;
  onPick: (i: number) => void;
}) {
  return (
    <div className="window-bar">
      <span className="flex shrink-0 items-center gap-2 pr-1">
        <span
          aria-hidden
          className="h-[13px] w-[13px] rounded-[4px]"
          style={{
            background: build.glyph,
            boxShadow: `0 0 10px -2px ${build.glyph}`,
          }}
        />
        <span className="text-[12.5px] font-medium tracking-[-0.01em] text-chalk/85">
          {build.chrome}
        </span>
      </span>

      <span aria-hidden className="h-4 w-px shrink-0 bg-white/[0.08]" />

      {/* Tabs scroll rather than wrap - a wrapped tab strip would change
          the bar's height and shove the stage down. */}
      <div
        role="tablist"
        aria-label={`${build.title} sections`}
        className="window-tabs scrollbar-hide flex min-w-0 items-center gap-1 overflow-x-auto"
      >
        {build.screens.map((s, i) => (
          <button
            key={s.tab}
            role="tab"
            id={`${build.id}-tab-${i}`}
            aria-selected={i === screen}
            aria-controls={STAGE_ID}
            onClick={() => onPick(i)}
            className={`shrink-0 rounded-md px-2.5 py-1 text-[11.5px] font-medium transition-colors duration-300 ${
              i === screen
                ? "bg-white/[0.09] text-chalk"
                : "text-ash-dim hover:text-ash"
            }`}
          >
            {s.tab}
          </button>
        ))}
      </div>
    </div>
  );
}

/* A padlock next to something that is not an address is a small lie, so
   it only appears when the chrome string really is a domain. */
const isDomain = (s: string) => /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(s);

function BrowserBar({ build }: { build: Build }) {
  const addressed = isDomain(build.chrome);
  return (
    <div className="window-bar">
      <span aria-hidden className="flex shrink-0 items-center gap-[6px] pr-1">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-[9px] w-[9px] rounded-full bg-[#3E3E48]" />
        ))}
      </span>
      <span className="flex min-w-0 flex-1 items-center gap-2 rounded-md bg-black/40 px-2.5 py-1">
        {addressed && (
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
        )}
        <span
          className={`truncate text-[11px] text-ash-dim ${
            addressed
              ? "font-mono tracking-[0.02em]"
              : "font-medium tracking-[-0.01em]"
          }`}
        >
          {build.chrome}
        </span>
      </span>
    </div>
  );
}

/* ── the section ───────────────────────────────────────────────── */

export default function Showcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  const [index, setIndex] = useState(0);
  const [screen, setScreen] = useState(0);
  /* Auto-advance is a way of showing there is more than one build, not a
     carousel someone has to fight. The first deliberate pick ends it. */
  const [taken, setTaken] = useState(false);
  const [hovering, setHovering] = useState(false);
  /* Only the stills that have actually been asked for are in the DOM, so
     the section costs one image on load rather than nine. */
  const [seen, setSeen] = useState<string[]>([BUILDS[0].screens[0].src]);

  const build = BUILDS[index];
  const inView = useInView(sectionRef, { margin: "-25% 0px -25% 0px" });
  const reduced = useReducedMotion();
  /* Whether a build's turn is being timed at all. Hovering is deliberately
     not in here: it pauses the fill in place (see .rail-mark) rather than
     cancelling it, so the marker holds where the visitor stopped it. */
  const timed = inView && !taken && !reduced;

  const show = useCallback((i: number, s: number) => {
    setIndex(i);
    setScreen(s);
    const src = BUILDS[i].screens[s].src;
    setSeen((prev) => (prev.includes(src) ? prev : [...prev, src]));
  }, []);

  /* On a phone the rail is wider than the screen, so the active cell has
     to be brought to it. scrollLeft rather than scrollIntoView, which
     would also drag the page vertically. */
  useEffect(() => {
    const rail = railRef.current;
    const cell = rail?.children[index] as HTMLElement | undefined;
    if (!rail || !cell || rail.scrollWidth <= rail.clientWidth) return;
    rail.scrollTo({
      left: cell.offsetLeft - (rail.clientWidth - cell.clientWidth) / 2,
      behavior: reduced ? "auto" : "smooth",
    });
  }, [index, reduced]);

  const current = build.screens[screen].src;

  return (
    <section
      id="system"
      ref={sectionRef}
      className="relative z-10 pt-16 md:pt-20"
    >
      <Container>
        {/* Section rule. The number on the right is a count of what is in
            the rail below, so it stays true when a build is added. */}
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
            <p className="max-w-[42ch] text-[15px] leading-[1.75] text-ash md:pb-2 md:text-right">
              The dashboards coaches run their week from, and the sites their
              clients land on. One list, because it is one job.
            </p>
          </div>
        </motion.div>

        {/* The stage */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
          className="mt-12 md:mt-14"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onFocusCapture={() => setHovering(true)}
          onBlurCapture={() => setHovering(false)}
        >
          <div className="window">
            {build.kind === "system" ? (
              <SystemBar
                build={build}
                screen={screen}
                onPick={(i) => {
                  setTaken(true);
                  show(index, i);
                }}
              />
            ) : (
              <BrowserBar build={build} />
            )}

            <div
              className="window-stage"
              data-kind={build.kind}
              id={STAGE_ID}
              /* Only a system's window has tabs, so only a system's stage is
                 the panel one of them controls. */
              role={build.kind === "system" ? "tabpanel" : undefined}
              aria-labelledby={
                build.kind === "system"
                  ? `${build.id}-tab-${screen}`
                  : undefined
              }
            >
              {seen.map((src) => (
                <img
                  key={src}
                  src={src}
                  /* The stills that are faded out are still in the DOM so the
                     crossfade has something to cross from. Describing them
                     would read the whole showcase out at once, so only the
                     one on the stage carries its description. */
                  alt={src === current ? ALT[src] : ""}
                  aria-hidden={src !== current}
                  decoding="async"
                  className={
                    src === current
                      ? "opacity-100"
                      : "pointer-events-none scale-[1.015] opacity-0"
                  }
                />
              ))}
            </div>
          </div>

          {/* Caption. Left says what it is and whose it is, right says what
              it does - so the eye can stop at either one. */}
          <div className="mt-7 grid gap-5 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] md:gap-14">
            <div>
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
              <h3 className="heading mt-4 text-[clamp(1.4rem,2.6vw,1.85rem)]">
                {build.title}
              </h3>
            </div>
            <p className="text-[15px] leading-[1.8] text-ash md:pt-1">
              {build.blurb}
            </p>
          </div>
        </motion.div>
      </Container>

      {/* The rail. Full-bleed so the row of builds reads as the floor the
          stage is standing on rather than another card. */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.16 }}
        className="mt-12 border-y border-white/[0.06] md:mt-16"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
          <div
            ref={railRef}
            className="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto"
          >
            {BUILDS.map((b, i) => {
              const on = i === index;
              return (
                <button
                  key={b.id}
                  onClick={() => {
                    setTaken(true);
                    show(i, 0);
                  }}
                  aria-current={on ? "true" : undefined}
                  className={`rail-item group min-w-[62%] shrink-0 snap-start border-l border-white/[0.05] px-5 py-6 text-left first:border-l-0 sm:min-w-[38%] md:min-w-0 md:flex-1 md:px-6 md:py-7 ${
                    on ? "bg-white/[0.03]" : "hover:bg-white/[0.028]"
                  }`}
                >
                  {/* Selection marker and auto-advance timer are the same
                      object: it fills while the build holds the stage, and
                      simply sits full-width once nobody is advancing. */}
                  {on && (
                    <span
                      aria-hidden
                      className="rail-mark"
                      /* Keyed on the build alone, so hovering only pauses
                         the fill - it does not remount the element and
                         start it over. */
                      data-timing={timed ? "true" : undefined}
                      data-paused={hovering ? "true" : undefined}
                      style={{ "--dwell": `${DWELL}ms` } as React.CSSProperties}
                      /* The bar reaching the end IS the cue to advance, so
                         there is no second clock that can drift out of step
                         with what the visitor can see. */
                      onAnimationEnd={() =>
                        show((index + 1) % BUILDS.length, 0)
                      }
                    />
                  )}

                  <span
                    className={`block font-mono text-[9px] uppercase tracking-[0.16em] transition-colors duration-300 ${
                      on
                        ? b.kind === "system"
                          ? "text-ember"
                          : "text-ash"
                        : "text-ash-faint"
                    }`}
                  >
                    {b.kind === "system" ? "System" : "Website"}
                  </span>
                  <span
                    className={`mt-2.5 block text-[14px] font-medium leading-snug transition-colors duration-300 ${
                      on ? "text-chalk" : "text-ash-dim group-hover:text-ash"
                    }`}
                  >
                    {b.title}
                  </span>
                  {/* Ben Ola's site is called Ben Ola - printing the name
                      twice reads as a bug rather than as attribution. */}
                  {b.client !== b.title && (
                    <span className="mt-1 block truncate text-[12px] text-ash-faint">
                      {b.client}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
