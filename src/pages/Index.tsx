import { useState, useMemo } from "react";
import {
  toHex, isValid, isNearBlack, isNearWhite, hexToHsl,
  build603010, runA11y, buildJSON, genBg, calcSlots, lightenForDark,
  type ThemeOptions,
} from "@/lib/colorUtils";
import { PrimaryColorsPanel } from "@/components/theme/PrimaryColorsPanel";
import { ExtendedPalettePanel } from "@/components/theme/ExtendedPalettePanel";
import { ThemeSettingsPanel } from "@/components/theme/ThemeSettingsPanel";
import { ColorHarmonyPanel } from "@/components/theme/ColorHarmonyPanel";
import { ExportButtons } from "@/components/theme/ExportButtons";
import { DashboardPreview } from "@/components/theme/DashboardPreview";
import { JSONViewer } from "@/components/theme/JSONViewer";
import { TypographyPanel } from "@/components/theme/TypographyPanel";
import { VisualStylePanel } from "@/components/theme/VisualStylePanel";
import { GeneratedColorsChips } from "@/components/theme/GeneratedColorsChips";
import { DataColorsStructurePanel } from "@/components/theme/DataColorsStructurePanel";
import { AIColorSuggester } from "@/components/theme/AIColorSuggester";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SlotMeta { role: string; hint: string; dot: string; }

