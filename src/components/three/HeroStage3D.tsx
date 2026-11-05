"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line, PresentationControls, Sparkles, ContactShadows } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const INK = "#1b1340", SAND = "#eef1e8", RED = "#e0262f", BLUE = "#1f4fe0", SUN = "#ffc93c", HENNA = "#d0662a", PINK = "#ff2e88";

/** Smoothly grows the active model in and shrinks the others out. */
function Morph({ active, children, spin = 0 }: { active: boolean; children: React.ReactNode; spin?: number }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!g.current) return;
    const target = active ? 1 : 0.0001;
    const s = THREE.MathUtils.damp(g.current.scale.x, target, 7, dt);
    g.current.scale.setScalar(s);
    g.current.rotation.y = THREE.MathUtils.damp(g.current.rotation.y, active ? spin : spin - 1.6, 5, dt);
    g.current.visible = s > 0.01;
  });
  return <group ref={g} scale={0.0001}>{children}</group>;
}

function HennaPlate() {
  const lines = useMemo(() => {
    const out: THREE.Vector3[][] = [];
    const rings = [
      { n: 8, r1: 0.12, r2: 0.48, w: 0.34 },
      { n: 12, r1: 0.56, r2: 0.95, w: 0.2 },
      { n: 16, r1: 1.02, r2: 1.38, w: 0.13 },
    ];
    for (const [k, g] of rings.entries()) {
      for (let i = 0; i < g.n; i++) {
        const a = (i / g.n) * Math.PI * 2 + (k % 2 ? Math.PI / g.n : 0);
        const m = (g.r1 + g.r2) / 2;
        const p = (r: number, ang: number) => new THREE.Vector3(r * Math.cos(ang), r * Math.sin(ang), 0.07);
        const c1 = new THREE.QuadraticBezierCurve3(p(g.r1, a), p(m, a - g.w), p(g.r2, a));
        const c2 = new THREE.QuadraticBezierCurve3(p(g.r2, a), p(m, a + g.w), p(g.r1, a));
        out.push([...c1.getPoints(14), ...c2.getPoints(14)]);
      }
    }
    for (const r of [0.52, 0.99, 1.44]) {
      out.push(Array.from({ length: 65 }, (_, i) => new THREE.Vector3(r * Math.cos((i / 64) * Math.PI * 2), r * Math.sin((i / 64) * Math.PI * 2), 0.07)));
    }
    return out;
  }, []);
  const dots = useMemo(() => Array.from({ length: 24 }, (_, i) => [1.55 * Math.cos((i / 24) * Math.PI * 2), 1.55 * Math.sin((i / 24) * Math.PI * 2)] as const), []);
  return (
    <group rotation={[-0.35, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[1.75, 1.75, 0.12, 64]} />
        <meshStandardMaterial color={SAND} roughness={0.6} />
      </mesh>
      <group rotation={[Math.PI / 2, 0, 0]} position={[0, 0.0, 0]}>
        {lines.map((pts, i) => <Line key={i} points={pts} color={HENNA} lineWidth={2.2} />)}
        {dots.map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0.08]}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshStandardMaterial color={i % 2 ? RED : BLUE} />
          </mesh>
        ))}
        <mesh position={[0, 0, 0.08]}><sphereGeometry args={[0.09, 16, 16]} /><meshStandardMaterial color={RED} /></mesh>
      </group>
      <mesh position={[0, -0.07, 0]}>
        <torusGeometry args={[1.75, 0.06, 12, 80]} />
        <meshStandardMaterial color={RED} />
      </mesh>
    </group>
  );
}

function Dhol() {
  const body = useRef<THREE.Group>(null);
  const stick = useRef<THREE.Group>(null);
  const lathe = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 20; i++) {
      const y = -1.1 + (i / 20) * 2.2;
      pts.push(new THREE.Vector2(0.86 + 0.14 * Math.cos((y / 1.1) * (Math.PI / 2)), y));
    }
    return new THREE.LatheGeometry(pts, 48);
  }, []);
  const ropes = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const n = 14;
    for (let k = 0; k <= n * 2; k++) {
      const a = (k / (n * 2)) * Math.PI * 2;
      const y = k % 2 ? 1.02 : -1.02;
      const r = 0.92;
      pts.push(new THREE.Vector3(r * Math.cos(a), y, r * Math.sin(a)));
    }
    return pts;
  }, []);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const beat = Math.pow(Math.max(0, Math.sin(t * Math.PI * 2)), 8);
    if (body.current) body.current.scale.set(1 + beat * 0.04, 1 - beat * 0.03, 1 + beat * 0.04);
    if (stick.current) stick.current.rotation.z = -0.6 + beat * 0.5;
  });
  return (
    <group rotation={[0.2, 0, Math.PI / 2]}>
      <group ref={body}>
        <mesh geometry={lathe}><meshStandardMaterial color={RED} roughness={0.45} side={THREE.DoubleSide} /></mesh>
        <Line points={ropes} color={SAND} lineWidth={3} />
        {[-1.1, 1.1].map((y) => (
          <group key={y} position={[0, y, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[0.88, 48]} /><meshStandardMaterial color={SAND} side={THREE.DoubleSide} /></mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.9, 0.07, 12, 60]} /><meshStandardMaterial color={INK} /></mesh>
          </group>
        ))}
        {[-0.7, 0.7].map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.99, 0.05, 10, 60]} /><meshStandardMaterial color={BLUE} /></mesh>
        ))}
      </group>
      <group ref={stick} position={[0.2, 1.35, 0.4]}>
        <mesh position={[0.9, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.05, 0.07, 1.8, 10]} /><meshStandardMaterial color="#c98a4b" /></mesh>
      </group>
    </group>
  );
}

