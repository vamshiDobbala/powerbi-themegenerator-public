import { useState } from "react";
import { SCHEME_INFO, hexToHsl, DOM_LABELS, calcSlots } from "@/lib/colorUtils";

const TooltipIcon = ({ text }: { text: string }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-flex items-center" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <span className="w-3.5 h-3.5 rounded-full bg-muted border border-border flex items-center justify-center text-[9px] text-muted-foreground cursor-help shrink-0">?</span>
      {show && (
        <div className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 bg-foreground text-card rounded-lg px-3 py-2 text-[10.5px] leading-relaxed whitespace-pre-wrap min-w-[220px] max-w-[280px] z-50 shadow-lg pointer-events-none">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-foreground" />
        </div>
      )}
    </div>
  );
};

const LightnessSteps = ({ palette, domCount }: { palette: string[]; domCount: number }) => {
  const domColors = palette.slice(0, domCount);
  return (
    <div className="mt-2.5">
      <div className="section-label">HSL LIGHTNESS STEPS</div>
      <div className="flex gap-0.5 items-end h-10">
        {domColors.map((c, i) => {
          const { l } = hexToHsl(c);
          const barH = 10 + (l / 100) * 26;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <div className="text-[7px] text-muted-foreground/60 leading-none text-center whitespace-nowrap">{Math.round(l)}%</div>
              <div className="w-full rounded-sm" style={{ height: barH, background: c, boxShadow: "inset 0 -1px 2px rgba(0,0,0,.1)" }} />
              <div className="text-[7px] text-muted-foreground/50 leading-none text-center">{DOM_LABELS[i]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const RatioBar = ({ palette }: { palette: string[] }) => {
  const { dom, sec, acc, hue } = calcSlots();
  const segs = [
    { label: "60%", sub: "Dominant",    colors: palette.slice(0, dom),                         dot: "#3B82F6", flex: 6 },
    { label: "30%", sub: "Secondary",   colors: palette.slice(dom, dom + sec),                  dot: "#10B981", flex: 3 },
    { label: "10%", sub: "Accent",      colors: palette.slice(dom + sec, dom + sec + acc),       dot: "#8B5CF6", flex: 1 },
    { label: "+2",  sub: "Hue Shift",   colors: palette.slice(dom + sec + acc, dom + sec + acc + hue), dot: "#F59E0B", flex: 2 },
    { label: "+2",  sub: "Desaturated", colors: palette.slice(dom + sec + acc + hue),            dot: "#6B7280", flex: 2 },
  ].filter(g => g.colors.length);

  return (
    <div className="mt-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className="section-label mb-0">60 – 30 – 10 DISTRIBUTION</div>
        <TooltipIcon text={"Power BI assigns dataColors by category index.\nWith 4 categories, it uses colors 1–4.\nWith 8 categories, it uses colors 1–8.\nThe 60-30-10 ratio guides palette structure,\nnot direct assignment."} />
      </div>
      <div className="flex gap-0.5 h-2.5 rounded-lg overflow-hidden mb-2">
        {segs.map((g, i) => (
          <div key={i} style={{ flex: g.flex }} className="flex gap-px">
            {g.colors.map((c, j) => <div key={j} className="flex-1" style={{ background: c }} />)}
          </div>
        ))}
      </div>
      <div className="flex gap-2.5 flex-wrap">
        {segs.map(g => (
          <div key={g.label} className="flex items-center gap-1 text-[9.5px] text-muted-foreground">
            <div className="w-2 h-2 rounded-sm" style={{ background: g.colors[0] || "#ccc" }} />
            <span style={{ color: g.dot }} className="font-bold">{g.label}</span> {g.sub}
          </div>
        ))}
      </div>
    </div>
  );
};

interface Props {
  scheme: string;
  setScheme: (v: string) => void;
  accent0: string;
  palette: string[];
  dom: number;
  sec: number;
  acc: number;
  hue: number;
}

export const SchemePanel = ({ scheme, setScheme, palette, dom, sec, acc, hue }: Props) => (
  <div className="panel-card">
    <div className="panel-title"><span>🎡</span> Secondary Scheme</div>

    <div className="section-label">Secondary family harmony (when no secondary color set)</div>
    <select
      value={scheme}
      onChange={e => setScheme(e.target.value)}
      className="color-input mb-3 cursor-pointer"
      style={{ textTransform: "none" }}
    >
      {Object.entries(SCHEME_INFO).map(([v, { label, desc }]) => (
        <option key={v} value={v}>{label} — {desc}</option>
      ))}
    </select>

    <div className="info-box mb-3">
      <strong>{SCHEME_INFO[scheme].label}:</strong> {SCHEME_INFO[scheme].desc}
    </div>

    {palette.length > 0 ? (
      <>
        {[
          { key: "dom", pct: "60%", label: "Dominant",    colors: palette.slice(0, dom),                          dot: "#3B82F6", bg: "#EFF6FF", tc: "#1D4ED8" },
          { key: "sec", pct: "30%", label: "Secondary",   colors: palette.slice(dom, dom + sec),                   dot: "#10B981", bg: "#F0FDF4", tc: "#065F46" },
          { key: "acc", pct: "10%", label: "Accent",      colors: palette.slice(dom + sec, dom + sec + acc),        dot: "#8B5CF6", bg: "#F5F3FF", tc: "#5B21B6" },
          { key: "hue", pct: "+2",  label: "Hue Shift",   colors: palette.slice(dom + sec + acc, dom + sec + acc + hue), dot: "#F59E0B", bg: "#FFFBEB", tc: "#92400E" },
          { key: "des", pct: "+2",  label: "Desaturated", colors: palette.slice(dom + sec + acc + hue),             dot: "#6B7280", bg: "#F9FAFB", tc: "#374151" },
        ].filter(g => g.colors.length).map(g => (
          <div key={g.key} className="rounded-lg p-2.5 mb-1.5" style={{ background: g.bg, border: `1px solid ${g.dot}33` }}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: g.dot }} />
                <span className="text-[10px] font-bold" style={{ color: g.tc }}>{g.pct} {g.label.toUpperCase()}</span>
              </div>
              <span className="text-[8.5px] opacity-65" style={{ color: g.tc }}>{g.colors.length} color{g.colors.length > 1 ? "s" : ""}</span>
            </div>
            <div className="flex gap-1">
              {g.colors.map((c, i) => (
                <div key={i} title={c} className="flex-1 max-w-9 text-center">
                  <div className="h-7 rounded-md shadow-sm mb-0.5" style={{ background: c }} />
                  <div className="text-[7px] text-muted-foreground/60 font-mono overflow-hidden">{c.slice(1)}</div>
                </div>
              ))}
            </div>
            {g.key === "dom" && <LightnessSteps palette={palette} domCount={dom} />}
          </div>
        ))}
        <RatioBar palette={palette} />
      </>
    ) : (
      <div className="text-[10.5px] text-muted-foreground/50 italic">Add a Dominant color to preview palette</div>
    )}
  </div>
);
