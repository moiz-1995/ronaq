// Truck-art craft illustrations. Used as a vendor's default cover (showing their craft)
// and for demo portfolio images ("art:<kind>:<seed>"). Pure SVG — no network, no images.
import type { CraftArt as Kind } from "@/db/catalog";

const INK = "#1b1340", SAND = "#eef1e8", RED = "#e0262f", BLUE = "#1f4fe0", SUN = "#ffc93c", PINK = "#ff2e88", TEAL = "#00a99d", HENNA = "#d0662a";
const BGS = [SAND, BLUE, RED, "#fde6e7", "#e4ebff", INK, TEAL, PINK];

function rng(seed: number) {
  let x = (seed * 9301 + 49297) % 233280;
  return () => ((x = (x * 9301 + 49297) % 233280) / 233280);
}
const f = (n: number) => Math.round(n * 100) / 100;
const pt = (r: number, a: number) => `${(100 + r * Math.cos(a)).toFixed(1)} ${(100 + r * Math.sin(a)).toFixed(1)}`;

function Mandala({ col, dot, scale = 1, seed = 0 }: { col: string; dot: string; scale?: number; seed?: number }) {
  const r = rng(seed + 3);
  const rings: { n: number; r1: number; r2: number; w: number; off: number }[] = [];
  let base = 12;
  for (let k = 0; k < 3; k++) {
    const n = [8, 10, 12, 16][Math.floor(r() * 4)];
    const len = 22 + r() * 14;
    rings.push({ n, r1: base, r2: base + len, w: 0.32 - k * 0.07, off: k % 2 ? Math.PI / n : 0 });
    base += len + 8;
  }
  const paths: string[] = [];
  for (const g of rings) {
    for (let i = 0; i < g.n; i++) {
      const a = (i / g.n) * Math.PI * 2 + g.off, m = (g.r1 + g.r2) / 2;
      paths.push(`M${pt(g.r1 * scale, a)} Q${pt(m * scale, a - g.w)} ${pt(g.r2 * scale, a)} Q${pt(m * scale, a + g.w)} ${pt(g.r1 * scale, a)}`);
    }
  }
  return (
    <g fill="none" stroke={col} strokeWidth={1.8} strokeLinecap="round">
      {paths.map((d, i) => <path key={i} d={d} />)}
      {rings.map((g, i) => <circle key={i} cx={100} cy={100} r={(g.r2 + 4) * scale} />)}
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i / 24) * Math.PI * 2, R = (base + 2) * scale;
        return <circle key={"d" + i} cx={f(100 + R * Math.cos(a))} cy={f(100 + R * Math.sin(a))} r={2.2} fill={dot} stroke="none" />;
      })}
      <circle cx={100} cy={100} r={5 * scale} fill={dot} stroke="none" />
    </g>
  );
}

function Henna({ seed }: { seed: number }) {
  return (
    <g>
      <Mandala col={HENNA} dot={RED} seed={seed} scale={0.95} />
    </g>
  );
}

function Daig() {
  return (
    <g>
      <g className="craft-steam" fill="none" stroke={SAND} strokeWidth={4} strokeLinecap="round" opacity={0.9}>
        <path d="M78 62 q-8 -10 0 -20 q8 -10 0 -20" /><path d="M100 58 q-8 -10 0 -20 q8 -10 0 -20" /><path d="M122 62 q-8 -10 0 -20 q8 -10 0 -20" />
      </g>
      <path d="M60 186 q8 -30 20 -14 q4 -22 20 -26 q16 4 20 26 q12 -16 20 14 z" fill={RED} />
      <path d="M78 186 q6 -18 14 -8 q4 -14 8 -16 q6 4 8 16 q8 -10 14 8 z" fill={SUN} />
      <rect x="34" y="176" width="34" height="14" rx="2" fill="#7a3b13" stroke={INK} strokeWidth={2} />
      <rect x="132" y="176" width="34" height="14" rx="2" fill="#7a3b13" stroke={INK} strokeWidth={2} />
      <path d="M28 92 Q24 168 100 170 Q176 168 172 92 Z" fill="#c9cdc6" stroke={INK} strokeWidth={3} />
      <path d="M40 112 Q100 128 160 112" stroke="#9aa09a" strokeWidth={3} fill="none" />
      <ellipse cx="100" cy="90" rx="76" ry="15" fill="#9aa09a" stroke={INK} strokeWidth={3} />
      <ellipse cx="100" cy="90" rx="66" ry="10" fill="#f3e2b3" />
      <g fill={RED}><circle cx="78" cy="88" r="2.5" /><circle cx="104" cy="93" r="2.5" /><circle cx="124" cy="87" r="2.5" /></g>
      <g fill={HENNA}><circle cx="70" cy="92" r="2" /><circle cx="114" cy="89" r="2" /><circle cx="134" cy="92" r="2" /></g>
      <path d="M150 40 L118 92" stroke={INK} strokeWidth={5} strokeLinecap="round" />
      <ellipse cx="116" cy="94" rx="10" ry="5" fill="#9aa09a" stroke={INK} strokeWidth={2} />
    </g>
  );
}

