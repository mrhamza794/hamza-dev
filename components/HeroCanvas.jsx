"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, PerspectiveCamera, MeshDistortMaterial, Sphere, TorusKnot, Icosahedron } from "@react-three/drei";
import { EffectComposer, Bloom, Noise, ChromaticAberration } from "@react-three/postprocessing";
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
  const torusRef = useRef();
  const icoRef = useRef();
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

    if (torusRef.current) {
      torusRef.current.rotation.y += 0.002;
    }

    if (icoRef.current) {
      icoRef.current.position.x = Math.sin(time) * 2;
      icoRef.current.position.z = Math.cos(time) * 2;
      icoRef.current.rotation.x += 0.01;
      icoRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Primary Torus Knot */}
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <TorusKnot ref={torusRef} args={[1, 0.3, 128, 32]}>
          <meshPhysicalMaterial
            color="#8B5CF6"
            metalness={0.8}
            roughness={0.2}
            transmission={0.1}
            thickness={0.5}
            emissive="#8B5CF6"
            emissiveIntensity={0.3}
          />
        </TorusKnot>
      </Float>

      {/* Orbiting Icosahedron */}
      <Icosahedron ref={icoRef} args={[0.3, 0]}>
        <meshPhysicalMaterial color="#EC4899" emissive="#EC4899" emissiveIntensity={1} />
      </Icosahedron>

      {/* Outer Wireframe Sphere */}
      <Sphere args={[3, 32, 32]}>
        <meshBasicMaterial color="#06B6D4" wireframe transparent opacity={0.1} />
      </Sphere>
    </group>
  );
};

const HeroCanvas = () => {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [particleCount, setParticleCount] = useState(500);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouse({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };

    const handleResize = () => {
      setParticleCount(window.innerWidth < 768 ? 100 : 500);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <ambientLight intensity={0.5} color="#8B5CF6" />
        <pointLight position={[10, 10, 10]} color="#3B82F6" intensity={1.5} />
        <pointLight position={[-10, -10, -10]} color="#EC4899" intensity={1} />
        <spotLight position={[0, 10, 0]} intensity={1} color="#06B6D4" angle={0.3} penumbra={1} />
        
        <Scene mouse={mouse} />
        <ParticleSystem count={particleCount} />

        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.5} mipmapBlur intensity={0.8} radius={0.4} />
          <Noise opacity={0.02} />
          <ChromaticAberration offset={[0.0005, 0.0005]} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default HeroCanvas;
