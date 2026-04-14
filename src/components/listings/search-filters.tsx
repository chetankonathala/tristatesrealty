"use client";
import { useQueryStates, parseAsInteger, parseAsString, parseAsBoolean, parseAsStringEnum } from "nuqs";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FilterPill } from "@/components/ui/filter-pill";
import { PriceRangeSlider } from "./price-range-slider";
import { BedsBathsSelector } from "./beds-baths-selector";
import { PropertyTypeChips } from "./property-type-chips";
import { LocationSearch } from "./location-search";
import { Input } from "@/components/ui/input";

export function SearchFilters() {
  const [filters, setFilters] = useQueryStates(
    {
      minPrice: parseAsInteger,
      maxPrice: parseAsInteger,
      minBeds: parseAsInteger,
      minBaths: parseAsInteger,
      type: parseAsString,
      cities: parseAsString,
      minSqft: parseAsInteger,
      maxSqft: parseAsInteger,
      minLotSize: parseAsInteger,
      maxLotSize: parseAsInteger,
      minYearBuilt: parseAsInteger,
      schoolDistrict: parseAsString,
      waterfront: parseAsBoolean,
      newConstruction: parseAsBoolean,
      garage: parseAsBoolean,
      state: parseAsStringEnum(["DE", "MD", "NJ", "PA"]),
    },
    { throttleMs: 300, shallow: false }
  );

  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const types = (filters.type ?? "").split(",").filter(Boolean);
  const cities = (filters.cities ?? "").split(",").filter(Boolean);

  const priceLabel = filters.minPrice || filters.maxPrice
    ? `${filters.minPrice ? `$${(filters.minPrice / 1000).toFixed(0)}k` : "Any"}–${filters.maxPrice ? `$${(filters.maxPrice / 1000).toFixed(0)}k` : "Any"}`
    : "Price";
  const bedsLabel = filters.minBeds ? `${filters.minBeds}+ Beds` : "Beds";
  const bathsLabel = filters.minBaths ? `${filters.minBaths}+ Baths` : "Baths";
  const typeLabel = types.length > 0 ? `${types.length} type${types.length > 1 ? "s" : ""}` : "Home Type";

  const clearAll = () =>
    setFilters({
      minPrice: null,
      maxPrice: null,
      minBeds: null,
      minBaths: null,
      type: null,
      cities: null,
      minSqft: null,
      maxSqft: null,
      minLotSize: null,
      maxLotSize: null,
      minYearBuilt: null,
      schoolDistrict: null,
      waterfront: null,
      newConstruction: null,
      garage: null,
    });

  // Shared filter form body (used by both desktop modal and mobile sheet)
  const FilterBody = (
    <div className="space-y-6">
      <section>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Price</h3>
        <PriceRangeSlider
          value={[filters.minPrice ?? 0, filters.maxPrice ?? 2_000_000]}
          onChange={([min, max]) => setFilters({ minPrice: min || null, maxPrice: max < 2_000_000 ? max : null })}
        />
      </section>
      <section className="grid grid-cols-2 gap-4">
        <BedsBathsSelector
          label="Beds"
          value={filters.minBeds ?? 0}
          onChange={(v) => setFilters({ minBeds: v || null })}
        />
        <BedsBathsSelector
          label="Baths"
          value={filters.minBaths ?? 0}
          onChange={(v) => setFilters({ minBaths: v || null })}
        />
      </section>
      <section>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Property Type</h3>
        <PropertyTypeChips
          selected={types}
          onChange={(s) => setFilters({ type: s.length ? s.join(",") : null })}
        />
      </section>
      <section>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Location</h3>
        <LocationSearch
          cities={cities}
          onChange={(c) => setFilters({ cities: c.length ? c.join(",") : null })}
        />
      </section>
      <section>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Square Footage</h3>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min sqft"
            value={filters.minSqft ?? ""}
            onChange={(e) => setFilters({ minSqft: e.target.value ? parseInt(e.target.value) : null })}
            aria-label="Minimum square footage"
          />
          <Input
            type="number"
            placeholder="Max sqft"
            value={filters.maxSqft ?? ""}
            onChange={(e) => setFilters({ maxSqft: e.target.value ? parseInt(e.target.value) : null })}
            aria-label="Maximum square footage"
          />
        </div>
      </section>
      <section>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">More Filters</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={!!filters.waterfront} onChange={(e) => setFilters({ waterfront: e.target.checked || null })} />
            Waterfront
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={!!filters.newConstruction} onChange={(e) => setFilters({ newConstruction: e.target.checked || null })} />
            New Construction
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={!!filters.garage} onChange={(e) => setFilters({ garage: e.target.checked || null })} />
            Garage
          </label>
        </div>
      </section>
    </div>
  );

  return (
    <>
      {/* Desktop top bar — D-05/D-06: 4 pills + More Filters */}
      <div className="hidden lg:flex items-center gap-2 px-4 py-3 border-b border-border bg-background sticky top-16 z-30">
        <FilterPill selected={!!(filters.minPrice || filters.maxPrice)}>{priceLabel}</FilterPill>
        <FilterPill selected={!!filters.minBeds}>{bedsLabel}</FilterPill>
        <FilterPill selected={!!filters.minBaths}>{bathsLabel}</FilterPill>
        <FilterPill selected={types.length > 0}>{typeLabel}</FilterPill>
        {/* D-05: More Filters modal */}
        <Dialog open={moreOpen} onOpenChange={(open) => setMoreOpen(open)}>
          <div className="ml-auto">
            <Button variant="outline" size="sm" onClick={() => setMoreOpen(true)}>
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Filters</DialogTitle>
            </DialogHeader>
            {FilterBody}
            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button variant="ghost" onClick={() => { clearAll(); setMoreOpen(false); }}>
                Clear All
              </Button>
              <Button onClick={() => setMoreOpen(false)}>Apply</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile — D-07: bottom Sheet drawer */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-background sticky top-16 z-30">
        <Sheet open={mobileOpen} onOpenChange={(open) => setMobileOpen(open)}>
          <Button variant="outline" size="sm" onClick={() => setMobileOpen(true)}>
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="pt-4 px-4">{FilterBody}</div>
            <div className="sticky bottom-0 bg-background pt-4 pb-4 border-t border-border px-4">
              <Button className="w-full" onClick={() => setMobileOpen(false)}>Apply Filters</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
