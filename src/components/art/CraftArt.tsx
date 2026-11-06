// Truck-art craft illustrations: deep jewel backgrounds, a yellow sunburst, a zigzag "chamak patti" border with
// corner phool (flowers), and a scalloped yellow medallion holding the craft — drawn with thick outlines.
// Used as each vendor's default cover and for demo portfolio images ("art:<kind>:<seed>"). Pure SVG, no network.
import type { CraftArt as Kind } from "@/db/catalog";

const INK = "#1b1340", RED = "#d7141e", YEL = "#ffcc00", ORA = "#ff8a00", GRN = "#12924a", TEAL = "#00a19a", BLUE = "#1f4fe0", PINK = "#e5197f", PURP = "#6a1b9a", CRM = "#fff3d6", HENNA = "#a3410f", SILV = "#c9cdd6";
const BASES = ["#0e7a43", "#b5124f", "#1d3fae", "#c8102e", "#006d6a", "#5b1a8c", "#e86a00"];
const ZIG = [RED, YEL, GRN, BLUE, PINK, YEL];

const f = (n: number) => Math.round(n * 100) / 100;
const P = (cx: number, cy: number, r: number, a: number) => `${f(cx + r * Math.cos(a))} ${f(cy + r * Math.sin(a))}`;

function Flower({ x, y, r, petal, center }: { x: number; y: number; r: number; petal: string; center: string }) {
  return (
    <g>
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return <ellipse key={i} cx={f(x + r * 0.62 * Math.cos(a))} cy={f(y + r * 0.62 * Math.sin(a))} rx={f(r * 0.45)} ry={f(r * 0.3)} transform={`rotate(${f((a * 180) / Math.PI)} ${f(x + r * 0.62 * Math.cos(a))} ${f(y + r * 0.62 * Math.sin(a))})`} fill={petal} stroke={INK} strokeWidth={1.4} />;
      })}
      <circle cx={x} cy={y} r={f(r * 0.32)} fill={center} stroke={INK} strokeWidth={1.4} />
    </g>
  );
}

/** Frame + sunburst + medallion; children are drawn into a 200×200 box centred in the medallion. */
function TruckFrame({ W, H, seed, medal, children }: { W: number; H: number; seed: number; medal: string; children: React.ReactNode }) {
  const base = BASES[seed % BASES.length];
  const cx = W / 2, cy = H / 2;
  const R = Math.hypot(W, H);
  const rays = 28, rot = (seed % 7) * 0.13;
  const m = Math.min(W, H) * 0.36; // medallion radius
  const sc = (m * 1.78) / 200;
  // zigzag border triangles
  const band = Math.min(W, H) * 0.075, inset = Math.min(W, H) * 0.035;
  const tris: React.ReactElement[] = [];
  const edge = (x1: number, y1: number, x2: number, y2: number, nx: number, ny: number, key: string) => {
    const len = Math.hypot(x2 - x1, y2 - y1), n = Math.max(4, Math.round(len / (band * 1.25)));
    for (let i = 0; i < n; i++) {
      const t0 = i / n, t1 = (i + 1) / n, tm = (i + 0.5) / n;
      const ax = x1 + (x2 - x1) * t0, ay = y1 + (y2 - y1) * t0, bx = x1 + (x2 - x1) * t1, by = y1 + (y2 - y1) * t1;
      const px = x1 + (x2 - x1) * tm + nx * band, py = y1 + (y2 - y1) * tm + ny * band;
      tris.push(<path key={key + i} d={`M${f(ax)} ${f(ay)} L${f(bx)} ${f(by)} L${f(px)} ${f(py)} Z`} fill={ZIG[(i + seed) % ZIG.length]} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />);
    }
  };
  const a0 = inset, b0 = inset;
  edge(a0, b0, W - a0, b0, 0, 1, "t");
  edge(W - a0, H - b0, a0, H - b0, 0, -1, "b");
  edge(a0, H - b0, a0, b0, 1, 0, "l");
  edge(W - a0, b0, W - a0, H - b0, -1, 0, "r");
  const corner = band * 1.05;
  return (
    <>
      <rect width={W} height={H} fill={base} />
      {Array.from({ length: rays }).map((_, i) => {
        if (i % 2) return null;
        const a1 = (i / rays) * Math.PI * 2 + rot, a2 = ((i + 1) / rays) * Math.PI * 2 + rot;
        return <path key={i} d={`M${f(cx)} ${f(cy)} L${P(cx, cy, R, a1)} L${P(cx, cy, R, a2)} Z`} fill={YEL} opacity={0.22} />;
      })}
      {/* scattered phool */}
      {[[0.2, 0.3], [0.8, 0.28], [0.18, 0.74], [0.82, 0.72]].map(([px, py], i) => (
        <Flower key={i} x={f(W * px)} y={f(H * py)} r={f(Math.min(W, H) * 0.055)} petal={[PINK, YEL, TEAL, ORA][(i + seed) % 4]} center={[YEL, RED, YEL, PURP][(i + seed) % 4]} />
      ))}
      {/* scalloped medallion */}
      {Array.from({ length: 18 }).map((_, i) => {
        const a = (i / 18) * Math.PI * 2;
        return <circle key={i} cx={f(cx + (m + 4) * Math.cos(a))} cy={f(cy + (m + 4) * Math.sin(a))} r={f(m * 0.16)} fill={i % 2 ? RED : GRN} stroke={INK} strokeWidth={1.6} />;
      })}
      <circle cx={cx} cy={cy} r={f(m + 2)} fill={medal} stroke={INK} strokeWidth={4} />
      <circle cx={cx} cy={cy} r={f(m - 5)} fill="none" stroke={INK} strokeWidth={1.2} strokeDasharray="3 4" opacity={0.5} />
      <g transform={`translate(${f(cx - 100 * sc)} ${f(cy - 100 * sc)}) scale(${f(sc * 1000) / 1000})`}>{children}</g>
      {/* border */}
      <rect x={1.5} y={1.5} width={W - 3} height={H - 3} fill="none" stroke={INK} strokeWidth={3} />
      {tris}
      {[[corner, corner], [W - corner, corner], [corner, H - corner], [W - corner, H - corner]].map(([x, y], i) => (
        <Flower key={"c" + i} x={f(x)} y={f(y)} r={f(band * 1.15)} petal={[YEL, RED, BLUE, GRN][i]} center={[RED, YEL, YEL, YEL][i]} />
      ))}
    </>
  );
}

