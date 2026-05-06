import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, Dodecahedron, Float } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "next-themes";

const ParticleSystem = ({ count = 500, color = "#06B6D4", opacity = 0.4 }) => {
  const mesh = useRef();
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const time = THREE.MathUtils.randFloat(0, 100);
      const factor = THREE.MathUtils.randFloat(20, 120);
      const speed = THREE.MathUtils.randFloat(0.01, 0.015) / 2;
      const x = THREE.MathUtils.randFloatSpread(10);
      const y = THREE.MathUtils.randFloatSpread(10);
      const z = THREE.MathUtils.randFloatSpread(10);

      temp.push({ time, factor, speed, x, y, z });
    }
    return temp;
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    particles.forEach((particle, i) => {
      let { time, factor, speed, x, y, z } = particle;

      const t = (time += speed);
      particles[i].time = t;

      dummy.position.set(
        x + Math.sin(t) * factor * 0.002,
        y + Math.cos(t) * factor * 0.002 + t * 0.2 % 10 - 5,
        z + Math.cos(t) * factor * 0.002
      );
      
      const s = Math.cos(t) * 0.02 + 0.03;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </instancedMesh>
  );
};

const Scene = ({ wireColor = "#8B5CF6" }) => {
  const dodecahedronRef = useRef();

  // We use a mutable ref to track scroll to avoid re-renders
  const scrollTarget = useRef(0);
  
  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress relative to first 100vh
      const scrollProgress = window.scrollY / window.innerHeight;
      scrollTarget.current = Math.min(Math.max(scrollProgress, 0), 1);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initialize
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useFrame((state, delta) => {
    if (dodecahedronRef.current) {
      const p = scrollTarget.current;
      
      // Interpolate towards target scroll positions for smooth 60fps tracking
      dodecahedronRef.current.rotation.x = THREE.MathUtils.lerp(dodecahedronRef.current.rotation.x, p * Math.PI, 0.1);
      dodecahedronRef.current.rotation.y = THREE.MathUtils.lerp(dodecahedronRef.current.rotation.y, p * Math.PI, 0.1);
      
      const targetScale = 1.5 * (1 - p * 0.7); // Shrinks from 1.5 down to 0.45
      dodecahedronRef.current.scale.setScalar(
        THREE.MathUtils.lerp(dodecahedronRef.current.scale.x, targetScale, 0.1)
      );
      
      // Translate right and down, pushing deep into Z
      dodecahedronRef.current.position.x = THREE.MathUtils.lerp(dodecahedronRef.current.position.x, p * 6, 0.1);
      dodecahedronRef.current.position.y = THREE.MathUtils.lerp(dodecahedronRef.current.position.y, p * -4, 0.1);
      dodecahedronRef.current.position.z = THREE.MathUtils.lerp(dodecahedronRef.current.position.z, p * -3, 0.1);
      
      // Material Opacity (fades out at end)
      const material = dodecahedronRef.current.material;
      if (material) {
        material.opacity = THREE.MathUtils.lerp(material.opacity, 1 - p * 1.5, 0.1);
      }
    }
  });

  return (
    <group>
      <Float speed={0} rotationIntensity={0} floatIntensity={0}>
        <Dodecahedron ref={dodecahedronRef} args={[1, 0]}>
          <meshBasicMaterial color={wireColor} wireframe transparent opacity={1} />
        </Dodecahedron>
      </Float>
    </group>
  );
};

const HeroCanvas = () => {
  const { theme } = useTheme();
  const [particleCount, setParticleCount] = useState(50);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (isReducedMotion) {
        setShouldRender(false);
        setParticleCount(0);
        return;
      }

      setShouldRender(true);
      setParticleCount(window.innerWidth < 768 ? 12 : 30);
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (!shouldRender) {
    return null;
  }

  return (
    <div className="fixed inset-0 w-full h-screen pointer-events-none -z-10">
      <Canvas dpr={[1, 1.5]}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <ambientLight intensity={theme === "light" ? 0.35 : 0.5} color={theme === "light" ? "#94a3b8" : "#8B5CF6"} />
        <pointLight position={[10, 10, 10]} color={theme === "light" ? "#cbd5e1" : "#3B82F6"} intensity={theme === "light" ? 0.6 : 1} />
        
        <Scene wireColor={theme === "light" ? "#94a3b8" : "#8B5CF6"} />
        <ParticleSystem count={particleCount} color={theme === "light" ? "#94a3b8" : "#06B6D4"} opacity={theme === "light" ? 0.18 : 0.4} />

      </Canvas>
    </div>
  );
};
export default HeroCanvas;
