import { useEffect, useRef } from "react";

/**
 * EmberField - the floor the page stands on.
 *
 * Ambient.tsx lights the site with one ember beam. This is what that beam
 * is striking: a bed of molten noise, banked along the bottom edge and up
 * the outer margins, that answers the cursor and burns harder the faster
 * you scroll.
 *
 * It is deliberately banked AWAY from the centre column. Every headline on
 * the site sits there, and a shader that brightens behind text is a shader
 * that makes the text unreadable - so the middle stays near-black and the
 * heat lives at the edges, where there is nothing to read.
 *
 * Written against the WebGL context directly rather than through the
 * three/fiber stack already in the repo. This is one quad and one fragment
 * shader: routing it through a scene graph would have cost 824 kB of
 * JavaScript to draw two triangles.
 *
 * The `still` prop draws exactly one frame and stops - no loop, no pointer
 * tracking. Nothing passes it any more now that motion runs for every
 * visitor, but it is kept because it is the cheap path back if that
 * decision is ever reversed. See useMotionOk in ./motion.
 *
 * The caller decides when this renders - see useHeavyVisuals in Home.tsx.
 */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2  uMouse;   // 0..1, y up
uniform float uVel;     // scroll speed, roughly 0..1
uniform float uAspect;

// Document geometry. The field is anchored to the page, not the window:
// without these it banks to the bottom of the viewport and therefore
// follows you down the whole site instead of pooling at the end of it.
uniform float uScrollPx;
uniform float uViewH;
uniform float uDocH;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  vec2 p = vec2(uv.x * uAspect, uv.y);
  vec2 m = vec2(uMouse.x * uAspect, uMouse.y);

  // Where this pixel sits in the DOCUMENT: 0 at the top of the page, 1 at
  // the very bottom. uv.y is 0 at the bottom of the viewport, hence the flip.
  float docY = (uScrollPx + (1.0 - uv.y) * uViewH) / max(1.0, uDocH);

  // Domain-warped noise: fbm fed into itself is what turns an even cloud
  // into something that curls the way heat does.
  float t = uTime * 0.055;
  vec2 q = p * 2.3;
  q.y -= t * 1.5 + docY * 2.4;
  float n = fbm(q + fbm(q * 1.7 + t) * 0.65);

  // The cursor is a heat source.
  float d = distance(p, m);
  float heat = exp(-d * 3.4);

  // Banked to the foot of the page and out along the margins. Nothing at the
  // top, a long climb rather than an edge, strongest at the very end.
  float pageBank = smoothstep(0.45, 1.0, docY);
  float sideBank = 0.34 + 0.66 * smoothstep(0.1, 0.46, abs(uv.x - 0.5));
  float mask = clamp(pageBank * sideBank + heat * 0.16, 0.0, 1.0);

  float burn  = n + uVel * 0.28;
  float glow  = smoothstep(0.34, 0.88, burn) * 0.5 + heat * 0.22;
  float crest = smoothstep(0.58, 0.98, burn);

  vec3 VOIDC = vec3(0.027, 0.027, 0.039);
  vec3 EMBER = vec3(1.000, 0.290, 0.090);
  vec3 FLARE = vec3(1.000, 0.635, 0.302);

  vec3 col = VOIDC;
  col = mix(col, EMBER, glow * 0.28);
  col = mix(col, FLARE, crest * 0.14);
  col = mix(VOIDC, col, mask);

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    // Drivers vary. If this one will not take the shader, the page must
    // still be a page - so give up quietly and leave the canvas blank.
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function EmberField({ still = false }: { still?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
    });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    // Two triangles covering clip space.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "uTime");
    const uMouse = gl.getUniformLocation(program, "uMouse");
    const uVel = gl.getUniformLocation(program, "uVel");
    const uAspect = gl.getUniformLocation(program, "uAspect");
    const uScrollPx = gl.getUniformLocation(program, "uScrollPx");
    const uViewH = gl.getUniformLocation(program, "uViewH");
    const uDocH = gl.getUniformLocation(program, "uDocH");

    // Targets are written by the listeners; the uniforms chase them. The
    // easing is what stops the field snapping on every wheel tick.
    const target = { mx: 0.5, my: 0.32, scrollPx: 0, vel: 0 };
    const current = { mx: 0.5, my: 0.32, scrollPx: 0, vel: 0 };
    let docH = 1;
    let lastScroll = window.scrollY;
    let aspect = 1;

    const resize = () => {
      // A full-screen noise field gains nothing from 3x pixels and costs
      // nine times the fragment work.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      aspect = window.innerWidth / Math.max(1, window.innerHeight);
      docH = Math.max(1, document.documentElement.scrollHeight);
    };
    resize();

    // ── still path ────────────────────────────────────────────────
    // One frame at a hand-picked moment in the noise. No animation loop and
    // no pointer tracking - the only thing that redraws is scrolling, and
    // that is not the field moving, it is the field staying where it is.
    if (still) {
      // Still, but still page-anchored: it has to redraw on scroll, or the
      // frozen field would slide with the viewport instead of staying put
      // at the foot of the page. Drawing one frame is far cheaper than the
      // animation it replaces.
      const draw = () => {
        resize();
        gl.uniform1f(uTime, 14.0);
        gl.uniform2f(uMouse, 0.5, 0.18);
        gl.uniform1f(uVel, 0);
        gl.uniform1f(uAspect, aspect);
        gl.uniform1f(uScrollPx, window.scrollY);
        gl.uniform1f(uViewH, window.innerHeight);
        gl.uniform1f(uDocH, docH);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };
      draw();
      window.addEventListener("resize", draw);
      window.addEventListener("scroll", draw, { passive: true });
      return () => {
        window.removeEventListener("resize", draw);
        window.removeEventListener("scroll", draw);
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      };
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      target.mx = e.clientX / window.innerWidth;
      target.my = 1 - e.clientY / window.innerHeight;
    };

    const onScroll = () => {
      const y = window.scrollY;
      target.scrollPx = y;
      docH = Math.max(1, document.documentElement.scrollHeight);
      // Velocity decays on its own, so a flick flares and then settles.
      target.vel = Math.min(1, target.vel + Math.abs(y - lastScroll) * 0.012);
      lastScroll = y;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);

    let raf = 0;
    let running = true;
    let last = performance.now();
    let elapsed = 0;

    // Nothing is animating that anyone can see while the tab is hidden.
    const onVisibility = () => {
      running = !document.hidden;
      if (running) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      } else {
        cancelAnimationFrame(raf);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    function frame(now: number) {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      elapsed += dt;

      target.vel *= 0.9;

      current.mx += (target.mx - current.mx) * 0.06;
      current.my += (target.my - current.my) * 0.06;
      // Scroll position is NOT eased - the field is pinned to the page, and
      // easing it would let the whole bank drift behind the content.
      current.scrollPx = target.scrollPx;
      current.vel += (target.vel - current.vel) * 0.12;

      gl!.uniform1f(uTime, elapsed);
      gl!.uniform2f(uMouse, current.mx, current.my);
      gl!.uniform1f(uVel, current.vel);
      gl!.uniform1f(uAspect, aspect);
      gl!.uniform1f(uScrollPx, current.scrollPx);
      gl!.uniform1f(uViewH, window.innerHeight);
      gl!.uniform1f(uDocH, docH);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [still]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
