"use client";
import { useQueryState, parseAsStringEnum } from "nuqs";
import { Map as MapIcon, List, Columns } from "lucide-react";
import { cn } from "@/lib/utils";

export function ViewToggle() {
  const [view, setView] = useQueryState("view", parseAsStringEnum(["map", "list", "split"]).withDefault("split"));
  const options = [
    { value: "map" as const, label: "Map", icon: MapIcon },
    { value: "list" as const, label: "List", icon: List },
    { value: "split" as const, label: "Split", icon: Columns },
  ];
  return (
    <div className="inline-flex rounded-md border border-border bg-card p-1" role="tablist" aria-label="View mode">
      {options.map((o) => {
        const Icon = o.icon;
        const active = view === o.value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-pressed={active}
            aria-label={`${o.label} view`}
            onClick={() => setView(o.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-sm transition-colors",
              active ? "text-accent border-b-2 border-accent" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden lg:inline">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
