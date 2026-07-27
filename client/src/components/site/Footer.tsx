import { Link } from "wouter";

import Container from "./Container";
import { Logo, goTo } from "./Nav";

/* Shared by the home page and the legal pages, so the privacy link is
   reachable from anywhere on the site rather than only from the one page
   that happened to own the markup. */

const SITE_LINKS = [
  { id: "system", label: "What we do" },
  { id: "results", label: "Results" },
  { id: "mission", label: "Mission" },
  { id: "apply", label: "Apply" },
];

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/[0.06] py-14">
      <Container>
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-[320px]">
            <Logo />
            <p className="mt-4 text-[13.5px] leading-[1.7] text-ash-dim">
              Systems and automation for online fitness coaches.
            </p>
          </div>

          <div className="flex gap-16">
            <div>
              <p className="mono-label mb-4">Site</p>
              <ul className="space-y-3">
                {SITE_LINKS.map((l) => (
                  <li key={l.id}>
                    <button
                      onClick={() => goTo(l.id)}
                      className="text-[13.5px] text-ash transition-colors hover:text-chalk"
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mono-label mb-4">Contact</p>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://instagram.com/hustlecorex"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-[13.5px] text-ash transition-colors hover:text-chalk"
                  >
                    @hustlecorex
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:info@hustlecorex.com"
                    className="text-[13.5px] text-ash transition-colors hover:text-chalk"
                  >
                    info@hustlecorex.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/[0.05] pt-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="font-mono text-[11px] tracking-[0.1em] text-ash-dim">
              © {new Date().getFullYear()} HUSTLECOREX
            </p>
            <span aria-hidden className="hidden h-3 w-px bg-white/[0.1] sm:block" />
            <Link
              href="/privacy"
              className="font-mono text-[11px] tracking-[0.1em] text-ash-dim transition-colors hover:text-chalk"
              data-testid="link-privacy"
            >
              Privacy policy
            </Link>
          </div>
          <p className="font-mono text-[11px] tracking-[0.1em] text-ash-dim">
            Built for coaches who'd rather be coaching
          </p>
        </div>
      </Container>
    </footer>
  );
}
