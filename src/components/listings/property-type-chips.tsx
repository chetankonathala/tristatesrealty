"use client";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const TYPES = [
  { label: "House", value: "residential" },
  { label: "Condo", value: "condominium" },
  { label: "Townhouse", value: "townhouse" },
  { label: "Multi-Family", value: "multifamily" },
  { label: "Land", value: "land" },
];

interface PropertyTypeChipsProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function PropertyTypeChips({ selected, onChange }: PropertyTypeChipsProps) {
  const toggle = (v: string) => {
    if (selected.includes(v)) onChange(selected.filter((s) => s !== v));
    else onChange([...selected, v]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {TYPES.map((t) => {
        const isOn = selected.includes(t.value);
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => toggle(t.value)}
            aria-pressed={isOn}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-colors",
              isOn
                ? "border-accent bg-accent/15 text-accent font-bold"
                : "border-border bg-card text-foreground hover:bg-muted"
            )}
          >
            {isOn && <Check className="h-3.5 w-3.5" />}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
