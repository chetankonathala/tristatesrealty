"use client";

import { cn } from "@/lib/utils";

const STATES = [
  { label: "All Communities", value: null },
  { label: "Delaware", value: "DE" },
  { label: "Maryland", value: "MD" },
  { label: "New Jersey", value: "NJ" },
  { label: "Pennsylvania", value: "PA" },
] as const;

interface CommunityStateFilterProps {
  selected: string | null;
  onFilterChange: (state: string | null) => void;
}

export function CommunityStateFilter({
  selected,
  onFilterChange,
}: CommunityStateFilterProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Filter by state"
      className="flex flex-nowrap gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      {STATES.map(({ label, value }) => {
        const isActive = selected === value;
        return (
          <button
            key={label}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onFilterChange(value)}
            className={cn(
              "inline-flex shrink-0 items-center rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.05em] cursor-pointer transition-colors select-none whitespace-nowrap font-[family-name:var(--font-montserrat)]",
              isActive
                ? "bg-accent/20 text-accent border-accent"
                : "bg-card text-muted-foreground border-border hover:border-accent/50"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
