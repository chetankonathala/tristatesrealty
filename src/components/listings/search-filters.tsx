"use client";
import { useQueryStates, parseAsInteger, parseAsString, parseAsBoolean, parseAsStringEnum } from "nuqs";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PriceRangeSlider } from "./price-range-slider";
import { BedsBathsSelector } from "./beds-baths-selector";
import { PropertyTypeChips } from "./property-type-chips";
import { LocationSearch } from "./location-search";
import { Input } from "@/components/ui/input";

const pillBase =
  "h-9 px-4 rounded-full text-sm font-medium transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const pillIdle = "bg-muted text-foreground border-border hover:border-border-hover";
const pillActive = "bg-accent-muted text-accent border-accent";

function pillClass(selected: boolean) {
  return cn(pillBase, selected ? pillActive : pillIdle);
}

export function SearchFilters() {
  const [filters, setFilters] = useQueryStates(
    {
      minPrice: parseAsInteger,
      maxPrice: parseAsInteger,
      minBeds: parseAsInteger,
      minBaths: parseAsInteger,
      type: parseAsString,
      cities: parseAsString,
      postalCodes: parseAsString,
      page: parseAsInteger,
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
  const [openPill, setOpenPill] = useState<"price" | "beds" | "baths" | "type" | null>(null);

  const types = (filters.type ?? "").split(",").filter(Boolean);
  const cities = (filters.cities ?? "").split(",").filter(Boolean);
  const postalCodes = (filters.postalCodes ?? "").split(",").filter(Boolean);

  const priceLabel =
    filters.minPrice || filters.maxPrice
      ? `${filters.minPrice ? `$${(filters.minPrice / 1000).toFixed(0)}k` : "Any"}–${filters.maxPrice ? `$${(filters.maxPrice / 1000).toFixed(0)}k` : "Any"}`
      : "Price";
  const bedsLabel = filters.minBeds ? `${filters.minBeds}+ Beds` : "Beds";
  const bathsLabel = filters.minBaths ? `${filters.minBaths}+ Baths` : "Baths";
  const typeLabel =
    types.length > 0 ? `${types.length} type${types.length > 1 ? "s" : ""}` : "Home Type";

  const resetPage = { page: null };

  const clearAll = () =>
    setFilters({
      minPrice: null,
      maxPrice: null,
      minBeds: null,
      minBaths: null,
      type: null,
      cities: null,
      postalCodes: null,
      page: null,
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

  const FilterBody = (
    <div className="space-y-6">
      <section>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Price</h3>
        <PriceRangeSlider
          value={[filters.minPrice ?? 0, filters.maxPrice ?? 2_000_000]}
          onChange={([min, max]) =>
            setFilters({ minPrice: min || null, maxPrice: max < 2_000_000 ? max : null, ...resetPage })
          }
        />
      </section>
      <section className="grid grid-cols-2 gap-4">
        <BedsBathsSelector
          label="Beds"
          value={filters.minBeds ?? 0}
          onChange={(v) => setFilters({ minBeds: v || null, ...resetPage })}
        />
        <BedsBathsSelector
          label="Baths"
          value={filters.minBaths ?? 0}
          onChange={(v) => setFilters({ minBaths: v || null, ...resetPage })}
        />
      </section>
      <section>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Property Type</h3>
        <PropertyTypeChips
          selected={types}
          onChange={(s) => setFilters({ type: s.length ? s.join(",") : null, ...resetPage })}
        />
      </section>
      <section>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Location</h3>
        <LocationSearch
          cities={cities}
          postalCodes={postalCodes}
          onChange={(c) => setFilters({ cities: c.length ? c.join(",") : null, ...resetPage })}
          onPostalCodesChange={(z) => setFilters({ postalCodes: z.length ? z.join(",") : null, ...resetPage })}
        />
      </section>
      <section>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Square Footage</h3>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min sqft"
            value={filters.minSqft ?? ""}
            onChange={(e) =>
              setFilters({ minSqft: e.target.value ? parseInt(e.target.value) : null, ...resetPage })
            }
            aria-label="Minimum square footage"
          />
          <Input
            type="number"
            placeholder="Max sqft"
            value={filters.maxSqft ?? ""}
            onChange={(e) =>
              setFilters({ maxSqft: e.target.value ? parseInt(e.target.value) : null, ...resetPage })
            }
            aria-label="Maximum square footage"
          />
        </div>
      </section>
      <section>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">More Filters</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!filters.waterfront}
              onChange={(e) => setFilters({ waterfront: e.target.checked || null, ...resetPage })}
            />
            Waterfront
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!filters.newConstruction}
              onChange={(e) => setFilters({ newConstruction: e.target.checked || null, ...resetPage })}
            />
            New Construction
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!filters.garage}
              onChange={(e) => setFilters({ garage: e.target.checked || null, ...resetPage })}
            />
            Garage
          </label>
        </div>
      </section>
    </div>
  );

  return (
    <>
      {/* Desktop top bar — 4 popover pills + More Filters */}
      <div className="hidden lg:flex items-center gap-2 px-4 py-3 border-b border-border bg-background sticky top-16 z-30">

        {/* Price pill */}
        <Popover open={openPill === "price"} onOpenChange={(o) => setOpenPill(o ? "price" : null)}>
          <PopoverTrigger className={pillClass(!!(filters.minPrice || filters.maxPrice))}>
            {priceLabel}
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start" sideOffset={8}>
            <PriceRangeSlider
              value={[filters.minPrice ?? 0, filters.maxPrice ?? 2_000_000]}
              onChange={([min, max]) =>
                setFilters({ minPrice: min || null, maxPrice: max < 2_000_000 ? max : null, ...resetPage })
              }
            />
          </PopoverContent>
        </Popover>

        {/* Beds pill */}
        <Popover open={openPill === "beds"} onOpenChange={(o) => setOpenPill(o ? "beds" : null)}>
          <PopoverTrigger className={pillClass(!!filters.minBeds)}>
            {bedsLabel}
          </PopoverTrigger>
          <PopoverContent className="w-60" align="start" sideOffset={8}>
            <BedsBathsSelector
              label="Beds"
              value={filters.minBeds ?? 0}
              onChange={(v) => setFilters({ minBeds: v || null, ...resetPage })}
            />
          </PopoverContent>
        </Popover>

        {/* Baths pill */}
        <Popover open={openPill === "baths"} onOpenChange={(o) => setOpenPill(o ? "baths" : null)}>
          <PopoverTrigger className={pillClass(!!filters.minBaths)}>
            {bathsLabel}
          </PopoverTrigger>
          <PopoverContent className="w-60" align="start" sideOffset={8}>
            <BedsBathsSelector
              label="Baths"
              value={filters.minBaths ?? 0}
              onChange={(v) => setFilters({ minBaths: v || null, ...resetPage })}
            />
          </PopoverContent>
        </Popover>

        {/* Home Type pill */}
        <Popover open={openPill === "type"} onOpenChange={(o) => setOpenPill(o ? "type" : null)}>
          <PopoverTrigger className={pillClass(types.length > 0)}>
            {typeLabel}
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start" sideOffset={8}>
            <PropertyTypeChips
              selected={types}
              onChange={(s) => setFilters({ type: s.length ? s.join(",") : null, ...resetPage })}
            />
          </PopoverContent>
        </Popover>

        {/* More Filters modal */}
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

      {/* Mobile — bottom Sheet drawer */}
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