function Flame({ position }: { position: [number, number, number] }) {
  const m = useRef<THREE.Mesh>(null);
  const seed = useMemo(() => Math.random() * 10, []);
  useFrame(({ clock }) => {
    if (!m.current) return;
    const t = clock.getElapsedTime() * 12 + seed;
    m.current.scale.set(1 + Math.sin(t) * 0.12, 1 + Math.sin(t * 1.3) * 0.2, 1);
  });
  return (
    <group position={position}>
      <mesh ref={m} position={[0, 0.12, 0]}>
        <coneGeometry args={[0.07, 0.24, 12]} />
        <meshStandardMaterial color={SUN} emissive={SUN} emissiveIntensity={2.2} />
      </mesh>
      <pointLight color={SUN} intensity={0.6} distance={2} />
    </group>
  );
}

function Cake() {
  const drips = (r: number, y: number, n: number) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      const len = 0.12 + ((i * 37) % 7) / 40;
      return (
        <mesh key={i} position={[r * Math.cos(a), y - len / 2, r * Math.sin(a)]}>
          <capsuleGeometry args={[0.06, len, 4, 8]} />
          <meshStandardMaterial color={SAND} />
        </mesh>
      );
    });
  return (
    <group position={[0, -0.6, 0]}>
      <mesh position={[0, -0.05, 0]}><cylinderGeometry args={[1.7, 1.7, 0.1, 64]} /><meshStandardMaterial color={SAND} /></mesh>
      <mesh position={[0, 0.4, 0]}><cylinderGeometry args={[1.3, 1.3, 0.8, 64]} /><meshStandardMaterial color={BLUE} roughness={0.5} /></mesh>
      <mesh position={[0, 0.8, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.25, 0.09, 12, 64]} /><meshStandardMaterial color={SAND} /></mesh>
      {drips(1.3, 0.78, 18)}
      <mesh position={[0, 1.1, 0]}><cylinderGeometry args={[0.85, 0.85, 0.6, 64]} /><meshStandardMaterial color={RED} roughness={0.5} /></mesh>
      <mesh position={[0, 1.4, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.8, 0.08, 12, 64]} /><meshStandardMaterial color={SAND} /></mesh>
      {drips(0.85, 1.38, 12)}
      {[[-0.35, 0], [0, -0.2], [0.35, 0.05]].map(([x, z], i) => (
        <group key={i} position={[x, 1.62, z]}>
          <mesh><cylinderGeometry args={[0.05, 0.05, 0.42, 10]} /><meshStandardMaterial color={i === 1 ? PINK : SAND} /></mesh>
          <Flame position={[0, 0.22, 0]} />
        </group>
      ))}
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return <mesh key={i} position={[1.31 * Math.cos(a), 0.3 + (i % 3) * 0.12, 1.31 * Math.sin(a)]}><sphereGeometry args={[0.05, 8, 8]} /><meshStandardMaterial color={i % 2 ? PINK : SUN} /></mesh>;
      })}
    </group>
  );
}

export default function HeroStage3D({ active }: { active: number }) {
  return (
    <Canvas camera={{ position: [0, 0.6, 6], fov: 40 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 5, 4]} intensity={1.6} />
      <pointLight position={[-4, -2, 3]} intensity={18} color={RED} />
      <pointLight position={[4, -1, 2]} intensity={14} color={BLUE} />
      <PresentationControls global={false} cursor snap rotation={[0, 0, 0]} polar={[-0.4, 0.4]} azimuth={[-0.9, 0.9]}>
        <Float speed={2} rotationIntensity={0.25} floatIntensity={0.6}>
          <Morph active={active === 0} spin={0}><HennaPlate /></Morph>
          <Morph active={active === 1} spin={0.5}><Dhol /></Morph>
          <Morph active={active === 2} spin={-0.3}><Cake /></Morph>
        </Float>
      </PresentationControls>
      <Sparkles count={60} scale={[6, 4, 3]} size={3} speed={0.4} color={SAND} />
      <ContactShadows position={[0, -1.9, 0]} opacity={0.35} scale={8} blur={2.5} far={4} color={INK} />
    </Canvas>
  );
}
