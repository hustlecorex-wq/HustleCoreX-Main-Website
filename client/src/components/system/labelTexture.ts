import * as THREE from "three";

/* Labels are drawn into a 2D canvas and used as a texture rather than
   rendered with an SDF text helper. Two reasons:

   1. The brand faces (General Sans, JetBrains Mono) are already loaded
      by the document, so canvas text renders in the real typeface with
      no extra font file to ship and no second loading path to get wrong.
   2. It keeps the route's dependency list to three + fiber + drei, which
      is what the 3 MB budget is spent on.

   Call only after document.fonts.ready has resolved - see useFontsReady. */

type LabelOptions = {
  /** css font shorthand, e.g. "600 64px 'General Sans', sans-serif" */
  font: string;
  color: string;
  /** canvas pixel size - also fixes the aspect of the plane it maps to */
  width: number;
  height: number;
  align?: "left" | "center" | "right";
  /** horizontal padding in canvas pixels, used by left/right alignment */
  padding?: number;
};

export function makeLabelTexture(
  text: string,
  { font, color, width, height, align = "center", padding = 24 }: LabelOptions,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, width, height);
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textBaseline = "middle";
    ctx.textAlign = align;

    const x =
      align === "left" ? padding : align === "right" ? width - padding : width / 2;
    ctx.fillText(text, x, height / 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  // Labels are viewed at a slant on the side faces; anisotropy keeps the
  // price tag legible instead of smearing into the panel.
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}
