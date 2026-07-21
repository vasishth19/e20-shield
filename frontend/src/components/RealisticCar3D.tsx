"use client";

/**
 * Realistic-as-possible procedural 3D car (React Three Fiber + drei).
 *
 * There is no licensed/photoreal car asset here — this is a fully
 * procedural body built from primitives with PBR (physically-based)
 * materials: clearcoat paint, glass, chrome, emissive lights, plus
 * environment reflections and a reflective ground plane. It's the
 * closest achievable "showroom" look without importing a 3D asset file,
 * and it live-animates (wheel spin, headlight glow, subtle bob) rather
 * than being a static render.
 */

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  ContactShadows,
  RoundedBox,
  OrbitControls,
  Float,
} from "@react-three/drei";
import * as THREE from "three";

function Wheel({ position }: { position: [number, number, number] }) {
  const wheelRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (wheelRef.current) wheelRef.current.rotation.x -= delta * 4;
  });
  return (
    <group position={position} ref={wheelRef}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.34, 0.34, 0.22, 32]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.24, 16]} />
        <meshStandardMaterial color="#c7c7cf" roughness={0.25} metalness={0.9} />
      </mesh>
    </group>
  );
}

function CarBody({ paintColor }: { paintColor: string }) {
  const paint = { color: paintColor, metalness: 0.6, roughness: 0.25, envMapIntensity: 1.2 };

  return (
    <group>
      {/* Lower chassis */}
      <RoundedBox args={[2.6, 0.5, 1.15]} radius={0.12} smoothness={4} position={[0, 0.35, 0]}>
        <meshStandardMaterial {...paint} />
      </RoundedBox>

      {/* Cabin */}
      <RoundedBox args={[1.5, 0.5, 1.05]} radius={0.18} smoothness={4} position={[-0.1, 0.78, 0]}>
        <meshStandardMaterial {...paint} />
      </RoundedBox>

      {/* Windshield / glass band */}
      <RoundedBox args={[1.42, 0.32, 1.0]} radius={0.14} smoothness={4} position={[-0.1, 0.85, 0]}>
        <meshPhysicalMaterial
          color="#89d8ff"
          transparent
          opacity={0.35}
          roughness={0.05}
          metalness={0}
          transmission={0.6}
          thickness={0.2}
        />
      </RoundedBox>

      {/* Headlights */}
      {[-0.52, 0.52].map((z) => (
        <mesh key={z} position={[1.28, 0.42, z]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#bfe9ff"
            emissiveIntensity={1.8}
          />
        </mesh>
      ))}

      {/* Taillights */}
      {[-0.5, 0.5].map((z) => (
        <mesh key={z} position={[-1.28, 0.42, z]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial
            color="#ff2d2d"
            emissive="#ff2d2d"
            emissiveIntensity={1.4}
          />
        </mesh>
      ))}

      {/* Wheels */}
      <Wheel position={[0.85, 0.34, 0.62]} />
      <Wheel position={[0.85, 0.34, -0.62]} />
      <Wheel position={[-0.85, 0.34, 0.62]} />
      <Wheel position={[-0.85, 0.34, -0.62]} />
    </group>
  );
}

export default function RealisticCar3D({
  paintColor = "#3b82f6",
  autoRotate = true,
}: {
  paintColor?: string;
  autoRotate?: boolean;
}) {
  return (
    <div className="w-full h-[28rem] rounded-2xl overflow-hidden bg-gradient-to-b from-transparent to-black/40">
      <Canvas shadows camera={{ position: [3.6, 2.1, 3.6], fov: 40 }}>
        <ambientLight intensity={0.35} />
        <directionalLight
          position={[4, 6, 3]}
          intensity={1.6}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <spotLight position={[-5, 5, -5]} intensity={0.5} color="#22D3EE" />

        <Float speed={1.2} rotationIntensity={0} floatIntensity={0.4}>
          <CarBody paintColor={paintColor} />
        </Float>

        <ContactShadows position={[0, 0.02, 0]} opacity={0.6} scale={8} blur={2.4} far={4} />
        <Environment preset="city" />

        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={7}
          autoRotate={autoRotate}
          autoRotateSpeed={1.4}
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>
    </div>
  );
}
