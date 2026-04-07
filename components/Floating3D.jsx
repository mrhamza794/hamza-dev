"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

const BackgroundShapes = () => {
  const meshRef = useRef();

  useFrame((state) => {
    const { clock } = state;
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <group>
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <Sphere ref={meshRef} args={[1, 64, 64]} position={[0, 0, 0]}>
          <MeshDistortMaterial
            color="#8B5CF6"
            attach="material"
            distort={0.4}
            speed={1.5}
            roughness={0}
            metalness={0.8}
          />
        </Sphere>
      </Float>
      
      {/* Smaller secondary floating shapes */}
      <Float speed={3} rotationIntensity={2} floatIntensity={3}>
        <Sphere args={[0.5, 32, 32]} position={[3, 2, -2]}>
          <MeshDistortMaterial
            color="#06B6D4"
            attach="material"
            distort={0.5}
            speed={2}
          />
        </Sphere>
      </Float>

      <Float speed={2.5} rotationIntensity={1.5} floatIntensity={2.5}>
        <Sphere args={[0.3, 32, 32]} position={[-4, -1, -3]}>
          <MeshDistortMaterial
            color="#EC4899"
            attach="material"
            distort={0.6}
            speed={1}
          />
        </Sphere>
      </Float>
    </group>
  );
};

const Floating3D = () => {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none opacity-50">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#8B5CF6" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06B6D4" />
        <spotLight position={[5, 10, 5]} angle={0.3} penumbra={1} intensity={1} castShadow />
        <BackgroundShapes />
      </Canvas>
    </div>
  );
};

export default Floating3D;
