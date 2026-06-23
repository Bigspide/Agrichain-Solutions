"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function seededRandom(seed: number) {
  const value = Math.sin(seed) * 10000;
  return value - Math.floor(value);
}

function Globe() {
  const globeRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.002;
    }
    if (wireRef.current) {
      wireRef.current.rotation.y += 0.002;
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.002;
    }
  });

  // Generate agricultural data points concentrated on West Africa
  const dataPoints = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const westAfricaLocations = [
      // Côte d'Ivoire
      { lat: 6.8, lng: -5.3, color: [0.13, 0.77, 0.37] },
      { lat: 7.7, lng: -6.9, color: [0.13, 0.77, 0.37] },
      { lat: 5.3, lng: -4.0, color: [0.96, 0.62, 0.04] },
      { lat: 9.5, lng: -5.6, color: [0.13, 0.77, 0.37] },
      // Ghana
      { lat: 5.6, lng: -0.2, color: [0.96, 0.62, 0.04] },
      { lat: 7.3, lng: -2.0, color: [0.13, 0.77, 0.37] },
      // Nigeria
      { lat: 6.5, lng: 3.4, color: [0.96, 0.62, 0.04] },
      { lat: 9.1, lng: 7.5, color: [0.13, 0.77, 0.37] },
      // Senegal
      { lat: 14.7, lng: -17.5, color: [0.13, 0.77, 0.37] },
      { lat: 12.6, lng: -15.3, color: [0.96, 0.62, 0.04] },
      // Mali
      { lat: 12.6, lng: -8.0, color: [0.13, 0.77, 0.37] },
      // Guinea
      { lat: 9.9, lng: -13.7, color: [0.96, 0.62, 0.04] },
      // Cameroon
      { lat: 3.8, lng: 11.5, color: [0.13, 0.77, 0.37] },
      // Burkina Faso
      { lat: 12.3, lng: -1.5, color: [0.96, 0.62, 0.04] },
    ];

    westAfricaLocations.forEach((loc) => {
      const phi = (90 - loc.lat) * (Math.PI / 180);
      const theta = (loc.lng + 180) * (Math.PI / 180);
      const r = 2.02;

      positions.push(
        -r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );

      colors.push(loc.color[0], loc.color[1], loc.color[2]);
    });

    // Random points around the world
    for (let i = 0; i < 50; i++) {
      const phi = Math.acos(2 * seededRandom(i * 17 + 3) - 1);
      const theta = 2 * Math.PI * seededRandom(i * 29 + 7);
      const r = 2.02;

      positions.push(
        -r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );

      colors.push(0.4, 0.6, 0.4);
    }

    return {
      positions: new Float32Array(positions),
      colors: new Float32Array(colors),
    };
  }, []);

  return (
    <group>
      {/* Globe */}
      <Sphere ref={globeRef} args={[2, 64, 64]}>
        <meshPhongMaterial
          color="#0a3d1a"
          transparent
          opacity={0.85}
          wireframe={false}
        />
      </Sphere>

      {/* Wireframe overlay */}
      <Sphere args={[2.01, 32, 32]} ref={wireRef}>
        <meshBasicMaterial color="#22c55e" wireframe transparent opacity={0.15} />
      </Sphere>

      {/* Data points */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[dataPoints.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[dataPoints.colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.08} vertexColors transparent opacity={0.9} sizeAttenuation />
      </points>

      {/* Glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.3, 2.5, 64]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Particles() {
  const particlesRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions: number[] = [];
    for (let i = 0; i < 200; i++) {
      positions.push(
        (seededRandom(i * 11 + 1) - 0.5) * 15,
        (seededRandom(i * 13 + 2) - 0.5) * 15,
        (seededRandom(i * 17 + 3) - 0.5) * 15
      );
    }
    return new Float32Array(positions);
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[particles, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#22c55e" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

export default function GlobeScene() {
  return (
    <div className="absolute inset-0 opacity-80">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 3, 5]} intensity={1} color="#22c55e" />
        <directionalLight position={[-5, -3, -5]} intensity={0.3} color="#f59e0b" />
        <pointLight position={[0, 0, 5]} intensity={0.5} color="#ffffff" />
        <Globe />
        <Particles />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={(2 * Math.PI) / 3}
        />
      </Canvas>
    </div>
  );
}
