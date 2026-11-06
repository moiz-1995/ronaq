"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, PresentationControls } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

const RED = "#e0262f", BLUE = "#1f4fe0", SAND = "#efdfbd", SUN = "#ffc93c", PINK = "#ff2e88";

function Box({ open }: { open: boolean }) {
  const lid = useRef<THREE.Group>(null);
  const bits = useRef<THREE.InstancedMesh>(null);
  const seeds = useMemo(() => Array.from({ length: 40 }, () => ({ v: new THREE.Vector3((Math.random() - 0.5) * 2, 2 + Math.random() * 2, (Math.random() - 0.5) * 2), r: Math.random() * 6 })), []);
  const t0 = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame((state, dt) => {
    if (lid.current) {
      lid.current.position.y = THREE.MathUtils.damp(lid.current.position.y, open ? 1.6 : 0.55, 6, dt);
      lid.current.rotation.z = THREE.MathUtils.damp(lid.current.rotation.z, open ? 0.5 : 0, 6, dt);
    }
    if (!bits.current) return;
    if (open && t0.current === 0) t0.current = state.clock.getElapsedTime();
    if (!open) t0.current = 0;
    const t = open ? state.clock.getElapsedTime() - t0.current : 0;
    seeds.forEach((sd, i) => {
      const p = open ? new THREE.Vector3(sd.v.x * t, 0.5 + sd.v.y * t - 2.5 * t * t, sd.v.z * t) : new THREE.Vector3(0, -10, 0);
      dummy.position.copy(p);
      dummy.rotation.set(sd.r + t * 4, sd.r * 2 + t * 3, 0);
      dummy.scale.setScalar(open && t < 2.2 ? 1 : 0.0001);
      dummy.updateMatrix();
      bits.current!.setMatrixAt(i, dummy.matrix);
    });
    bits.current.instanceMatrix.needsUpdate = true;
  });
  const colors = useMemo(() => {
    const arr = new Float32Array(40 * 3);
    const c = new THREE.Color();
    for (let i = 0; i < 40; i++) { c.set([RED, BLUE, SUN, PINK, SAND][i % 5]); c.toArray(arr, i * 3); }
    return arr;
  }, []);
  return (
    <group position={[0, -0.4, 0]}>
      <mesh><boxGeometry args={[1.6, 1, 1.6]} /><meshStandardMaterial color={BLUE} /></mesh>
      <mesh><boxGeometry args={[0.3, 1.02, 1.62]} /><meshStandardMaterial color={SAND} /></mesh>
      <group ref={lid} position={[0, 0.55, 0]}>
        <mesh><boxGeometry args={[1.75, 0.3, 1.75]} /><meshStandardMaterial color={RED} /></mesh>
        <mesh><boxGeometry args={[0.3, 0.32, 1.77]} /><meshStandardMaterial color={SAND} /></mesh>
        <mesh position={[-0.25, 0.3, 0]} rotation={[0, 0, 0.6]}><torusGeometry args={[0.22, 0.07, 10, 30]} /><meshStandardMaterial color={SAND} /></mesh>
        <mesh position={[0.25, 0.3, 0]} rotation={[0, 0, -0.6]}><torusGeometry args={[0.22, 0.07, 10, 30]} /><meshStandardMaterial color={SAND} /></mesh>
      </group>
      <instancedMesh ref={bits} args={[undefined, undefined, 40]}>
        <boxGeometry args={[0.1, 0.1, 0.02]}>
          <instancedBufferAttribute attach="attributes-color" args={[colors, 3]} />
        </boxGeometry>
        <meshStandardMaterial vertexColors />
      </instancedMesh>
    </group>
  );
}

/** A spinnable gift box that pops open on tap. Used on empty states. */
export default function Gift3D() {
  const [open, setOpen] = useState(false);
  return (
    <Canvas camera={{ position: [2.6, 2, 4], fov: 40 }} dpr={[1, 2]} gl={{ alpha: true }} onPointerDown={() => setOpen((o) => !o)}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 5, 3]} intensity={1.6} />
      <PresentationControls global={false} snap polar={[-0.3, 0.3]} azimuth={[-1, 1]}>
        <Float speed={2} floatIntensity={0.4} rotationIntensity={0.3}>
          <Box open={open} />
        </Float>
      </PresentationControls>
    </Canvas>
  );
}