// ---------- motifs, drawn in a 200×200 box with thick outlines ----------
function Henna({ seed }: { seed: number }) {
  const rings = [
    { n: 8, r1: 10, r2: 42, w: 0.34 },
    { n: [10, 12, 16][seed % 3], r1: 46, r2: 78, w: 0.2 },
  ];
  return (
    <g>
      <g fill="none" stroke={HENNA} strokeWidth={3.2} strokeLinecap="round">
        {rings.flatMap((g, k) => Array.from({ length: g.n }).map((_, i) => {
          const a = (i / g.n) * Math.PI * 2 + (k ? Math.PI / g.n : 0), m = (g.r1 + g.r2) / 2;
          return <path key={`${k}-${i}`} d={`M${P(100, 100, g.r1, a)} Q${P(100, 100, m, a - g.w)} ${P(100, 100, g.r2, a)} Q${P(100, 100, m, a + g.w)} ${P(100, 100, g.r1, a)}`} />;
        }))}
        <circle cx={100} cy={100} r={44} /><circle cx={100} cy={100} r={84} />
      </g>
      {Array.from({ length: 16 }).map((_, i) => { const a = (i / 16) * Math.PI * 2; return <circle key={i} cx={f(100 + 91 * Math.cos(a))} cy={f(100 + 91 * Math.sin(a))} r={3.6} fill={i % 2 ? RED : HENNA} />; })}
      <circle cx={100} cy={100} r={7} fill={RED} stroke={INK} strokeWidth={2} />
    </g>
  );
}

