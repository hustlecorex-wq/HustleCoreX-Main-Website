/**
 * The line that opens every section below the hero.
 *
 * Eyebrow, then a rule carrying the eye across, then a fact at the far
 * end. The right-hand slot only ever holds something true and countable -
 * how many builds are in the rail, how many reviews are in the wall - so
 * that it stays honest when the content behind it changes. A section with
 * nothing to count leaves it out and the rule runs to the edge.
 */
export default function SectionRule({
  label,
  meta,
}: {
  label: string;
  meta?: string;
}) {
  return (
    <div className="flex items-center gap-5">
      <p className="mono-label-ember shrink-0">{label}</p>
      <span aria-hidden className="rule-line" />
      {meta && <p className="mono-label hidden shrink-0 sm:block">{meta}</p>}
    </div>
  );
}
