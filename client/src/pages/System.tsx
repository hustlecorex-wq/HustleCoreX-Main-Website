import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

import { Logo } from "@/components/site/Nav";
import StackTowerFallback from "@/components/system/StackTowerFallback";
import {
  formatUsd,
  STACK_TOOLS,
  STACK_TOTAL_MONTHLY,
  STACK_TOTAL_YEARLY,
} from "@/components/system/stackConfig";

/* three + drei + postprocessing are the heaviest thing on the site. They
   are behind this import so they are fetched only once the page has
   painted, and never at all on the fallback path. */
const StackTowerScene = lazy(
  () => import("@/components/system/StackTowerScene"),
);

/* One viewport of scroll per block, plus one for the total. */
const RUNWAY_VH = (STACK_TOOLS.length + 1) * 100;

export default function System() {
  const sectionRef = useRef<HTMLElement>(null);
  const [useCanvas, setUseCanvas] = useState(false);

  useEffect(() => {
    document.title = "The stack tax - HustleCoreX";
  }, []);

  useEffect(() => {
    // Runs after the first paint, which is also what defers the chunk.
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const narrow = window.matchMedia("(max-width: 767px)").matches;
    if (!reducedMotion && !narrow) setUseCanvas(true);
  }, []);

  return (
    <main className="relative bg-[color:var(--void)]">
      <header className="fixed inset-x-0 top-0 z-[200] px-4 pt-4 md:pt-5">
        <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 rounded-full border border-white/[0.06] bg-[rgba(10,10,14,0.72)] py-2 pl-4 pr-2 backdrop-blur-xl md:pl-5">
          <a href="/" aria-label="HustleCoreX - back to the home page">
            <Logo />
          </a>
          <a
            href="/#apply"
            className="btn-ember rounded-full px-5 py-2.5 text-[13.5px] font-medium"
          >
            Apply free
          </a>
        </nav>
      </header>

      {/* ── the tower ─────────────────────────────────────────────
          The section is the scroll runway; the sticky child is what the
          visitor actually looks at. Its height is fixed up front, so
          nothing moves when the canvas chunk lands. */}
      <section ref={sectionRef} style={{ height: `${RUNWAY_VH}vh` }}>
        <div className="sticky top-0 h-screen overflow-hidden">
          {/* Static HTML, rendered on the first pass - the largest thing
              on screen while the canvas is still being fetched. */}
          <div className="pointer-events-none absolute inset-x-0 top-[13vh] z-10 px-6 text-center">
            <p className="mono-label-ember mb-4">The stack tax</p>
            <h1 className="mx-auto max-w-3xl text-[clamp(1.9rem,5vw,3.25rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-chalk">
              Every tool you bolt on is another bill that shows up whether you
              coach or not.
            </h1>
          </div>

          {useCanvas ? (
            <Suspense fallback={null}>
              <StackTowerScene sectionRef={sectionRef} />
            </Suspense>
          ) : (
            <StackTowerFallback />
          )}

          {useCanvas && (
            <p className="pointer-events-none absolute inset-x-0 bottom-8 text-center text-[12.5px] text-ash-dim">
              Scroll to stack it up
            </p>
          )}
        </div>
      </section>

      {/* ── the receipt ───────────────────────────────────────────
          The animation makes the point; this makes it checkable. */}
      <section className="border-t border-white/[0.06] py-24 md:py-32">
        <div className="mx-auto w-full max-w-3xl px-6 md:px-10">
          <p className="mono-label mb-4">What the tower is made of</p>
          <h2 className="mb-10 text-[clamp(1.5rem,3.4vw,2.25rem)] font-semibold leading-tight tracking-[-0.02em] text-chalk">
            List prices, billed monthly. Checked 28 July 2026.
          </h2>

          <ul className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
            {STACK_TOOLS.map((tool) => (
              <li
                key={tool.id}
                className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-5"
              >
                <div className="min-w-0">
                  <p className="text-[15.5px] font-medium text-chalk">
                    {tool.name}
                  </p>
                  <p className="mt-1 text-[13.5px] text-ash">{tool.role}</p>
                  <p className="mt-1 text-[12.5px] text-ash-dim">{tool.tier}</p>
                </div>
                <a
                  href={tool.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-[15px] text-[color:var(--ember)] underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {formatUsd(tool.priceUsd)}/mo
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-baseline justify-between gap-4">
            <span className="text-[15.5px] text-ash">
              Five tools, before a single client is coached
            </span>
            <span
              className="text-[clamp(1.5rem,4vw,2rem)] font-medium text-[color:var(--ember)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {formatUsd(STACK_TOTAL_MONTHLY)}/mo &middot;{" "}
              {formatUsd(STACK_TOTAL_YEARLY)}/yr
            </span>
          </div>

          <a
            href="/#apply"
            className="btn-ember mt-14 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-medium"
          >
            Apply for a free system
            <ArrowRight size={16} />
          </a>
        </div>
      </section>
    </main>
  );
}