function Daig() {
  return (
    <g strokeLinejoin="round">
      <g fill="none" stroke={CRM} strokeWidth={6} strokeLinecap="round" opacity={0.95}>
        <path d="M78 52 q-9 -11 0 -22 q9 -11 0 -22" /><path d="M100 46 q-9 -11 0 -22 q9 -11 0 -22" /><path d="M122 52 q-9 -11 0 -22 q9 -11 0 -22" />
      </g>
      <path d="M52 190 q8 -34 22 -16 q4 -26 26 -30 q22 4 26 30 q14 -18 22 16 z" fill={RED} stroke={INK} strokeWidth={3} />
      <path d="M74 190 q6 -20 16 -9 q4 -16 10 -18 q7 4 10 18 q10 -11 16 9 z" fill={YEL} />
      <rect x="26" y="178" width="38" height="16" rx="3" fill="#8a3b12" stroke={INK} strokeWidth={3} /><rect x="136" y="178" width="38" height="16" rx="3" fill="#8a3b12" stroke={INK} strokeWidth={3} />
      <path d="M22 90 Q18 172 100 174 Q182 172 178 90 Z" fill={SILV} stroke={INK} strokeWidth={4} />
      <path d="M40 104 Q42 150 70 162" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.7} />
      <path d="M30 122 Q100 142 170 122" fill="none" stroke={BLUE} strokeWidth={5} />
      {[50, 75, 100, 125, 150].map((x, i) => <circle key={x} cx={x} cy={133 + (i === 2 ? 5 : i % 2 ? 3 : 0)} r={4} fill={i % 2 ? RED : YEL} stroke={INK} strokeWidth={1.5} />)}
      <ellipse cx="100" cy="88" rx="80" ry="17" fill="#9aa1ad" stroke={INK} strokeWidth={4} />
      <ellipse cx="100" cy="88" rx="68" ry="11" fill="#ffd36b" />
      <g fill={RED}><circle cx="78" cy="86" r="3.2" /><circle cx="106" cy="91" r="3.2" /><circle cx="128" cy="85" r="3.2" /></g>
      <g fill="#fff"><circle cx="90" cy="84" r="2.6" /><circle cx="116" cy="88" r="2.6" /></g>
      <g fill={GRN}><circle cx="70" cy="90" r="2.6" /><circle cx="138" cy="90" r="2.6" /></g>
      <path d="M156 34 L120 90" stroke={INK} strokeWidth={7} strokeLinecap="round" /><path d="M156 34 L120 90" stroke="#c98a4b" strokeWidth={3.5} strokeLinecap="round" />
      <ellipse cx="117" cy="93" rx="12" ry="6" fill={SILV} stroke={INK} strokeWidth={3} />
    </g>
  );
}

function Cake() {
  return (
    <g strokeLinejoin="round">
      <ellipse cx="100" cy="178" rx="80" ry="12" fill={CRM} stroke={INK} strokeWidth={3} />
      <rect x="30" y="126" width="140" height="50" rx="10" fill={PINK} stroke={INK} strokeWidth={4} />
      <path d="M30 136 q12 16 23 0 q12 16 24 0 q12 16 23 0 q12 16 24 0 q12 16 23 0 q12 16 23 0 V128 H30 Z" fill={CRM} stroke={INK} strokeWidth={2} />
      {[48, 76, 104, 132, 158].map((x, i) => <circle key={x} cx={x} cy={160} r={5} fill={i % 2 ? YEL : TEAL} stroke={INK} strokeWidth={1.5} />)}
      <rect x="50" y="86" width="100" height="42" rx="9" fill={TEAL} stroke={INK} strokeWidth={4} />
      <path d="M50 95 q10 13 20 0 q10 13 20 0 q10 13 20 0 q10 13 20 0 q10 13 20 0 V88 H50 Z" fill={CRM} stroke={INK} strokeWidth={2} />
      <rect x="70" y="56" width="60" height="32" rx="8" fill={YEL} stroke={INK} strokeWidth={4} />
      {[[80, 72], [100, 74], [120, 72]].map(([x, y]) => <circle key={x} cx={x} cy={y} r={3.5} fill={RED} />)}
      <g stroke={INK} strokeWidth={2.5}>{[[82, RED], [100, BLUE], [118, GRN]].map(([x, c]) => <rect key={x as number} x={(x as number) - 4} y="30" width="8" height="28" rx="2" fill={c as string} />)}</g>
      {[82, 100, 118].map((x) => <path key={x} d={`M${x} 28 q-8 -10 0 -20 q8 10 0 20z`} fill={YEL} stroke={ORA} strokeWidth={2} />)}
    </g>
  );
}

function Camera() {
  return (
    <g strokeLinejoin="round">
      <path d="M100 22 l8 18 18 -10 -6 20 20 4 -18 10" fill="none" stroke={YEL} strokeWidth={5} strokeLinecap="round" />
      <rect x="22" y="62" width="156" height="104" rx="18" fill={INK} stroke={INK} strokeWidth={4} />
      <rect x="22" y="80" width="156" height="14" fill={RED} />
      <rect x="22" y="142" width="156" height="12" fill={YEL} />
      <rect x="54" y="44" width="50" height="22" rx="6" fill={RED} stroke={INK} strokeWidth={4} />
      <rect x="140" y="70" width="26" height="14" rx="4" fill={YEL} stroke={INK} strokeWidth={2.5} />
      <circle cx="100" cy="116" r="44" fill={CRM} stroke={INK} strokeWidth={5} />
      <circle cx="100" cy="116" r="33" fill={BLUE} stroke={INK} strokeWidth={3} />
      <circle cx="100" cy="116" r="20" fill={INK} />
      <circle cx="100" cy="116" r="10" fill={TEAL} />
      <circle cx="90" cy="106" r="6" fill="#fff" opacity={0.9} />
      <Flower x={40} y={150} r={9} petal={PINK} center={YEL} />
    </g>
  );
}

