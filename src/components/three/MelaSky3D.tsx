"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const COLS = ["#e0262f", "#1f4fe0", "#ffc93c", "#ff2e88", "#00a99d", "#efdfbd"];
const PETALS = ["#ffc93c", "#ff8a00", "#ff2e88", "#ffb347"];
// where the pointer is, -1..1. Read by the camera each frame; never triggers a React render.
const aim = { x: 0, y: 0 };

/** A soft round glow, drawn once and shared by every bulb. */
function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.25, "rgba(255,255,255,.45)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function Rig() {
  useFrame(({ camera }) => {
    camera.position.x += (aim.x * 0.9 - camera.position.x) * 0.04;
    camera.position.y += (aim.y * 0.5 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/** Soft out-of-focus lights far behind everything, slowly twinkling. */
function Bokeh({ count }: { count: number }) {
  const { geo, mat } = useMemo(() => {
    const pos = new Float32Array(count * 3), col = new Float32Array(count * 3), size = new Float32Array(count), phase = new Float32Array(count);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      pos.set([(Math.random() - 0.5) * 26, (Math.random() - 0.5) * 13, -3 - Math.random() * 9], i * 3);
      c.set(COLS[i % COLS.length]);
      col.set([c.r, c.g, c.b], i * 3);
      size[i] = 0.5 + Math.random() * 1.6;
      phase[i] = Math.random() * 6.28;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
      uniforms: { uTime: { value: 0 }, uPx: { value: 1 } },
      vertexShader: `attribute float aSize; attribute float aPhase; uniform float uTime; uniform float uPx; varying vec3 vC; varying float vT;
        void main() { vC = color; vT = 0.55 + 0.45 * sin(uTime * 1.3 + aPhase); vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = aSize * uPx * (34.0 / -mv.z); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `varying vec3 vC; varying float vT;
        void main() { float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(vC, a * a * vT * 0.34); }`,
    });
    return { geo, mat };
  }, [count]);
  useFrame(({ clock, gl }) => { mat.uniforms.uTime.value = clock.elapsedTime; mat.uniforms.uPx.value = gl.getPixelRatio(); });
  useEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);
  return <points geometry={geo} material={mat} />;
}

/** Strings of fairy lights draped across the top, like a shaadi tent. */
function Strings({ rows, high = false }: { rows: number; high?: boolean }) {
  const group = useRef<THREE.Group>(null);
  const bulbsRef = useRef<THREE.InstancedMesh>(null);
  const halo = useRef<THREE.InstancedMesh>(null);
  const { bulbs, lines } = useMemo(() => {
    const bulbs: { x: number; y: number; z: number; c: string; p: number }[] = [];
    const lines: THREE.Line[] = [];
    for (let r = 0; r < rows; r++) {
      const y0 = (high ? 5 : 3.7) - r * 0.8, z = -2.5 - r * 1.7, sag = (high ? 0.85 : 1.1) + r * 0.25, w = 15 + r * 2.5, n = 22;
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= n; i++) {
        const u = i / n, x = (u - 0.5) * w, y = y0 - sag * (1 - Math.pow(2 * u - 1, 2));
        pts.push(new THREE.Vector3(x, y, z));
        if (i > 0 && i < n) bulbs.push({ x, y: y - 0.14, z, c: COLS[(i + r) % COLS.length], p: Math.random() * 6.28 });
      }
      lines.push(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: "#efdfbd", transparent: true, opacity: 0.35 })));
    }
    return { bulbs, lines };
  }, [rows, high]);
  const d = useMemo(() => new THREE.Object3D(), []);
  const glow = useMemo(glowTexture, []);
  useEffect(() => () => glow.dispose(), [glow]);
  useEffect(() => {
    const c = new THREE.Color();
    bulbs.forEach((b, i) => {
      d.position.set(b.x, b.y, b.z); d.scale.setScalar(1); d.rotation.set(0, 0, 0); d.updateMatrix();
      bulbsRef.current!.setMatrixAt(i, d.matrix);
      c.set(b.c);
      bulbsRef.current!.setColorAt(i, c);
      halo.current!.setColorAt(i, c);
    });
    bulbsRef.current!.instanceMatrix.needsUpdate = true;
    bulbsRef.current!.instanceColor!.needsUpdate = true;
    halo.current!.instanceColor!.needsUpdate = true;
    return () => lines.forEach((l) => { l.geometry.dispose(); (l.material as THREE.Material).dispose(); });
  }, [bulbs, lines, d]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (group.current) { group.current.rotation.z = Math.sin(t * 0.5) * 0.012; group.current.position.y = Math.sin(t * 0.7) * 0.05; }
    if (!halo.current) return;
    bulbs.forEach((b, i) => {
      d.position.set(b.x, b.y, b.z - 0.02); d.rotation.set(0, 0, 0); d.scale.setScalar(1 + 0.3 * Math.sin(t * 2.2 + b.p)); d.updateMatrix();
      halo.current!.setMatrixAt(i, d.matrix);
    });
    halo.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <group ref={group}>
      {lines.map((l, i) => <primitive key={i} object={l} />)}
      <instancedMesh ref={bulbsRef} args={[undefined, undefined, bulbs.length]}>
        <sphereGeometry args={[0.055, 10, 10]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={halo} args={[undefined, undefined, bulbs.length]}>
        <planeGeometry args={[0.62, 0.62]} />
        <meshBasicMaterial map={glow} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

/** A few fanoos lanterns drifting up through the scene. */
function Lanterns({ count }: { count: number }) {
  const body = useRef<THREE.InstancedMesh>(null);
  const cap = useRef<THREE.InstancedMesh>(null);
  const L = useMemo(() => Array.from({ length: count }, (_, i) => ({
    x: (Math.random() - 0.5) * 17, y: (Math.random() - 0.5) * 9, z: -3 - Math.random() * 5,
    s: 0.22 + Math.random() * 0.26, v: 0.12 + Math.random() * 0.22, p: Math.random() * 6.28, c: COLS[i % COLS.length],
  })), [count]);
  const d = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => {
    const c = new THREE.Color();
    L.forEach((l, i) => { c.set(l.c); body.current!.setColorAt(i, c); });
    body.current!.instanceColor!.needsUpdate = true;
  }, [L]);
  useFrame(({ clock }, dt) => {
    if (!body.current || !cap.current) return;
    const t = clock.elapsedTime, step = Math.min(dt, 0.05);
    L.forEach((l, i) => {
      l.y += l.v * step;
      if (l.y > 5.5) { l.y = -5.5; l.x = (Math.random() - 0.5) * 17; }
      const x = l.x + Math.sin(t * 0.6 + l.p) * 0.4;
      d.position.set(x, l.y, l.z); d.rotation.set(0, t * 0.4 + l.p, Math.sin(t * 1.4 + l.p) * 0.15); d.scale.set(l.s, l.s * 1.35, l.s); d.updateMatrix();
      body.current!.setMatrixAt(i, d.matrix);
      d.position.set(x, l.y + l.s * 0.78, l.z); d.scale.set(l.s * 0.75, l.s * 0.25, l.s * 0.75); d.updateMatrix();
      cap.current!.setMatrixAt(i, d.matrix);
    });
    body.current.instanceMatrix.needsUpdate = true;
    cap.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <>
      <instancedMesh ref={body} args={[undefined, undefined, count]}>
        <octahedronGeometry args={[0.55, 0]} />
        <meshBasicMaterial toneMapped={false} transparent opacity={0.92} />
      </instancedMesh>
      <instancedMesh ref={cap} args={[undefined, undefined, count]}>
        <cylinderGeometry args={[0.45, 0.6, 1, 8]} />
        <meshBasicMaterial color="#ffc93c" toneMapped={false} />
      </instancedMesh>
    </>
  );
}

/** Marigold petals tumbling down in front. */
function Petals({ count }: { count: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const P = useMemo(() => Array.from({ length: count }, (_, i) => ({
    x: (Math.random() - 0.5) * 18, y: (Math.random() - 0.5) * 11, z: -4 + Math.random() * 6,
    v: 0.35 + Math.random() * 0.5, p: Math.random() * 6.28, r: 0.6 + Math.random() * 1.6, c: PETALS[i % PETALS.length],
  })), [count]);
  const d = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => {
    const c = new THREE.Color();
    P.forEach((p, i) => { c.set(p.c); mesh.current!.setColorAt(i, c); });
    mesh.current!.instanceColor!.needsUpdate = true;
  }, [P]);
  useFrame(({ clock }, dt) => {
    if (!mesh.current) return;
    const t = clock.elapsedTime, step = Math.min(dt, 0.05);
    P.forEach((p, i) => {
      p.y -= p.v * step;
      if (p.y < -6) { p.y = 6; p.x = (Math.random() - 0.5) * 18; }
      d.position.set(p.x + Math.sin(t * 0.8 + p.p) * 0.6, p.y, p.z);
      d.rotation.set(t * p.r + p.p, t * p.r * 0.7, p.p);
      d.scale.setScalar(1);
      d.updateMatrix();
      mesh.current!.setMatrixAt(i, d.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <planeGeometry args={[0.15, 0.21]} />
      <meshBasicMaterial side={THREE.DoubleSide} transparent opacity={0.85} toneMapped={false} />
    </instancedMesh>
  );
}

/** The mela at night. Purely decorative, pauses when scrolled out of view, lighter on phones. */
export default function MelaSky3D({ lite = false }: { lite?: boolean }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(true);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting));
    if (wrap.current) io.observe(wrap.current);
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      aim.x = (e.clientX / innerWidth) * 2 - 1;
      aim.y = -((e.clientY / innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => { io.disconnect(); window.removeEventListener("pointermove", move); };
  }, []);
  return (
    <div ref={wrap} className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
      <Canvas frameloop={on ? "always" : "never"} camera={{ position: [0, 0, 7], fov: 50 }} dpr={[1, lite ? 1.25 : 1.6]} gl={{ alpha: true, antialias: !lite, powerPreference: "low-power" }} style={{ pointerEvents: "none" }} events={undefined} onCreated={() => setReady(true)}>
        <Rig />
        <Bokeh count={lite ? 40 : 130} />
        <Strings rows={lite ? 1 : 3} high={lite} />
        <Lanterns count={lite ? 4 : 8} />
        <Petals count={lite ? 22 : 50} />
      </Canvas>
    </div>
  );
}
