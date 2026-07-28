/**
 * motion - the page's reactive layer.
 *
 * Ambient.tsx gives the site one light source. These primitives let that
 * light answer the visitor: things lean toward the cursor, headlines are
 * uncovered rather than faded in, and the beam tracks where you point.
 *
 * Two rules everything here follows:
 *
 * 1. Nothing re-renders React on pointer or scroll. Every value below is a
 *    MotionValue driven straight onto a transform or a gradient string.
 * 2. Every component checks `useMotionOk()`. With prefers-reduced-motion the
 *    effect degrades to static markup - not to a shorter animation.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionStyle,
} from "framer-motion";

/** Matches --ease-out-quint in index.css. */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** False when the visitor asked for reduced motion. */
export function useMotionOk() {
  return !useReducedMotion();
}

/* ═══ scroll progress ═════════════════════════════════════════════
   A hairline of ember across the top edge. It is the one piece of UI
   that is always telling the truth about where you are. */

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  // Spring, not the raw value: a wheel tick moves scrollYProgress in a
  // single jump, and the bar should catch up rather than teleport.
  const smooth = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    restDelta: 0.001,
  });

  // This one survives reduced motion. It only ever reflects the scroll the
  // visitor is doing themselves, which is not the kind of movement that
  // setting is asking us to stop - so drop the easing and keep the bar.
  const ok = useMotionOk();
  const scaleX = ok ? smooth : scrollYProgress;

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[300] h-[2px] origin-left"
    >
      <div
        className="h-full w-full"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,74,23,0) 0%, var(--ember) 18%, var(--flare) 62%, #FFE3CB 100%)",
          boxShadow: "0 0 14px rgba(255,90,30,0.55)",
        }}
      />
    </motion.div>
  );
}

/* ═══ cursor glow ═════════════════════════════════════════════════
   The site is lit by one ember source. This is that light noticing the
   visitor: a soft warm pool that trails the pointer across the page. */

export function CursorGlow() {
  const x = useMotionValue(-1000);
  const y = useMotionValue(-1000);
  // Heavy damping and low stiffness - the glow should lag well behind the
  // cursor, or it reads as a UI element instead of as light.
  const sx = useSpring(x, { stiffness: 55, damping: 22, mass: 0.7 });
  const sy = useSpring(y, { stiffness: 55, damping: 22, mass: 0.7 });

  const background = useMotionTemplate`radial-gradient(560px circle at ${sx}px ${sy}px, rgba(255,74,23,0.075), rgba(255,74,23,0.02) 42%, transparent 68%)`;

  const ok = useMotionOk();

  useEffect(() => {
    if (!ok) return;
    // The listener lives on the window: this element has pointer-events
    // none, so it would never see a move of its own.
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [ok, x, y]);

  if (!ok) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 hidden md:block"
      style={{ background }}
    />
  );
}

/* ═══ reveal ══════════════════════════════════════════════════════
   The workhorse. Rises, sharpens and settles - the blur is what makes
   it read as "coming into focus" rather than "fading in". */

export function Reveal({
  children,
  delay = 0,
  y = 26,
  className = "",
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  const ok = useMotionOk();

  if (!ok) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(9px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, margin: "-70px" }}
      transition={{ duration: 0.85, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Reveal for a list: children arrive one after another. */
export function Stagger({
  children,
  delay = 0,
  step = 0.08,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  step?: number;
  className?: string;
  /** Keep the semantics of what you are animating - a list stays a list. */
  as?: "div" | "ol" | "ul";
}) {
  const ok = useMotionOk();
  const Tag = as;
  const MotionTag = motion[as];

  if (!ok) return <Tag className={className}>{children}</Tag>;

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-70px" }}
      variants={{
        hidden: {},
        shown: { transition: { staggerChildren: step, delayChildren: delay } },
      }}
    >
      {children}
    </MotionTag>
  );
}

/** A child of <Stagger>. */
export function StaggerItem({
  children,
  className = "",
  y = 18,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  as?: "div" | "li";
}) {
  const ok = useMotionOk();
  const Tag = as;
  const MotionTag = motion[as];

  if (!ok) return <Tag className={className}>{children}</Tag>;

  return (
    <MotionTag
      className={className}
      variants={{
        hidden: { opacity: 0, y, filter: "blur(6px)" },
        shown: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.7, ease: EASE },
        },
      }}
    >
      {children}
    </MotionTag>
  );
}