function Decor() {
  return (
    <g strokeLinejoin="round">
      <path d="M30 182 V96 Q100 4 170 96 V182" fill={PURP} stroke={INK} strokeWidth={5} />
      <path d="M46 182 V100 Q100 30 154 100 V182" fill={CRM} stroke={INK} strokeWidth={3} />
      {Array.from({ length: 15 }).map((_, i) => {
        const t = i / 14, a = Math.PI * (1 - t);
        return <circle key={i} cx={f(100 + 62 * Math.cos(a))} cy={f(100 - 62 * Math.sin(a))} r={i % 2 ? 8 : 10} fill={i % 3 === 0 ? YEL : i % 3 === 1 ? ORA : RED} stroke={INK} strokeWidth={2} />;
      })}
      {[64, 82, 100, 118, 136].map((x, i) => (
        <g key={x}>
          <line x1={x} y1={f(52 + Math.abs(100 - x) / 2)} x2={x} y2={124 + (i % 2) * 12} stroke={ORA} strokeWidth={3} />
          {Array.from({ length: 4 }).map((_, k) => <circle key={k} cx={x} cy={f(64 + Math.abs(100 - x) / 2 + k * 15)} r={4.5} fill={k % 2 ? YEL : ORA} stroke={INK} strokeWidth={1.2} />)}
        </g>
      ))}
      <rect x="56" y="150" width="88" height="26" rx="7" fill={RED} stroke={INK} strokeWidth={4} />
      <rect x="66" y="138" width="68" height="16" rx="7" fill={YEL} stroke={INK} strokeWidth={3} />
    </g>
  );
}

function Makeup() {
  return (
    <g strokeLinejoin="round">
      <rect x="36" y="76" width="50" height="104" rx="10" fill={RED} stroke={INK} strokeWidth={4} />
      <rect x="36" y="100" width="50" height="12" fill={YEL} />
      <rect x="47" y="50" width="28" height="30" rx="4" fill={YEL} stroke={INK} strokeWidth={4} />
      <path d="M47 50 L61 24 L75 50 Z" fill={PINK} stroke={INK} strokeWidth={4} />
      <circle cx="134" cy="132" r="42" fill={TEAL} stroke={INK} strokeWidth={4} />
      <circle cx="134" cy="132" r="30" fill={PINK} stroke={INK} strokeWidth={3} />
      <circle cx="122" cy="120" r="8" fill="#fff" opacity={0.6} />
      <path d="M148 26 l24 60 -15 6 -24 -60z" fill={BLUE} stroke={INK} strokeWidth={4} />
      <path d="M133 26 q8 -18 18 -2 l-2 10z" fill={YEL} stroke={INK} strokeWidth={3} />
      <Flower x={61} y={146} r={11} petal={YEL} center={CRM} />
    </g>
  );
}

function Gift() {
  return (
    <g strokeLinejoin="round">
      <rect x="34" y="92" width="132" height="86" rx="8" fill={RED} stroke={INK} strokeWidth={4} />
      {[[60, 120], [140, 120], [60, 158], [140, 158]].map(([x, y], i) => <Flower key={i} x={x} y={y} r={9} petal={i % 2 ? TEAL : YEL} center={PINK} />)}
      <rect x="26" y="70" width="148" height="28" rx="7" fill={BLUE} stroke={INK} strokeWidth={4} />
      <rect x="90" y="70" width="20" height="108" fill={YEL} stroke={INK} strokeWidth={3} />
      <path d="M100 70 C76 32 44 48 66 68 Z" fill={YEL} stroke={INK} strokeWidth={4} />
      <path d="M100 70 C124 32 156 48 134 68 Z" fill={YEL} stroke={INK} strokeWidth={4} />
      <circle cx="100" cy="68" r="8" fill={ORA} stroke={INK} strokeWidth={3} />
    </g>
  );
}

