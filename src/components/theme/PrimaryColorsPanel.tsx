import { isValid } from "@/lib/colorUtils";

interface SlotMeta { role: string; hint: string; dot: string; }

interface Props {
  customColors: string[];
  customInput: string;
  inputError: string;
  slotMeta: SlotMeta[];
  hasColors: boolean;
  accentColor: string;
  accent0: string;
  addColor: () => void;
  removeColor: (i: number) => void;
  setCustomInput: (v: string) => void;
  setInputError: (v: string) => void;
}

export const PrimaryColorsPanel = ({
  customColors, customInput, inputError, slotMeta, hasColors, accentColor, accent0,
  addColor, removeColor, setCustomInput, setInputError,
}: Props) => {
  const parsedInput = customInput.startsWith("#") ? customInput : `#${customInput}`;
  const colorPickerValue = isValid(parsedInput) ? parsedInput : "#000000";

  return (
    <div className="panel-card">
      <div className="panel-title">
        <span>🎨</span> Primary Colors
      </div>

      {/* Slot indicators */}
      <div className="flex gap-1.5 mb-3">
        {slotMeta.map((m, i) => (
          <div
            key={i}
            className="flex-1 rounded-lg p-2 text-center transition-all"
            style={{
              border: `1.5px solid ${customColors[i] ? m.dot + "66" : "hsl(var(--border))"}`,
              background: customColors[i] ? m.dot + "09" : "hsl(var(--muted))",
            }}
          >
            <div className="flex justify-center mb-1">
              <div
                className="w-5 h-5 rounded-md transition-all duration-300"
                style={{
                  background: customColors[i] || "hsl(var(--border))",
                  border: `2px solid ${m.dot}`,
                  boxShadow: customColors[i] ? `0 0 0 2px ${m.dot}33` : "none",
                }}
              />
            </div>
            <div className="text-[8.5px] font-bold tracking-wider" style={{ color: customColors[i] ? m.dot : "hsl(var(--muted-foreground))" }}>
              {m.role}
            </div>
            <div className="text-[7.5px] text-muted-foreground mt-0.5">{m.hint}</div>
          </div>
        ))}
      </div>

      {/* Color input row */}
      <div className="flex gap-1.5 items-center">
        <input
          type="color"
          value={colorPickerValue}
          onChange={e => { setCustomInput(e.target.value); setInputError(""); }}
          className="color-picker-input"
        />
        <input
          value={customInput}
          onChange={e => { setCustomInput(e.target.value); setInputError(""); }}
          onKeyDown={e => e.key === "Enter" && addColor()}
          placeholder={["#1E6FDB", "#1AAB7A", "#9E7BD4"][customColors.length] || "#------"}
          className="color-input flex-1"
          style={inputError ? { borderColor: "hsl(var(--destructive))" } : undefined}
        />
        <button
          onClick={addColor}
          disabled={customColors.length >= 3}
          className="btn-icon-add"
          style={customColors.length < 3 ? { background: accent0 } : undefined}
        >+</button>
      </div>

      {inputError && (
        <div className="text-destructive text-[10.5px] mt-1.5 flex items-center gap-1">
          <span>⚠</span> {inputError}
        </div>
      )}

      {/* Color chips */}
      {customColors.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {customColors.map((c, i) => (
            <div key={i} className="chip" style={{ borderColor: slotMeta[i].dot + "55" }}>
              <div className="w-3.5 h-3.5 rounded-sm border border-foreground/10" style={{ background: c }} />
              <span className="text-[10px] font-mono font-bold text-card-foreground uppercase">{c}</span>
              <span
                className="text-[7.5px] font-bold rounded-sm px-1 py-px"
                style={{ color: slotMeta[i].dot, background: slotMeta[i].dot + "18" }}
              >
                {slotMeta[i].role}
              </span>
              <span
                onClick={() => removeColor(i)}
                className="cursor-pointer text-muted-foreground hover:text-destructive text-sm font-bold leading-none transition-colors"
              >×</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="warning-box mt-3">
          ⚠ Add a Dominant color to begin.
        </div>
      )}

      {/* Auto-generated accent notice */}
      {hasColors && !customColors[2] && (
        <div className="mt-3 bg-accent/10 border border-accent/30 rounded-lg p-2.5 text-[10px] text-accent leading-relaxed">
          ✦ Accent auto-generated using harmony rules.
          {accentColor && (
            <span className="inline-flex items-center gap-1 ml-1.5">
              <span className="w-3 h-3 rounded-sm inline-block border border-foreground/10" style={{ background: accentColor }} />
              <span className="font-mono font-bold">{accentColor}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
