interface Props {
  hasColors: boolean;
  copied: boolean;
  accent0: string;
  copyJSON: () => void;
  download: () => void;
}

export const ExportButtons = ({ hasColors, copied, accent0, copyJSON, download }: Props) => (
  <div className="flex flex-col gap-2">
    <button
      onClick={copyJSON}
      disabled={!hasColors}
      className="btn-primary w-full py-3 text-sm"
      style={hasColors ? {
        background: copied ? "hsl(var(--success))" : accent0,
        boxShadow: `0 2px 10px ${accent0}44`,
      } : undefined}
    >
      {copied ? "✓ Copied to Clipboard!" : "📋 Copy JSON"}
    </button>
    <button
      onClick={download}
      disabled={!hasColors}
      className="btn-outline w-full py-2.5"
    >
      ⬇ Download .json
    </button>
  </div>
);
