"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, Dodecahedron, Float, Stats } from "@react-three/drei";
import * as THREE from "three";

const ParticleSystem = ({ count = 500 }) => {
  const mesh = useRef();
  const light = useRef();
  
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
      <meshBasicMaterial color="#06B6D4" transparent opacity={0.4} />
    </instancedMesh>
  );
};

const Scene = () => {
  const dodecahedronRef = useRef();
  const { viewport } = useThree();

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
          <meshBasicMaterial color="#8B5CF6" wireframe transparent opacity={1} />
        </Dodecahedron>
      </Float>
    </group>
  );
};

const HeroCanvas = () => {
  const [particleCount, setParticleCount] = useState(50);

  useEffect(() => {
    const handleResize = () => {
      setParticleCount(window.innerWidth < 768 ? 20 : 50);
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-screen pointer-events-none -z-10">
      <Canvas dpr={[1, 1.5]}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <ambientLight intensity={0.5} color="#8B5CF6" />
        <pointLight position={[10, 10, 10]} color="#3B82F6" intensity={1} />
        
        <Scene />
        <ParticleSystem count={particleCount} />

        {process.env.NODE_ENV === 'development' && <Stats />}
      </Canvas>
    </div>
  );
};
export default HeroCanvas;
