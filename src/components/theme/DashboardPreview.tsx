import { DominantBarChart, SecondaryDonut, MultiLine, StatCard } from "./ChartComponents";

const PreviewTable = ({ bg, palette, isDark }: { bg: string; palette: string[]; isDark?: boolean }) => {
  const borderColor = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
  const textColor = isDark ? "#F5F5F5" : undefined;
  const altRowBg = isDark ? "rgba(255,255,255,0.05)" : "#fff";
  return (
    <div className="preview-card" style={isDark ? { background: "transparent", border: `1px solid ${borderColor}`, boxShadow: "0 2px 8px rgba(0,0,0,0.35)" } : undefined}>
      <div className="font-bold text-[10.5px] mb-2" style={{ color: textColor }}>{isDark ? "" : ""}Regional Summary</div>
      <table className="w-full border-collapse text-[10px]">
        <thead>
          <tr style={{ background: isDark ? "rgba(255,255,255,0.06)" : bg }}>
            {["Region", "Revenue", "Status"].map(h => (
              <th key={h} className="p-1.5 px-2 text-left font-bold text-[10px]" style={{ borderBottom: `2px solid ${palette[0]}`, color: textColor }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {([["North", "$142K", "Ahead"], ["South", "$98K", "On Track"], ["East", "$187K", "Ahead"], ["West", "$76K", "At Risk"]] as const).map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? (isDark ? "transparent" : "#fff") : (isDark ? "rgba(255,255,255,0.04)" : bg) }}>
              <td className="p-1.5 px-2" style={{ color: textColor }}>{row[0]}</td>
              <td className="p-1.5 px-2" style={{ color: textColor }}>{row[1]}</td>
              <td className="p-1.5 px-2 font-bold text-[9.5px]" style={{ color: row[2] === "Ahead" ? "#1AAB40" : row[2] === "At Risk" ? "#D13438" : (isDark ? "#D4D4D4" : "#595959") }}>{row[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface Props {
  bg: string;
  palette: string[];
  dom: number;
  sec: number;
  accentColor: string;
  name: string;
  isDark?: boolean;
}

export const DashboardPreview = ({ bg, palette, dom, sec, accentColor, name, isDark }: Props) => {
  const borderColor = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
  const textColor = isDark ? "#F5F5F5" : undefined;
  const cardStyle = isDark ? { background: "transparent", border: `1px solid ${borderColor}`, boxShadow: "0 2px 8px rgba(0,0,0,0.35)" } : {};
  
  return (
    <div className="rounded-xl p-4 shadow-sm transition-colors duration-300" style={{ background: bg }}>
      {/* Header */}
      <div className="mb-3 flex justify-between items-end">
        <div>
          <div className="font-bold text-sm" style={{ color: textColor }}>{name || "Theme Preview"}</div>
          <div className="text-[9.5px]" style={{ color: isDark ? "#A0A0A0" : undefined, ...(!isDark ? {} : {}) }}>
            {!isDark && <span className="text-muted-foreground">Power BI Report — Mock Layout</span>}
            {isDark && "Power BI Report — Mock Layout"}
          </div>
        </div>
        <div className="flex gap-1 items-center">
          {([["●", "#3B82F6", "Dominant"], ["●", "#10B981", "Secondary"], ["✦", "#8B5CF6", "Accent"]] as const).map(([d, c, l]) => (
            <div key={l} className="flex items-center gap-1 text-[8.5px] rounded-md px-2 py-0.5" style={{ color: c, background: c + "10" }}>
              <span>{d}</span>{l}
            </div>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="mb-1">
        <div className="text-[9px] text-dom-dot font-bold mb-1.5 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-dom-dot inline-block" />
          DOMINANT COLORS — KPI cards
        </div>
        <div className="flex gap-1.5 mb-2.5">
          {([["1,284", "Revenue"], ["94.2%", "CSAT"], ["$48.7K", "Avg Deal"], ["↑ 21%", "YoY"]] as const).map(([v, l], i) => (
            <StatCard key={l} color={palette[i % dom]} val={v} label={l} isDark={isDark} />
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-[1.2fr_1fr] gap-2.5 mb-2.5">
        <div className="preview-card" style={cardStyle}>
          <div className="flex justify-between items-center mb-1.5">
            <div className="font-bold text-[10.5px]" style={{ color: textColor }}>Monthly Performance</div>
            <div className="text-[8px] text-dom-dot font-bold bg-dom-dot/10 rounded px-1.5 py-0.5">● Dominant</div>
          </div>
          <DominantBarChart palette={palette} domCount={dom} />
        </div>
        <div className="preview-card" style={cardStyle}>
          <div className="flex justify-between items-center mb-1.5">
            <div className="font-bold text-[10.5px]" style={{ color: textColor }}>Category Mix</div>
            <div className="text-[8px] text-sec-dot font-bold bg-sec-dot/10 rounded px-1.5 py-0.5">● Secondary</div>
          </div>
          <SecondaryDonut palette={palette} domCount={dom} secCount={sec} isDark={isDark} />
        </div>
      </div>

      {/* Multi-series + table */}
      <div className="grid grid-cols-[1.4fr_1fr] gap-2.5 mb-2.5">
        <div className="preview-card" style={cardStyle}>
          <div className="flex justify-between items-center mb-1.5">
            <div className="font-bold text-[10.5px]" style={{ color: textColor }}>Multi-Series Trend</div>
            <div className="text-[8px] text-acc-dot font-bold bg-acc-dot/10 rounded px-1.5 py-0.5">✦ Accent highlighted</div>
          </div>
          <MultiLine palette={palette} domCount={dom} secCount={sec} />
          <div className="flex gap-2 mt-1.5 flex-wrap">
            {palette.map((c, i) => {
              const isAcc = i >= dom + sec;
              return (
                <div key={i} className="flex items-center gap-1 text-[8.5px]" style={{ color: isAcc ? "#8B5CF6" : (isDark ? "#BBB" : "#777"), fontWeight: isAcc ? 700 : 400 }}>
                  <div className="rounded-sm" style={{ width: isAcc ? 16 : 12, height: isAcc ? 3.5 : 2.5, background: c }} />
                  {isAcc ? "✦ Key Series" : `S${i + 1}`}
                </div>
              );
            })}
          </div>
        </div>
        <PreviewTable bg={bg} palette={palette} isDark={isDark} />
      </div>

      {/* Accent spotlight + semantic */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="preview-card" style={cardStyle}>
          <div className="font-bold text-[10.5px] mb-2" style={{ color: textColor }}>
            Accent Spotlight <span className="text-[8.5px] text-acc-dot font-bold">✦ used sparingly</span>
          </div>
          <div className="flex gap-1.5 items-end">
            {[55, 78, 43, 91, 60].map((h, i) => (
              <div key={i} className="flex-1 rounded-sm transition-colors duration-300" style={{
                background: i === 3 ? accentColor : palette[i % dom],
                height: h * 0.7,
                boxShadow: i === 3 ? `0 0 0 2px ${accentColor}88` : "none",
              }} />
            ))}
          </div>
          <div className="text-[8.5px] mt-2 leading-snug" style={{ color: isDark ? "#A0A0A0" : undefined }}>
            {!isDark && <span className="text-muted-foreground">Accent highlights the peak value only. Dominant colors fill remaining bars.</span>}
            {isDark && "Accent highlights the peak value only. Dominant colors fill remaining bars."}
          </div>
        </div>
        <div className="preview-card" style={cardStyle}>
          <div className="font-bold text-[10.5px] mb-2" style={{ color: textColor }}>KPI Status</div>
          {([["✅ On Track", "#1AAB40"], ["⚠ At Risk", "#FFB900"], ["❌ Behind", "#D13438"]] as const).map(([l, c]) => (
            <div key={l} className="mb-1.5 text-[10.5px] font-bold pl-2" style={{ borderLeft: `3px solid ${c}`, color: c }}>{l}</div>
          ))}
        </div>
      </div>
    </div>
  );
};
