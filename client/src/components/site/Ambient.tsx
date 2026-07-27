/**
 * Ambient - the page's light.
 *
 * The whole site is lit by one source: a shaft of ember light that strikes a
 * point behind the hero video and blooms outward. Everything else (grid,
 * noise, the faint wash further down the page) is fallout from that one
 * source, which is why the page reads as a single space rather than a stack
 * of sections with gradients bolted on.
 */

/* Hand-tuned so the embers look scattered rather than evenly spaced. */
const SPARKS = [
  { left: "49.2%", dur: "13s", delay: "0s", drift: "26px", peak: 0.55 },
  { left: "50.6%", dur: "17s", delay: "2.4s", drift: "-34px", peak: 0.4 },
  { left: "48.1%", dur: "11s", delay: "5.1s", drift: "-18px", peak: 0.65 },
  { left: "51.4%", dur: "19s", delay: "1.2s", drift: "44px", peak: 0.32 },
  { left: "50.1%", dur: "15s", delay: "7.6s", drift: "12px", peak: 0.5 },
  { left: "47.4%", dur: "21s", delay: "3.8s", drift: "-52px", peak: 0.28 },
  { left: "52.2%", dur: "12.5s", delay: "9.3s", drift: "30px", peak: 0.6 },
  { left: "49.8%", dur: "16s", delay: "11.5s", drift: "-22px", peak: 0.42 },
  { left: "46.6%", dur: "18s", delay: "6.2s", drift: "-40px", peak: 0.3 },
  { left: "53.1%", dur: "14s", delay: "13.1s", drift: "48px", peak: 0.36 },
];

/**
 * The beam.
 *
 * Everything is anchored to the BOTTOM of its container, so wherever you drop
 * this the light strikes exactly at that bottom edge. In the hero that edge is
 * the top of the video frame, on every viewport, without pixel-guessing.
 */
export function HeroBeam() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 top-[-210px] z-0"
    >
      {/* Drafting grid - architectural, not "tech template". Fades fast. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "88px 88px",
          maskImage:
            "radial-gradient(80% 68% at 50% 46%, #000 0%, rgba(0,0,0,0.4) 54%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(80% 68% at 50% 46%, #000 0%, rgba(0,0,0,0.4) 54%, transparent 80%)",
        }}
      />

      {/* Broad warm wash - pooled low, so the headline keeps a black field */}
      <div
        className="absolute inset-x-0 bottom-[-24%] top-[30%]"
        style={{
          background:
            "radial-gradient(46% 52% at 50% 84%, rgba(255,74,23,0.13) 0%, rgba(255,74,23,0.04) 46%, transparent 74%)",
        }}
      />

      {/* Outer cone: light fanning up from the strike point */}
      <div
        className="beam-layer absolute bottom-0 left-1/2 h-full w-[46vw] max-w-[620px] -translate-x-1/2"
        style={{
          clipPath: "polygon(50% 100%, 0% 0%, 100% 0%)",
          background:
            "linear-gradient(to top, rgba(255,92,32,0.20) 0%, rgba(255,74,23,0.05) 42%, transparent 78%)",
          filter: "blur(46px)",
          animation: "beam-breathe 9s ease-in-out infinite",
        }}
      />

      {/* Inner cone - gives the shaft a defined edge */}
      <div
        className="beam-layer absolute bottom-0 left-1/2 h-full w-[15vw] max-w-[200px] -translate-x-1/2"
        style={{
          clipPath: "polygon(50% 100%, 6% 0%, 94% 0%)",
          background:
            "linear-gradient(to top, rgba(255,155,88,0.26) 0%, rgba(255,90,30,0.07) 46%, transparent 84%)",
          filter: "blur(20px)",
          animation: "beam-breathe 7s ease-in-out infinite reverse",
        }}
      />

      {/* The hot core line */}
      <div
        className="beam-layer absolute bottom-0 left-1/2 h-full w-[1.5px] -translate-x-1/2"
        style={{
          background:
            "linear-gradient(to top, rgba(255,232,208,0.9) 0%, rgba(255,138,64,0.5) 26%, rgba(255,74,23,0.14) 58%, transparent 88%)",
          boxShadow: "0 0 22px 3px rgba(255,90,30,0.3)",
          animation: "core-flicker 5.5s ease-in-out infinite",
        }}
      />

      {/* Strike point */}
      <div
        className="beam-layer absolute bottom-0 left-1/2 h-[130px] w-[320px] -translate-x-1/2 translate-y-1/2"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,244,228,0.9) 0%, rgba(255,150,70,0.48) 26%, rgba(255,74,23,0.18) 54%, transparent 78%)",
          filter: "blur(11px)",
          animation: "bloom-pulse 6s ease-in-out infinite",
        }}
      />

      {/* Horizon spill - light running along the plane it strikes */}
      <div
        className="absolute bottom-0 left-1/2 h-[2px] w-[94vw] max-w-[1400px] -translate-x-1/2 translate-y-1/2"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,110,45,0.34) 32%, rgba(255,218,186,0.62) 50%, rgba(255,110,45,0.34) 68%, transparent)",
          filter: "blur(2px)",
        }}
      />

      {/* Embers lifting off the strike point */}
      <div className="absolute bottom-0 left-0 h-0 w-full">
        {SPARKS.map((s, i) => (
          <span
            key={i}
            className="spark"
            style={
              {
                left: s.left,
                "--spark-dur": s.dur,
                "--spark-delay": s.delay,
                "--spark-drift": s.drift,
                "--spark-peak": s.peak,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}

/** Page-wide texture + the light that survives below the fold. */
export function SiteBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      {/* Film grain - keeps flat blacks from banding on large screens.
          Steps aside while a video plays; see .site-grain in index.css. */}
      <div
        className="site-grain absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
        }}
      />
      {/* A little warmth pooling at the bottom of the viewport */}
      <div
        className="absolute inset-x-0 bottom-0 h-[45vh]"
        style={{
          background:
            "radial-gradient(70% 100% at 50% 130%, rgba(255,74,23,0.055) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
