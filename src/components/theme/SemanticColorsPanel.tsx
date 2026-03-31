export const SemanticColorsPanel = () => (
  <div className="panel-card">
    <div className="panel-title"><span>📊</span> Semantic Colors</div>
    <div className="flex gap-1.5">
      {([["Good", "#1AAB40"], ["Neutral", "#FFB900"], ["Bad", "#D13438"]] as const).map(([l, c]) => (
        <div
          key={l}
          className="flex-1 rounded-lg p-2 text-center"
          style={{ border: `1.5px solid ${c}44`, background: c + "0E" }}
        >
          <div className="w-4 h-4 rounded mx-auto mb-1" style={{ background: c }} />
          <div className="text-[9px] font-bold" style={{ color: c }}>{l}</div>
          <div className="text-[7.5px] text-muted-foreground font-mono">{c}</div>
        </div>
      ))}
    </div>
  </div>
);
