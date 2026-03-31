import { SliderWithInput } from "./SliderWithInput";

interface Props {
  fontFamily: string;
  setFontFamily: (v: string) => void;
  baseFontSize: number;
  setBaseFontSize: (v: number) => void;
}

const FONT_OPTIONS = [
  "Segoe UI",
  "Segoe UI Light",
  "Arial",
  "Calibri",
  "Verdana",
  "Trebuchet MS",
  "Tahoma",
  "Georgia",
  "Consolas",
  "Cambria",
  "Candara",
  "Corbel",
  "Times New Roman",
];

export const TypographyPanel = ({ fontFamily, setFontFamily, baseFontSize, setBaseFontSize }: Props) => (
  <div className="panel-card">
    <div className="panel-title"><span>🔤</span> Typography</div>

    <div className="section-label">FONT FAMILY</div>
    <select
      value={fontFamily}
      onChange={e => setFontFamily(e.target.value)}
      className="color-input mb-3 cursor-pointer"
      style={{ textTransform: "none" }}
    >
      {FONT_OPTIONS.map(f => (
        <option key={f} value={f}>{f}</option>
      ))}
    </select>

    <SliderWithInput
      label="BASE FONT SIZE"
      value={baseFontSize}
      onChange={setBaseFontSize}
      min={8}
      max={16}
    />

    <div className="mt-3 rounded-lg bg-muted/50 border border-border/50 p-3">
      <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">Preview</div>
      <div className="space-y-1.5">
        <div className="text-card-foreground font-semibold" style={{ fontFamily, fontSize: baseFontSize + 2 }}>
          Title text — {baseFontSize + 2}pt
        </div>
        <div className="text-muted-foreground" style={{ fontFamily, fontSize: baseFontSize }}>
          Label text — {baseFontSize}pt
        </div>
        <div className="text-card-foreground font-bold" style={{ fontFamily, fontSize: baseFontSize * 2.5 }}>
          {Math.round(baseFontSize * 2.5)}
          <span className="text-xs text-muted-foreground font-normal ml-1.5">Callout</span>
        </div>
      </div>
    </div>
  </div>
);
