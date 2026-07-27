import { useEffect, useLayoutEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

import Nav from "@/components/site/Nav";
import Footer from "@/components/site/Footer";
import Container from "@/components/site/Container";
import { SiteBackdrop } from "@/components/site/Ambient";

/**
 * Privacy policy.
 *
 * Written against what the site actually does rather than from a template:
 * one form writing to Supabase, no analytics, no ad pixels, self-hosted
 * video. If any of that changes - a tracking script, an embedded player, a
 * mailing list - this page has to change with it.
 */

const UPDATED = "27 July 2026";
const CONTACT = "info@hustlecorex.com";

function Section({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-4 border-t border-white/[0.06] py-10 md:grid-cols-[140px_1fr] md:gap-10 md:py-12">
      <div className="md:pt-1">
        <span className="font-mono text-[11px] tracking-[0.12em] text-ember">
          {n}
        </span>
        <h2 className="mt-3 text-[17px] font-medium leading-[1.35] tracking-[-0.01em] text-chalk">
          {title}
        </h2>
      </div>
      <div className="max-w-[620px] space-y-4 text-[15px] leading-[1.85] text-ash">
        {children}
      </div>
    </section>
  );
}

function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3.5">
          <span
            aria-hidden
            className="mt-[11px] h-[3px] w-[3px] shrink-0 rounded-full bg-ember/70"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Mail() {
  return (
    <a
      href={`mailto:${CONTACT}`}
      className="text-chalk underline decoration-white/20 underline-offset-4 transition-colors hover:decoration-ember"
    >
      {CONTACT}
    </a>
  );
}

export default function Privacy() {
  /* Wouter keeps the scroll offset across routes, so arriving from the
     footer link would otherwise drop you halfway down the policy. `behavior:
     "instant"` is load-bearing: the site sets `scroll-behavior: smooth`
     globally, and a plain scrollTo animates from wherever the home page was,
     then gets cut short when the shorter page clamps the offset. */
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    const previous = document.title;
    document.title = "Privacy Policy - HustleCoreX";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-void">
      <SiteBackdrop />
      <Nav />

      <main className="relative z-10 pt-[128px] md:pt-[150px]">
        <Container>
          <div className="max-w-[720px]">
            <p className="mono-label-ember mb-6">Legal</p>
            <h1 className="heading text-[clamp(2.1rem,5.5vw,3.4rem)]">
              Privacy policy
            </h1>
            <p className="mt-6 font-mono text-[11px] tracking-[0.12em] text-ash-dim">
              LAST UPDATED {UPDATED.toUpperCase()}
            </p>

            <p className="mt-8 text-[16px] leading-[1.8] text-ash">
              This page explains what HustleCoreX does with your information
              when you use this site or apply for a free build. It describes
              this site as it actually works today - not a template - and it is
              short because we collect very little.
            </p>
          </div>

          {/* The short version - most people read this and nothing else, so
              it should be true on its own. */}
          <div className="panel mt-12 max-w-[720px] rounded-[24px] p-7 md:p-8">
            <p className="mono-label mb-5">The short version</p>
            <List
              items={[
                "The only information we ask for is what you type into the application form.",
                "We use it to review your application and to get back to you. Nothing else.",
                "We don't run analytics, advertising pixels or tracking cookies on this site.",
                "We never sell your details or pass them to anyone for marketing.",
                <>
                  Want your data removed? Email <Mail /> and we'll delete it.
                </>,
              ]}
            />
          </div>

          <div className="mt-14 md:mt-16">
            <Section n="01" title="Who we are">
              <p>
                HustleCoreX builds systems and automation for online fitness
                coaches. We are the data controller for the information
                described on this page - meaning we decide why it is collected
                and what happens to it.
              </p>
              <p>
                For anything to do with your data, including the requests
                described in section 08, contact us at <Mail />.
              </p>
            </Section>

            <Section n="02" title="What we collect">
              <p>
                <span className="text-chalk">
                  What you give us in the application form.
                </span>{" "}
                When you apply for a free build, we receive:
              </p>
              <List
                items={[
                  "Your name and email address.",
                  "Your Instagram handle, if you choose to give it - the field is optional.",
                  "The number of clients you currently coach, and your monthly revenue band. Both are ranges you pick from a list, not exact figures.",
                  "Whatever you write about your biggest time drain.",
                ]}
              />
              <p>
                We also record the date the application arrived and whether
                we've replied to it, so we don't contact anyone twice or leave
                anyone waiting.
              </p>
              <p>
                <span className="text-chalk">
                  What is collected automatically.
                </span>{" "}
                Our hosting provider keeps standard server logs - IP address,
                browser and device type, the page requested and the time of the
                request. These are a normal part of serving and securing a
                website, and we don't use them to build a profile of you.
              </p>
              <p>
                <span className="text-chalk">
                  What we deliberately don't collect.
                </span>{" "}
                There is no analytics script, no advertising pixel and no
                tracking cookie on this site. The videos are served from our own
                site rather than embedded from YouTube or Vimeo, so watching one
                doesn't hand your viewing habits to a third party.
              </p>
            </Section>

            <Section n="03" title="Why we use it">
              <p>We use what you send us to:</p>
              <List
                items={[
                  "Read your application and work out whether a free build is a fit.",
                  "Reply to you, and follow up about the system we'd build.",
                  "Keep a record of who we've spoken to and what was discussed.",
                  "Keep the site working, and protect it from abuse and spam.",
                ]}
              />
              <p>
                That's the whole list. We don't sell your information, we don't
                share it with advertisers, and we don't add you to a mailing
                list off the back of an application.
              </p>
            </Section>

            <Section n="04" title="Our legal basis">
              <p>
                If you are in the UK or the EU, the law asks us to name a legal
                basis for handling your data. Ours is:
              </p>
              <List
                items={[
                  <>
                    <span className="text-chalk">Your consent</span> - you chose
                    to fill in the form and send it to us, knowing we'd read it
                    and reply. You can withdraw that consent at any time.
                  </>,
                  <>
                    <span className="text-chalk">Legitimate interests</span> -
                    running and securing the website, and keeping records of the
                    businesses we've worked with or spoken to.
                  </>,
                ]}
              />
            </Section>

            <Section n="05" title="Where it's stored, and who can see it">
              <p>
                Applications are stored in a Postgres database hosted by
                Supabase, on servers in the European Union (Frankfurt). The site
                itself is hosted by Vercel, which handles the server logs
                described above.
              </p>
              <p>
                Inside HustleCoreX, applications are only accessible through a
                password-protected admin page that isn't linked from anywhere on
                the public site. Nobody outside the company is given access.
              </p>
              <p>
                Two other services see a request from your browser when a page
                loads: Google Fonts and Fontshare, which serve the typefaces
                this site uses. As with any file your browser fetches, they
                receive your IP address as part of delivering the font. They
                receive nothing you type into the form.
              </p>
            </Section>

            <Section n="06" title="How long we keep it">
              <p>
                We keep applications for as long as there's a reason to - while
                we're talking to you, and while we're working together
                afterwards. If nothing comes of an application, we delete it
                within 24 months of the last contact.
              </p>
              <p>
                You don't have to wait for that. Ask us to delete your details
                and we'll do it, normally within a few days.
              </p>
            </Section>

            <Section n="07" title="Cookies and browser storage">
              <p>
                This site sets no advertising or analytics cookies, and there is
                no cookie banner because there is nothing to consent to.
              </p>
              <p>
                The one thing we do store in a browser is a flag that keeps our
                own team signed in to the private admin page. It is never set on
                a normal visit, and it isn't readable by anyone else.
              </p>
            </Section>

            <Section n="08" title="Your rights">
              <p>
                Depending on where you live - and in full if you're in the UK or
                the EU - you can ask us to:
              </p>
              <List
                items={[
                  "Tell you what information we hold about you, and give you a copy.",
                  "Correct anything that's wrong or out of date.",
                  "Delete your information entirely.",
                  "Stop using it, or restrict what we do with it.",
                  "Send it to you, or to someone else, in a portable format.",
                ]}
              />
              <p>
                Email <Mail /> and we'll action it, normally within a few days
                and always within one month. We won't charge you and we won't
                ask why.
              </p>
              <p>
                If you think we've handled your data badly, we'd like the chance
                to fix it first - but you're entitled to complain to your data
                protection regulator instead. In the UK that's the Information
                Commissioner's Office at ico.org.uk.
              </p>
            </Section>

            <Section n="09" title="Children">
              <p>
                This site is aimed at people running a coaching business, and
                isn't intended for anyone under 16. We don't knowingly collect
                information from children. If you believe a child has sent us
                their details, email us and we'll remove them.
              </p>
            </Section>

            <Section n="10" title="Changes to this policy">
              <p>
                If we start using a new tool that changes any of the above - an
                analytics service, an email platform, an embedded player - we'll
                update this page and change the date at the top before it goes
                live.
              </p>
            </Section>

            <Section n="11" title="Contact">
              <p>
                Questions about any of this, or about your data specifically:{" "}
                <Mail />. We read everything ourselves.
              </p>
            </Section>
          </div>

          <div className="border-t border-white/[0.06] py-12">
            <Link
              href="/"
              className="btn-ghost group inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-medium"
            >
              <ArrowLeft
                size={15}
                className="transition-transform duration-300 group-hover:-translate-x-0.5"
              />
              Back to the site
            </Link>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
