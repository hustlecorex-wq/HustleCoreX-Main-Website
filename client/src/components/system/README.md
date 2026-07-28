# Stack Tower (`/system`)

A scroll-driven 3D scene. Five rounded blocks fall one at a time and stack
into a tower; each block is a tool an online fitness coach pays for every
month. A counter above the tower adds the bills up, and the last scroll beat
replaces it with the monthly total and the same number times twelve.

The route is self-contained. It does not touch the home page or the funnel.

## Changing tools and prices

Everything editable lives in **`stackConfig.ts`**. Nothing about the tools is
written into the scene components, so this is the only file you need.

To change a price, edit `priceUsd` on that entry. To add or remove a tool,
add or delete an entry in `STACK_TOOLS`. Everything else follows on its own:

- the number of blocks and the height of the tower,
- the running counter and both totals,
- the length of the scroll runway (one viewport per block, plus one for the
  total — see `RUNWAY_VH` in `pages/System.tsx`),
- the receipt table below the animation,
- the mobile fallback.

**Order matters.** Index `0` falls first and ends up at the bottom of the
tower; the last entry lands on top. The fallback list is reversed so it reads
top-down like the finished tower.

Four blocks still look like a tower. Above seven, the tower outgrows the
frame — pull the camera back in `StackTowerScene.tsx` (`camera.position`) or
shrink `BLOCK.height` in `stackConfig.ts`.

### Prices are a claim, not decoration

Each entry carries a `tier` and a `source`, and both are rendered on the page
under the animation. Two rules when you touch a number:

1. Use the **monthly-billed** list price, not the annual rate. Annual pricing
   makes the tower cheaper than the argument it exists to make.
2. Update `source`, and update the "Checked …" date in `pages/System.tsx`.

Prices were last verified on 2026-07-28.

## Geometry and colour

Block size, gap, corner radius, rim thickness and drop height are the `BLOCK`
constants in `stackConfig.ts`. `restingY(i)` derives where block `i` comes to
rest, keeping the tower centred however many blocks there are.

`SCENE_COLORS` mirrors four tokens from `client/src/index.css`. WebGL
materials cannot read CSS custom properties, so those values exist twice —
**change them in both places** or the scene will drift off-brand.

## How the animation works

No physics engine. The fall is a GSAP tween with `bounce.out` easing, bound
to scroll through `ScrollTrigger` with `scrub: true`. That means the visitor
drives it: scrolling back up takes the tower apart in reverse, and the result
is identical on every machine, which a physics simulation would not be.

Per block the timeline runs three tweens on the same beat: the drop, the
counter, and a short `elastic.out` settle on the tower's base pivot, which
alternates direction so the stack does not lean the same way five times.

GSAP mutates plain objects; `useFrame` copies them onto the meshes. React
does not re-render during the animation.

The ember outline is a slightly larger copy of each block rendered
back-faces-only behind the panel, not edge geometry — on rounded corners it
is both cheaper and cleaner. The bloom threshold sits above the panel colour,
so only the rim and the price tags glow.

Labels are drawn into 2D canvases and used as textures (`labelTexture.ts`),
which renders them in the real General Sans and JetBrains Mono already loaded
by the document, with no font file to ship. They are only drawn once
`document.fonts.ready` resolves, otherwise the blocks would render their
names in a fallback face.

## Loading and the fallback

`pages/System.tsx` lazy-imports the scene inside an effect, so three, drei
and postprocessing are fetched only after the first paint. The heading is
plain static HTML and is the largest element on screen while that happens.
The sticky container is a fixed `100vh`, so the canvas arriving shifts
nothing.

No WebGL is loaded at all when the viewport is under 768px or the visitor has
`prefers-reduced-motion: reduce`. Those visitors get
`StackTowerFallback.tsx`, which draws the same blocks and the same total in
DOM elements using the same tokens.

> Deviation from the original brief, worth knowing: the brief asked for a
> static *image* of the tower on that path. The fallback is drawn in markup
> instead — an exported screenshot would be a second asset to keep in sync
> with `stackConfig.ts` every time a price changes, and it would blur on wide
> screens. If a real render is wanted later, replace the component body with
> an `<img>`; nothing else depends on it.

## Budget

The route's own JavaScript is expected to stay under 3 MB uncompressed and
the desktop animation at 60fps. If you add to the scene, re-check both — the
usual causes are a heavier post-processing chain or an uncapped `dpr` (it is
capped at 1.75 on purpose).
