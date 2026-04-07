"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Float, Sphere, MeshDistortMaterial, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { SKILLS } from "@/lib/constants";

const SkillOrb = ({ position, skill, index, onHover, isSelected, onSelect }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  const categoryColors = {
    frontend: "#8B5CF6", // Purple
    backend: "#3B82F6",  // Blue
    database: "#10B981", // Emerald/Green
    state: "#F59E0B",    // Amber
    styling: "#06B6D4",  // Cyan
    "3d": "#EC4899",     // Pink
    design: "#F43F5E",   // Rose
  };

  const color = categoryColors[skill.category] || "#FFFFFF";

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.position.y += Math.sin(time + index) * 0.002;
      meshRef.current.scale.lerp(
        new THREE.Vector3(hovered || isSelected ? 1.5 : 1, hovered || isSelected ? 1.5 : 1, hovered || isSelected ? 1.5 : 1), 
        0.1
      );
    }
  });

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Sphere
          ref={meshRef}
          args={[0.6, 32, 32]}
          onPointerOver={() => { setHovered(true); onHover(skill); }}
          onPointerOut={() => { setHovered(false); onHover(null); }}
          onClick={() => onSelect(skill)}
        >
          <MeshDistortMaterial
            color={color}
            distort={0.3}
            speed={2}
            roughness={0}
            metalness={0.8}
            emissive={color}
            emissiveIntensity={hovered || isSelected ? 1 : 0.4}
          />
        </Sphere>
      </Float>
      
      <Text
        position={[0, -1.2, 0]}
        fontSize={0.4}
        color="white"
        font="/fonts/SpaceGrotesk-Medium.ttf"
        anchorX="center"
        anchorY="middle"
        visible={hovered || isSelected}
      >
        {skill.name}
      </Text>
    </group>
  );
};

const SkillSphere = ({ onSelectSkill, selectedSkill }) => {
  const [hoveredSkill, setHoveredSkill] = useState(null);

  const skillPositions = useMemo(() => {
    const points = [];
    const radius = 8;
    const count = SKILLS.length;

    for (let i = 0; i < count; i++) {
        const phi = Math.acos(1 - 2 * (i + 0.5) / count);
        const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

        const x = radius * Math.cos(theta) * Math.sin(phi);
        const y = radius * Math.sin(theta) * Math.sin(phi);
        const z = radius * Math.cos(phi);

        points.push(new THREE.Vector3(x, y, z));
    }
    return points;
  }, []);

  return (
    <>
      <OrbitControls 
        enableZoom={false} 
        autoRotate={!selectedSkill} 
        autoRotateSpeed={0.5} 
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI * 3 / 4}
      />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#8B5CF6" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06B6D4" />

      {SKILLS.map((skill, idx) => (
        <SkillOrb
          key={skill.name}
          index={idx}
          position={skillPositions[idx]}
          skill={skill}
          onHover={setHoveredSkill}
          isSelected={selectedSkill?.name === skill.name}
          onSelect={onSelectSkill}
        />
      ))}
      
      {/* Connecting Lines */}
      {skillPositions.map((pos, i) => {
        if (i === 0) return null;
        return (
          <line key={`line-${i}`}>
            <bufferGeometry attach="geometry">
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([...skillPositions[i-1].toArray(), ...pos.toArray()])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial attach="material" color="#8B5CF6" transparent opacity={0.1} />
          </line>
        )
      })}
    </>
  );
};

export default SkillSphere;
