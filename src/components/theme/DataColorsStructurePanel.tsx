import { DOM_L_STEPS, calcSlots } from "@/lib/colorUtils";

const SEC_L_STEPS = [54, 38, 72];

interface Props {
  palette: string[];
  dom: number;
  sec: number;
  acc: number;
  hue: number;
}

export const DataColorsStructurePanel = ({ palette, dom, sec, acc, hue }: Props) => (
  <div className="panel-card">
    <div className="panel-title"><span>🔢</span> dataColors Structure</div>
    <div className="flex gap-1.5 mb-2.5">
      {([
        ["6", "Dominant",    "Base → Dark → Darker → Light → Lighter → Pastel", "#3B82F6", "#EFF6FF"],
        ["3", "Secondary",   "Base → Dark → Light",                              "#10B981", "#F0FDF4"],
        ["1", "Accent",      "Harmony highlight",                                 "#8B5CF6", "#F5F3FF"],
        ["2", "Hue Shift",   "±20° variants",                                    "#F59E0B", "#FFFBEB"],
        ["2", "Desaturated", "Muted variants",                                   "#6B7280", "#F9FAFB"],
      ] as const).map(([n, l, sub, dot, bg2]) => (
        <div key={l} className="flex-1 rounded-lg p-2 text-center" style={{ background: bg2, border: `1.5px solid ${dot}33` }}>
          <div className="text-lg font-extrabold leading-none" style={{ color: dot }}>{n}</div>
          <div className="text-[8.5px] font-bold mt-0.5" style={{ color: dot }}>{l}</div>
          <div className="text-[7px] text-muted-foreground mt-0.5 leading-tight">{sub}</div>
        </div>
      ))}
    </div>

    {/* 14-slot swatch bar */}
    <div className="flex gap-0.5">
      {Array.from({ length: 14 }).map((_, i) => {
        const ringColor = i < dom ? "#3B82F6" : i < dom + sec ? "#10B981" : i < dom + sec + acc ? "#8B5CF6" : i < dom + sec + acc + hue ? "#F59E0B" : "#6B7280";
        const lLabel = ([...DOM_L_STEPS, ...SEC_L_STEPS, null, null, null, null, null] as (number | null)[])[i];
        return (
          <div key={i} className="flex-1 flex flex-col gap-0.5 items-center">
            <div
              className="w-full h-5 rounded transition-colors duration-300"
              style={{ background: palette[i] || "hsl(var(--border))", outline: `1.5px solid ${ringColor}55`, outlineOffset: 1 }}
            />
            <div className="text-[6.5px] text-muted-foreground/50">
              {lLabel ? `${lLabel}%` : i < dom + sec + acc ? "acc" : i < dom + sec + acc + hue ? "±20°" : "desat"}
            </div>
          </div>
        );
      })}
    </div>

    <div className="flex gap-2 mt-1.5 flex-wrap">
      {([["●", "#3B82F6", "6 dom"], ["●", "#10B981", "3 sec"], ["●", "#8B5CF6", "1 acc"], ["●", "#F59E0B", "2 hue"], ["●", "#6B7280", "2 desat"]] as const)
        .map(([d, c, l]) => (
          <div key={l} className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <span style={{ color: c }}>{d}</span>{l}
          </div>
        ))}
    </div>
    <div className="mt-2 info-box">
      Generated: <strong className="text-card-foreground">14 candidate colors</strong> — 6 dominant + 3 secondary + 1 accent + 2 hue-shift + 2 desaturated.
      <br />Power BI theme uses <strong className="text-card-foreground">10 balanced dataColors</strong> selected for optimal chart readability.
    </div>
  </div>
);
