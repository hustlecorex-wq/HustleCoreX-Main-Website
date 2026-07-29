import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  BLOCK,
  formatUsd,
  restingY,
  SCENE_COLORS,
  STACK_CUMULATIVE,
  STACK_TOOLS,
  STACK_TOTAL_MONTHLY,
  STACK_TOTAL_YEARLY,
  type StackTool,
} from "./stackConfig";
import { makeLabelTexture } from "./labelTexture";

gsap.registerPlugin(ScrollTrigger);

/* This whole module is behind a dynamic import (see pages/System.tsx).
   Nothing here runs, and none of three/drei/postprocessing is fetched,
   until the page has already painted its heading. */

const COUNT = STACK_TOOLS.length;
const STEP = BLOCK.height + BLOCK.gap;
const TOWER_HEIGHT = COUNT * STEP - BLOCK.gap;

/** Mutable per-block animation state. GSAP writes it, useFrame reads it. */
type BlockState = { y: number };
type TowerState = { tilt: number };

/* ─── fonts ─────────────────────────────────────────────────────
   Canvas labels must not be drawn before the brand faces have loaded,
   or every block would say its name in the fallback system font. */
function useFontsReady() {
  const [ready, setReady] = useState(() => document.fonts?.status === "loaded");

  useEffect(() => {
    if (!document.fonts) {
      setReady(true);
      return;
    }
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}

/* ─── one block ─────────────────────────────────────────────────── */

const NAME_TEX = { width: 1024, height: 160 };
const PRICE_TEX = { width: 768, height: 200 };

function Block({ tool, state }: { tool: StackTool; state: BlockState }) {
  const group = useRef<THREE.Group>(null);
  const fontsReady = useFontsReady();

  const nameTexture = useMemo(
    () =>
      fontsReady
        ? makeLabelTexture(tool.name, {
            font: `600 76px 'General Sans', system-ui, sans-serif`,
            color: SCENE_COLORS.chalk,
            ...NAME_TEX,
            align: "left",
            padding: 40,
          })
        : null,
    [fontsReady, tool.name],
  );

  const priceTexture = useMemo(
    () =>
      fontsReady
        ? makeLabelTexture(`${formatUsd(tool.priceUsd)}/mo`, {
            font: `500 78px 'JetBrains Mono', ui-monospace, monospace`,
            color: SCENE_COLORS.ember,
            ...PRICE_TEX,
            align: "center",
          })
        : null,
    [fontsReady, tool.priceUsd],
  );

  useEffect(
    () => () => {
      nameTexture?.dispose();
      priceTexture?.dispose();
    },
    [nameTexture, priceTexture],
  );

  useFrame(() => {
    if (group.current) group.current.position.y = state.y;
  });

  const nameWidth = BLOCK.width * 0.88;
  const priceWidth = BLOCK.depth * 0.82;

  return (
    <group ref={group}>
      {/* Ember rim: a slightly larger shell drawn back-faces-only, so the
          panel in front of it hides everything except a hairline outline.
          Cheaper and cleaner on rounded corners than edge geometry. */}
      <RoundedBox
        args={[
          BLOCK.width + BLOCK.rim,
          BLOCK.height + BLOCK.rim,
          BLOCK.depth + BLOCK.rim,
        ]}
        radius={BLOCK.radius + BLOCK.rim / 2}
        smoothness={4}
      >
        <meshBasicMaterial
          color={SCENE_COLORS.ember}
          side={THREE.BackSide}
          toneMapped={false}
        />
      </RoundedBox>

      <RoundedBox
        args={[BLOCK.width, BLOCK.height, BLOCK.depth]}
        radius={BLOCK.radius}
        smoothness={4}
      >
        <meshStandardMaterial
          color={SCENE_COLORS.panel}
          roughness={0.58}
          metalness={0.1}
        />
      </RoundedBox>

      {nameTexture && (
        <mesh position={[0, 0, BLOCK.depth / 2 + 0.012]}>
          <planeGeometry
            args={[nameWidth, (nameWidth * NAME_TEX.height) / NAME_TEX.width]}
          />
          <meshBasicMaterial
            map={nameTexture}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      {priceTexture && (
        <mesh
          position={[BLOCK.width / 2 + 0.012, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <planeGeometry
            args={[priceWidth, (priceWidth * PRICE_TEX.height) / PRICE_TEX.width]}
          />
          <meshBasicMaterial
            map={priceTexture}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  );
}

/* ─── the tower ─────────────────────────────────────────────────── */

function Tower({
  blocks,
  tower,
}: {
  blocks: BlockState[];
  tower: TowerState;
}) {
  const pivot = useRef<THREE.Group>(null);

  useFrame(() => {
    if (pivot.current) pivot.current.rotation.z = tower.tilt;
  });

  return (
    // Turned off-axis so the front face and the price tag on the side are
    // both readable from the default camera.
    <group rotation={[0, -0.5, 0]} position={[0, -0.5, 0]}>
      {/* Pivot sits at the base of the tower, so the wobble reads as the
          stack rocking on the ground rather than spinning about its middle. */}
      <group ref={pivot} position={[0, -TOWER_HEIGHT / 2, 0]}>
        <group position={[0, TOWER_HEIGHT / 2, 0]}>
          {STACK_TOOLS.map((tool, i) => (
            <Block key={tool.id} tool={tool} state={blocks[i]} />
          ))}
        </group>
      </group>
    </group>
  );
}

/* ─── the canvas ────────────────────────────────────────────────── */

export default function StackTowerScene({
  sectionRef,
}: {
  sectionRef: React.RefObject<HTMLElement>;
}) {
  /* Plain mutable objects, deliberately outside React state: GSAP mutates
     them 60 times a second and useFrame reads them. Re-rendering React on
     every frame would cost far more than it buys. */
  const blocks = useMemo<BlockState[]>(
    () => STACK_TOOLS.map(() => ({ y: BLOCK.dropFrom })),
    [],
  );
  const tower = useMemo<TowerState>(() => ({ tilt: 0 }), []);
  const counter = useMemo(() => ({ value: 0 }), []);

  const counterRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          // scrub ties playhead to scroll position: the user builds the
          // tower, and scrolling back up takes it apart again.
          scrub: true,
        },
      });

      STACK_TOOLS.forEach((_, i) => {
        // bounce.out gives the impact and the short overshoot without a
        // physics step, so the result is identical on every machine.
        timeline.to(
          blocks[i],
          { y: restingY(i), duration: 1, ease: "bounce.out" },
          i,
        );

        timeline.to(
          counter,
          {
            value: STACK_CUMULATIVE[i],
            duration: 0.8,
            ease: "power1.out",
            onUpdate: () => {
              if (counterRef.current) {
                counterRef.current.textContent = formatUsd(counter.value);
              }
            },
          },
          i,
        );

        // The stack settles after the landing, alternating direction so
        // the tower does not drift the same way five times.
        timeline.fromTo(
          tower,
          { tilt: i % 2 === 0 ? -0.02 : 0.02 },
          { tilt: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" },
          i + 0.68,
        );
      });

      // Last beat: the running counter hands over to the total.
      timeline.to(counterRef.current, { autoAlpha: 0, duration: 0.3 }, COUNT);
      timeline.fromTo(
        summaryRef.current,
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.5 },
        COUNT + 0.15,
      );
    }, overlayRef);

    // The canvas mounts after first paint, so anything measured before it
    // arrived needs re-measuring once.
    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, [blocks, counter, sectionRef, tower]);

  return (
    <div ref={overlayRef} className="absolute inset-0">
      <Canvas
        className="absolute inset-0"
        camera={{ position: [0, 0.7, 9.4], fov: 36 }}
        // Capped device pixel ratio - a 3x phone display would otherwise
        // render nine times the pixels for no visible gain.
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={[SCENE_COLORS.void]} />

        <ambientLight intensity={0.38} />
        <directionalLight position={[5, 9, 7]} intensity={2.4} />

        <Tower blocks={blocks} tower={tower} />

        {/* No normal pass: bloom is the only effect, and it does not read
            scene normals. */}
        <EffectComposer enableNormalPass={false}>
          {/* Threshold sits above the panel colour, so only the ember rim
              and the ember price tags bloom. */}
          <Bloom
            intensity={0.7}
            luminanceThreshold={0.5}
            luminanceSmoothing={0.25}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>

      {/* HTML overlay - crisper than 3D type and it costs no draw calls. */}
      <div className="pointer-events-none absolute inset-x-0 top-[26vh] flex flex-col items-center px-6 text-center">
        <div
          ref={counterRef}
          className="font-mono text-[clamp(2.5rem,7vw,4.5rem)] font-medium leading-none tracking-tight text-[color:var(--ember)]"
          style={{ fontFamily: "var(--font-mono)" }}
          aria-hidden="true"
        >
          {formatUsd(0)}
        </div>

        <div
          ref={summaryRef}
          className="absolute inset-x-0 top-0 flex flex-col items-center px-6"
          style={{ opacity: 0, visibility: "hidden" }}
        >
          <div
            className="text-[clamp(2.75rem,9vw,6rem)] font-medium leading-none tracking-tight text-[color:var(--ember)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {formatUsd(STACK_TOTAL_MONTHLY)}
            <span className="text-[0.32em] text-ash"> /mo</span>
          </div>
          <div
            className="mt-4 text-[clamp(1rem,3vw,1.5rem)] text-ash"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {formatUsd(STACK_TOTAL_YEARLY)} a year
          </div>
        </div>
      </div>
    </div>
  );
}
