import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  tooltip?: string;
}

export const SliderWithInput = ({ label, value, onChange, min, max, tooltip }: Props) => {
  const [inputValue, setInputValue] = useState(String(value));

  useEffect(() => { setInputValue(String(value)); }, [value]);

  const commit = (raw: string) => {
    const n = Number(raw);
    if (!isNaN(n) && n >= min && n <= max) onChange(n);
    else setInputValue(String(value));
  };

  const content = (
    <div>
      <div className="section-label">{label}</div>
      <div className="flex items-center gap-2.5">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="flex-1 accent-primary h-1.5"
        />
        <input
          type="number"
          min={min}
          max={max}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onBlur={e => commit(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") commit((e.target as HTMLInputElement).value); }}
          className="w-12 h-7 rounded-md border border-input bg-background px-1.5 text-xs font-mono text-card-foreground text-center focus:outline-none focus:ring-1 focus:ring-ring/30"
        />
      </div>
    </div>
  );

  if (!tooltip) return content;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>{content}</div>
      </TooltipTrigger>
      <TooltipContent side="left" className="max-w-[200px] text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
};
