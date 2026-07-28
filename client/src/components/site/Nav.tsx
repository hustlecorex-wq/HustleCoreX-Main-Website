import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import LogoMark from "./LogoMark";

const LINKS = [
  { id: "system", label: "What we do" },
  { id: "results", label: "Results" },
  { id: "mission", label: "Mission" },
];

export function goTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark className="h-[22px] w-[26px] shrink-0 text-chalk" />
      {!compact && (
        <span className="text-[15px] font-semibold tracking-[-0.03em] text-chalk">
          HustleCoreX
        </span>
      )}
    </div>
  );
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      // Back at the hero, nothing is "current" - otherwise the pill sticks to
      // whichever section was last in view.
      if (window.scrollY < 200) setActive(null);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Scroll spy - the filled pill tracks where you actually are. */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    // "apply" has no nav link, but it still needs observing - otherwise the
    // pill stays lit on Mission all the way down to the footer.
    [...LINKS.map((l) => l.id), "apply"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const jump = (id: string) => {
    setOpen(false);
    goTo(id);
  };

  return (
    /* pointer-events-none on the wrapper, auto on the pill. The header spans
       the full width and the top ~78px of every page; without this it
       swallowed every click in that strip - including the close button of the
       full-size viewer, which sits exactly there. */
    <header className="pointer-events-none fixed inset-x-0 top-0 z-[200] px-4 pt-4 md:pt-5">
      <nav
        className={`pointer-events-auto mx-auto flex max-w-5xl items-center justify-between gap-4 rounded-full border py-2 pl-4 pr-2 transition-all duration-500 md:pl-5 ${
          scrolled
            ? "border-white/[0.08] bg-[rgba(10,10,14,0.82)] shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl"
            : "border-white/[0.05] bg-[rgba(10,10,14,0.4)] backdrop-blur-md"
        }`}
      >
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="HustleCoreX - back to top"
          className="rounded-full"
        >
          <Logo />
        </button>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => {
            const isActive = active === link.id;
            return (
              <button
                key={link.id}
                onClick={() => jump(link.id)}
                className={`relative rounded-full px-4 py-2 text-[13.5px] font-medium transition-colors duration-300 ${
                  isActive ? "text-chalk" : "text-ash hover:text-chalk"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-full border border-white/[0.07] bg-white/[0.05]"
                  />
                )}
                <span className="relative">{link.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => jump("apply")}
            className="btn-ember hidden rounded-full px-5 py-2.5 text-[13.5px] font-medium sm:block"
          >
            Apply free
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.07] text-chalk transition-colors hover:bg-white/[0.04] md:hidden"
          >
            {open ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto mx-auto mt-2 max-w-5xl overflow-hidden rounded-3xl border border-white/[0.07] bg-[rgba(10,10,14,0.94)] p-2 backdrop-blur-xl md:hidden"
          >
            {LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => jump(link.id)}
                className="block w-full rounded-2xl px-4 py-3.5 text-left text-[15px] font-medium text-ash transition-colors hover:bg-white/[0.04] hover:text-chalk"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => jump("apply")}
              className="btn-ember mt-1 w-full rounded-2xl px-4 py-3.5 text-[15px] font-medium"
            >
              Apply free
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
