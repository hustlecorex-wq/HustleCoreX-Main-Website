import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

import Container from "@/components/site/Container";
import SectionRule from "@/components/site/SectionRule";

/**
 * Founder - the person behind the work, not just the company.
 *
 * Sits between Mission (why the company exists) and Apply (the ask), because
 * "who's actually building this" is the last piece of trust before someone
 * hands over their business. Two blocks: a portrait, and a bio that only
 * claims what the rest of the page already backs up - the real work in
 * Showcase, not a list of invented stats.
 *
 * ── Certifications ────────────────────────────────────────────────────────
 * CERTS is empty on purpose. Add an entry only for a certificate you actually
 * hold, using an image of the real issued document - not a template, and not
 * someone else's certificate with the name swapped. Most issuers give you a
 * verify link; include it, so a visitor can check it without taking the
 * image's word for it. One fabricated entry makes every real one worthless.
 *
 *   { issuer: "...", title: "...", image: "/founder/certs/<slug>.jpg", verifyUrl: "..." }
 *
 * Drop the image under client/public/founder/certs/ and the grid below
 * switches itself on - nothing else to wire up.
 */

const NAME = "Mikolas Micka";
const ROLE = "Founder, HustleCoreX";
const PHOTO_SRC = "/founder/mikolas-micka.jpg";

type Cert = {
  issuer: string;
  title: string;
  image: string;
  verifyUrl?: string;
};

const CERTS: Cert[] = [];

const EASE = [0.22, 1, 0.36, 1] as const;

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/* Falls back to a monogram if the photo isn't there yet, rather than a
   broken-image icon - so the section still reads as finished the moment
   this ships, and starts showing the real photo the instant the file
   lands at PHOTO_SRC with no code change needed. */
function Portrait() {
  const [broken, setBroken] = useState(false);
  const initials = NAME.split(" ")
    .map((w) => w[0])
    .join("");

  return (
    <div className="relative mx-auto w-full max-w-[320px] lg:mx-0 lg:max-w-none">
      {/* Beam catch-light on the top edge, echoing the showcase windows -
          the same light source touching a person now, not just a build. */}
      <div
        aria-hidden
        className="absolute inset-x-10 -top-px z-10 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,176,122,0.6), transparent)",
        }}
      />
      <div
        className="overflow-hidden rounded-[28px] border border-white/[0.09]"
        style={{
          boxShadow:
            "0 40px 90px -40px rgba(0,0,0,0.9), 0 10px 40px -20px rgba(255,74,23,0.16)",
        }}
      >
        {!broken ? (
          <img
            src={PHOTO_SRC}
            alt={NAME}
            onError={() => setBroken(true)}
            className="aspect-[4/5] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-4 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0)_45%)]">
            <span className="flex h-20 w-20 items-center justify-center rounded-full border border-ember/25 bg-ember/[0.08] text-[22px] font-semibold text-chalk">
              {initials}
            </span>
            <p className="mono-label px-8 text-center text-ash-faint">
              Photo pending
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Founder() {
  return (
    <section id="founder" className="relative z-10 py-20 md:py-28">
      <Container>
        <Reveal>
          <SectionRule label="The founder" />
        </Reveal>

        <div className="mt-12 grid gap-12 md:mt-14 lg:grid-cols-[0.85fr_1fr] lg:gap-16">
          <Reveal>
            <Portrait />
          </Reveal>

          <Reveal delay={0.1}>
            <h2 className="heading max-w-lg text-[clamp(1.9rem,3.6vw,2.6rem)]">
              The person actually building your system
            </h2>
            <p className="mt-4 text-[13.5px] font-medium tracking-[-0.01em] text-chalk">
              {NAME}
              <span className="font-normal text-ash-dim"> · {ROLE}</span>
            </p>

            <div className="mt-7 max-w-[46ch] space-y-5 text-[15px] leading-[1.8] text-ash">
              <p>
                I started HustleCoreX because coaches kept getting sold the
                same templated funnel with a new logo on it. I wanted to
                actually build the thing - properly, from scratch, for the
                business in front of me. Every system and every site in the
                work above, I designed and shipped myself.
              </p>
              <p>
                I'm still a student of this. The models and frameworks all of
                it runs on move fast enough that a system left alone for six
                months starts to feel old, so a real chunk of most weeks goes
                into a course, a changelog, or just rebuilding something to
                see if it can be done better. Learning the stack isn't a
                phase I finished - it's the job.
              </p>
            </div>
          </Reveal>
        </div>

        {CERTS.length > 0 && (
          <div className="mt-16 md:mt-20">
            <p className="mono-label-ember mb-6">Certifications</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
              {CERTS.map((c, i) => {
                const card = (
                  <>
                    <img
                      src={c.image}
                      alt={`${c.title} certificate`}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <div className="p-4">
                      <p className="text-[13px] font-medium leading-snug text-chalk">
                        {c.title}
                      </p>
                      <p className="mt-1 text-[12px] text-ash-dim">
                        {c.issuer}
                      </p>
                    </div>
                  </>
                );
                return (
                  <Reveal key={c.title} delay={0.04 * i}>
                    {c.verifyUrl ? (
                      <a
                        href={c.verifyUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="panel lift block overflow-hidden rounded-2xl"
                      >
                        {card}
                      </a>
                    ) : (
                      <div className="panel block overflow-hidden rounded-2xl">
                        {card}
                      </div>
                    )}
                  </Reveal>
                );
              })}
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
