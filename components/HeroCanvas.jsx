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

const Scene = ({ mouse }) => {
  const groupRef = useRef();
  const dodecahedronRef = useRef();
  const { viewport } = useThree();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Parallax effect
    if (groupRef.current) {
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, mouse.x * viewport.width / 20, 0.05);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, mouse.y * viewport.height / 20, 0.05);
      
      groupRef.current.rotation.x = time * 0.1;
      groupRef.current.rotation.y = time * 0.15;
    }

    if (dodecahedronRef.current) {
      dodecahedronRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <Dodecahedron ref={dodecahedronRef} args={[1.5, 0]}>
          <meshBasicMaterial color="#8B5CF6" wireframe />
        </Dodecahedron>
      </Float>
    </group>
  );
};

const HeroCanvas = () => {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [particleCount, setParticleCount] = useState(50); // Heavily reduced default count

  useEffect(() => {
    let timeoutId;
    const handleMouseMove = (e) => {
      // Debounce logic (throttle to ~60fps equivalent interaction)
      if(timeoutId) return;
      timeoutId = setTimeout(() => {
        setMouse({
          x: (e.clientX / window.innerWidth) * 2 - 1,
          y: -(e.clientY / window.innerHeight) * 2 + 1,
        });
        timeoutId = null;
      }, 16);
    };

    const handleResize = () => {
      setParticleCount(window.innerWidth < 768 ? 20 : 50);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if(timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      <Canvas dpr={[1, 1.5]}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <ambientLight intensity={0.5} color="#8B5CF6" />
        <pointLight position={[10, 10, 10]} color="#3B82F6" intensity={1} />
        
        <Scene mouse={mouse} />
        <ParticleSystem count={particleCount} />

        {process.env.NODE_ENV === 'development' && <Stats />}
      </Canvas>
    </div>
  );
};

export default HeroCanvas;
