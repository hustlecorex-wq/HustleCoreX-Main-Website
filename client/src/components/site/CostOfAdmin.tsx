import { useEffect, useRef, useState } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { useReducedMotion, useSpring } from "framer-motion";
import { Globe } from "lucide-react";

/**
 * CostOfAdmin - the hero's one interactive element.
 *
 * The mission further down the page says the ceiling on a coach's
 * business is capacity, not ambition. This is that claim made
 * countable: drag to your own admin hours and watch what a year of
 * them actually costs, in workweeks and in the clients they could
 * have been coaching instead.
 *
 * The 15-20 hrs/week figure is VA Masters' published estimate, cited
 * in place rather than presented as this company's own research. The
 * 40-hour week and the coaching-time-per-client figure are stated
 * assumptions, not data - the footnote says so, because a number with
 * no way to check it is worth less than the real one.
 */

const MIN_HOURS = 15;
const MAX_HOURS = 20;
const DEFAULT_HOURS = 17.5;
const WEEKS_PER_YEAR = 52;
const STANDARD_WORKWEEK = 40;
/* How much weekly coaching attention - check-ins, programming, replies -
   one client takes. Stated here and in the footnote, not buried in the
   maths. */
const COACHING_HOURS_PER_CLIENT = 1.25;

/**
 * A number that tweens to each new value instead of jumping. Written to
 * the DOM directly through a ref rather than through React state, so a
 * drag doesn't re-render this on every animation frame - only the one
 * spring subscription does, same as the rest of the app's motion.
 */
function AnimatedNumber({
  value,
  decimals = 0,
}: {
  value: number;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  // Read once - after mount, only the imperative writes below ever touch
  // this node, so React never gets a chance to stomp a tween mid-flight.
  const initialText = useRef(value.toFixed(decimals)).current;
  const reduceMotion = useReducedMotion();
  const spring = useSpring(value, { stiffness: 110, damping: 22, mass: 0.6 });

  useEffect(() => {
    if (reduceMotion) {
      if (ref.current) ref.current.textContent = value.toFixed(decimals);
      return;
    }
    spring.set(value);
  }, [value, decimals, reduceMotion, spring]);

  useEffect(() => {
    if (reduceMotion) return;
    return spring.on("change", (latest) => {
      if (ref.current) ref.current.textContent = latest.toFixed(decimals);
    });
  }, [spring, decimals, reduceMotion]);

  return (
    <span ref={ref} className="tabular">
      {initialText}
    </span>
  );
}

export default function CostOfAdmin() {
  const [hours, setHours] = useState(DEFAULT_HOURS);

  const perYear = hours * WEEKS_PER_YEAR;
  const workweeksLost = perYear / STANDARD_WORKWEEK;
  const extraClients = hours / COACHING_HOURS_PER_CLIENT;

  return (
    <div className="panel rounded-3xl px-6 py-7 text-left sm:px-8 sm:py-8">
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
        <p className="text-[13.5px] leading-snug text-ash">
          Coaches lose{" "}
          <span className="font-medium text-chalk">15 to 20 hours a week</span>{" "}
          to admin - time that never reaches a client.
        </p>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.06] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-ash-dim">
          <Globe size={10} />
          VA Masters
        </span>
      </div>

      <div className="hairline-rule my-6" />

      <div>
        <div className="mb-4 flex items-end justify-between gap-4">
          <p id="admin-hours-label" className="mono-label">
            Your hours a week
          </p>
          <p className="flex items-baseline gap-1.5">
            <span className="text-[26px] font-semibold leading-none text-chalk">
              <AnimatedNumber value={hours} decimals={1} />
            </span>
            <span className="text-[12.5px] text-ash-dim">hrs</span>
          </p>
        </div>

        <SliderPrimitive.Root
          className="admin-slider"
          min={MIN_HOURS}
          max={MAX_HOURS}
          step={0.5}
          value={[hours]}
          onValueChange={([v]) => setHours(v)}
        >
          <SliderPrimitive.Track className="admin-slider-track">
            <SliderPrimitive.Range className="admin-slider-range" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb
            className="admin-slider-thumb"
            aria-labelledby="admin-hours-label"
          />
        </SliderPrimitive.Root>

        <div className="mt-2.5 flex justify-between font-mono text-[9.5px] uppercase tracking-[0.14em] text-ash-faint">
          <span>{MIN_HOURS} hrs</span>
          <span>{MAX_HOURS} hrs</span>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-2 py-4 text-center">
          <p className="text-[21px] font-semibold text-chalk sm:text-[23px]">
            <AnimatedNumber value={perYear} decimals={0} />
          </p>
          <p className="mono-label mt-2">Hours / year</p>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-2 py-4 text-center">
          <p className="text-[21px] font-semibold text-chalk sm:text-[23px]">
            <AnimatedNumber value={workweeksLost} decimals={1} />
          </p>
          <p className="mono-label mt-2">Weeks lost</p>
        </div>
        <div className="rounded-2xl border border-ember/[0.2] bg-ember/[0.06] px-2 py-4 text-center">
          <p className="text-[21px] font-semibold text-flare sm:text-[23px]">
            ~<AnimatedNumber value={extraClients} decimals={0} />
          </p>
          <p className="mono-label mt-2">More clients</p>
        </div>
      </div>

      <p className="mt-5 text-[11px] leading-relaxed text-ash-faint">
        Weeks lost is against a 40-hour workweek. More clients assumes
        about 75 minutes of coaching time per client, per week.
      </p>
    </div>
  );
}
