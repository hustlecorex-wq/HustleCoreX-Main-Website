import { useId } from "react";

/** The orange chevron - shared by the mark and the knockout mask. */
const CHEVRON =
  "M232 58 L455 246 L232 434 L232 342 L349 246 L232 150 Z";

/**
 * The HX mark, redrawn as vector.
 *
 * The supplied artwork has a black H and X, which would vanish against this
 * site's background, so the letterforms are set in chalk and the chevron
 * carries the ember gradient. The chevron is the only lit element, so it reads
 * as the same light source as the hero beam rather than a second accent.
 *
 * The mask knocks out the chevron's own footprint plus a thin gap, and nothing
 * more. Cutting a wider swath is what stops the X reading as an X.
 */
export default function LogoMark({
  className = "",
  glow = true,
}: {
  className?: string;
  glow?: boolean;
}) {
  // Unique per instance - the mark renders in both the nav and the footer.
  const uid = useId().replace(/[:]/g, "");
  const ember = `ember-${uid}`;
  const bloom = `bloom-${uid}`;
  const xbox = `xbox-${uid}`;
  const knock = `knock-${uid}`;

  return (
    <svg
      viewBox="0 0 583 484"
      className={className}
      role="img"
      aria-label="HustleCoreX"
      overflow="visible"
    >
      <defs>
        <linearGradient id={ember} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF5A1F" />
          <stop offset="55%" stopColor="#FF7A1A" />
          <stop offset="100%" stopColor="#FFA24D" />
        </linearGradient>

        <filter id={bloom} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="14" />
        </filter>

        {/* Squares off the top and bottom of the X */}
        <clipPath id={xbox}>
          <rect x="386" y="62" width="180" height="370" />
        </clipPath>

        {/* Chevron footprint + a thin separation gap */}
        <mask id={knock}>
          <rect width="583" height="484" fill="#fff" />
          <path
            d={CHEVRON}
            fill="#000"
            stroke="#000"
            strokeWidth="30"
            strokeLinejoin="miter"
          />
        </mask>
      </defs>

      {/* Bloom sits behind, so the letterforms stay crisp on top */}
      {glow && (
        <g filter={`url(#${bloom})`} className="hx-bloom" opacity="0.55">
          <path d={CHEVRON} fill="#FF6A22" />
        </g>
      )}

      <g mask={`url(#${knock})`}>
        {/* H */}
        <g fill="currentColor">
          <rect x="20" y="60" width="92" height="372" rx="10" />
          <rect x="112" y="196" width="112" height="92" />
          <path d="M224 118 L338 246 L224 374 Z" />
        </g>

        {/* X */}
        <g clipPath={`url(#${xbox})`} stroke="currentColor" strokeWidth="86">
          <path d="M396 30 L556 464" />
          <path d="M556 30 L396 464" />
        </g>
      </g>

      <path d={CHEVRON} fill={`url(#${ember})`} />
    </svg>
  );
}
