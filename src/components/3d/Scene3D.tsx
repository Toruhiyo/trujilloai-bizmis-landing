import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Float } from "@react-three/drei";
import { useState, useEffect } from "react";
import FloatingAI from "./FloatingAI";

interface Mouse3DProps {
  mousePosition: { x: number; y: number };
  onAIClick: (type: string) => void;
}

const Scene3D = ({ mousePosition, onAIClick }: Mouse3DProps) => {
  const [aiPositions] = useState([
    { pos: [-3, 0, 0] as [number, number, number], color: "#10b981", type: "sales" as const },
    { pos: [0, 2, -2] as [number, number, number], color: "#3b82f6", type: "support" as const },
    { pos: [3, -1, 1] as [number, number, number], color: "#8b5cf6", type: "analytics" as const },
  ]);

  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 75 }}
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      
      {/* Background Stars */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Floating AI Characters */}
      {aiPositions.map((ai, index) => (
        <Float key={index} speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <FloatingAI
            position={ai.pos}
            color={ai.color}
            type={ai.type}
            onClick={() => onAIClick(ai.type)}
          />
        </Float>
      ))}
      
      {/* Interactive Controls */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        enableRotate={true}
        autoRotate={true}
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 3}
      />
    </Canvas>
  );
};

export default Scene3D;