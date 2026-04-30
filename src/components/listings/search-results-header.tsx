"use client";
import { useQueryState, parseAsStringEnum } from "nuqs";
import { ViewToggle } from "./view-toggle";

interface SearchResultsHeaderProps {
  totalCount: number;
  locationLabel?: string;
  leftSlot?: React.ReactNode;
}

export function SearchResultsHeader({ totalCount, locationLabel, leftSlot }: SearchResultsHeaderProps) {
  const [sort, setSort] = useQueryState(
    "sort",
    parseAsStringEnum(["price-asc", "price-desc", "date-desc", "date-asc", "beds-desc", "sqft-desc", "dom-asc"]).withDefault("date-desc")
  );

  const headline = locationLabel
    ? `${totalCount.toLocaleString()} homes in ${locationLabel}`
    : `${totalCount.toLocaleString()} homes across the Tri States`;

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        {leftSlot}
        <h2 className="text-base font-bold truncate">{headline}</h2>
      </div>
      <div className="flex items-center gap-3">
        <label className="text-xs uppercase tracking-wider text-muted-foreground">Sort by</label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="bg-card border border-border rounded-md px-3 py-1.5 text-sm"
          aria-label="Sort listings"
        >
          <option value="date-desc">Newest</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="beds-desc">Most Bedrooms</option>
          <option value="sqft-desc">Largest Sqft</option>
          <option value="dom-asc">Days on Market</option>
        </select>
        <ViewToggle />
      </div>
    </div>
  );
}
