import { useState } from "react";
import { SliderWithInput } from "./SliderWithInput";

interface Props {
  cardCalloutSize: number;
  setCardCalloutSize: (v: number) => void;
  tableHeaderSize: number;
  setTableHeaderSize: (v: number) => void;
  altRowShading: boolean;
  setAltRowShading: (v: boolean) => void;
  slicerItemSize: number;
  setSlicerItemSize: (v: number) => void;
  isDark: boolean;
  darkCanvasStyle: "elevated" | "inset" | "frameless";
  setDarkCanvasStyle: (v: "elevated" | "inset" | "frameless") => void;
}

const DARK_STYLES: { value: "elevated" | "inset"; label: string; desc: string }[] = [
  { value: "elevated", label: "Standard",     desc: "Cards float above page — works for all dashboards" },
  { value: "inset",    label: "Professional", desc: "Cards recessed into page — best for finance & executive" },
];

export const VisualStylePanel = ({
  cardCalloutSize, setCardCalloutSize,
  tableHeaderSize, setTableHeaderSize,
  altRowShading, setAltRowShading,
  slicerItemSize, setSlicerItemSize,
  isDark, darkCanvasStyle, setDarkCanvasStyle,
}: Props) => {
  const [activePreview, setActivePreview] = useState<"card" | "table" | "slicer">("card");

  return (
    <div className="panel-card">
      <div className="panel-title"><span>🎛</span> Visual Styles</div>

      <div className="space-y-3">

        {isDark && (
          <div>
            <div className="section-label">DARK CANVAS STYLE</div>
            <div className="flex flex-col gap-1.5">
              {DARK_STYLES.map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => setDarkCanvasStyle(value)}
                  className={`text-left rounded-lg px-3 py-2 border transition-all ${
                    darkCanvasStyle === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/60"
                  }`}
                >
                  <div className="font-semibold text-[11px]">{label}</div>
                  <div className="text-[9px] opacity-75 mt-0.5">{desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div onFocus={() => setActivePreview("card")}>
          <SliderWithInput label="CARD CALLOUT SIZE" value={cardCalloutSize} onChange={setCardCalloutSize} min={20} max={40} />
        </div>

        <div onFocus={() => setActivePreview("table")}>
          <SliderWithInput label="TABLE HEADER SIZE" value={tableHeaderSize} onChange={setTableHeaderSize} min={9} max={16} />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <div className="section-label mb-0">ALTERNATE ROW SHADING</div>
            <button
              onClick={() => { setAltRowShading(!altRowShading); setActivePreview("table"); }}
              className={`relative w-10 h-5 rounded-full transition-colors ${altRowShading ? "bg-primary" : "bg-muted border border-border"}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-card shadow transition-transform ${altRowShading ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
          <div className="text-[9px] text-muted-foreground mt-1">Alternating row backgrounds for tables.</div>
        </div>

        <div onFocus={() => setActivePreview("slicer")}>
          <SliderWithInput label="SLICER ITEM SIZE" value={slicerItemSize} onChange={setSlicerItemSize} min={8} max={14} />
        </div>

        <div className="rounded-lg bg-muted/50 border border-border/50 p-2.5">
          <div className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5">
            {activePreview === "card"   && "Card callout preview"}
            {activePreview === "table"  && `Table preview — row shading ${altRowShading ? "ON" : "OFF"}`}
            {activePreview === "slicer" && "Slicer item preview"}
          </div>

          {activePreview === "card" && (
            <div className="rounded border border-border/50 bg-card/60 px-3 py-1.5 flex flex-col gap-0.5">
              <div className="font-bold text-card-foreground leading-tight" style={{ fontSize: cardCalloutSize }}>1,284</div>
              <div className="text-[10px] text-muted-foreground">Revenue</div>
            </div>
          )}

          {activePreview === "table" && (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border/50">
                  {["Region", "Revenue", "Status"].map(h => (
                    <th key={h} className="text-left py-0.5 px-1.5 text-card-foreground font-semibold" style={{ fontSize: tableHeaderSize }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[["North","$142K","Ahead"],["South","$98K","On Track"],["East","$187K","Ahead"],["West","$76K","At Risk"]].map((row, i) => (
                  <tr key={i} style={{ background: altRowShading && i % 2 !== 0 ? "hsl(var(--muted))" : "transparent", transition: "background 0.2s" }}>
                    {row.map((cell, j) => <td key={j} className="py-0.5 px-1.5 text-muted-foreground text-[10px]">{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activePreview === "slicer" && (
            <div className="flex gap-3">
              {["North", "South", "East"].map(item => (
                <div key={item} className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full border border-border/70 shrink-0" />
                  <span className="text-muted-foreground" style={{ fontSize: slicerItemSize }}>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
