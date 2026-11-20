// Original vector artwork for each garment type, tinted with the product colour.
// Swap for real photography by adding an `image` field to the catalog.
type Props = { art: string; color: string; label?: string; className?: string };

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, v + amt));
  return `#${((c(n >> 16) << 16) | (c((n >> 8) & 255) << 8) | c(n & 255)).toString(16).padStart(6, "0")}`;
}

const SHAPES: Record<string, (fill: string, dark: string, light: string) => React.ReactNode> = {
  coat: (f, d, l) => (
    <>
      <path d="M120 60 L160 50 L200 60 L240 80 L262 230 L238 236 L230 140 L228 330 L92 330 L90 140 L82 236 L58 230 L80 80 Z" fill={f} />
      <path d="M160 50 L140 120 L160 330 L180 120 Z" fill={d} opacity=".35" />
      <path d="M140 58 L160 110 L180 58" fill="none" stroke={l} strokeWidth="4" />
      <circle cx="170" cy="170" r="5" fill={l} /><circle cx="170" cy="210" r="5" fill={l} /><circle cx="170" cy="250" r="5" fill={l} />
      <rect x="92" y="200" width="136" height="10" fill={d} opacity=".4" />
    </>
  ),
  blazer: (f, d, l) => (
    <>
      <path d="M118 62 L160 54 L202 62 L240 82 L258 236 L236 240 L226 140 L224 290 L96 290 L94 140 L84 240 L62 236 L80 82 Z" fill={f} />
      <path d="M140 60 L160 150 L180 60 L196 66 L172 170 L160 290 L148 170 L124 66 Z" fill={d} opacity=".45" />
      <path d="M150 64 L160 140 L170 64 Z" fill="#f4f1ea" />
      <circle cx="166" cy="200" r="5" fill={l} /><circle cx="166" cy="230" r="5" fill={l} />
      <path d="M190 120 l22 0" stroke={l} strokeWidth="3" />
    </>
  ),
  dress: (f, d) => (
    <>
      <path d="M135 50 L145 50 L150 80 L170 80 L175 50 L185 50 L192 110 L180 150 L250 330 L70 330 L140 150 L128 110 Z" fill={f} />
      <path d="M140 150 L180 150 L176 162 L144 162 Z" fill={d} opacity=".6" />
      <path d="M160 162 L130 330 M160 162 L190 330 M160 162 L160 330" stroke={d} strokeWidth="2" opacity=".35" />
    </>
  ),
  sweater: (f, d) => (
    <>
      <path d="M120 70 Q160 90 200 70 L250 95 L270 250 L244 256 L228 140 L226 300 L94 300 L92 140 L76 256 L50 250 L70 95 Z" fill={f} />
      <path d="M130 72 Q160 100 190 72" fill="none" stroke={d} strokeWidth="8" />
      {[110, 135, 160, 185, 210].map((x) => (
        <path key={x} d={`M${x} 110 L${x} 290`} stroke={d} strokeWidth="5" opacity=".3" />
      ))}
      <rect x="94" y="282" width="132" height="18" fill={d} opacity=".45" />
    </>
  ),
  shirt: (f, d, l) => (
    <>
      <path d="M125 62 L160 72 L195 62 L240 86 L262 200 L238 206 L226 130 L226 310 L94 310 L94 130 L82 206 L58 200 L80 86 Z" fill={f} />
      <path d="M125 62 L148 96 L160 72 L172 96 L195 62 L185 56 L160 66 L135 56 Z" fill={l} opacity=".7" />
      <path d="M160 72 L160 310" stroke={d} strokeWidth="3" opacity=".5" />
      {[120, 160, 200, 240, 280].map((y) => (<circle key={y} cx="166" cy={y} r="3.5" fill={l} />))}
    </>
  ),
  trousers: (f, d) => (
    <>
      <path d="M100 50 L220 50 L232 330 L176 330 L160 130 L144 330 L88 330 Z" fill={f} />
      <rect x="100" y="50" width="120" height="16" fill={d} opacity=".5" />
      <path d="M130 70 L120 330 M190 70 L200 330" stroke={d} strokeWidth="2" opacity=".35" />
    </>
  ),
  shoe: (f, d, l) => (
    <>
      <path d="M50 230 Q60 160 110 160 L150 170 Q200 200 250 200 Q285 205 285 240 L285 252 L50 252 Z" fill={f} />
      <path d="M50 252 L285 252 L285 266 L50 266 Z" fill={d} />
      <path d="M110 165 Q130 200 170 186" fill="none" stroke={l} strokeWidth="3" />
      <path d="M60 266 L60 300 L82 300 L86 266 Z" fill={d} opacity=".8" />
    </>
  ),
  bag: (f, d, l) => (
    <>
      <path d="M120 140 Q120 70 160 70 Q200 70 200 140" fill="none" stroke={d} strokeWidth="12" />
      <path d="M70 140 L250 140 L268 310 L52 310 Z" fill={f} />
      <path d="M70 140 L250 140 L250 180 L70 180 Z" fill={d} opacity=".35" />
      <rect x="148" y="170" width="24" height="20" rx="3" fill={l} />
    </>
  ),
  scarf: (f, d) => (
    <>
      <path d="M90 60 Q160 120 230 60 L240 80 Q200 140 190 330 L150 330 L160 150 Q120 130 80 80 Z" fill={f} />
      <path d="M150 330 L190 330" stroke={d} strokeWidth="10" strokeDasharray="3 4" />
      {[90, 140, 190, 240, 290].map((y) => (<path key={y} d={`M150 ${y} L200 ${y}`} stroke={d} strokeWidth="3" opacity=".3" />))}
    </>
  ),
  belt: (f, d, l) => (
    <>
      <path d="M40 180 Q160 140 280 180 L280 214 Q160 174 40 214 Z" fill={f} />
      <rect x="138" y="150" width="44" height="54" rx="6" fill="none" stroke={l} strokeWidth="8" />
      {[70, 90, 230, 250].map((x) => (<circle key={x} cx={x} cy="190" r="3" fill={d} />))}
    </>
  ),
  sunglasses: (f, d) => (
    <>
      <path d="M60 170 L260 170" stroke={f} strokeWidth="8" />
      <ellipse cx="110" cy="200" rx="52" ry="40" fill={d} stroke={f} strokeWidth="8" />
      <ellipse cx="210" cy="200" rx="52" ry="40" fill={d} stroke={f} strokeWidth="8" />
      <path d="M150 190 Q160 178 170 190" fill="none" stroke={f} strokeWidth="6" />
      <path d="M86 186 L104 180" stroke="#fff" strokeWidth="4" opacity=".4" />
    </>
  ),
};

export default function ProductArt({ art, color, label, className }: Props) {
  const dark = shade(color, -40);
  const light = shade(color, 90);
  const draw = SHAPES[art] ?? SHAPES.shirt;
  return (
    <svg viewBox="0 0 320 380" role="img" aria-label={label ?? art} className={className}>
      <rect width="320" height="380" fill="var(--art-bg)" />
      <ellipse cx="160" cy="352" rx="110" ry="10" fill="#000" opacity=".06" />
      {draw(color, dark, light)}
    </svg>
  );
}
