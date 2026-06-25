import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "next-themes";
import { useHomeScrollProgress } from "@/hooks/useHomeScrollProgress";

// ---- Gradient palettes (RGB 0–1) ----
const DARK_STOPS = [
  [0.545, 0.361, 0.965],
  [0.024, 0.714, 0.831],
  [0.925, 0.286, 0.6],
];
const LIGHT_STOPS = [
  [0.38, 0.42, 0.62],
  [0.12, 0.55, 0.72],
  [0.72, 0.28, 0.52],
];

/** Per-formation hue accent — keeps each shape visually distinct while morphing */
const FORMATION_TINTS = [
  [1.0, 0.92, 1.05], // globe — violet lean
  [0.85, 1.05, 1.1], // grid — cyan lean
  [1.05, 0.88, 1.0], // helix — pink lean
  [0.9, 1.0, 1.08],  // rings — cool
  [1.08, 0.95, 0.88], // funnel — warm
];

function sampleGradient(stops, t) {
  const clamped = Math.max(0, Math.min(1, t));
  const segment = clamped * (stops.length - 1);
  const i0 = Math.floor(segment);
  const i1 = Math.min(i0 + 1, stops.length - 1);
  const localT = segment - i0;
  const a = stops[i0];
  const b = stops[i1];
  return [
    a[0] + (b[0] - a[0]) * localT,
    a[1] + (b[1] - a[1]) * localT,
    a[2] + (b[2] - a[2]) * localT,
  ];
}

function applyTint(rgb, tint) {
  return [rgb[0] * tint[0], rgb[1] * tint[1], rgb[2] * tint[2]];
}

function buildColors(positions, count, stops, tint) {
  const colors = new Float32Array(count * 3);
  let minV = Infinity;
  let maxV = -Infinity;

  for (let i = 0; i < count; i++) {
    const v = positions[i * 3] + positions[i * 3 + 1] + positions[i * 3 + 2] * 0.35;
    if (v < minV) minV = v;
    if (v > maxV) maxV = v;
  }

  const range = Math.max(1e-4, maxV - minV);

  for (let i = 0; i < count; i++) {
    const v = positions[i * 3] + positions[i * 3 + 1] + positions[i * 3 + 2] * 0.35;
    const t = (v - minV) / range;
    const tinted = applyTint(sampleGradient(stops, t), tint);
    colors[i * 3] = tinted[0];
    colors[i * 3 + 1] = tinted[1];
    colors[i * 3 + 2] = tinted[2];
  }

  return colors;
}

function fibonacciSphere(count, radius) {
  const positions = new Float32Array(count * 3);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(1, count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * i;
    positions[i * 3] = Math.cos(theta) * r * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = Math.sin(theta) * r * radius;
  }

  return positions;
}

function dataGrid(count, size) {
  const positions = new Float32Array(count * 3);
  const side = Math.max(2, Math.round(Math.cbrt(count)));
  let idx = 0;

  for (let ix = 0; ix < side && idx < count; ix++) {
    for (let iy = 0; iy < side && idx < count; iy++) {
      for (let iz = 0; iz < side && idx < count; iz++) {
        positions[idx * 3] = (ix / (side - 1) - 0.5) * size;
        positions[idx * 3 + 1] = (iy / (side - 1) - 0.5) * size;
        positions[idx * 3 + 2] = (iz / (side - 1) - 0.5) * size;
        idx++;
      }
    }
  }

  for (; idx < count; idx++) {
    positions[idx * 3] = (Math.random() - 0.5) * size;
    positions[idx * 3 + 1] = (Math.random() - 0.5) * size;
    positions[idx * 3 + 2] = (Math.random() - 0.5) * size;
  }

  return positions;
}

function doubleHelix(count, radius, height, turns) {
  const positions = new Float32Array(count * 3);
  const total = Math.ceil(count / 2);

  for (let i = 0; i < count; i++) {
    const strand = i % 2;
    const tIdx = Math.floor(i / 2);
    const t = tIdx / total;
    const angle = t * turns * Math.PI * 2 + (strand === 1 ? Math.PI : 0);
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = (t - 0.5) * height;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
  }

  return positions;
}

