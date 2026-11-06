"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const COLS = ["#e0262f", "#1f4fe0", "#ffc93c", "#ff2e88", "#00a99d", "#efdfbd"];

/** Floating fanoos lanterns that drift upward, sway, glow, and lean toward the pointer. */
function Field({ count }: { count: number }) {
  const body = useRef<THREE.InstancedMesh>(null);
  const cap = useRef<THREE.InstancedMesh>(null);
  const glow = useRef<THREE.InstancedMesh>(null);
  const L = useMemo(() => Array.from({ length: count }, (_, i) => ({
    x: (Math.random() - 0.5) * 16, y: (Math.random() - 0.5) * 8, z: -2 - Math.random() * 6,
    s: 0.35 + Math.random() * 0.45, v: 0.15 + Math.random() * 0.3, p: Math.random() * 6.28, c: COLS[i % COLS.length],
  })), [count]);
  const d = useMemo(() => new THREE.Object3D(), []);
  const painted = useRef(false);
  useFrame(({ clock, pointer }, dt) => {
    const t = clock.getElapsedTime();
    if (!body.current || !cap.current || !glow.current) return;
    if (!painted.current) {
      const c = new THREE.Color();
      L.forEach((l, i) => { c.set(l.c); body.current!.setColorAt(i, c); glow.current!.setColorAt(i, c); });
      body.current.instanceColor!.needsUpdate = true; glow.current.instanceColor!.needsUpdate = true;
      painted.current = true;
    }
    L.forEach((l, i) => {
      l.y += l.v * dt;
      if (l.y > 5) { l.y = -5; l.x = (Math.random() - 0.5) * 16; }
      const x = l.x + Math.sin(t * 0.6 + l.p) * 0.4 + pointer.x * (1.2 + l.z * -0.1);
      const y = l.y + pointer.y * 0.5;
      const sway = Math.sin(t * 1.4 + l.p) * 0.15;
      d.position.set(x, y, l.z); d.rotation.set(0, t * 0.4 + l.p, sway); d.scale.set(l.s, l.s * 1.35, l.s); d.updateMatrix();
      body.current!.setMatrixAt(i, d.matrix);
      d.position.set(x, y + l.s * 0.78, l.z); d.scale.set(l.s * 0.75, l.s * 0.25, l.s * 0.75); d.updateMatrix();
      cap.current!.setMatrixAt(i, d.matrix);
      const pulse = 1.6 + Math.sin(t * 3 + l.p) * 0.25;
      d.position.set(x, y, l.z - 0.01); d.rotation.set(0, 0, 0); d.scale.setScalar(l.s * pulse); d.updateMatrix();
      glow.current!.setMatrixAt(i, d.matrix);
    });
    body.current.instanceMatrix.needsUpdate = true; cap.current.instanceMatrix.needsUpdate = true; glow.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <>
      <instancedMesh ref={body} args={[undefined, undefined, count]}>
        <octahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial emissive="#ffb347" emissiveIntensity={0.35} flatShading roughness={0.4} />
      </instancedMesh>
      <instancedMesh ref={cap} args={[undefined, undefined, count]}>
        <cylinderGeometry args={[0.45, 0.6, 1, 8]} />
        <meshStandardMaterial color="#ffc93c" metalness={0.5} roughness={0.3} />
      </instancedMesh>
      <instancedMesh ref={glow} args={[undefined, undefined, count]}>
        <circleGeometry args={[0.5, 24]} />
        <meshBasicMaterial transparent opacity={0.12} depthWrite={false} blending={THREE.AdditiveBlending} />
      </instancedMesh>
    </>
  );
}

export default function Lanterns3D({ count = 26 }: { count?: number }) {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 1.75]} gl={{ alpha: true, antialias: true }} style={{ pointerEvents: "none" }} eventSource={typeof document !== "undefined" ? document.body : undefined}>
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 2, 4]} intensity={20} color="#ffc93c" />
      <Field count={count} />
    </Canvas>
  );
}