const AppHeader = ({ hasColors, palette, dom, sec }: { hasColors: boolean; palette: string[]; dom: number; sec: number }) => {
  const displayPalette = hasColors
    ? palette
    : ["#1E3A5F", "#2D5A8E", "#3B7BBF", "#78A8D4", "#94B8DC", "#7EC4B4", "#9CBFB8", "#A8D4C8", "#88B4A8", "#9E8BC4"];

  return (
    <div className="bg-header px-6 py-3 flex items-center gap-3.5">
      <div className="flex gap-0.5 shrink-0">
        {displayPalette.map((c, i) => (
          <div
            key={i}
            className="h-8 rounded-sm opacity-90"
            style={{ width: i < dom ? 12 : i < dom + sec ? 8 : 5, background: c }}
          />
        ))}
      </div>
      <div>
        <div className="text-header-foreground font-bold text-base tracking-tight">Power BI Theme Generator</div>
        <div className="text-header-foreground/30 text-[10px]">60-30-10 Rule · WCAG Validation · Schema-compliant JSON</div>
      </div>
      <div className="ml-auto hidden md:flex gap-1.5">
        {([["60%", "Dominant", "#3B82F6"], ["30%", "Secondary", "#10B981"], ["10%", "Accent", "#8B5CF6"]] as const).map(([p, l, c]) => (
          <div key={l} className="rounded-md px-2.5 py-1 text-[10px] font-bold text-center" style={{ background: c + "18", border: `1px solid ${c}44`, color: c }}>
            <div>{p}</div><div className="text-[7.5px] opacity-75">{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TabBar = ({ tab, setTab, accent0, canvasMode, setCanvasMode }: {
  tab: string; setTab: (t: string) => void; accent0: string;
  canvasMode: "light" | "dark"; setCanvasMode: (m: "light" | "dark") => void;
}) => (
  <div className="flex items-center gap-3 flex-wrap">
    <div className="flex gap-1 bg-card rounded-xl p-1 shadow-sm w-fit">
      {([["preview", "🖥 Preview"], ["json", "{ } JSON"]] as const).map(([t, lbl]) => (
        <button
          key={t}
          onClick={() => setTab(t)}
          className={`tab-btn ${tab === t ? "tab-btn-active" : "tab-btn-inactive"}`}
          style={tab === t ? { background: accent0 } : undefined}
        >{lbl}</button>
      ))}
    </div>
    <div className="flex gap-1 bg-card rounded-xl p-1 shadow-sm w-fit items-center">
      <span className="text-[10px] text-muted-foreground font-semibold px-1.5">Canvas:</span>
      {([["light", "☀ Light"], ["dark", "🌙 Dark"]] as const).map(([m, lbl]) => (
        <button
          key={m}
          onClick={() => setCanvasMode(m as "light" | "dark")}
          className={`tab-btn ${canvasMode === m ? "tab-btn-active" : "tab-btn-inactive"}`}
          style={canvasMode === m ? { background: m === "dark" ? "#36454F" : accent0 } : undefined}
        >{lbl}</button>
      ))}
    </div>
  </div>
);

const EmptyState = () => (
  <div className="panel-card flex flex-col items-center gap-3 py-14 px-8 flex-1">
    <div className="text-5xl">🎨</div>
    <div className="font-bold text-base text-card-foreground">Pick your theme colors</div>
    <p className="text-xs text-muted-foreground text-center max-w-xs leading-relaxed">
      Add a <strong>Dominant</strong> color to generate a balanced Power BI theme palette.
    </p>
    <div className="flex gap-2.5 mt-1.5">
      {([["60%", "Dominant", "#3B82F6"], ["30%", "Secondary", "#10B981"], ["10%", "Accent", "#8B5CF6"]] as const).map(([p, l, c]) => (
        <div key={l} className="rounded-xl p-3 px-4 text-center" style={{ background: c + "10", border: `1.5px solid ${c}44` }}>
          <div className="text-lg font-extrabold" style={{ color: c }}>{p}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{l}</div>
        </div>
      ))}
    </div>
  </div>
);

export default function PowerBIThemeGenerator() {
  const [name, setName]                   = useState("My Power BI Theme");
  const [scheme, setScheme]               = useState("complementary");
  const [customColors, setCustomColors]   = useState<string[]>([]);
  const [customInput, setCustomInput]     = useState("");
  const [inputError, setInputError]       = useState("");
  const [extraColors, setExtraColors]     = useState<string[]>([]);
  const [extraInput, setExtraInput]       = useState("");
  const [extraError, setExtraError]       = useState("");
  const [tab, setTab]                     = useState("preview");
  const [copied, setCopied]               = useState(false);
  const [a11yOpen, setA11yOpen]           = useState(false);
  const [canvasMode, setCanvasMode]       = useState<"light" | "dark">("light");
  const [structureView, setStructureView] = useState<"chart" | "data">("chart");

  // Typography & Visual Style
  const [fontFamily, setFontFamily]           = useState("Segoe UI");
  const [baseFontSize, setBaseFontSize]       = useState(10);
  const [cardCalloutSize, setCardCalloutSize] = useState(28);
  const [tableHeaderSize, setTableHeaderSize] = useState(11);
  const [altRowShading, setAltRowShading]     = useState(true);
  const [slicerItemSize, setSlicerItemSize]   = useState(10);
  const [darkCanvasStyle, setDarkCanvasStyle] = useState<"elevated" | "inset" | "frameless">("elevated");

  const addColor = () => {
    const raw = customInput.trim();
    const val = raw.startsWith("#") ? raw : `#${raw}`;
    if (!isValid(val))                                         { setInputError("Invalid hex. Use #RRGGBB."); return; }
    if (isNearBlack(toHex(val)))                               { setInputError("Too dark — near-black colors aren't usable."); return; }
    if (isNearWhite(toHex(val)))                               { setInputError("Too light — near-white colors aren't usable."); return; }
    if (customColors.map(toHex).includes(toHex(val)))          { setInputError("Already added."); return; }
    if (customColors.length >= 3)                              { setInputError("Max 3 core slots: Dominant · Secondary · Accent."); return; }
    setCustomColors(p => [...p, toHex(val)]);
    setCustomInput(""); setInputError("");
  };

  const removeColor = (i: number) => setCustomColors(p => p.filter((_, j) => j !== i));

  // AI suggester — receives a hex from Claude, injects it as the dominant color
  const handleAISuggestion = (hex: string) => {
    const val = toHex(hex);
    if (!isValid(val) || isNearBlack(val) || isNearWhite(val)) return;
    // Clear existing colors and set the suggested one as dominant
    setCustomColors([val]);
    setCustomInput(val);
    setInputError("");
  };

  const addExtraColor = () => {
    const raw = extraInput.trim();
    const val = raw.startsWith("#") ? raw : `#${raw}`;
    if (!isValid(val)) { setExtraError("Invalid hex. Use #RRGGBB."); return; }
    const allUsed = [...customColors.map(toHex), ...palette, ...extraColors.map(toHex)];
    if (allUsed.map(c => c.toUpperCase()).includes(toHex(val))) { setExtraError("Color already in palette."); return; }
    setExtraColors(p => [...p, toHex(val)]);
    setExtraInput(""); setExtraError("");
  };

  const removeExtraColor = (i: number) => setExtraColors(p => p.filter((_, j) => j !== i));

  const hasColors   = customColors.length > 0;
  const accent0     = hasColors ? customColors[0] : "#0078D4";
  const palette     = useMemo(() => build603010(customColors, scheme), [customColors, scheme]);
  const fullPalette = useMemo(() => [...palette, ...extraColors], [palette, extraColors]);
  const isDark      = canvasMode === "dark";
  const bg          = useMemo(() => isDark ? "#36454F" : (hasColors ? genBg(palette[0]) : "#F5F6FA"), [palette, hasColors, isDark]);
  const previewPalette = useMemo(() => isDark ? palette.map(c => lightenForDark(c)) : palette, [palette, isDark]);
  const a11y        = useMemo(() => runA11y(fullPalette, isDark ? "#36454F" : bg), [fullPalette, bg, isDark]);

  const themeOptions: ThemeOptions = useMemo(() => ({
    fontFamily, baseFontSize, cardCalloutSize, tableHeaderSize, altRowShading, slicerItemSize, darkCanvas: isDark, darkCanvasStyle,
  }), [fontFamily, baseFontSize, cardCalloutSize, tableHeaderSize, altRowShading, slicerItemSize, isDark, darkCanvasStyle]);

  const json        = useMemo(() => hasColors ? buildJSON(fullPalette, name, 10, themeOptions) : {}, [fullPalette, name, hasColors, themeOptions]);
  const jsonStr     = useMemo(() => hasColors ? JSON.stringify(json, null, 2) : "// Add at least one Dominant color to generate theme JSON.", [json, hasColors]);

  const { dom, sec, acc, hue } = calcSlots();
  const accentColor = palette[dom + sec] || palette[palette.length - 1];

  const copyJSON = async () => { await navigator.clipboard.writeText(jsonStr); setCopied(true); setTimeout(() => setCopied(false), 2400); };
  const download = () => {
    if (!hasColors) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([jsonStr], { type: "application/json" }));
    a.download = `${(name || "theme").replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
  };

  const slotMeta: SlotMeta[] = [
    { role: "DOMINANT",  hint: "Base for 60% family", dot: "#3B82F6" },
    { role: "SECONDARY", hint: "Base for 30% family", dot: "#10B981" },
    { role: "ACCENT",    hint: "10% highlight color", dot: "#8B5CF6" },
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      <AppHeader hasColors={hasColors} palette={palette} dom={dom} sec={sec} />

      <div className="max-w-[1400px] mx-auto p-4 grid grid-cols-1 lg:grid-cols-[280px_1fr_260px] gap-3.5">
        {/* Column 1 — Theme Setup */}
        <div className="flex flex-col gap-2.5 order-2 lg:order-1">
          <ThemeSettingsPanel name={name} setName={setName} />
          <AIColorSuggester onColorSuggested={handleAISuggestion} accent0={accent0} />
          <PrimaryColorsPanel
            customColors={customColors} customInput={customInput} inputError={inputError}
            slotMeta={slotMeta} hasColors={hasColors} accentColor={accentColor} accent0={accent0}
            addColor={addColor} removeColor={removeColor} setCustomInput={setCustomInput} setInputError={setInputError}
          />
          <ExtendedPalettePanel
            extraColors={extraColors} extraInput={extraInput} extraError={extraError} palette={palette}
            addExtraColor={addExtraColor} removeExtraColor={removeExtraColor} setExtraInput={setExtraInput} setExtraError={setExtraError}
          />
          <ColorHarmonyPanel scheme={scheme} setScheme={setScheme} />

          {hasColors && (
            <div className="panel-card">
              <div className="panel-title"><span>🔢</span> Structure</div>
              <div className="section-label">VIEW</div>
              <select
                value={structureView}
                onChange={e => setStructureView(e.target.value as "chart" | "data")}
                className="color-input cursor-pointer"
                style={{ textTransform: "none" }}
              >
                <option value="chart">Chart Colors</option>
                <option value="data">Data Colors</option>
              </select>
              <div className="text-[10px] text-muted-foreground mt-1.5">
                Shown below the dashboard preview.
              </div>
            </div>
          )}
        </div>

        {/* Column 2 — Preview (sticky) */}
        <div className="flex flex-col gap-3 order-1 lg:order-2">
          <div className="lg:sticky lg:top-4">
            <TabBar tab={tab} setTab={setTab} accent0={accent0} canvasMode={canvasMode} setCanvasMode={setCanvasMode} />

            <div className="mt-3">
              {!hasColors && <EmptyState />}

              {tab === "preview" && hasColors && (
                <DashboardPreview bg={bg} palette={previewPalette} dom={dom} sec={sec} accentColor={isDark ? lightenForDark(accentColor) : accentColor} name={name} isDark={isDark} />
              )}

              {tab === "json" && (
                <JSONViewer
                  jsonStr={jsonStr} hasColors={hasColors} copied={copied} name={name} accent0={accent0}
                  copyJSON={copyJSON} download={download} dom={dom} sec={sec} palette={palette}
                />
              )}
            </div>

            {hasColors && (
              <div className="mt-3">
                {structureView === "chart" && (
                  <GeneratedColorsChips palette={palette} />
                )}
                {structureView === "data" && (
                  <DataColorsStructurePanel
                    palette={palette}
                    dom={dom}
                    sec={sec}
                    acc={acc}
                    hue={hue}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Column 3 — Typography & Export */}
        <div className="flex flex-col gap-2.5 order-3">
          <TypographyPanel
            fontFamily={fontFamily} setFontFamily={setFontFamily}
            baseFontSize={baseFontSize} setBaseFontSize={setBaseFontSize}
          />
          <VisualStylePanel
            cardCalloutSize={cardCalloutSize} setCardCalloutSize={setCardCalloutSize}
            tableHeaderSize={tableHeaderSize} setTableHeaderSize={setTableHeaderSize}
            altRowShading={altRowShading} setAltRowShading={setAltRowShading}
            slicerItemSize={slicerItemSize} setSlicerItemSize={setSlicerItemSize}
            isDark={isDark}
            darkCanvasStyle={darkCanvasStyle} setDarkCanvasStyle={setDarkCanvasStyle}
          />
          <ExportButtons hasColors={hasColors} copied={copied} accent0={accent0} copyJSON={copyJSON} download={download} />

          {/* Collapsible a11y status */}
          {hasColors && (
            <Collapsible open={a11yOpen} onOpenChange={setA11yOpen}>
              <div className={`panel-card ${a11y.length === 0 ? 'border-[hsl(var(--success))]/30' : 'border-destructive/30'}`}>
                <CollapsibleTrigger className="w-full flex items-center justify-between cursor-pointer bg-transparent border-none p-0">
                  {a11y.length === 0
                    ? <span className="text-[11px] font-semibold text-[hsl(var(--success))]">✅ All WCAG checks passed</span>
                    : <span className="text-[11px] font-semibold text-destructive">⚠ {a11y.length} contrast issue{a11y.length > 1 ? "s" : ""} detected</span>
                  }
                  {a11y.length > 0 && (
                    <span className="text-[10px] text-muted-foreground">
                      {a11yOpen ? "Hide" : "Show"} details
                    </span>
                  )}
                </CollapsibleTrigger>
                {a11y.length > 0 && (
                  <CollapsibleContent>
                    <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
                      {a11y.map((check, i) => (
                        <div key={i} className="text-[10px] text-destructive/80 leading-relaxed">• {check.label} — ratio {check.ratio.toFixed(1)}:1 {check.pass ? "✓" : "✗"}</div>
                      ))}
                    </div>
                  </CollapsibleContent>
                )}
              </div>
            </Collapsible>
          )}
        </div>
      </div>
    </div>
  );
}
