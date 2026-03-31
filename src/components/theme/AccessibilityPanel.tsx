import { useState } from "react";
import type { A11yCheck } from "@/lib/colorUtils";

const TooltipIcon = ({ text }: { text: string }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-flex items-center" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <span className="w-3.5 h-3.5 rounded-full bg-muted border border-border flex items-center justify-center text-[9px] text-muted-foreground cursor-help shrink-0">?</span>
      {show && (
        <div className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 bg-foreground text-card rounded-lg px-3 py-2 text-[10.5px] leading-relaxed whitespace-pre-wrap min-w-[220px] max-w-[280px] z-50 shadow-lg pointer-events-none">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-foreground" />
        </div>
      )}
    </div>
  );
};

interface Props {
  hasColors: boolean;
  a11y: A11yCheck[];
}

export const AccessibilityPanel = ({ hasColors, a11y }: Props) => (
  <div className="panel-card">
    <div className="flex items-center gap-1.5 mb-2.5">
      <span className="font-bold text-sm text-card-foreground">♿ WCAG Accessibility</span>
      <TooltipIcon text={"WCAG 2.1 contrast requirements:\n• 4.5:1 — normal text (AA)\n• 3.0:1 — large text / UI elements\n• 2.5:1 — chart colors on background\n\nFailing colors may be hard to read for\nusers with visual impairments."} />
    </div>
    {!hasColors ? (
      <div className="text-[10.5px] text-muted-foreground/50 italic">Generate a palette to run checks</div>
    ) : a11y.length === 0 ? (
      <div className="flex items-center gap-2 bg-success-muted border border-success/20 rounded-lg p-2.5">
        <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center shrink-0 text-success-foreground text-[11px] font-bold">✓</div>
        <div className="text-[11px] text-success font-semibold">All contrast checks passed</div>
      </div>
    ) : (
      <div className="flex flex-col gap-1.5">
        {a11y.map((c, i) => (
          <div key={i} className="flex gap-2 items-start bg-danger-muted border border-destructive/20 rounded-lg p-2">
            <div className="w-4.5 h-4.5 rounded-full bg-destructive/40 flex items-center justify-center shrink-0 text-destructive-foreground text-[10px] font-bold mt-0.5">!</div>
            <div>
              <div className="text-[10.5px] text-destructive font-semibold leading-snug">{c.label}</div>
              <div className="text-[9.5px] text-destructive/80 mt-0.5">Ratio {c.ratio}:1 — needs ≥ {c.req}:1</div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
