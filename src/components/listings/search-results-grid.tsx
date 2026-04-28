"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useQueryState, parseAsStringEnum } from "nuqs";
import { ListingCard } from "@/components/cards/listing-card";
import { ListingCardSkeleton } from "./listing-card-skeleton";
import { EmptyState } from "./empty-state";
import { SearchPagination } from "./search-pagination";
import { Button } from "@/components/ui/button";
import { Map as MapIcon, List as ListIcon } from "lucide-react";
import type { ListingSummary } from "@/types/listing";

const SearchMap = dynamic(() => import("./search-map").then((m) => m.SearchMap), { ssr: false });

interface SearchResultsGridProps {
  listings: ListingSummary[];
  totalCount: number;
}

export function SearchResultsGrid({ listings, totalCount }: SearchResultsGridProps) {
  const [view] = useQueryState(
    "view",
    parseAsStringEnum(["map", "list", "split"]).withDefault("split")
  );
  const [selectedMlsId, setSelectedMlsId] = useState<number | null>(null);
  const [mobileMapOpen, setMobileMapOpen] = useState(false);

  if (listings.length === 0) return <EmptyState variant="no-results" />;

  const cardGrid = (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        {listings.map((listing) => (
          <ListingCard
            key={listing.mls_id}
            listing={listing}
            highlighted={selectedMlsId === listing.mls_id}
            onRequireSignIn={() => {
              window.dispatchEvent(new CustomEvent("require-sign-in"));
            }}
          />
        ))}
      </div>
      <SearchPagination totalCount={totalCount} />
    </div>
  );

  const mapPanel = (
    <div className="h-full w-full">
      <SearchMap
        listings={listings}
        selectedMlsId={selectedMlsId}
        onSelect={setSelectedMlsId}
      />
    </div>
  );

  return (
    <>
      {/* Desktop: D-01 split layout (map right 40%, list left 60%) */}
      <div
        className="hidden lg:grid h-[calc(100vh-12rem)]"
        style={{
          gridTemplateColumns:
            view === "split" ? "60% 40%" : view === "list" ? "100% 0%" : "0% 100%",
        }}
      >
        {view !== "map" && (
          <div className="overflow-y-auto border-r border-border">{cardGrid}</div>
        )}
        {view !== "list" && <div className="relative">{mapPanel}</div>}
      </div>

      {/* Mobile: D-03 list-first with Show Map toggle */}
      <div className="lg:hidden">
        {!mobileMapOpen && cardGrid}
        {mobileMapOpen && (
          <div className="fixed inset-0 top-32 z-40 bg-background">{mapPanel}</div>
        )}
        <Button
          onClick={() => setMobileMapOpen((v) => !v)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 shadow-lg"
        >
          {mobileMapOpen ? (
            <>
              <ListIcon className="h-4 w-4 mr-2" /> Show List
            </>
          ) : (
            <>
              <MapIcon className="h-4 w-4 mr-2" /> Show Map
            </>
          )}
        </Button>
      </div>
    </>
  );
}

// Suppress unused import warning — ListingCardSkeleton is used in loading.tsx
export { ListingCardSkeleton };
