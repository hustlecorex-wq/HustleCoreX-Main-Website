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
 *  - it starts as soon as the heading comes into view, not halfway up
 *    the screen,
 *  - it replays. The audit fires once; here every return runs it again.
 *
 * ── Why an IntersectionObserver and not ScrollTrigger ──────────────────
 * The audit uses GSAP's ScrollTrigger, and the first version here did too.
 * It replayed unreliably, and the reason is this page rather than the plugin:
 * ScrollTrigger measures the document when it is created, and this document
 * keeps growing afterwards. The proof wheel sizes its runway from the number
 * of cards, which is only known once a HEAD sweep has established which
 * screenshots exist - so the heading's real position lands well below where
 * the trigger thinks it is, and the crossings it is waiting for never happen
 * where it expects. An IntersectionObserver holds no cached geometry and is
 * immune to all of that.
 *
 * GSAP still drives the timeline itself, so the motion is the audit's, down
 * to the easing. It is loaded on demand rather than imported at the top: it
 * is already a dependency but it lives in the /system chunk, and pulling it
 * into the shared bundle for one heading would cost every visitor ~70 kB.
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
      const { gsap } = await import("gsap");
      if (cancelled) return;

      let play = () => {};
      let stop = () => {};

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

        STOPS.forEach((stop_, i) => {
          fallTo(stop_, i === 0 ? T.firstFall : T.laterFalls[i - 1]);
          shake();
        });

        fallTo(0, T.finalFall);
        tl.call(() => {
          setAmount(0);
          setDone(true);
        });

        play = () => {
          reset();
          // `true` replays the leading delay too, so every run is identical.
          tl.restart(true);
        };
        stop = () => {
          tl.pause();
          reset();
        };
      }, el);

      if (cancelled) {
        ctx.revert();
        return;
      }

      /* Fires as the heading comes up from the bottom of the screen - the
         small negative margin only asks it to be properly in, not centred.
         Leaving resets it, so coming back always starts from 4,000 again. */
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) play();
          else stop();
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0 },
      );
      io.observe(el);

      cleanup = () => {
        io.disconnect();
        ctx.revert();
      };
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