/* ═══ type reveals ════════════════════════════════════════════════ */

/**
 * Words rise out from behind a clipped edge, one after another - the
 * headline is uncovered rather than faded up.
 *
 * Only for solid-colour type. Gradient text (.text-lit) must use
 * <MaskLine>: splitting it would restart the gradient on every word.
 */
export function RiseWords({
  text,
  delay = 0,
  step = 0.055,
  className = "",
  as: Tag = "span",
}: {
  text: string;
  delay?: number;
  step?: number;
  className?: string;
  as?: "span" | "div";
}) {
  const ok = useMotionOk();
  const words = text.split(" ");

  if (!ok) return <Tag className={className}>{text}</Tag>;

  return (
    <Tag className={className} aria-label={text}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          aria-hidden
          // Descenders would be sliced by a tight clip, hence the padding
          // and the matching negative margin.
          className="inline-block overflow-hidden pb-[0.14em] align-bottom"
          style={{ marginBottom: "-0.14em" }}
        >
          <motion.span
            className="inline-block"
            initial={{ y: "108%" }}
            whileInView={{ y: "0%" }}
            viewport={{ once: true, margin: "-70px" }}
            transition={{ duration: 0.9, ease: EASE, delay: delay + i * step }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/**
 * Uncovers a line top-to-bottom with a clip. Keeps background-clip text
 * gradients intact, which per-word splitting cannot.
 */
export function MaskLine({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ok = useMotionOk();

  if (!ok) return <span className={className}>{children}</span>;

  return (
    <motion.span
      className={className}
      initial={{ clipPath: "inset(0 0 108% 0)", y: 10 }}
      whileInView={{ clipPath: "inset(0 0 -12% 0)", y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 1.05, ease: EASE, delay }}
    >
      {children}
    </motion.span>
  );
}

/**
 * Mono labels decode into place, character by character, the way an
 * instrument resolves a reading. Only for the mono voice - run it on body
 * copy and it reads as a broken font.
 */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\<>-_=*";

export function Scramble({
  text,
  className = "",
  speed = 42,
}: {
  text: string;
  className?: string;
  /** ms per settled character */
  speed?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  const ok = useMotionOk();

  useEffect(() => {
    if (!ok) return;
    const el = ref.current;
    if (!el) return;

    let stopTicking = () => {};

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || started.current) return;
        started.current = true;
        observer.disconnect();

        let settled = 0;
        const id = window.setInterval(() => {
          settled += 1;
          if (settled > text.length) {
            el.textContent = text;
            window.clearInterval(id);
            return;
          }
          const scrambled = text
            .slice(settled)
            .split("")
            .map((c) =>
              c === " " ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
            )
            .join("");
          el.textContent = text.slice(0, settled) + scrambled;
        }, speed);

        stopTicking = () => window.clearInterval(id);
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      stopTicking();
    };
  }, [ok, text, speed]);

  // Renders the real text first: if the effect never runs, the label is
  // still correct and still readable by a screen reader.
  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}

/**
 * Runs `start` once, the first time the element is scrolled into view.
 * Shared by Typewriter and CountdownToFree; Scramble predates it.
 */
function useOnceInView<T extends HTMLElement>(
  start: (el: T) => () => void,
  enabled: boolean,
) {
  const ref = useRef<T>(null);
  const done = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    let stop = () => {};
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || done.current) return;
        done.current = true;
        observer.disconnect();
        stop = start(el);
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      stop();
    };
    // `start` is re-created each render; re-running on that would retype the
    // line every time a parent re-renders. Only `enabled` should retrigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return ref;
}

/**
 * Types a line out character by character, with an ember caret that stops
 * blinking and disappears once the line is finished.
 *
 * Layout is reserved by a hidden copy of the full text underneath, so a
 * heading never reflows mid-type - the same rule the lazy canvas follows.
 * The full text is also what assistive tech and crawlers get, immediately:
 * the typed layer is aria-hidden.
 */
export function Typewriter({
  text,
  className = "",
  delay = 0,
  /** ms per character */
  speed = 32,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
  as?: "span" | "div";
}) {
  const ok = useMotionOk();
  const [typed, setTyped] = useState(0);
  const [finished, setFinished] = useState(false);

  const ref = useOnceInView<HTMLSpanElement>((_el) => {
    let raf = 0;
    let timer = 0;
    const begin = () => {
      const started = performance.now();
      const tick = (now: number) => {
        const n = Math.min(text.length, Math.floor((now - started) / speed));
        setTyped(n);
        if (n < text.length) raf = requestAnimationFrame(tick);
        else setFinished(true);
      };
      raf = requestAnimationFrame(tick);
    };
    timer = window.setTimeout(begin, delay * 1000);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, ok);

  if (!ok) return <Tag className={className}>{text}</Tag>;

  /* Every character is always in the DOM; the untyped ones are just
     transparent. That is what reserves the box - including how the line
     wraps - without a second copy of the text underneath.

     An overlay would have been simpler and was wrong twice over: crawlers
     and copy-paste would see the heading twice, and the accessible name
     would have rested on aria-label on a plain div, which is not reliably
     exposed. This way the real text is present exactly once. */
  const caret = (
    /* Zero-width host, so the caret cannot nudge a single glyph as it
       travels along the line. */
    <span
      key="caret"
      aria-hidden
      style={{ position: "relative", display: "inline-block", width: 0 }}
    >
      <span
        className="tw-caret"
        style={{
          position: "absolute",
          left: "0.05em",
          bottom: "0.1em",
          width: "0.06em",
          height: "0.78em",
          background: "var(--ember)",
          boxShadow: "0 0 12px rgba(255,90,30,0.7)",
        }}
      />
    </span>
  );

  return (
    <Tag ref={ref as never} className={className}>
      {Array.from(text).flatMap((ch, i) => {
        const glyph = (
          <span
            key={i}
            style={{ opacity: i < typed ? 1 : 0 }}
            className="[transition:opacity_90ms_linear]"
          >
            {ch}
          </span>
        );
        // The caret rides between what has been typed and what has not.
        return !finished && i === typed ? [caret, glyph] : [glyph];
      })}
      {!finished && typed >= text.length && caret}
    </Tag>
  );
}

/**
 * Counts down from a price to the word "free", cooling from chalk to ember
 * as it falls. Replaces the last word of the apply heading.
 *
 * The countdown is decoration over a claim, so the claim is what gets
 * exposed: aria-label carries the final wording from the first paint and the
 * ticking digits are hidden from assistive tech. Nobody should have to sit
 * through four thousand steps to hear the offer.
 */
export function CountdownToFree({
  from = 4000,
  word = "free",
  className = "",
  durationMs = 2200,
}: {
  from?: number;
  word?: string;
  className?: string;
  durationMs?: number;
}) {
  const ok = useMotionOk();
  const [value, setValue] = useState(from);
  const [landed, setLanded] = useState(false);

  const ref = useOnceInView<HTMLSpanElement>(() => {
    let raf = 0;
    const started = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - started) / durationMs);
      // Ease-out on the count, so it tears through the thousands and slows
      // enough at the end that the last figures are actually readable.
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.max(1, Math.round(from - (from - 1) * eased)));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setLanded(true);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, ok);

  const label = `for ${word}`;

  if (!ok) {
    return (
      <span className={className} style={{ color: "var(--ember)" }}>
        {label}
      </span>
    );
  }

  // Chalk at the top of the count, ember by the time it lands. Interpolated
  // by hand rather than with color-mix, which is newer than this needs to be.
  const t = 1 - (value - 1) / Math.max(1, from - 1);
  const CHALK = [245, 243, 241];
  const EMBER = [255, 74, 23];
  const rgb = CHALK.map((c, i) => Math.round(c + (EMBER[i] - c) * t)).join(", ");

  const widest = `${from.toLocaleString("de-DE")} €`;

  return (
    <span ref={ref} className={className} aria-label={label}>
      <span aria-hidden>for </span>
      {landed ? (
        <span
          aria-hidden
          style={{
            color: "var(--ember)",
            textShadow: "0 0 26px rgba(255,74,23,0.55)",
            transition: "text-shadow 600ms ease-out",
          }}
        >
          {word}
        </span>
      ) : (
        /* While counting, the box is held at the width of the largest figure
           and the digits are drawn over it. Tabular numerals alone would not
           do it - the string itself gets shorter as the number falls, and a
           heading that reflows on every frame is unreadable. One controlled
           change of width at the end, none during. */
        <span
          aria-hidden
          className="relative inline-block"
          style={{
            color: `rgb(${rgb})`,
            fontFamily: "var(--font-mono)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span className="invisible">{widest}</span>
          <span className="absolute inset-0 whitespace-nowrap">
            {value.toLocaleString("de-DE")} €
          </span>
        </span>
      )}
    </span>
  );
}

/* ═══ pointer-reactive surfaces ═══════════════════════════════════ */

/**
 * Pulls its child toward the cursor while the pointer is near, and lets
 * it spring back on leave. Fine on primary buttons, ruinous on anything
 * you have to aim at twice - use it sparingly.
 */
export function Magnetic({
  children,
  strength = 0.32,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 260, damping: 18, mass: 0.4 });

  const ok = useMotionOk();

  if (!ok) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy }}
      // Pointer events only - a touch drag must never move the button
      // out from under the finger that is pressing it.
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * An ember pool that follows the cursor across a surface, plus a border
 * that lights where the pointer is. Wraps cards and video frames.
 */
