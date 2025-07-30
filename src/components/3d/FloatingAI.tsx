import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Sphere, Box } from "@react-three/drei";
import * as THREE from "three";

interface FloatingAIProps {
  position: [number, number, number];
  color: string;
  type: "sales" | "support" | "analytics";
  onClick?: () => void;
}

const FloatingAI = ({ position, color, type, onClick }: FloatingAIProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
    if (textRef.current) {
      textRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1 + 0.8;
    }
  });

  const handleClick = () => {
    setClicked(!clicked);
    onClick?.();
  };

  const getTypeSymbol = () => {
    switch (type) {
      case "sales": return "💼";
      case "support": return "🎧";
      case "analytics": return "📊";
    }
  };

  return (
    <group>
      {/* Main AI Character */}
      <Sphere
        ref={meshRef}
        position={position}
        scale={clicked ? 1.3 : hovered ? 1.1 : 1}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={color} 
          emissive={hovered ? color : "#000000"}
          emissiveIntensity={hovered ? 0.2 : 0}
        />
      </Sphere>

      {/* Floating Icon/Type Indicator */}
      <Box
        position={[position[0] + 0.5, position[1] + 0.5, position[2]]}
        scale={0.3}
      >
        <meshStandardMaterial color="#ffffff" />
      </Box>

      {/* Floating Text Label */}
      <Text
        ref={textRef}
        position={[position[0], position[1] + 0.8, position[2]]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {type.charAt(0).toUpperCase() + type.slice(1)} AI
      </Text>

      {/* Particle Ring */}
      {hovered && (
        <group position={position}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Sphere
              key={i}
              position={[
                Math.cos((i / 8) * Math.PI * 2) * 2,
                0,
                Math.sin((i / 8) * Math.PI * 2) * 2
              ]}
              scale={0.1}
            >
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
            </Sphere>
          ))}
        </group>
      )}
    </group>
  );
};

export default FloatingAI;