function Cake() {
  return (
    <g>
      <ellipse cx="100" cy="172" rx="74" ry="11" fill={SAND} stroke={INK} strokeWidth={2} />
      <rect x="38" y="116" width="124" height="52" rx="9" fill={BLUE} stroke={INK} strokeWidth={3} />
      <path d="M38 126 q10 14 20 0 q10 14 21 0 q10 14 20 0 q10 14 21 0 q10 14 21 0 q10 14 21 0 V118 H38 Z" fill={SAND} />
      <rect x="60" y="76" width="80" height="42" rx="8" fill={RED} stroke={INK} strokeWidth={3} />
      <path d="M60 85 q10 12 20 0 q10 12 20 0 q10 12 20 0 q10 12 20 0 V78 H60 Z" fill={SAND} />
      <g fill={PINK}><circle cx="54" cy="148" r="3" /><circle cx="82" cy="156" r="3" /><circle cx="118" cy="150" r="3" /><circle cx="146" cy="157" r="3" /><circle cx="88" cy="104" r="2.6" /><circle cx="114" cy="108" r="2.6" /></g>
      <g fill={SAND} stroke={INK} strokeWidth={2}><rect x="77" y="50" width="8" height="26" rx="2" /><rect x="96" y="44" width="8" height="32" rx="2" /><rect x="115" y="50" width="8" height="26" rx="2" /></g>
      <g fill={SUN}><path d="M81 48 q-6 -8 0 -16 q6 8 0 16z" /><path d="M100 42 q-6 -8 0 -16 q6 8 0 16z" /><path d="M119 48 q-6 -8 0 -16 q6 8 0 16z" /></g>
    </g>
  );
}

function Camera() {
  return (
    <g>
      <rect x="36" y="64" width="128" height="88" rx="14" fill={INK} />
      <rect x="62" y="50" width="40" height="18" rx="5" fill={INK} />
      <rect x="132" y="74" width="20" height="10" rx="3" fill={SAND} />
      <circle cx="100" cy="108" r="34" fill={SAND} stroke={INK} strokeWidth={4} />
      <circle cx="100" cy="108" r="24" fill={BLUE} />
      <circle cx="100" cy="108" r="12" fill={INK} />
      <circle cx="93" cy="101" r="5" fill={SAND} opacity={0.85} />
      <path d="M44 64 v-6 h14 v6" fill={RED} />
    </g>
  );
}

function Decor() {
  return (
    <g>
      <path d="M40 170 V90 Q100 20 160 90 V170" fill="none" stroke={INK} strokeWidth={6} />
      <path d="M52 170 V94 Q100 38 148 94 V170" fill="none" stroke={RED} strokeWidth={4} />
      {Array.from({ length: 13 }).map((_, i) => {
        const t = i / 12, a = Math.PI * (1 - t);
        const x = 100 + 60 * Math.cos(a), y = 90 - 55 * Math.sin(a) + (t < 0.05 || t > 0.95 ? 0 : 0);
        return <circle key={i} cx={f(x)} cy={f(y)} r={i % 2 ? 7 : 9} fill={i % 3 === 0 ? SUN : i % 3 === 1 ? RED : PINK} stroke={INK} strokeWidth={1.5} />;
      })}
      {[60, 80, 100, 120, 140].map((x, i) => (
        <g key={x}>
          <line x1={x} y1={f(70 + Math.abs(100 - x) / 3)} x2={x} y2={120 + (i % 2) * 10} stroke={SUN} strokeWidth={1.5} strokeDasharray="2 4" />
          <circle cx={x} cy={124 + (i % 2) * 10} r={4} fill={SUN} />
        </g>
      ))}
      <rect x="62" y="150" width="76" height="20" rx="6" fill={BLUE} stroke={INK} strokeWidth={3} />
      <rect x="70" y="140" width="60" height="14" rx="6" fill={SAND} stroke={INK} strokeWidth={2} />
    </g>
  );
}

