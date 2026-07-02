"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Float, MeshDistortMaterial, Text, Environment } from "@react-three/drei";
import * as THREE from "three";

/**
 * FieldTwin: 3D Digital Twin of an Agricultural Field
 * Maps NDVI data and yield predictions to a visual representation of crop health and productivity.
 */
interface FieldTwinProps {
  ndvi: number; // Normalized Difference Vegetation Index (0-1)
  position: [number, number, number];
  label: string;
  predictedYield?: number; // Predicted yield in kg/ha
  confidence?: number; // Confidence in prediction (0-1)
}

function FieldTwin({ ndvi = 0.5, position = [0, 0, 0], label = "Field", predictedYield, confidence }: FieldTwinProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Color mapping based on NDVI
  // 0.0 (Red/Brown) -> 0.3 (Yellow) -> 0.7 (Light Green) -> 1.0 (Deep Green)
  const color = useMemo(() => {
    if (ndvi < 0.2) return new THREE.Color("#ef4444"); // Poor
    if (ndvi < 0.4) return new THREE.Color("#facc15"); // Fair
    if (ndvi < 0.7) return new THREE.Color("#4ade80"); // Good
    return new THREE.Color("#166534"); // Excellent
  }, [ndvi]);

  // Additional visual indicator for yield potential (pulsing intensity based on yield)
  const yieldPulse = useMemo(() => {
    if (predictedYield === undefined) return 1.0;
    // Normalize yield to 0.5-1.5 range for pulsing (assuming 0-10000 kg/ha range)
    const normalizedYield = Math.min(1.5, Math.max(0.5, predictedYield / 5000 + 0.5));
    return normalizedYield;
  }, [predictedYield]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
      // Apply yield-based pulsing scale
      meshRef.current.scale.set(yieldPulse, yieldPulse, yieldPulse);
    }
  });

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={meshRef}>
          {/* Representation of a plot of land as a rounded box */}
          <boxGeometry args={[2, 0.4, 2]} />
          <MeshDistortMaterial
            color={color}
            speed={2}
            distort={0.1}
            radius={1}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        <Text
          position={[0, 1, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
          font="/fonts/outfit.ttf" // Ensure this path is correct or use default
        >
          {predictedYield !== undefined
            ? `${label}\nNDVI: ${ndvi.toFixed(2)}\nYield: ${predictedYield.toFixed(0)} kg/ha`
            : `${label} (NDVI: ${ndvi.toFixed(2)})`}
        </Text>
      </Float>
    </group>
  );
}

export default function FieldDigitalTwin({ fields = [] }) {
  const [enhancedFields, setEnhancedFields] = useState<any[]>(fields);

  // Fetch yield predictions for fields that don't have them
  useEffect(() => {
    if (fields.length === 0) return;

    const fetchPredictions = async () => {
      try {
        // Only fetch predictions for fields that don't already have yield data
        const fieldsNeedingPrediction = fields.filter(
          field => !field.predictedYield && field.ndvi !== undefined
        );

        if (fieldsNeedingPrediction.length === 0) return;

        // For demo purposes, we'll generate mock predictions based on field data
        // In a real app, you would call the API endpoint
        const enhanced = fields.map(field => {
          if (field.predictedYield !== undefined) {
            return field; // Already has prediction
          }

          // Generate a mock prediction based on field data
          // This simulates what the API would return
          const mockPrediction = {
            ...field,
            predictedYield: Math.max(500, field.ndvi * 12000 + Math.random() * 2000), // Simple model
            confidence: 0.75 + Math.random() * 0.2, // Random confidence between 0.75-0.95
          };
          return mockPrediction;
        });

        setEnhancedFields(enhanced);
      } catch (error) {
        console.error("Error fetching yield predictions:", error);
        setEnhancedFields(fields); // Fallback to original fields
      }
    };

    fetchPredictions();
  }, [fields]);

  return (
    <div className="w-full h-[600px] rounded-4xl overflow-hidden bg-navy-950 relative group border border-white/10 shadow-glow-lg">
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h3 className="text-white text-2xl font-display font-bold mb-2">Digital Twin Infrastructure</h3>
        <p className="text-gray-400 text-sm font-medium">Real-time Satellite-to-3D Spectral Mapping with Yield Prediction</p>
      </div>

      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[5, 5, 5]} />
        <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} />

        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />

        <Environment preset="city" />

        <group position={[0, -1, 0]}>
          {enhancedFields.map((field: any, i: number) => (
            <FieldTwin
              key={field.id}
              ndvi={field.ndvi || 0.5}
              position={[ (i % 3) * 3 - 3, 0, Math.floor(i / 3) * 3 - 3]}
              label={field.name || `Field ${i+1}`}
              predictedYield={field.predictedYield}
              confidence={field.confidence}
            />
          ))}
        </group>

        {/* Ground Plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#020617" roughness={1} metalness={0} />
        </mesh>
      </Canvas>

      <div className="absolute bottom-6 right-6 z-10 flex gap-4">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs text-white font-medium">
          <div className="w-2 h-2 rounded-full bg-red-500" /> Poor (NDVI < 0.2)
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs text-white font-medium">
          <div className="w-2 h-2 rounded-full bg-yellow-400" /> Fair (NDVI 0.2-0.4)
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs text-white font-medium">
          <div className="w-2 h-2 rounded-full bg-green-400" /> Good (NDVI 0.4-0.7)
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs text-white font-medium">
          <div className="w-2 h-2 rounded-full bg-green-600" /> Excellent (NDVI > 0.7)
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs text-white font-medium">
          <div className="w-2 h-2 rounded-full bg-blue-500" /> Yield Data
        </div>
      </div>
    </div>
  );
}
