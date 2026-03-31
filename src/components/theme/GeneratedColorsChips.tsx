import { selectBalanced10 } from "@/lib/colorUtils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  palette: string[];
}

export const GeneratedColorsChips = ({ palette }: Props) => {
  const balanced = selectBalanced10(palette);

  return (
    <div className="panel-card">
      <div className="panel-title"><span>🎨</span> Chart Colors Used in Power BI</div>
      <TooltipProvider delayDuration={100}>
        <div className="flex flex-wrap gap-1.5">
          {balanced.map((c, i) => (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 border border-border/50 bg-muted/30 cursor-default hover:border-primary/30 transition-colors">
                  <div
                    className="w-5 h-5 rounded-md border border-foreground/10 shrink-0"
                    style={{ background: c }}
                  />
                  <span className="text-[10px] font-mono font-semibold text-card-foreground uppercase">{c}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs font-mono">
                {c}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
};