function orbitRings(count, radius) {
  const positions = new Float32Array(count * 3);
  const ringsCount = 3;
  const perRing = Math.ceil(count / ringsCount);
  const tilts = [0, Math.PI / 3.2, -Math.PI / 3.2];
  let idx = 0;

  for (let r = 0; r < ringsCount && idx < count; r++) {
    const ringRadius = radius * (0.7 + r * 0.18);
    const tilt = tilts[r];

    for (let i = 0; i < perRing && idx < count; i++) {
      const angle = (i / perRing) * Math.PI * 2;
      const x = Math.cos(angle) * ringRadius;
      const z = Math.sin(angle) * ringRadius;
      positions[idx * 3] = x;
      positions[idx * 3 + 1] = -z * Math.sin(tilt);
      positions[idx * 3 + 2] = z * Math.cos(tilt);
      idx++;
    }
  }

  return positions;
}

function signalFunnel(count, radius, length) {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const t = i / count;
    const angle = t * Math.PI * 14 + i * 0.61803398875;
    const r = radius * Math.pow(1 - t, 1.3) + 0.05;
    positions[i * 3] = Math.cos(angle) * r;
    positions[i * 3 + 1] = Math.sin(angle) * r;
    positions[i * 3 + 2] = -t * length + length * 0.4;
  }

  return positions;
}

function buildFormations(count, isLight) {
  const stops = isLight ? LIGHT_STOPS : DARK_STOPS;
  const rawPositions = [
    fibonacciSphere(count, 1.7),
    dataGrid(count, 2.6),
    doubleHelix(count, 1.05, 3.6, 3.5),
    orbitRings(count, 1.65),
    signalFunnel(count, 1.9, 3.2),
  ];

  const positions = rawPositions;
  const colors = rawPositions.map((p, i) => buildColors(p, count, stops, FORMATION_TINTS[i]));

  return { positions, colors };
}

/** Soft circular sprite — avoids harsh square points */
function createParticleTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.85)");
  gradient.addColorStop(0.7, "rgba(255,255,255,0.25)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

const MorphingSwarm = ({ progressRef, particleCount, isLight }) => {
  const pointsRef = useRef();
  const groupRef = useRef();
  const lastProgress = useRef(0);

  const particleTexture = useMemo(() => {
    if (typeof document === "undefined") return null;
    return createParticleTexture();
  }, []);

  const { positions, colors } = useMemo(
    () => buildFormations(particleCount, isLight),
    [particleCount, isLight]
  );

  const phases = useMemo(
    () => Float32Array.from({ length: particleCount }, () => Math.random() * Math.PI * 2),
    [particleCount]
  );

  const livePositions = useMemo(() => new Float32Array(particleCount * 3), [particleCount]);
  const liveColors = useMemo(() => new Float32Array(particleCount * 3), [particleCount]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(livePositions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(liveColors, 3));
    return geo;
  }, [livePositions, liveColors]);

  useEffect(() => () => {
    geometry.dispose();
    particleTexture?.dispose();
  }, [geometry, particleTexture]);

  useFrame((state, delta) => {
    const points = pointsRef.current;
    if (!points) return;

    const progress = progressRef.current;
    const scrollVelocity = (progress - lastProgress.current) / Math.max(delta, 0.001);
    lastProgress.current = progress;

    const formCount = positions.length;
    const scaled = progress * (formCount - 1);
    const indexA = Math.min(Math.floor(scaled), formCount - 1);
    const indexB = Math.min(indexA + 1, formCount - 1);
    let blend = scaled - indexA;
    blend = blend * blend * (3 - 2 * blend);

    const posA = positions[indexA];
    const posB = positions[indexB];
    const colA = colors[indexA];
    const colB = colors[indexB];
    const t = state.clock.elapsedTime;
    const wobble = Math.min(0.12, Math.abs(scrollVelocity) * 0.04);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const phase = phases[i];

      let x = posA[i3] + (posB[i3] - posA[i3]) * blend;
      let y = posA[i3 + 1] + (posB[i3 + 1] - posA[i3 + 1]) * blend;
      let z = posA[i3 + 2] + (posB[i3 + 2] - posA[i3 + 2]) * blend;

      x += Math.sin(t * 0.55 + phase) * (0.035 + wobble);
      y += Math.cos(t * 0.48 + phase) * (0.035 + wobble);
      z += Math.sin(t * 0.42 + phase * 1.3) * 0.02;

      livePositions[i3] = x;
      livePositions[i3 + 1] = y;
      livePositions[i3 + 2] = z;

      const brightness = isLight ? 0.92 : 1.08 + Math.sin(t * 1.2 + phase) * 0.08;
      liveColors[i3] = (colA[i3] + (colB[i3] - colA[i3]) * blend) * brightness;
      liveColors[i3 + 1] = (colA[i3 + 1] + (colB[i3 + 1] - colA[i3 + 1]) * blend) * brightness;
      liveColors[i3 + 2] = (colA[i3 + 2] + (colB[i3 + 2] - colA[i3 + 2]) * blend) * brightness;
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;

    if (groupRef.current) {
      groupRef.current.rotation.y += delta * (0.028 + Math.abs(scrollVelocity) * 0.015);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        progress * 0.5 - 0.12,
        0.05
      );
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        Math.sin(progress * Math.PI) * 0.08,
        0.04
      );
      groupRef.current.position.x = THREE.MathUtils.lerp(
        groupRef.current.position.x,
        (progress - 0.5) * 1.1,
        0.05
      );
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        (0.5 - progress) * 0.4,
        0.05
      );
      groupRef.current.scale.setScalar(
        THREE.MathUtils.lerp(groupRef.current.scale.x, 0.92 + Math.sin(progress * Math.PI) * 0.08, 0.04)
      );
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} geometry={geometry}>
        <pointsMaterial
          map={particleTexture ?? undefined}
          size={isLight ? 0.045 : 0.052}
          sizeAttenuation
          vertexColors
          transparent
          opacity={isLight ? 0.72 : 0.92}
          depthWrite={false}
          blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
    </group>
  );
};