function Stitch() {
  return (
    <g strokeLinejoin="round">
      <path d="M64 32 L100 48 L136 32 L172 56 L156 96 L140 88 L140 182 L60 182 L60 88 L44 96 L28 56 Z" fill={GRN} stroke={INK} strokeWidth={4} />
      <path d="M80 42 Q100 66 120 42" fill="none" stroke={YEL} strokeWidth={5} />
      <path d="M100 52 V182" stroke={YEL} strokeWidth={3} strokeDasharray="6 5" />
      {[70, 92, 114, 136, 158].map((y) => <circle key={y} cx="100" cy={y} r="4" fill={YEL} stroke={INK} strokeWidth={1.4} />)}
      <path d="M60 160 H140" stroke={PINK} strokeWidth={6} />
      <path d="M60 170 H140" stroke={YEL} strokeWidth={4} />
      <Flower x={78} y={120} r={9} petal={PINK} center={YEL} /><Flower x={122} y={120} r={9} petal={PINK} center={YEL} />
      <g transform="translate(160 132) rotate(22)"><line x1="0" y1="0" x2="0" y2="54" stroke={INK} strokeWidth={4} /><ellipse cx="0" cy="-5" rx="4" ry="7" fill="none" stroke={INK} strokeWidth={3} /></g>
    </g>
  );
}

function Dhol() {
  return (
    <g strokeLinejoin="round">
      <path d="M74 20 L112 72" stroke={INK} strokeWidth={9} strokeLinecap="round" /><path d="M74 20 L112 72" stroke="#d9a05b" strokeWidth={5} strokeLinecap="round" />
      <path d="M134 14 Q160 40 148 76" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" /><path d="M134 14 Q160 40 148 76" stroke="#d9a05b" strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d="M40 68 Q100 52 160 68 L160 150 Q100 166 40 150 Z" fill={RED} stroke={INK} strokeWidth={4} />
      <polyline points="50,70 62,148 74,67 86,151 98,65 110,152 122,65 134,151 146,67 156,148" fill="none" stroke={YEL} strokeWidth={4.5} strokeLinejoin="round" />
      <rect x="54" y="64" width="9" height="90" fill={BLUE} stroke={INK} strokeWidth={1.5} /><rect x="137" y="64" width="9" height="90" fill={BLUE} stroke={INK} strokeWidth={1.5} />
      <ellipse cx="40" cy="109" rx="17" ry="43" fill={CRM} stroke={INK} strokeWidth={4} />
      <ellipse cx="160" cy="109" rx="17" ry="43" fill={CRM} stroke={INK} strokeWidth={4} />
      <ellipse cx="160" cy="109" rx="8" ry="22" fill="none" stroke={HENNA} strokeWidth={3} />
      <path d="M10 70 q-8 39 0 78" fill="none" stroke={YEL} strokeWidth={4} strokeLinecap="round" />
      <path d="M190 70 q8 39 0 78" fill="none" stroke={YEL} strokeWidth={4} strokeLinecap="round" />
    </g>
  );
}

function Rental() {
  return (
    <g strokeLinejoin="round">
      <path d="M20 92 L100 34 L180 92 Z" fill={RED} stroke={INK} strokeWidth={4} />
      <path d="M100 34 L60 92 M100 34 L140 92" stroke={YEL} strokeWidth={4} />
      <path d="M20 92 q13 14 27 0 q13 14 26 0 q13 14 27 0 q13 14 27 0 q13 14 26 0 q13 14 27 0" fill={YEL} stroke={INK} strokeWidth={3} />
      <line x1="30" y1="100" x2="30" y2="182" stroke={INK} strokeWidth={5} /><line x1="170" y1="100" x2="170" y2="182" stroke={INK} strokeWidth={5} />
      {[66, 100, 134].map((x, i) => (
        <g key={x}>
          <rect x={x - 13} y={136} width={26} height={22} rx={3} fill={[TEAL, PINK, BLUE][i]} stroke={INK} strokeWidth={3} />
          <rect x={x - 13} y={116} width={26} height={22} rx={3} fill={[TEAL, PINK, BLUE][i]} stroke={INK} strokeWidth={3} />
          <line x1={x - 10} y1={158} x2={x - 10} y2={180} stroke={INK} strokeWidth={4} /><line x1={x + 10} y1={158} x2={x + 10} y2={180} stroke={INK} strokeWidth={4} />
        </g>
      ))}
      {[46, 64, 82, 100, 118, 136, 154].map((x) => <circle key={x} cx={x} cy={104} r={4} fill={YEL} stroke={INK} strokeWidth={1.2} />)}
    </g>
  );
}

