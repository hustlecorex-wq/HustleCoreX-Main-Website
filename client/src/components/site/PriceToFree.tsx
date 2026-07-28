import { useEffect, useRef, useState } from "react";

/**
 * PriceToFree - lifted from the Systems Audit (`src/components/PriceToFree.tsx`
 * in hcx-audit) and kept deliberately close to it, so the two properties argue
 * the same way.
 *
 * The figure falls, catches on each stop in turn, shakes as though it is
 * resisting, and falls again. After the last stop it gives up and becomes
 * "free". Two colours only: chalk while it is still a price, ember on every
 * shake and on the final word.
 *
 * Three things differ from the audit, all asked for:
 *
 *  - it starts at EUR 4,000 rather than the audit's $5,500,
 *  - it starts later, once the heading is properly on screen,
 *  - it replays. The audit fires once; here scrolling away and coming back
 *    runs it again, so nobody has to reload to see it.
 *
 * GSAP is loaded on demand rather than imported at the top. It is already a
 * dependency but it lives in the /system chunk, and pulling it into the shared
 * bundle to animate one heading would cost every visitor about 70 kB.
 */

const START = 4000;
/** Where it catches on the way down. From the audit, minus its higher start. */
const STOPS = [400, 50] as const;

/**
 * The three second budget, in seconds. The first fall is the long one; each
 * later fall is quicker, so the sequence accelerates towards zero.
 */
const T = {
  delay: 0.15,
  firstFall: 0.85,
  laterFalls: [0.5],
  finalFall: 0.25,
  shake: 0.22,
  hold: 0.1,
};

const money = (v: number) => `${v.toLocaleString("de-DE")} €`;

export default function PriceToFree() {
  const wrap = useRef<HTMLSpanElement>(null);
  const figure = useRef<HTMLSpanElement>(null);
  const [amount, setAmount] = useState(START);
  const [shaking, setShaking] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;

    let cancelled = false;
    let cleanup = () => {};

    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        const counter = { v: START };

        const reset = () => {
          counter.v = START;
          setAmount(START);
          setShaking(false);
          setDone(false);
        };

        const tl = gsap.timeline({ paused: true, delay: T.delay });

        const fallTo = (target: number, duration: number) =>
          tl.to(counter, {
            v: target,
            duration,
            ease: "power2.inOut",
            onUpdate: () => setAmount(Math.max(0, Math.round(counter.v))),
          });

        /** Catches on the number and refuses to move for a beat. */
        const shake = () => {
          tl.call(() => setShaking(true));
          tl.to(figure.current, {
            keyframes: { x: [0, -6, 5, -3, 0], rotate: [0, -1, 0.8, -0.4, 0] },
            duration: T.shake,
            ease: "none",
          });
          tl.to({}, { duration: T.hold });
          tl.call(() => setShaking(false));
        };

        STOPS.forEach((stop, i) => {
          fallTo(stop, i === 0 ? T.firstFall : T.laterFalls[i - 1]);
          shake();
        });

        fallTo(0, T.finalFall);
        tl.call(() => {
          setAmount(0);
          setDone(true);
        });

        ScrollTrigger.create({
          trigger: el,
          /* Deliberately late - later than the audit's 62%. The heading has
             to be properly on screen before a three second sequence is worth
             starting, and it was firing while still half below the fold. */
          start: "top 55%",
          // Runs again every time it is scrolled back into view.
          onEnter: () => {
            reset();
            tl.restart(true);
          },
          onEnterBack: () => {
            reset();
            tl.restart(true);
          },
          onLeave: () => tl.pause(),
          onLeaveBack: () => {
            tl.pause();
            reset();
          },
        });
      }, el);

      cleanup = () => ctx.revert();
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return (
    /* One line of its own, and it never wraps.
       When the figure became the shorter word "free" the line stopped
       wrapping and the whole thing jumped up a line. Reserving the width of
       the widest state and forbidding the wrap keeps it anchored. */
    <span
      ref={wrap}
      className="block whitespace-nowrap"
      style={{ minWidth: "8ch" }}
    >
      <span aria-hidden>for </span>
      {done ? (
        <span className="text-ember-grad">free</span>
      ) : (
        <span
          ref={figure}
          style={{
            display: "inline-block",
            fontFamily: "var(--font-mono)",
            fontVariantNumeric: "tabular-nums",
            color: shaking ? "var(--ember)" : "var(--chalk)",
            transition: "color .18s ease",
          }}
        >
          {money(amount)}
        </span>
      )}
      <span className="sr-only">for free</span>
    </span>
  );
}