function Makeup() {
  return (
    <g>
      <rect x="44" y="60" width="44" height="100" rx="10" fill={RED} stroke={INK} strokeWidth={3} />
      <rect x="54" y="38" width="24" height="26" rx="4" fill={PINK} stroke={INK} strokeWidth={3} />
      <path d="M54 38 L66 22 L78 38 Z" fill={RED} stroke={INK} strokeWidth={3} />
      <circle cx="132" cy="122" r="36" fill={SAND} stroke={INK} strokeWidth={3} />
      <circle cx="132" cy="122" r="24" fill={PINK} opacity={0.7} />
      <path d="M150 40 l20 50 -12 4 -20 -50z" fill={BLUE} stroke={INK} strokeWidth={3} />
      <path d="M138 36 q6 -14 14 -2 l-2 8z" fill={SUN} stroke={INK} strokeWidth={2} />
      {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={56 + (i % 3) * 10} cy={90 + Math.floor(i / 3) * 20} r={3} fill={SAND} />)}
    </g>
  );
}

function Gift() {
  return (
    <g>
      <rect x="44" y="92" width="112" height="76" rx="6" fill={BLUE} stroke={INK} strokeWidth={3} />
      <rect x="36" y="72" width="128" height="26" rx="6" fill={RED} stroke={INK} strokeWidth={3} />
      <rect x="92" y="72" width="16" height="96" fill={SAND} stroke={INK} strokeWidth={2} />
      <path d="M100 72 C80 40 54 52 70 70 Z" fill={SAND} stroke={INK} strokeWidth={3} />
      <path d="M100 72 C120 40 146 52 130 70 Z" fill={SAND} stroke={INK} strokeWidth={3} />
      {[[60, 120], [136, 140], [70, 150], [128, 110]].map(([x, y], i) => <path key={i} d={`M${x} ${y - 6} l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2z`} fill={SUN} />)}
    </g>
  );
}

function Stitch() {
  return (
    <g>
      <path d="M70 40 L100 54 L130 40 L160 60 L148 92 L134 86 L134 170 L66 170 L66 86 L52 92 L40 60 Z" fill={RED} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <path d="M100 54 V170" stroke={SUN} strokeWidth={2} strokeDasharray="5 5" />
      <path d="M84 48 Q100 66 116 48" fill="none" stroke={SAND} strokeWidth={3} />
      {[70, 90, 110, 130, 150].map((y) => <circle key={y} cx="100" cy={y} r="3" fill={SAND} />)}
      <path d="M66 150 H134" stroke={SAND} strokeWidth={3} />
      <g transform="translate(140 120) rotate(20)"><line x1="0" y1="0" x2="0" y2="56" stroke={INK} strokeWidth={3} /><ellipse cx="0" cy="-4" rx="3" ry="6" fill="none" stroke={INK} strokeWidth={2} /></g>
    </g>
  );
}

function Dhol() {
  return (
    <g>
      <path d="M78 22 L112 72" stroke="#c98a4b" strokeWidth={6} strokeLinecap="round" />
      <path d="M132 18 Q156 40 146 74" stroke="#c98a4b" strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M44 68 Q100 54 156 68 L156 146 Q100 160 44 146 Z" fill={RED} stroke={INK} strokeWidth={3} />
      <polyline points="52,70 63,145 74,68 85,147 96,66 107,148 118,66 129,147 140,68 151,145" fill="none" stroke={SAND} strokeWidth={3} strokeLinejoin="round" />
      <rect x="56" y="66" width="8" height="84" fill={BLUE} />
      <rect x="136" y="66" width="8" height="84" fill={BLUE} />
      <ellipse cx="44" cy="107" rx="15" ry="40" fill={SAND} stroke={INK} strokeWidth={3} />
      <ellipse cx="156" cy="107" rx="15" ry="40" fill={SAND} stroke={INK} strokeWidth={3} />
      <ellipse cx="156" cy="107" rx="7" ry="20" fill="none" stroke={HENNA} strokeWidth={2} />
    </g>
  );
}

