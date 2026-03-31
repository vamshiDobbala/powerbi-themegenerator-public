import { SCHEME_INFO } from "@/lib/colorUtils";

interface Props {
  scheme: string;
  setScheme: (v: string) => void;
}

export const ColorHarmonyPanel = ({ scheme, setScheme }: Props) => (
  <div className="panel-card">
    <div className="panel-title"><span>🎡</span> Palette Style</div>
    <div className="section-label">HARMONY MODE</div>
    <select
      value={scheme}
      onChange={e => setScheme(e.target.value)}
      className="color-input cursor-pointer"
      style={{ textTransform: "none" }}
    >
      {Object.entries(SCHEME_INFO).map(([v, { label }]) => (
        <option key={v} value={v}>{label}</option>
      ))}
    </select>
    <div className="text-[10px] text-muted-foreground mt-1.5">
      Used when no secondary color is set.
    </div>
  </div>
);
