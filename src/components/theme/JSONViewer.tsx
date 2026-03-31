interface Props {
  jsonStr: string;
  hasColors: boolean;
  copied: boolean;
  name: string;
  accent0: string;
  copyJSON: () => void;
  download: () => void;
  dom: number;
  sec: number;
  palette: string[];
}

export const JSONViewer = ({
  jsonStr, hasColors, copied, name, accent0, copyJSON, download, dom, sec, palette,
}: Props) => (
  <div className="rounded-xl p-5 shadow-sm" style={{ background: "hsl(var(--code-bg))" }}>
    <div className="flex justify-between items-center mb-3.5">
      <div>
        <div className="text-[11px] font-mono" style={{ color: "hsl(var(--code-foreground) / 0.38)" }}>
          📄 {(name || "theme").replace(/\s+/g, "-").toLowerCase()}.json
        </div>
        {hasColors && (
          <div className="text-[9.5px] mt-0.5" style={{ color: "hsl(var(--code-foreground) / 0.18)" }}>
            {jsonStr.split("\n").length} lines · {palette.length} dataColors ({dom}/{sec}/1) · textClasses · semantic · gradient
          </div>
        )}
      </div>
      {hasColors && (
        <div className="flex gap-2">
          <button
            onClick={copyJSON}
            className="border-none rounded-md px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-all"
            style={{ background: copied ? "hsl(var(--success))" : accent0, color: "#fff" }}
          >{copied ? "✓ Copied" : "Copy"}</button>
          <button
            onClick={download}
            className="rounded-md px-3.5 py-1.5 text-xs font-semibold cursor-pointer"
            style={{ background: "rgba(255,255,255,.07)", color: "#fff", border: "1px solid rgba(255,255,255,.15)" }}
          >Download</button>
        </div>
      )}
    </div>
    <pre className="font-mono text-[11px] overflow-auto max-h-[620px] m-0 leading-relaxed" style={{ color: "hsl(var(--code-foreground))" }}>
      {jsonStr}
    </pre>
  </div>
);
