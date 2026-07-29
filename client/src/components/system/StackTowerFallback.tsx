import {
  formatUsd,
  STACK_TOOLS,
  STACK_TOTAL_MONTHLY,
  STACK_TOTAL_YEARLY,
} from "./stackConfig";

/* Shown instead of the canvas on narrow viewports and whenever the visitor
   has asked for reduced motion. It is drawn with the same tokens rather
   than shipped as a screenshot: an image of the tower would need a second
   asset kept in sync with stackConfig, and it would blur on wide screens.

   The blocks are listed top-down so the picture matches the finished tower,
   where the last tool to land sits on top. */

const BLOCKS = [...STACK_TOOLS].reverse();

export default function StackTowerFallback() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-6 py-16">
      <ul className="flex w-full max-w-sm flex-col gap-[3px]">
        {BLOCKS.map((tool) => (
          <li
            key={tool.id}
            className="flex items-center justify-between gap-4 rounded-xl border px-4 py-3.5"
            style={{
              background: "var(--panel)",
              borderColor: "rgba(255, 74, 23, 0.42)",
            }}
          >
            <span className="text-[15px] font-medium text-chalk">{tool.name}</span>
            <span
              className="text-[14px] text-[color:var(--ember)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {formatUsd(tool.priceUsd)}/mo
            </span>
          </li>
        ))}
      </ul>

      <div className="text-center">
        <div
          className="text-[clamp(2.5rem,13vw,3.5rem)] font-medium leading-none tracking-tight text-[color:var(--ember)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {formatUsd(STACK_TOTAL_MONTHLY)}
          <span className="text-[0.32em] text-ash"> /mo</span>
        </div>
        <div
          className="mt-3 text-[15px] text-ash"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {formatUsd(STACK_TOTAL_YEARLY)} a year
        </div>
      </div>
    </div>
  );
}
