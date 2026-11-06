// Large standalone celebration pieces for the home hero: a mehndi hand, a dhol and a birthday cake.
// Drawn for a dark background, with thick outlines and truck-art colours.

const INK = "#1b1340", RED = "#d7141e", YEL = "#ffcc00", ORA = "#ff8a00", GRN = "#12924a", TEAL = "#00a19a", BLUE = "#1f4fe0", PINK = "#e5197f", CRM = "#fff3d6", HENNA = "#9c3d10", SKIN = "#f6d2a8";
const f = (n: number) => Math.round(n * 100) / 100;

export function MehndiHand() {
  // finger and palm silhouettes drawn twice: a thick ink pass, then the skin fill on top (outer outline only)
  const shapes = (
    <>
      <rect x="54" y="40" width="22" height="80" rx="11" />
      <rect x="80" y="22" width="22" height="92" rx="11" />
      <rect x="106" y="30" width="22" height="86" rx="11" />
      <rect x="131" y="52" width="19" height="70" rx="9.5" />
      <rect x="50" y="92" width="102" height="96" rx="34" />
      <rect x="22" y="112" width="22" height="66" rx="11" transform="rotate(-38 33 145)" />
    </>
  );
  return (
    <svg viewBox="0 0 200 210" className="h-full w-full" role="img" aria-label="Hand decorated with bridal mehndi">
      <g fill={INK} stroke={INK} strokeWidth={9} strokeLinejoin="round">{shapes}</g>
      <g fill={SKIN}>{shapes}</g>
      {/* fingertips */}
      {[[65, 52], [91, 34], [117, 42], [140.5, 62]].map(([x, y], i) => <path key={i} d={`M${x - 9} ${y + 2} q${9} -16 18 0 v8 h-18z`} fill={HENNA} />)}
      {/* finger patterns: rings of dots and vines */}
      <g fill="none" stroke={HENNA} strokeWidth={2.4} strokeLinecap="round">
        {[65, 91, 117].map((x, i) => (
          <g key={x}>
            <path d={`M${x - 8} ${78 - i * 4} h16`} /><path d={`M${x - 8} ${84 - i * 4} h16`} />
            <path d={`M${x} ${64 - i * 6} q-6 6 0 12 q6 6 0 12`} />
          </g>
        ))}
        <path d="M140 80 q-5 5 0 10 q5 5 0 10" />
      </g>
      {[65, 91, 117, 140].map((x, i) => <circle key={x} cx={x} cy={f(98 - (i === 3 ? -6 : i * 4))} r={2.6} fill={HENNA} />)}
      {/* palm mandala */}
      <g transform="translate(101 140)">
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2, r1 = 9, r2 = 30, m = 19;
          const p = (r: number, ang: number) => `${f(r * Math.cos(ang))} ${f(r * Math.sin(ang))}`;
          return <path key={i} d={`M${p(r1, a)} Q${p(m, a - 0.32)} ${p(r2, a)} Q${p(m, a + 0.32)} ${p(r1, a)}`} fill="none" stroke={HENNA} strokeWidth={2.4} />;
        })}
        <circle r="34" fill="none" stroke={HENNA} strokeWidth={2.4} />
        <circle r="7" fill={HENNA} />
        {Array.from({ length: 14 }).map((_, i) => { const a = (i / 14) * Math.PI * 2; return <circle key={i} cx={f(39 * Math.cos(a))} cy={f(39 * Math.sin(a))} r={2.2} fill={HENNA} />; })}
      </g>
      {/* wrist lace */}
      <path d="M58 186 q10 -10 20 0 q10 -10 20 0 q10 -10 20 0 q10 -10 22 0" fill="none" stroke={HENNA} strokeWidth={2.6} />
      {/* bangles */}
      <rect x="52" y="190" width="98" height="9" rx="4" fill={RED} stroke={INK} strokeWidth={2.5} />
      <rect x="52" y="198" width="98" height="8" rx="4" fill={YEL} stroke={INK} strokeWidth={2.5} />
    </svg>
  );
}

