import { isValid } from "@/lib/colorUtils";

interface Props {
  extraColors: string[];
  extraInput: string;
  extraError: string;
  palette: string[];
  addExtraColor: () => void;
  removeExtraColor: (i: number) => void;
  setExtraInput: (v: string) => void;
  setExtraError: (v: string) => void;
}

export const ExtendedPalettePanel = ({
  extraColors, extraInput, extraError, palette,
  addExtraColor, removeExtraColor, setExtraInput, setExtraError,
}: Props) => {
  const parsedInput = extraInput.startsWith("#") ? extraInput : `#${extraInput}`;
  const colorPickerValue = isValid(parsedInput) ? parsedInput : "#000000";

  return (
    <div className="panel-card">
      <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-border/50">
        <div className="font-bold text-sm text-card-foreground flex items-center gap-2">
          <span>➕</span> Extended Palette
        </div>
        {extraColors.length > 0 && (
          <span className="badge badge-success">
            {extraColors.length} extra
          </span>
        )}
      </div>

      <p className="text-[10.5px] text-muted-foreground mb-3 leading-relaxed">
        Extra colors used when visuals have more categories.
      </p>

      <div className="flex gap-1.5 items-center mb-1.5">
        <input
          type="color"
          value={colorPickerValue}
          onChange={e => { setExtraInput(e.target.value); setExtraError(""); }}
          className="color-picker-input"
        />
        <input
          value={extraInput}
          onChange={e => { setExtraInput(e.target.value); setExtraError(""); }}
          onKeyDown={e => e.key === "Enter" && addExtraColor()}
          placeholder="#A67C52"
          className="color-input flex-1"
          style={extraError ? { borderColor: "hsl(var(--destructive))" } : undefined}
        />
        <button onClick={addExtraColor} className="btn-icon-add">+</button>
      </div>

      {extraError && (
        <div className="text-destructive text-[10.5px] mb-1.5">⚠ {extraError}</div>
      )}

      {extraColors.length > 0 ? (
        <div className="flex flex-col gap-1 mt-1.5">
          {extraColors.map((c, i) => (
            <div key={i} className="flex items-center gap-2 bg-muted border border-border rounded-lg px-2.5 py-1.5">
              <div className="w-5 h-5 rounded-md shrink-0 border border-foreground/10" style={{ background: c }} />
              <span className="flex-1 text-[11px] font-mono font-semibold text-card-foreground uppercase">{c}</span>
              <span
                onClick={() => removeExtraColor(i)}
                className="cursor-pointer text-muted-foreground hover:text-destructive text-base font-bold leading-none ml-0.5 transition-colors"
              >×</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-dashed">
          No extra colors added.
        </div>
      )}
    </div>
  );
};
