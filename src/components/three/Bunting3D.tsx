"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";

const COLORS = ["#e0262f", "#eef1e8", "#1f4fe0", "#ff2e88", "#eef1e8", "#00a99d"];

function Flags({ n }: { n: number }) {
  const refs = useRef<(THREE.Group | null)[]>([]);
  const tri = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([-0.32, 0, 0, 0.32, 0, 0, 0, -0.62, 0], 3));
    g.computeVertexNormals();
    return g;
  }, []);
  const span = n * 0.78;
  const sag = (x: number) => -0.35 * (1 - Math.pow((2 * x) / span, 2));
  const rope = useMemo(() => Array.from({ length: 41 }, (_, i) => { const x = -span / 2 + (i / 40) * span; return new THREE.Vector3(x, sag(x) + 0.02, 0); }), [span]); // eslint-disable-line react-hooks/exhaustive-deps
  useFrame(({ clock, pointer }) => {
    const t = clock.getElapsedTime();
    refs.current.forEach((g, i) => {
      if (!g) return;
      g.rotation.x = Math.sin(t * 2.2 + i * 0.7) * 0.35 + pointer.y * 0.2;
      g.rotation.y = Math.sin(t * 1.3 + i) * 0.25 + pointer.x * 0.4;
    });
  });
  return (
    <group>
      <Line points={rope} color="#1b1340" lineWidth={2} />
      {Array.from({ length: n }).map((_, i) => {
        const x = -span / 2 + 0.39 + i * 0.78;
        return (
          <group key={i} position={[x, sag(x), 0]} ref={(el) => { refs.current[i] = el; }}>
            <mesh geometry={tri}>
              <meshStandardMaterial color={COLORS[i % COLORS.length]} side={THREE.DoubleSide} roughness={0.7} />
            </mesh>
            <mesh geometry={tri} position={[0, -0.04, 0.001]} scale={0.6}>
              <meshBasicMaterial color={i % 2 ? "#1b1340" : "#ffc93c"} side={THREE.DoubleSide} wireframe />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/** Waving 3D jhandiyan (bunting) strung across a header band. */
export default function Bunting3D({ count = 14 }: { count?: number }) {
  return (
    <Canvas orthographic camera={{ zoom: 80, position: [0, 0, 10] }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={1.4} />
      <directionalLight position={[2, 3, 5]} intensity={1.2} />
      <group position={[0, 0.9, 0]}>
        <Flags n={count} />
      </group>
    </Canvas>
  );
}
