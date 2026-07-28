import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

import { useMotionOk } from "./motion";

/**
 * Cursor - an ember ring that trails the pointer and swells over anything
 * you can press.
 *
 * The native cursor is kept. Hiding it is the usual move here and it is a
 * bad one: the moment a frame drops, the visitor has no pointer at all.
 * This rides alongside it instead, so the page can only ever gain.
 *
 * Mouse only, desktop only. Motion is no longer gated on the visitor's
 * reduced-motion preference anywhere on the site - see useMotionOk.
 */

const HOT_SELECTOR = 'a, button, input, textarea, select, [data-cursor="hot"]';

export default function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const [hot, setHot] = useState(false);
  const [visible, setVisible] = useState(false);

  // The dot keeps up, the ring lags behind it. That gap is the whole
  // effect - a single element tracking exactly would read as a bug.
  const dotX = useSpring(x, { stiffness: 1200, damping: 42, mass: 0.18 });
  const dotY = useSpring(y, { stiffness: 1200, damping: 42, mass: 0.18 });
  const ringX = useSpring(x, { stiffness: 190, damping: 20, mass: 0.55 });
  const ringY = useSpring(y, { stiffness: 190, damping: 20, mass: 0.55 });

  const ok = useMotionOk();

  useEffect(() => {
    if (!ok) return;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const el = e.target as Element | null;
      setHot(Boolean(el?.closest?.(HOT_SELECTOR)));
    };
    const onLeave = () => setVisible(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [ok, x, y]);

  if (!ok) return null;

  return (
    <div aria-hidden className="unzoom pointer-events-none fixed inset-0 z-[400] hidden md:block">
      <motion.div
        className="absolute left-0 top-0 rounded-full"
        style={{ x: ringX, y: ringY }}
        animate={{
          width: hot ? 46 : 26,
          height: hot ? 46 : 26,
          opacity: visible ? (hot ? 0.9 : 0.55) : 0,
          borderColor: hot ? "rgba(255,162,77,0.9)" : "rgba(255,74,23,0.55)",
        }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        // translate(-50%) centres the ring on the point, whatever its size.
        initial={false}
      >
        <div
          className="h-full w-full -translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{
            borderColor: "inherit",
            boxShadow: hot
              ? "0 0 22px rgba(255,90,30,0.45)"
              : "0 0 12px rgba(255,74,23,0.25)",
          }}
        />
      </motion.div>

      <motion.div
        className="absolute left-0 top-0"
        style={{ x: dotX, y: dotY }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <div
          className="h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: "var(--flare)",
            boxShadow: "0 0 10px rgba(255,140,60,0.9)",
          }}
        />
      </motion.div>
    </div>
  );
}
