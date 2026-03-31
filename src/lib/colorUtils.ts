// ─────────────────────────────────────────────────────────────────────────────
// Color Utilities — ALL LOGIC PRESERVED EXACTLY
// ─────────────────────────────────────────────────────────────────────────────

export const toHex = (raw: string) => `#${raw.replace("#", "").toUpperCase().padStart(6, "0")}`;

export const hexToRgb = (hex: string) => {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
};

export const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (mx + mn) / 2;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    if (mx === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (mx === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
};

export const hslToHex = (h: number, s: number, l: number) => {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s));
  l = Math.max(0, Math.min(100, l));
  const sl = s / 100, ll = l / 100;
  const a = sl * Math.min(ll, 1 - ll);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)))
      .toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
};

export const hexToHsl = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsl(r, g, b);
};

export const isValid = (hex: string) => /^#?[0-9A-Fa-f]{6}$/.test(hex.replace("#", ""));
export const isNearBlack = (hex: string) => hexToHsl(hex).l < 8;   // relaxed: true black only
export const isNearWhite = (hex: string) => hexToHsl(hex).l > 97;  // relaxed: true white only

export const getLum = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  const c = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b);
};

export const wcagRatio = (a: string, b: string) => {
  const l1 = getLum(a), l2 = getLum(b);
  return +((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2);
};

export const ensureContrast = (txt: string, bg: string) => {
  if (wcagRatio(txt, bg) >= 4.5) return txt;
  const { h, s, l } = hexToHsl(txt);
  const step = getLum(bg) > 0.5 ? -5 : 5;
  let nl = l;
  for (let i = 0; i < 20; i++) {
    nl = Math.max(0, Math.min(100, nl + step));
    const c = hslToHex(h, s, nl);
    if (wcagRatio(c, bg) >= 4.5) return c;
  }
  return getLum(bg) > 0.5 ? "#111111" : "#FFFFFF";
};

// ─── Dual-Canvas Visibility ───────────────────────────────────────────────────
// The Power BI dark canvas background used throughout this app.
export const DARK_CANVAS_BG = "#36454F";

/**
 * Ensures a color has ≥ minRatio contrast on BOTH white (#FFFFFF) and the
 * dark canvas (#36454F).  Colors that are too dark blend into the dark canvas;
 * colors that are too light vanish on white cards.  The fix adjusts Lightness
 * only — Hue and Saturation are always preserved.
 *
 * Strategy:
 *  • Too dark for dark canvas  → nudge L UP until both canvases pass
 *  • Too light for white cards → nudge L DOWN until both canvases pass
 *  • Already fine              → return as-is (zero change)
 */
export const ensureDualVisible = (hex: string, minRatio = 3.0): string => {
  const onWhite = wcagRatio(hex, "#FFFFFF");
  const onDark  = wcagRatio(hex, DARK_CANVAS_BG);
  if (onWhite >= minRatio && onDark >= minRatio) return hex; // already safe

  const { h, s, l } = hexToHsl(hex);

  if (onDark < minRatio) {
    // Colour is too dark — increase L until it passes on dark canvas AND white
    for (let nl = l + 1; nl <= 90; nl++) {
      const c = hslToHex(h, s, nl);
      if (wcagRatio(c, "#FFFFFF") >= minRatio && wcagRatio(c, DARK_CANVAS_BG) >= minRatio) return c;
    }
  } else {
    // Colour is too light — decrease L until it passes on white AND dark canvas
    for (let nl = l - 1; nl >= 10; nl--) {
      const c = hslToHex(h, s, nl);
      if (wcagRatio(c, "#FFFFFF") >= minRatio && wcagRatio(c, DARK_CANVAS_BG) >= minRatio) return c;
    }
  }
  // Absolute fallback: mid-tone always visible on both
  return hslToHex(h, Math.max(s, 30), 58);
};

export const genBg      = (hex: string) => { const { h, s } = hexToHsl(hex); return hslToHex(h, Math.max(s * 0.18, 3), 97.5).toUpperCase(); };
export const genAltRow  = (hex: string) => { const { h, s } = hexToHsl(hex); return hslToHex(h, Math.max(s * 0.1,  3), 96.5).toUpperCase(); };
export const genGradMin = (hex: string) => { const { h, s } = hexToHsl(hex); return hslToHex(h, Math.max(s * 0.2,  5), 93).toUpperCase(); };

// ─────────────────────────────────────────────────────────────────────────────
// Palette Generation
// ─────────────────────────────────────────────────────────────────────────────

export const SCHEME_INFO: Record<string, { label: string; desc: string }> = {
  complementary:      { label: "Complementary",      desc: "Opposite hue (180°) — strong contrast" },
  analogous:          { label: "Analogous",           desc: "Adjacent hue (30°) — harmonious feel" },
  splitComplementary: { label: "Split-Complementary", desc: "Near-opposite (150°) — balanced contrast" },
  triadic:            { label: "Triadic",             desc: "120° hue shift — vibrant variety" },
  tetradic:           { label: "Tetradic",            desc: "90° hue shift — rich 4-colour variety" },
  monochromatic:      { label: "Monochromatic",       desc: "Same hue, varied saturation and lightness" },
  neutral:            { label: "Neutral / Corporate", desc: "Desaturated grays anchored by brand color" },
};

export const calcSlots = () => ({ dom: 6, sec: 3, acc: 1, hue: 2, desat: 2 });

export const DOM_L_STEPS = [50, 40, 30, 62, 74, 88];
export const DOM_LABELS  = ["Base", "Dark", "Darker", "Light", "Lighter", "Pastel"];

const SEC_L_STEPS = [54, 38, 72];

const genDominant = (h: number, s: number) => {
  const sl = Math.max(Math.min(s, 76), 36);
  return DOM_L_STEPS.map(l => hslToHex(h, sl, l));
};

const genHueShifts = (h: number, s: number, l: number) => {
  const sl = Math.max(Math.min(s, 76), 36);
  const bl = Math.max(Math.min(l, 62), 36);
  return [hslToHex(h + 20, sl, bl), hslToHex(h - 20, sl, bl)];
};

const genDesatVariants = (h: number, s: number, l: number) => {
  const bl    = Math.max(Math.min(l, 62), 36);
  const desatS = s * 0.82;
  return [hslToHex(h, desatS, bl), hslToHex(h, desatS, Math.min(bl + 18, 72))];
};

const SCHEME_OFFSETS: Record<string, number> = {
  complementary: 180, analogous: 32, splitComplementary: 150,
  triadic: 120, tetradic: 90, monochromatic: 0,
};

const genSecondary = (domH: number, domS: number, _domL: number, scheme: string) => {
  if (scheme === "monochromatic") {
    const offsets = [10, -10, 5];
    const secS = Math.max(Math.min(domS * 0.75, 70), 30);
    return offsets.map((o, i) => hslToHex(domH + o, secS, SEC_L_STEPS[i]));
  }
  if (scheme === "neutral") {
    const secS = Math.max(domS * 0.15, 4);
    return SEC_L_STEPS.map(l => hslToHex(domH, secS, l));
  }
  const secH = domH + (SCHEME_OFFSETS[scheme] || 150);
  const sl   = Math.max(Math.min(domS * 0.88, 70), 30);
  return SEC_L_STEPS.map(l => hslToHex(secH, sl, l));
};

const genAccentColor = (domH: number, domS: number, domL: number, secH: number) => {
  const cand1H = domH + 90, cand2H = domH + 270;
  const d1 = Math.min(Math.abs(cand1H - secH) % 360, 360 - Math.abs(cand1H - secH) % 360);
  const d2 = Math.min(Math.abs(cand2H - secH) % 360, 360 - Math.abs(cand2H - secH) % 360);
  const accH = d1 >= d2 ? cand1H : cand2H;
  const accS = Math.max(Math.min(domS * 0.72, 64), 52);
  const accL = Math.max(Math.min(domL * 0.88 + 8, 58), 44);
  return ensureDualVisible(hslToHex(accH, accS, accL));
};

export const build603010 = (customColors: string[], scheme: string): string[] => {
  if (!customColors.length) return [];
  const normed = customColors.map(toHex);
  const { h: dh, s: ds, l: dl } = hexToHsl(normed[0]);

  const dominant = genDominant(dh, ds);

  let secondary: string[];
  if (normed[1]) {
    const { h: sh, s: ss } = hexToHsl(normed[1]);
    const sl = Math.max(Math.min(ss * 0.88, 70), 30);
    secondary = SEC_L_STEPS.map(l => hslToHex(sh, sl, l));
  } else {
    secondary = genSecondary(dh, ds, dl, scheme);
  }

  const accent = normed[2]
    ? [normed[2]]
    : [genAccentColor(dh, ds, dl, hexToHsl(secondary[0]).h)];

  const result = [
    ...dominant,
    ...secondary,
    ...accent,
    ...genHueShifts(dh, ds, dl),
    ...genDesatVariants(dh, ds, dl),
  ].map(toHex);

  return result.filter(c => !isNearBlack(c) && !isNearWhite(c)).slice(0, 14);
};

// ─────────────────────────────────────────────────────────────────────────────
// WCAG Accessibility Checks
// ─────────────────────────────────────────────────────────────────────────────

export interface A11yCheck {
  label: string;
  ratio: number;
  req: number;
  pass: boolean;
  warn?: boolean;
}

/**
 * Select 10 well-balanced colors from the full palette for Power BI dataColors.
 * Structure: domPrimary, secPrimary, accent, domDark, secDark, domMid, secMid, accentSoft, neutral, contrast
 * Indices in generated palette: 0-5 dominant, 6-8 secondary, 9 accent, 10-11 hue-shift, 12-13 desaturated
 *
/**
 * buildChartPalette — generates 10 perceptually spaced dataColors anchored
 * to the user's brand color.
 *
 * Strategy (same as Tableau 10 / D3 schemeCategory10):
 *   - 10 hues spaced 36° apart around the color wheel
 *   - Alternating order (0°, 180°, 72°, 252°...) so consecutive colors
 *     are always far apart — a 4-category pie never has two similar colors
 *   - All colors pass 3.0:1 on BOTH white and dark canvas via ensureDualVisible
 *   - Hue, saturation and lightness all anchor to the brand color
 *
 * The 60-30-10 palette (build603010) is preserved for the UI preview and
 * color chips — only the JSON dataColors use this perceptual palette.
 */
export const buildChartPalette = (dominantHex: string): string[] => {
  const { h: baseH, s: baseS } = hexToHsl(dominantHex);

  // Hue offsets — alternating opposite sides of the wheel so adjacent
  // colors always have maximum perceptual distance
  const hueOffsets    = [0, 180, 72, 252, 144, 36, 216, 108, 288, 324];

  // Slight saturation and lightness variation per slot for subtle depth
  const satVariations = [0, -5, +5, -8, +3, -3, +8, -10, +2, -6];
  const litVariations = [0, +3, -3, +5, -5, +2, -2, +4,  -4, +1];

  // Keep base saturation in a usable range
  const s = Math.max(Math.min(baseS, 70), 40);
  const baseLightness = 52; // mid-tone — visible on both canvases

  return hueOffsets.map((offset, i) => {
    const h   = baseH + offset;
    const sat = Math.max(Math.min(s + satVariations[i], 80), 35);
    const lit = baseLightness + litVariations[i];
    return ensureDualVisible(hslToHex(h, sat, lit));
  });
};

/**
 * selectBalanced10 — kept for WCAG validation panel which checks the
 * 60-30-10 palette. buildChartPalette is used for JSON dataColors.
 */
export const selectBalanced10 = (palette: string[]): string[] => {
  if (palette.length < 10) return palette.map(c => ensureDualVisible(c));

  const pick = (i: number) => ensureDualVisible(palette[Math.min(i, palette.length - 1)]);

  // Interleaved order — warm / cool / mid alternating so consecutive
  // colors always contrast each other in charts
  return [
    pick(0),   // dominant base     — warm
    pick(6),   // secondary         — cool (far hue)
    pick(9),   // accent            — mid hue
    pick(10),  // hue shift +20°    — warm variant
    pick(7),   // secondary dark    — cool variant
    pick(3),   // dominant light    — warm light
    pick(8),   // secondary mid     — cool light
    pick(1),   // dominant dark     — warm dark
    pick(12),  // desaturated       — muted
    pick(11),  // hue shift -20°    — opposite warm
  ];
};


export const runA11y = (palette: string[], bg: string): A11yCheck[] => {
  if (!palette.length || !bg) return [];
  const WHITE = "#FFFFFF";
  const checks: A11yCheck[] = [];

  const corrected = selectBalanced10(palette);

  // Use the correct body text color for the active canvas:
  // dark canvas → white text (#F5F5F5), light canvas → dark text (#2B2B2B)
  const bodyTextColor = getLum(bg) < 0.2 ? "#F5F5F5" : "#2B2B2B";
  const textBg = wcagRatio(bodyTextColor, bg);
  checks.push({ label: "Body text on page background", ratio: textBg, req: 4.5, pass: textBg >= 4.5 });

  const dom0White = wcagRatio(corrected[0], WHITE);
  checks.push({ label: "Dominant color on white card", ratio: dom0White, req: 3.0, pass: dom0White >= 3.0 });

  corrected.forEach((c, i) => {
    const onLight = wcagRatio(c, WHITE);
    const onDark  = wcagRatio(c, DARK_CANVAS_BG);
    if (onLight < 2.5)
      checks.push({ label: `dataColor[${i}] low contrast on light canvas (${c})`, ratio: onLight, req: 2.5, pass: false, warn: true });
    if (onDark < 2.5)
      checks.push({ label: `dataColor[${i}] low contrast on dark canvas (${c})`, ratio: onDark, req: 2.5, pass: false, warn: true });
  });

  const acc  = corrected[2];
  const accW = wcagRatio(acc, WHITE);
  checks.push({ label: "Accent color on white card", ratio: accW, req: 3.0, pass: accW >= 3.0 });

  return checks.filter(c => !c.pass);
};

// ─────────────────────────────────────────────────────────────────────────────
// JSON Builder
// ─────────────────────────────────────────────────────────────────────────────

export interface DesignTokens {
  brand: { dominant: string; secondary: string; accent: string };
  palette: { dominantDark: string; dominantMid: string; dominantLight: string; secondaryDark: string; secondaryMid: string; secondaryLight: string };
  semantic: { good: string; neutral: string; bad: string };
  surface: { background: string; card: string; altRow: string };
  text: { primary: string; secondary: string };
}

export const buildDesignTokens = (palette: string[]): DesignTokens => {
  const p0 = palette[0] || "#4472C4";
  return {
    brand: {
      dominant: p0,
      secondary: palette[6] || p0,
      accent: palette[9] || p0,
    },
    palette: {
      dominantDark: palette[1] || p0,
      dominantMid: palette[3] || p0,
      dominantLight: palette[4] || p0,
      secondaryDark: palette[7] || p0,
      secondaryMid: palette[8] || p0,
      secondaryLight: palette[6] || p0,
    },
    semantic: { good: "#1AAB40", neutral: "#FFB900", bad: "#D13438" },
    surface: { background: genBg(p0), card: "#FFFFFF", altRow: genAltRow(p0) },
    text: { primary: "#2B2B2B", secondary: "#595959" },
  };
};

/**
 * Adjusts a colour for dark-canvas mode.
 * Old approach: naively added +12 L (not enough for dark palette entries).
 * New approach: first makes the colour dual-safe via ensureDualVisible, then
 * nudges L a little higher within the safe zone for a crisper dark-mode look,
 * while guaranteeing the colour is still readable on white cards too.
 */
export const lightenForDark = (hex: string): string => {
  // Step 1 — ensure at least 2.5:1 on both canvases
  const safe = ensureDualVisible(hex);
  // Step 2 — try to brighten slightly for dark-canvas aesthetics (max +8 L)
  const { h, s, l } = hexToHsl(safe);
  for (let nl = l + 1; nl <= Math.min(l + 8, 85); nl++) {
    const c = hslToHex(h, Math.max(s - 3, 10), nl);
    if (wcagRatio(c, "#FFFFFF") >= 2.5 && wcagRatio(c, DARK_CANVAS_BG) >= 2.5) return c;
  }
  return safe;
};

export interface ThemeOptions {
  fontFamily?: string;
  baseFontSize?: number;
  cardCalloutSize?: number;
  tableHeaderSize?: number;
  altRowShading?: boolean;
  slicerItemSize?: number;
  darkCanvas?: boolean;
  // elevated  = slightly lighter card floats above page (safe default)
  // inset     = slightly darker card recessed into page (professional/financial)
  // frameless = fully transparent, visuals sit directly on dark page (designer)
  darkCanvasStyle?: "elevated" | "inset" | "frameless";
}

export const buildJSON = (palette: string[], name: string, _count: number, options?: ThemeOptions) => {
  if (!palette.length) return {};
  const { dom } = calcSlots();
  const isDark = options?.darkCanvas === true;
  const darkStyle = options?.darkCanvasStyle ?? "elevated";

  // Chart palette — perceptually spaced 10 hues anchored to brand color
  // Guarantees every category in a pie/bar/line is distinguishable
  const chartPalette = buildChartPalette(palette[0]).map(c => isDark ? lightenForDark(c) : c);

  // Keep the 60-30-10 balanced palette for non-dataColors uses (tableAccent etc.)
  const balanced = selectBalanced10(palette).map(c => isDark ? lightenForDark(c) : c);
  const tokens = buildDesignTokens(palette);
  const solid = (c: string) => ({ solid: { color: toHex(c) } });

  const ff          = options?.fontFamily    || "Segoe UI";
  const bfs         = options?.baseFontSize  || 10;
  const calloutSize = options?.cardCalloutSize || 28;
  const headerSize  = options?.tableHeaderSize || 11;
  const altRow      = options?.altRowShading !== false;
  const slicerSize  = options?.slicerItemSize || 10;

  const canvasBg    = isDark ? "#36454F" : tokens.surface.background;
  const canvasFg    = isDark ? "#F5F5F5" : tokens.text.primary;
  const canvasSecFg = isDark ? "#D4D4D4" : tokens.text.secondary;

  // ─── Dark canvas visual card color based on chosen style ───────────────────
  // elevated:  #3D5260 — 1 step lighter than page, card floats above
  // inset:     #2C3A44 — 1 step darker than page, card recessed into page
  // frameless: fully transparent — no card at all
  const darkCardBg     = darkStyle === "inset" ? "#2C3A44" : "#3D5260";
  const darkCardTransp = darkStyle === "frameless" ? 100 : 0;

  // Table row backgrounds follow the same logic
  const darkRowBg    = darkStyle === "frameless" ? canvasBg : darkCardBg;
  const darkAltRowBg = darkStyle === "inset"     ? "#36454F" : (darkStyle === "frameless" ? canvasBg : "#36454F");

  // Table / matrix header: always slightly darker than card for separation
  const darkHeaderBg = darkStyle === "frameless" ? "#2C3A44" : (darkStyle === "inset" ? "#1E2D35" : "#2C3A44");

  return {
    name: name || "Generated Theme",
    dataColors: chartPalette,
    background: canvasBg,
    foreground: canvasFg,
    tableAccent: tokens.brand.dominant,
    good:    tokens.semantic.good,
    neutral: tokens.semantic.neutral,
    bad:     tokens.semantic.bad,
    // ── Semantic color range tokens (top-level affects ALL visuals) ──────────
    maximum: toHex(tokens.brand.dominant),
    center:  toHex(tokens.semantic.neutral),
    minimum: isDark ? "#D0E4F5" : toHex(tokens.palette.dominantLight),
    // ── textClasses — CRITICAL: Power BI uses this as the global text ────────
    // color fallback for ANY text not explicitly set in visualStyles.
    // Without color here, Power BI defaults every unset text to black —
    // which is why axis titles, data labels, tooltips show black on dark canvas.
    textClasses: {
      callout: { fontFace: ff, fontSize: Math.round(bfs * 2.5), color: canvasFg },
      title:   { fontFace: ff, fontSize: bfs + 2,               color: canvasFg },
      header:  { fontFace: ff, fontSize: bfs + 1,               color: canvasFg },
      label:   { fontFace: ff, fontSize: bfs,                   color: canvasFg },
    },
    // ── Top-level theme tokens — explicit for both canvas modes ─────────────
    // These control neutral text, surface colors, and hyperlinks throughout
    // the Power BI UI. Being explicit prevents version-to-version PBI defaults
    // from changing the look of deployed reports.
    foregroundNeutralSecondary: isDark ? canvasSecFg        : "#605E5C",
    foregroundNeutralTertiary:  isDark ? "#979593"          : "#A19F9D",
    backgroundLight:            isDark ? darkCardBg         : "#F3F2F1",
    backgroundNeutral:          isDark ? "#605E5C"          : "#C8C6C4",
    hyperlink:                  toHex(tokens.brand.dominant),
    visitedHyperlink:           toHex(tokens.palette.dominantLight),
    visualStyles: {
      // ── Global wildcard — applies to every visual ────────────────────────
      "*": { "*": {
        background:    [{ color: solid(isDark ? darkCardBg : tokens.surface.card), transparency: isDark ? darkCardTransp : 0 }],
        title:         [{ show: true, fontColor: solid(canvasFg), bold: true, fontSize: bfs + 2, fontFamily: ff, background: solid(isDark ? darkCardBg : tokens.surface.card) }],
        border:        [{ show: false }],
        // Shadow — only on light canvas where white cards need depth against near-white page
        // Dark canvas: card color provides separation — shadow creates noise
        dropShadow:    [{ show: !isDark, color: { solid: { color: "#000000" } }, transparency: 94, angle: 90, distance: 2, size: 8 }],
        padding:       [{ top: 12, right: 12, bottom: 12, left: 12 }],
        // Rounded corners — 8px on all visuals regardless of canvas mode
        // Matches modern Power BI, Tableau, Looker aesthetic
        // visualBorder show:true activates rounded corners in Power BI
        // Border color matches the PAGE background (not card) so the rounded
        // corner cuts cleanly into the canvas — sharpest possible edge definition
        visualBorder:  [{ show: true, color: solid(canvasBg), radius: isDark ? 12 : 8 }],
        // Visual header — controls the ... menu area and title bar on each visual
        visualHeader:  [{ foreground: solid(canvasFg), border: solid(isDark ? darkCardBg : tokens.surface.card), background: solid(isDark ? darkCardBg : tokens.surface.card) }],
        // Outspace pane — the area outside the report page
        outspacePane:  [{ backgroundColor: solid(canvasBg), foregroundColor: solid(canvasFg), transparency: 0, border: true, borderColor: solid(isDark ? "#4A5F6E" : "#E5E7EB") }],
        // Filter pane cards
        filterCard:    [
          { $id: "Applied",   transparency: 0, foregroundColor: solid(canvasFg), backgroundColor: solid(isDark ? "#605E5C" : "#F3F4F6"), inputBoxColor: solid(isDark ? "#605E5C" : "#FFFFFF"), borderColor: solid(isDark ? "#979593" : "#D1D5DB"), border: true },
          { $id: "Available", transparency: 0, foregroundColor: solid(canvasFg), backgroundColor: solid(isDark ? darkCardBg : tokens.surface.card), inputBoxColor: solid(isDark ? darkCardBg : "#FFFFFF"), borderColor: solid(isDark ? "#4A5F6E" : "#D1D5DB"), border: true },
        ],
        // Text — all labels, axes, legends switch with canvas mode
        labels:        [{ color: solid(canvasFg),    fontSize: bfs, fontFamily: ff }],
        dataLabel:     [{ color: solid(canvasFg),    fontSize: bfs, fontFamily: ff }],
        categoryLabel: [{ color: solid(canvasFg),    fontSize: bfs, fontFamily: ff }],
        legend:        [{ labelColor: solid(canvasFg),    fontSize: bfs, fontFamily: ff }],
        axisTitle:     [{ color: solid(canvasSecFg), fontSize: bfs, fontFamily: ff }],
        xAxis:         [{ labelColor: solid(canvasSecFg), titleColor: solid(canvasSecFg), fontSize: bfs, fontFamily: ff }],
        yAxis:         [{ labelColor: solid(canvasSecFg), titleColor: solid(canvasSecFg), fontSize: bfs, fontFamily: ff }],
        valueAxis:     [{ labelColor: solid(canvasSecFg), titleColor: solid(canvasSecFg), fontSize: bfs, fontFamily: ff }],
        categoryAxis:  [{ labelColor: solid(canvasSecFg), titleColor: solid(canvasSecFg), fontSize: bfs, fontFamily: ff }],
      }},
      // ── Explicit axis title overrides for common chart types ─────────────
      // Power BI does not always inherit axisTitle from the wildcard for
      // bar/column/line charts — setting them explicitly guarantees white
      // axis titles on dark canvas and dark titles on light canvas.
      barChart:    { "*": { valueAxis: [{ labelColor: solid(canvasSecFg), titleColor: solid(canvasSecFg) }], categoryAxis: [{ labelColor: solid(canvasSecFg), titleColor: solid(canvasSecFg) }] }},
      columnChart: { "*": { valueAxis: [{ labelColor: solid(canvasSecFg), titleColor: solid(canvasSecFg) }], categoryAxis: [{ labelColor: solid(canvasSecFg), titleColor: solid(canvasSecFg) }] }},
      lineChart:   { "*": { valueAxis: [{ labelColor: solid(canvasSecFg), titleColor: solid(canvasSecFg) }], categoryAxis: [{ labelColor: solid(canvasSecFg), titleColor: solid(canvasSecFg) }] }},
      areaChart:   { "*": { valueAxis: [{ labelColor: solid(canvasSecFg), titleColor: solid(canvasSecFg) }], categoryAxis: [{ labelColor: solid(canvasSecFg), titleColor: solid(canvasSecFg) }] }},
      scatterChart:{ "*": { xAxis:     [{ labelColor: solid(canvasSecFg), titleColor: solid(canvasSecFg) }], yAxis:         [{ labelColor: solid(canvasSecFg), titleColor: solid(canvasSecFg) }] }},
      // ── Page ────────────────────────────────────────────────────────────
      page: { "*": {
        background: [{ color: solid(canvasBg), transparency: 0 }],
        outspace:   [{ color: solid(canvasBg) }],
      }},
      // ── Card visual ─────────────────────────────────────────────────────
      // Power BI Card visual has its own internal layers that override the
      // wildcard. Must be explicitly set here to eliminate nested rectangles.
      card: { "*": {
        calloutValue:  [{ color: solid(isDark ? lightenForDark(tokens.brand.dominant) : tokens.brand.dominant), fontSize: calloutSize, fontFamily: ff, bold: true }],
        categoryLabel: [{ color: solid(canvasSecFg), fontSize: bfs, fontFamily: ff }],
        background:    [{ color: solid(isDark ? darkCardBg : tokens.surface.card), transparency: 100 }],
        visualHeader:  [{ show: false }],
        border:        [{ show: false }],
        visualBorder:  [{ show: true, color: solid(canvasBg), radius: isDark ? 12 : 8 }],
      }},
      // ── Table ───────────────────────────────────────────────────────────
      tableEx: { "*": {
        header:  [{ fontColor: solid(canvasFg), bold: true, fontSize: headerSize, fontFamily: ff, backgroundColor: solid(isDark ? darkHeaderBg : canvasBg) }],
        rows:    [{ fontColor: solid(canvasFg), fontSize: bfs, backgroundColor: solid(isDark ? darkRowBg : tokens.surface.card), altBackgroundEnabled: altRow, altBackgroundColor: solid(isDark ? darkAltRowBg : tokens.surface.altRow) }],
        outline: [{ color: solid(tokens.brand.dominant), weight: 2 }],
      }},
      // ── Matrix ──────────────────────────────────────────────────────────
      matrix: { "*": {
        header: [{ fontColor: solid(canvasFg), bold: true, fontSize: headerSize, backgroundColor: solid(isDark ? darkHeaderBg : canvasBg) }],
      }},
      // ── Slicer ──────────────────────────────────────────────────────────
      slicer: { "*": {
        header:            [{ fontColor: solid(canvasFg), bold: true, fontSize: headerSize }],
        items:             [{ fontColor: solid(canvasFg), fontSize: slicerSize, background: solid(isDark ? darkCardBg : tokens.surface.card) }],
        background:        [{ color: solid(isDark ? darkCardBg : tokens.surface.card), transparency: isDark ? darkCardTransp : 0 }],
        numericInputStyle: [{ background: solid(isDark ? darkCardBg : tokens.surface.card) }],
      }},
      // ── Key Influencers ──────────────────────────────────────────────────
      keyDriversVisual: { "*": {
        keyInfluencersVisual: [{ canvasColor: solid(isDark ? darkCardBg : tokens.surface.background) }],
      }},
      // ── Gauge ────────────────────────────────────────────────────────────
      // maximum/minimum/center are set at top level above — more reliable.
      // Only target needs to be in visualStyles.
      gauge: { "*": {
        target: [{ color: solid(palette[dom] || tokens.brand.dominant) }],
      }},
      // ── KPI ─────────────────────────────────────────────────────────────
      kpi: { "*": { indicator: [{ color: solid(tokens.brand.dominant) }] }},
    },
  };
};
