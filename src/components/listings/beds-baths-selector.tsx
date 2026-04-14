"use client";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { label: "Any", value: 0 },
  { label: "1+", value: 1 },
  { label: "2+", value: 2 },
  { label: "3+", value: 3 },
  { label: "4+", value: 4 },
  { label: "5+", value: 5 },
];

interface SegmentedProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
}

export function BedsBathsSelector({ label, value, onChange }: SegmentedProps) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="flex gap-1 rounded-md border border-border p-1 bg-card">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={value === opt.value}
            className={cn(
              "flex-1 rounded-sm px-3 py-1.5 text-sm transition-colors",
              value === opt.value
                ? "bg-accent/15 text-accent font-bold"
                : "text-foreground hover:bg-muted"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