export function Spotlight({
  children,
  className = "",
  radius = 420,
  style,
}: {
  children: ReactNode;
  className?: string;
  radius?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(-9999);
  const y = useMotionValue(-9999);
  const opacity = useMotionValue(0);

  const background = useMotionTemplate`radial-gradient(${radius}px circle at ${x}px ${y}px, rgba(255,74,23,0.13), rgba(255,74,23,0.04) 38%, transparent 66%)`;

  const ok = useMotionOk();

  if (!ok) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      style={style}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        x.set(e.clientX - r.left);
        y.set(e.clientY - r.top);
        opacity.set(1);
      }}
      onPointerLeave={() => opacity.set(0)}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] rounded-[inherit] transition-opacity duration-500"
        style={{ background, opacity }}
      />
      {children}
    </div>
  );
}

/**
 * Leans a surface toward the cursor. Rotation is deliberately small -
 * past about 7deg the text on the far edge starts to look out of focus.
 */
export function Tilt({
  children,
  className = "",
  max = 5,
  scale = 1.012,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  scale?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const spring = { stiffness: 180, damping: 20, mass: 0.5 };
  const rotateY = useSpring(
    useTransform(px, [0, 1], [-max, max]),
    spring,
  ) as unknown as MotionStyle["rotateY"];
  const rotateX = useSpring(
    useTransform(py, [0, 1], [max, -max]),
    spring,
  ) as unknown as MotionStyle["rotateX"];
  const s = useSpring(1, spring);

  const ok = useMotionOk();

  if (!ok) return <div className={className}>{children}</div>;

  return (
    <div style={{ perspective: 1400 }} className={className}>
      <motion.div
        ref={ref}
        style={{ rotateX, rotateY, scale: s, transformStyle: "preserve-3d" }}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const el = ref.current;
          if (!el) return;
          const r = el.getBoundingClientRect();
          px.set((e.clientX - r.left) / r.width);
          py.set((e.clientY - r.top) / r.height);
        }}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") s.set(scale);
        }}
        onPointerLeave={() => {
          px.set(0.5);
          py.set(0.5);
          s.set(1);
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ═══ scroll-reactive ═════════════════════════════════════════════ */

/**
 * Moves its child against the scroll. `speed` is how far it travels over
 * one full pass through the viewport, in pixels.
 */
export function Parallax({
  children,
  speed = 60,
  className = "",
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useSpring(useTransform(scrollYProgress, [0, 1], [speed, -speed]), {
    stiffness: 90,
    damping: 26,
  });

  const ok = useMotionOk();

  if (!ok) return <div className={className}>{children}</div>;

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}

/**
 * Stands a surface up as it enters the viewport: it starts tipped back
 * and away, and settles flat as it reaches reading position.
 */
export function RiseIntoView({
  children,
  className = "",
  tilt = 9,
}: {
  children: ReactNode;
  className?: string;
  tilt?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const spring = { stiffness: 110, damping: 28 };
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [tilt, 0]),
    spring,
  ) as unknown as MotionStyle["rotateX"];
  const scale = useSpring(
    useTransform(scrollYProgress, [0, 1], [0.94, 1]),
    spring,
  );
  const opacity = useTransform(scrollYProgress, [0, 0.45], [0.4, 1]);

  const ok = useMotionOk();

  if (!ok) return <div className={className}>{children}</div>;

  return (
    <div ref={ref} style={{ perspective: 1600 }} className={className}>
      <motion.div style={{ rotateX, scale, opacity, transformOrigin: "50% 100%" }}>
        {children}
      </motion.div>
    </div>
  );
}
