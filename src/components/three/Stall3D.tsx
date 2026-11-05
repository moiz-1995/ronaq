"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float, PresentationControls, Sparkles } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

const INK = "#1b1340", SAND = "#eef1e8", RED = "#e0262f", BLUE = "#1f4fe0", SUN = "#ffc93c", PINK = "#ff2e88", TEAL = "#00a99d";

function Lantern({ x, color, phase }: { x: number; color: string; phase: number }) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => { if (g.current) g.current.rotation.z = Math.sin(clock.getElapsedTime() * 1.8 + phase) * 0.18; });
  return (
    <group ref={g} position={[x, 1.55, 0.95]}>
      <mesh position={[0, -0.2, 0]}><cylinderGeometry args={[0.008, 0.008, 0.4]} /><meshBasicMaterial color={INK} /></mesh>
      <mesh position={[0, -0.48, 0]}><sphereGeometry args={[0.13, 20, 20]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} /></mesh>
      <mesh position={[0, -0.33, 0]}><cylinderGeometry args={[0.06, 0.09, 0.06, 12]} /><meshStandardMaterial color={SUN} metalness={0.4} roughness={0.3} /></mesh>
    </group>
  );
}

/** A truck-art dukaan: striped awning, swinging lanterns, goods on the counter. Drag to spin. */
function Stall() {
  const stripes = 9;
  return (
    <group position={[0, -0.6, 0]}>
      {/* counter */}
      <mesh position={[0, 0.35, 0.3]}><boxGeometry args={[2.6, 0.7, 1]} /><meshStandardMaterial color={BLUE} /></mesh>
      <mesh position={[0, 0.72, 0.3]}><boxGeometry args={[2.75, 0.06, 1.1]} /><meshStandardMaterial color={SAND} /></mesh>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[-1.1 + i * 0.44, 0.35, 0.81]}><circleGeometry args={[0.13, 20]} /><meshStandardMaterial color={[RED, SUN, PINK, TEAL, SAND, RED][i]} /></mesh>
      ))}
      {/* back wall + posts */}
      <mesh position={[0, 1.15, -0.25]}><boxGeometry args={[2.6, 1.6, 0.08]} /><meshStandardMaterial color={RED} /></mesh>
      {[-1.25, 1.25].map((x) => <mesh key={x} position={[x, 1.1, 0.75]}><cylinderGeometry args={[0.05, 0.05, 2.2, 10]} /><meshStandardMaterial color={INK} /></mesh>)}
      {/* striped awning */}
      <group position={[0, 2.1, 0.45]} rotation={[0.45, 0, 0]}>
        {Array.from({ length: stripes }).map((_, i) => (
          <mesh key={i} position={[-1.35 + (i + 0.5) * (2.7 / stripes), 0, 0]}>
            <boxGeometry args={[2.7 / stripes, 0.04, 1.3]} />
            <meshStandardMaterial color={i % 3 === 0 ? RED : i % 3 === 1 ? SAND : BLUE} />
          </mesh>
        ))}
        {Array.from({ length: stripes * 2 }).map((_, i) => (
          <mesh key={"s" + i} position={[-1.35 + (i + 0.5) * (2.7 / (stripes * 2)), -0.02, 0.68]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.075, 0.16, 3]} />
            <meshStandardMaterial color={i % 2 ? SUN : RED} />
          </mesh>
        ))}
      </group>
      {/* goods on the counter */}
      <mesh position={[-0.8, 0.95, 0.3]}><cylinderGeometry args={[0.22, 0.18, 0.4, 24]} /><meshStandardMaterial color="#c9cdc6" metalness={0.5} roughness={0.35} /></mesh>
      <group position={[0.1, 0.75, 0.3]}>
        <mesh position={[0, 0.15, 0]}><cylinderGeometry args={[0.3, 0.3, 0.3, 32]} /><meshStandardMaterial color={PINK} /></mesh>
        <mesh position={[0, 0.38, 0]}><cylinderGeometry args={[0.2, 0.2, 0.18, 32]} /><meshStandardMaterial color={SAND} /></mesh>
      </group>
      <mesh position={[0.85, 0.95, 0.3]} rotation={[0, 0.5, 0]}><boxGeometry args={[0.38, 0.38, 0.38]} /><meshStandardMaterial color={TEAL} /></mesh>
      <mesh position={[0.85, 0.95, 0.3]} rotation={[0, 0.5, 0]}><boxGeometry args={[0.08, 0.39, 0.39]} /><meshStandardMaterial color={SAND} /></mesh>
      {[-0.9, -0.3, 0.3, 0.9].map((x, i) => <Lantern key={x} x={x} color={[SUN, PINK, SUN, TEAL][i]} phase={i} />)}
    </group>
  );
}

export default function Stall3D() {
  return (
    <Canvas camera={{ position: [2.4, 1.6, 5.2], fov: 38 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 6, 5]} intensity={1.5} />
      <pointLight position={[0, 1.2, 2]} intensity={6} color={SUN} />
      <PresentationControls global={false} cursor snap polar={[-0.2, 0.3]} azimuth={[-1.2, 1.2]}>
        <Float speed={1.5} floatIntensity={0.25} rotationIntensity={0.15}><Stall /></Float>
      </PresentationControls>
      <Sparkles count={40} scale={[5, 3, 3]} size={3} speed={0.3} color={SUN} />
      <ContactShadows position={[0, -0.62, 0]} opacity={0.4} scale={7} blur={2.4} color={INK} />
    </Canvas>
  );
}