function Rental() {
  return (
    <g>
      <path d="M30 90 L100 40 L170 90 Z" fill={RED} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <path d="M30 90 q12 12 23 0 q12 12 23 0 q12 12 24 0 q12 12 23 0 q12 12 24 0 q12 12 23 0" fill={SAND} stroke={INK} strokeWidth={2} />
      <line x1="40" y1="94" x2="40" y2="172" stroke={INK} strokeWidth={4} /><line x1="160" y1="94" x2="160" y2="172" stroke={INK} strokeWidth={4} />
      {[70, 100, 130].map((x, i) => (
        <g key={x}>
          <rect x={x - 11} y={128} width={22} height={20} rx={3} fill={i === 1 ? BLUE : SAND} stroke={INK} strokeWidth={2} />
          <rect x={x - 11} y={112} width={22} height={18} rx={3} fill={i === 1 ? BLUE : SAND} stroke={INK} strokeWidth={2} />
          <line x1={x - 9} y1={148} x2={x - 9} y2={170} stroke={INK} strokeWidth={3} /><line x1={x + 9} y1={148} x2={x + 9} y2={170} stroke={INK} strokeWidth={3} />
        </g>
      ))}
      <line x1="40" y1="100" x2="160" y2="100" stroke={SUN} strokeWidth={1.5} strokeDasharray="2 5" />
      {[55, 75, 95, 115, 135, 150].map((x) => <circle key={x} cx={x} cy={101} r={3} fill={SUN} />)}
    </g>
  );
}

const DRAW: Record<Kind, (p: { seed: number }) => React.ReactElement> = {
  henna: Henna, daig: Daig, cake: Cake, camera: Camera, decor: Decor, makeup: Makeup, gift: Gift, stitch: Stitch, dhol: Dhol, rental: Rental,
};

export function CraftArt({ kind, seed = 0, className, label }: { kind: Kind | string; seed?: number; className?: string; label?: string }) {
  const k = (kind in DRAW ? kind : "henna") as Kind;
  const r = rng(seed);
  const bg = k === "henna" ? [SAND, "#fde6e7", "#e4ebff"][seed % 3] : BGS[Math.floor(r() * BGS.length)];
  const Draw = DRAW[k];
  const dotCol = bg === INK || bg === BLUE || bg === RED || bg === TEAL || bg === PINK ? "rgba(238,241,232,.18)" : "rgba(27,19,64,.08)";
  const rot = (r() - 0.5) * 16;
  const scale = 0.86 + r() * 0.18;
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={label ?? `${k} illustration`} preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="200" fill={bg} />
      <pattern id={`dots-${k}-${seed}`} width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.6" fill={dotCol} /></pattern>
      <rect width="200" height="200" fill={`url(#dots-${k}-${seed})`} />
      <g transform={`rotate(${rot.toFixed(1)} 100 100) translate(${100 - 100 * scale} ${100 - 100 * scale}) scale(${scale.toFixed(3)})`}>
        <Draw seed={seed} />
      </g>
    </svg>
  );
}

/** Render either an uploaded image URL or an "art:<kind>:<seed>" placeholder. */
export function Picture({ src, alt, className, fallbackKind = "henna", seed = 0 }: { src?: string | null; alt: string; className?: string; fallbackKind?: string; seed?: number }) {
  if (!src) return <CraftArt kind={fallbackKind} seed={seed} className={className} label={alt} />;
  if (src.startsWith("art:")) {
    const [, kind, s] = src.split(":");
    return <CraftArt kind={kind} seed={Number(s) || 0} className={className} label={alt} />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} loading="lazy" decoding="async" style={{ objectFit: "cover" }} />;
}
