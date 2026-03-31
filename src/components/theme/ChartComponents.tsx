import { ensureContrast } from "@/lib/colorUtils";

// ─────────────────────────────────────────────────────────────────────────────
// Chart Components — ALL LOGIC PRESERVED EXACTLY
// ─────────────────────────────────────────────────────────────────────────────

export const DominantBarChart = ({ palette, domCount }: { palette: string[]; domCount: number }) => {
  const domColors = palette.slice(0, domCount);
  const vals = [82, 68, 91, 55, 74, 63].slice(0, domColors.length);
  const W = 220, H = 100, pad = 12;
  const bW = Math.floor((W - pad * 2) / vals.length) - 5;
  return (
    <svg width={W} height={H} className="block">
      <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="hsl(var(--border))" strokeWidth={1} />
      {vals.map((v, i) => {
        const bh = (v / 100) * (H - pad * 2);
        const x  = pad + i * ((W - pad * 2) / vals.length) + 2;
        const y  = H - pad - bh;
        return <rect key={i} x={x} y={y} width={bW} height={bh} fill={domColors[i % domColors.length]} rx={3} />;
      })}
    </svg>
  );
};

export const SecondaryDonut = ({ palette, domCount, secCount, isDark }: { palette: string[]; domCount: number; secCount: number; isDark?: boolean }) => {
  const secColors = palette.slice(domCount, domCount + secCount);
  if (!secColors.length) return null;
  const rv = [38, 28, 34].slice(0, secColors.length);
  const total = rv.reduce((a, b) => a + b, 0);
  const cx = 44, cy = 44, r = 34, ir = 20;
  let s = -Math.PI / 2;
  return (
    <svg width={180} height={88} className="block">
      {rv.map((v, i) => {
        const a = (v / total) * 2 * Math.PI;
        const x1 = cx + r * Math.cos(s),   y1 = cy + r * Math.sin(s);
        const x2 = cx + r * Math.cos(s+a), y2 = cy + r * Math.sin(s+a);
        const ix1 = cx + ir * Math.cos(s),  iy1 = cy + ir * Math.sin(s);
        const ix2 = cx + ir * Math.cos(s+a),iy2 = cy + ir * Math.sin(s+a);
        const lg = a > Math.PI ? 1 : 0;
        const d = `M${ix1},${iy1}L${x1},${y1}A${r},${r},0,${lg},1,${x2},${y2}L${ix2},${iy2}A${ir},${ir},0,${lg},0,${ix1},${iy1}Z`;
        s += a;
        return <path key={i} d={d} fill={secColors[i]} />;
      })}
      {rv.map((_, i) => (
        <g key={i}>
          <rect x={92} y={14 + i * 20} width={10} height={10} rx={2} fill={secColors[i]} />
          <text x={107} y={23 + i * 20} fontSize={9} fill={isDark ? "#D4D4D4" : "#595959"} fontFamily="Segoe UI">Cat {i + 1}</text>
        </g>
      ))}
    </svg>
  );
};

export const MultiLine = ({ palette, domCount, secCount }: { palette: string[]; domCount: number; secCount: number }) => (
  <svg width="100%" height={70} className="block">
    {palette.map((c, si) => {
      const isAcc = si >= domCount + secCount;
      const pts   = [42, 58, 35, 72, 60, 80, 50].map((v, xi) => Math.max(5, Math.min(95, v + (si * 7 + xi * 3) % 22 - 11)));
      const coords = pts.map((v, i) => [14 + i * (490 / 6), 70 - 8 - (v / 100) * (70 - 16)]);
      return (
        <path
          key={si}
          d={coords.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ")}
          fill="none"
          stroke={c}
          strokeWidth={isAcc ? 3.5 : 1.8}
          strokeLinejoin="round"
          opacity={isAcc ? 1 : si < domCount ? 0.9 : 0.7}
        />
      );
    })}
  </svg>
);

export const StatCard = ({ color, val, label, isDark }: { color: string; val: string; label: string; isDark?: boolean }) => {
  const borderColor = isDark ? "rgba(255,255,255,0.10)" : undefined;
  const cardDarkStyle = isDark ? { background: "transparent", border: `1px solid ${borderColor}`, boxShadow: "0 2px 8px rgba(0,0,0,0.35)" } : {};
  return (
    <div className="preview-card flex-1 min-w-[72px]" style={cardDarkStyle}>
      <div className="text-xl font-bold leading-tight" style={{ color: isDark ? color : ensureContrast(color, "#FFFFFF") }}>{val}</div>
      <div className="text-[9px] mt-1" style={{ color: isDark ? "#A0A0A0" : undefined }}>
        {!isDark && <span className="text-muted-foreground">{label}</span>}
        {isDark && label}
      </div>
    </div>
  );
};
