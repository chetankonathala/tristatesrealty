"use client";
import { useQueryStates, parseAsInteger, parseAsString, parseAsBoolean } from "nuqs";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ActiveFilterBar() {
  const [filters, setFilters] = useQueryStates({
    minPrice: parseAsInteger,
    maxPrice: parseAsInteger,
    minBeds: parseAsInteger,
    minBaths: parseAsInteger,
    type: parseAsString,
    cities: parseAsString,
    waterfront: parseAsBoolean,
    newConstruction: parseAsBoolean,
    garage: parseAsBoolean,
  }, { shallow: false });

  const chips: { label: string; clear: () => void }[] = [];
  if (filters.minPrice || filters.maxPrice) {
    chips.push({
      label: `$${filters.minPrice ?? 0}–$${filters.maxPrice ?? "∞"}`,
      clear: () => setFilters({ minPrice: null, maxPrice: null }),
    });
  }
  if (filters.minBeds) chips.push({ label: `${filters.minBeds}+ beds`, clear: () => setFilters({ minBeds: null }) });
  if (filters.minBaths) chips.push({ label: `${filters.minBaths}+ baths`, clear: () => setFilters({ minBaths: null }) });
  if (filters.type) {
    filters.type.split(",").filter(Boolean).forEach((t) => {
      chips.push({
        label: t,
        clear: () => {
          const next = (filters.type ?? "").split(",").filter((x) => x !== t).join(",");
          setFilters({ type: next || null });
        },
      });
    });
  }
  if (filters.cities) {
    filters.cities.split(",").filter(Boolean).forEach((c) => {
      chips.push({
        label: c,
        clear: () => {
          const next = (filters.cities ?? "").split(",").filter((x) => x !== c).join(",");
          setFilters({ cities: next || null });
        },
      });
    });
  }
  if (filters.waterfront) chips.push({ label: "Waterfront", clear: () => setFilters({ waterfront: null }) });
  if (filters.newConstruction) chips.push({ label: "New Construction", clear: () => setFilters({ newConstruction: null }) });
  if (filters.garage) chips.push({ label: "Garage", clear: () => setFilters({ garage: null }) });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b border-border bg-card/50">
      {chips.map((c, i) => (
        <span key={i} className="inline-flex items-center gap-1 rounded-full bg-accent/15 text-accent text-xs px-3 py-1 font-bold">
          {c.label}
          <button type="button" onClick={c.clear} aria-label={`Remove ${c.label}`}>
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="ml-auto text-xs"
        onClick={() => setFilters({ minPrice: null, maxPrice: null, minBeds: null, minBaths: null, type: null, cities: null, waterfront: null, newConstruction: null, garage: null })}
      >
        Clear All
      </Button>
    </div>
  );
}
