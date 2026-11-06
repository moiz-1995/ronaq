// Large standalone celebration pieces for the home hero: a mehndi hand, a dhol and a birthday cake.
// Drawn for a dark background, with thick outlines and truck-art colours.

const INK = "#1b1340", RED = "#d7141e", YEL = "#ffcc00", ORA = "#ff8a00", GRN = "#12924a", TEAL = "#00a19a", BLUE = "#1f4fe0", PINK = "#e5197f", CRM = "#fff3d6", HENNA = "#9c3d10", SKIN = "#f6d2a8";
const f = (n: number) => Math.round(n * 100) / 100;

/** One hand (left, palm facing). Mirror it for the right hand. Henna in bridal style: tips, lattice bands, keri (paisley), vines, lace cuff. */
function Hand() {
  const fingers = [
    { x: 8, y: 54, w: 17, h: 62 },
    { x: 27, y: 30, w: 19, h: 82 },
    { x: 48, y: 20, w: 20, h: 90 },
    { x: 70, y: 32, w: 19, h: 78 },
  ];
  const sil = (
    <>
      {fingers.map((g, i) => <rect key={i} x={g.x} y={g.y} width={g.w} height={g.h} rx={g.w / 2} />)}
      <rect x="6" y="92" width="86" height="84" rx="30" />
      <rect x="84" y="106" width="19" height="58" rx="9.5" transform="rotate(30 94 156)" />
      <rect x="20" y="158" width="60" height="60" rx="10" />
    </>
  );
  return (
    <g>
      <g fill={INK} stroke={INK} strokeWidth={8} strokeLinejoin="round">{sil}</g>
      <g fill={SKIN}>{sil}</g>
      {/* fingertips + lattice bands + little vines */}
      {fingers.map((g, i) => {
        const cx = g.x + g.w / 2, r = g.w / 2;
        const zig = Array.from({ length: 6 }, (_, k) => `${f(g.x + 2 + (k * (g.w - 4)) / 5)},${k % 2 ? g.y + 30 : g.y + 22}`).join(" ");
        return (
          <g key={i}>
            <path d={`M${g.x} ${g.y + r} A${r} ${r} 0 0 1 ${g.x + g.w} ${g.y + r} V${g.y + r + 6} H${g.x} Z`} fill={HENNA} />
            <g fill="none" stroke={HENNA} strokeWidth={1.8} strokeLinecap="round">
              <path d={`M${g.x + 1} ${g.y + 20} H${g.x + g.w - 1} M${g.x + 1} ${g.y + 32} H${g.x + g.w - 1}`} />
              <polyline points={zig} />
              <path d={`M${cx} ${g.y + 38} q-5 5 0 10 q5 5 0 10`} />
            </g>
            <circle cx={cx} cy={g.y + 62} r={2} fill={HENNA} />
          </g>
        );
      })}
      {/* palm: keri (paisley) with petals, dots and a trailing vine */}
      <g fill="none" stroke={HENNA} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M52 104 C30 108 24 140 44 152 C58 160 74 148 70 132 C67 120 60 112 52 104 Z" />
        <path d="M51 116 C38 120 36 138 47 144 C55 148 63 141 61 132 C59 125 56 120 51 116 Z" />
        <path d="M70 132 q14 -2 18 -14 M70 132 q12 8 6 22" />
        {[0, 1, 2, 3, 4, 5].map((k) => <path key={k} d={`M${f(44 + 18 * Math.cos(-2.2 + k * 0.62))} ${f(132 + 22 * Math.sin(-2.2 + k * 0.62))} l${f(-6 * Math.cos(-2.2 + k * 0.62))} ${f(-6 * Math.sin(-2.2 + k * 0.62))}`} />)}
        <path d="M34 156 q10 6 20 0 q10 6 20 0" />
      </g>
      <circle cx="49" cy="133" r="4" fill={HENNA} />
      {[[18, 116], [16, 132], [86, 112], [28, 100], [80, 152]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2.2} fill={HENNA} />)}
      {/* thumb */}
      <g transform="rotate(30 94 156)">
        <path d="M84 115.5 A9.5 9.5 0 0 1 103 115.5 V121 H84 Z" fill={HENNA} />
        <path d="M85 128 H102 M85 136 H102" stroke={HENNA} strokeWidth={1.8} />
      </g>
      {/* lace cuff at the wrist */}
      <path d="M22 168 q6 -7 12 0 q6 -7 12 0 q6 -7 12 0 q6 -7 12 0 q5 -6 9 0" fill="none" stroke={HENNA} strokeWidth={2.2} />
      {[28, 40, 52, 64, 74].map((x) => <circle key={x} cx={x} cy={174} r={1.8} fill={HENNA} />)}
      {/* churiyan (bangles) */}
      {[RED, YEL, GRN, RED, YEL].map((c, i) => <rect key={i} x="17" y={182 + i * 7} width="66" height="7" rx="3.5" fill={c} stroke={INK} strokeWidth={2} />)}
      {[30, 46, 62].map((x) => <circle key={x} cx={x} cy={192} r={1.6} fill="#fff" />)}
    </g>
  );
}

export function MehndiHand() {
  return (
    <svg viewBox="0 0 240 230" className="h-full w-full" role="img" aria-label="Two hands decorated with bridal mehndi and bangles">
      <g transform="translate(20 4) rotate(-10 54 120)"><Hand /></g>
      <g transform="translate(220 4) scale(-1 1) rotate(-10 54 120)"><Hand /></g>
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