const DRAW: Record<Kind, (p: { seed: number }) => React.ReactElement> = {
  henna: Henna, daig: Daig, cake: Cake, camera: Camera, decor: Decor, makeup: Makeup, gift: Gift, stitch: Stitch, dhol: Dhol, rental: Rental,
};
const MEDAL: Partial<Record<Kind, string>> = { henna: CRM, camera: YEL, daig: YEL };

/** ratio = width / height of the box it will fill, so the ornate border is never cropped. */
export function CraftArt({ kind, seed = 0, className, label, ratio = 1 }: { kind: Kind | string; seed?: number; className?: string; label?: string; ratio?: number }) {
  const k = (kind in DRAW ? kind : "henna") as Kind;
  const H = 200, W = Math.round(200 * Math.min(4, Math.max(0.5, ratio)));
  const Draw = DRAW[k];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label={label ?? `${k} illustration`} preserveAspectRatio="xMidYMid slice">
      <TruckFrame W={W} H={H} seed={seed} medal={MEDAL[k] ?? (seed % 2 ? YEL : CRM)}>
        <Draw seed={seed} />
      </TruckFrame>
    </svg>
  );
}

/** Truck-art monogram badge for vendors without a logo. */
export function Monogram({ name, seed = 0, className, label }: { name: string; seed?: number; className?: string; label?: string }) {
  const initials = name.replace(/[^A-Za-z0-9 &]/g, " ").split(/\s+/).filter((w) => w && w !== "&").slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "R";
  const base = BASES[seed % BASES.length];
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={label ?? `${name} logo`}>
      <rect width="200" height="200" fill={base} />
      {Array.from({ length: 24 }).map((_, i) => (i % 2 ? null : <path key={i} d={`M100 100 L${P(100, 100, 150, (i / 24) * Math.PI * 2)} L${P(100, 100, 150, ((i + 1) / 24) * Math.PI * 2)} Z`} fill={YEL} opacity={0.25} />))}
      {Array.from({ length: 16 }).map((_, i) => { const a = (i / 16) * Math.PI * 2; return <circle key={i} cx={f(100 + 74 * Math.cos(a))} cy={f(100 + 74 * Math.sin(a))} r={13} fill={i % 2 ? RED : GRN} stroke={INK} strokeWidth={2} />; })}
      <circle cx="100" cy="100" r="68" fill={YEL} stroke={INK} strokeWidth={5} />
      <circle cx="100" cy="100" r="56" fill={CRM} stroke={INK} strokeWidth={2.5} />
      <circle cx="100" cy="100" r="50" fill="none" stroke={RED} strokeWidth={2} strokeDasharray="4 4" />
      <text x="100" y={initials.length > 1 ? 117 : 121} textAnchor="middle" fontFamily="var(--font-bungee), Impact, sans-serif" fontSize={initials.length > 1 ? 48 : 58} fill={INK}>{initials}</text>
      {[[100, 40], [100, 160]].map(([x, y], i) => <path key={i} d={`M${x} ${y - 7} l2.5 5 5.5 2 -5.5 2 -2.5 5 -2.5 -5 -5.5 -2 5.5 -2z`} fill={RED} stroke={INK} strokeWidth={1} />)}
    </svg>
  );
}

/** Render an uploaded image URL, an "art:<kind>:<seed>" placeholder, or the craft fallback. */
export function Picture({ src, alt, className, fallbackKind = "henna", seed = 0, ratio = 1 }: { src?: string | null; alt: string; className?: string; fallbackKind?: string; seed?: number; ratio?: number }) {
  if (!src) return <CraftArt kind={fallbackKind} seed={seed} className={className} label={alt} ratio={ratio} />;
  if (src.startsWith("art:")) {
    const [, kind, s] = src.split(":");
    return <CraftArt kind={kind} seed={Number(s) || 0} className={className} label={alt} ratio={ratio} />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} loading="lazy" decoding="async" style={{ objectFit: "cover" }} />;
}

/** Vendor logo: their upload, else a truck-art monogram. */
export function VendorLogo({ src, name, className, seed }: { src?: string | null; name: string; className?: string; seed?: number }) {
  seed ??= [...name].reduce((a, ch) => a + ch.charCodeAt(0), 0);
  if (src && !src.startsWith("art:")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={`${name} logo`} className={className} loading="lazy" decoding="async" style={{ objectFit: "cover" }} />;
  }
  return <Monogram name={name} seed={seed} className={className} />;
}