export function DholArt() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label="Dhol drum with sticks">
      <g strokeLinejoin="round">
        <path d="M70 18 L110 70" stroke={INK} strokeWidth={10} strokeLinecap="round" /><path d="M70 18 L110 70" stroke="#d9a05b" strokeWidth={5.5} strokeLinecap="round" />
        <path d="M136 10 Q164 38 150 76" stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" /><path d="M136 10 Q164 38 150 76" stroke="#d9a05b" strokeWidth={3.5} fill="none" strokeLinecap="round" />
        <path d="M38 68 Q100 50 162 68 L162 154 Q100 172 38 154 Z" fill={RED} stroke={INK} strokeWidth={5} />
        <path d="M38 80 Q100 64 162 80" fill="none" stroke={ORA} strokeWidth={4} opacity={0.7} />
        <polyline points="49,70 61,152 73,67 85,155 97,65 109,156 121,65 133,155 145,67 156,152" fill="none" stroke={YEL} strokeWidth={5} strokeLinejoin="round" />
        <rect x="52" y="64" width="10" height="94" fill={BLUE} stroke={INK} strokeWidth={2} /><rect x="138" y="64" width="10" height="94" fill={BLUE} stroke={INK} strokeWidth={2} />
        {[[57, 75], [57, 110], [57, 145], [143, 75], [143, 110], [143, 145]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3} fill={YEL} />)}
        <ellipse cx="38" cy="111" rx="18" ry="45" fill={CRM} stroke={INK} strokeWidth={5} />
        <ellipse cx="162" cy="111" rx="18" ry="45" fill={CRM} stroke={INK} strokeWidth={5} />
        <ellipse cx="162" cy="111" rx="8" ry="23" fill="none" stroke={HENNA} strokeWidth={3} />
        <path d="M100 150 Q100 190 60 196" stroke={GRN} strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d="M100 150 Q102 188 142 194" stroke={PINK} strokeWidth={5} fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function CakeArt() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label="Three-tier birthday cake with candles">
      <g strokeLinejoin="round">
        <ellipse cx="100" cy="184" rx="86" ry="12" fill={CRM} stroke={INK} strokeWidth={4} />
        <rect x="26" y="128" width="148" height="54" rx="11" fill={PINK} stroke={INK} strokeWidth={5} />
        <path d="M26 139 q12 17 24 0 q12 17 25 0 q12 17 24 0 q12 17 25 0 q12 17 25 0 q12 17 25 0 V130 H26 Z" fill={CRM} stroke={INK} strokeWidth={2.5} />
        {[46, 74, 102, 130, 156].map((x, i) => <circle key={x} cx={x} cy={163} r={5.5} fill={i % 2 ? YEL : TEAL} stroke={INK} strokeWidth={2} />)}
        <rect x="46" y="86" width="108" height="44" rx="10" fill={TEAL} stroke={INK} strokeWidth={5} />
        <path d="M46 95 q11 14 22 0 q11 14 21 0 q11 14 22 0 q11 14 21 0 q11 14 22 0 V88 H46 Z" fill={CRM} stroke={INK} strokeWidth={2.5} />
        <rect x="68" y="54" width="64" height="34" rx="9" fill={YEL} stroke={INK} strokeWidth={5} />
        {[78, 100, 122].map((x) => <circle key={x} cx={x} cy={72} r={4} fill={RED} />)}
        <g stroke={INK} strokeWidth={3}>{([[80, RED], [100, BLUE], [120, GRN]] as const).map(([x, c]) => <rect key={x} x={x - 4.5} y="26" width="9" height="30" rx="2" fill={c} />)}</g>
        {[80, 100, 120].map((x) => <path key={x} className="hero-flame" d={`M${x} 24 q-9 -11 0 -22 q9 11 0 22z`} fill={YEL} stroke={ORA} strokeWidth={2.5} style={{ transformOrigin: `${x}px 24px` }} />)}
      </g>
    </svg>
  );
}
