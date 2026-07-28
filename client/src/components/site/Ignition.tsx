import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useMotionOk } from "./motion";

/**
 * Ignition - the beam striking, once, before the page opens.
 *
 * Three constraints kept this honest, because an intro screen on a
 * lead-generation page is a conversion tax if you get it wrong:
 *
 *  - It runs once per browser session, not once per navigation.
 *  - It is skipped entirely under prefers-reduced-motion.
 *  - It is short, and it cannot trap anyone: any key or click ends it, and
 *    a hard timer removes it even if an animation callback never fires.
 */

const DURATION = 1150;
const KEY = "hcx:ignited";

export default function Ignition() {
  const ok = useMotionOk();
  const [done, setDone] = useState(true);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (!ok) return;
    let seen = true;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
    } catch {
      // Private mode or storage disabled - treat it as already seen. An
      // intro that replays on every page view is worse than none.
    }
    if (seen) return;

    setDone(false);
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* nothing to do - the animation still runs this once */
    }

    const started = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - started) / DURATION);
      setPct(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const end = () => setDone(true);
    // Belt and braces: the timer is what actually guarantees the overlay
    // leaves, whatever happens to the frame loop above.
    const timer = window.setTimeout(end, DURATION + 60);
    window.addEventListener("keydown", end);
    window.addEventListener("pointerdown", end);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.removeEventListener("keydown", end);
      window.removeEventListener("pointerdown", end);
    };
  }, [ok]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[500] flex items-center justify-center bg-void"
          initial={{ opacity: 1 }}
          // Lifts away from the bottom, in the direction the beam travels.
          exit={{ clipPath: "inset(0 0 100% 0)", opacity: 0.9 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative flex w-full max-w-[420px] flex-col items-center px-8">
            {/* The charging core */}
            <motion.div
              className="h-[2px] w-full origin-center"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: DURATION / 1000, ease: [0.4, 0, 0.2, 1] }}
              style={{
                background:
                  "linear-gradient(90deg, transparent, var(--ember) 30%, #FFE3CB 50%, var(--ember) 70%, transparent)",
                boxShadow: "0 0 26px rgba(255,90,30,0.6)",
              }}
            />

            <div className="mt-6 flex w-full items-baseline justify-between">
              <span className="mono-label">Igniting</span>
              <span
                className="text-[13px] tabular-nums text-[color:var(--ember)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {String(pct).padStart(3, "0")}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
