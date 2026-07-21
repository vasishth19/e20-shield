"use client";

/**
 * Interactive Three.js visualization (Section 5, module 6) showing how
 * ethanol exposure affects rubber (fuel line) vs metal (tank) components
 * over time. Simplified primitive-based scene — not a licensed engine
 * model, purely educational/illustrative.
 */

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";

function DegradingRubberLine({ exposureYears }: { exposureYears: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const degradation = Math.min(exposureYears / 15, 1);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  const color = new THREE.Color().lerpColors(
    new THREE.Color("#22C55E"),
    new THREE.Color("#F97316"),
    degradation
  );

  return (
    <mesh ref={meshRef} position={[-1.5, 0, 0]}>
      <cylinderGeometry args={[0.15, 0.15, 2, 16]} />
      <meshStandardMaterial color={color} roughness={0.6 + degradation * 0.3} />
    </mesh>
  );
}

function MetalTank({ exposureYears }: { exposureYears: number }) {
  const corrosion = Math.min(exposureYears / 25, 1); // metal degrades slower
  const color = new THREE.Color().lerpColors(
    new THREE.Color("#A1A1AA"),
    new THREE.Color("#78716C"),
    corrosion
  );

  return (
    <mesh position={[1.5, 0, 0]}>
      <sphereGeometry args={[0.9, 24, 24]} />
      <meshStandardMaterial color={color} metalness={0.7} roughness={0.3 + corrosion * 0.4} />
    </mesh>
  );
}

export default function EngineModel3D({ exposureYears = 5 }: { exposureYears?: number }) {
  return (
    <div className="w-full h-96 rounded-lg overflow-hidden bg-black/20">
      <Canvas camera={{ position: [0, 1.5, 5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 3, 3]} intensity={1} />
        <DegradingRubberLine exposureYears={exposureYears} />
        <MetalTank exposureYears={exposureYears} />
        <Text position={[-1.5, -1.3, 0]} fontSize={0.18} color="#a1a1aa">
          Fuel line (rubber)
        </Text>
        <Text position={[1.5, -1.3, 0]} fontSize={0.18} color="#a1a1aa">
          Fuel tank (metal)
        </Text>
        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.6} />
      </Canvas>
    </div>
  );
}