const AmbientSparkles = ({ count, isLight }) => {
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        time: THREE.MathUtils.randFloat(0, 100),
        factor: THREE.MathUtils.randFloat(20, 120),
        speed: THREE.MathUtils.randFloat(0.004, 0.01),
        x: THREE.MathUtils.randFloatSpread(14),
        y: THREE.MathUtils.randFloatSpread(14),
        z: THREE.MathUtils.randFloatSpread(10),
      });
    }
    return temp;
  }, [count]);

  const sparkleColor = isLight ? "#64748b" : "#22d3ee";

  useFrame(() => {
    if (!mesh.current) return;

    particles.forEach((particle, i) => {
      particle.time += particle.speed;
      const t = particle.time;

      dummy.position.set(
        particle.x + Math.sin(t) * particle.factor * 0.002,
        particle.y + Math.cos(t) * particle.factor * 0.002 + ((t * 0.2) % 10) - 5,
        particle.z + Math.cos(t * 0.7) * particle.factor * 0.0015
      );

      const s = Math.cos(t) * 0.015 + 0.022;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });

    mesh.current.instanceMatrix.needsUpdate = true;
  });

  if (count === 0) return null;

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <sphereGeometry args={[1, 5, 5]} />
      <meshBasicMaterial color={sparkleColor} transparent opacity={isLight ? 0.2 : 0.45} depthWrite={false} />
    </instancedMesh>
  );
};

const ScrollCamera = ({ progressRef }) => {
  const { camera } = useThree();

  useFrame(() => {
    const p = progressRef.current;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 5.5 - p * 0.6, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, p * 0.25, 0.04);
    camera.lookAt(0, 0, 0);
  });

  return null;
};

const HomeScrollScene = () => {
  const { resolvedTheme } = useTheme();
  const progressRef = useHomeScrollProgress();
  const [mounted, setMounted] = useState(false);
  const [particleCount, setParticleCount] = useState(900);
  const [ambientCount, setAmbientCount] = useState(28);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleResize = () => {
      const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (isReducedMotion) {
        setShouldRender(false);
        return;
      }

      setShouldRender(true);
      const isMobile = window.innerWidth < 768;
      setParticleCount(isMobile ? 380 : 900);
      setAmbientCount(isMobile ? 14 : 28);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!shouldRender || !mounted) return null;

  const isLight = resolvedTheme === "light";

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 h-screen w-full" aria-hidden>
      <Canvas dpr={[1, 1.75]} gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}>
        <PerspectiveCamera makeDefault position={[0, 0, 5.5]} fov={42} />
        <ScrollCamera progressRef={progressRef} />
        <MorphingSwarm progressRef={progressRef} particleCount={particleCount} isLight={isLight} />
        <AmbientSparkles count={ambientCount} isLight={isLight} />
      </Canvas>
    </div>
  );
};

export default HomeScrollScene;
