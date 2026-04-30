import type { Metadata } from "next";
import { searchListings } from "@/lib/supabase/queries/listings";
import { parseSearchParams } from "@/lib/schemas/search-params";
import { SearchFilters } from "@/components/listings/search-filters";
import { ActiveFilterBar } from "@/components/listings/active-filter-bar";
import { ListingsShell } from "@/components/listings/listings-shell";
import { MlsAttribution } from "@/components/listings/mls-attribution";

export const metadata: Metadata = {
  title: "Homes for Sale in Delaware | Tri States Realty",
  description:
    "Search all Delaware MLS listings — filter by price, beds, baths, and location, or ask our AI assistant in plain English.",
};

export const revalidate = 900; // 15 min — matches delta sync cadence

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ListingsPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  let parsed;
  try {
    parsed = parseSearchParams(raw);
  } catch {
    parsed = parseSearchParams({});
  }

  const result = await searchListings(parsed);

  const locationLabel =
    parsed.state ??
    (parsed.cities ? parsed.cities.split(",")[0] : undefined);

  return (
    <main className="min-h-screen bg-background">
      <SearchFilters />
      <ActiveFilterBar />
      <ListingsShell
        listings={result.listings}
        totalCount={result.totalCount}
        locationLabel={locationLabel}
      />
      <MlsAttribution
        compact
        listingOfficeName={null}
        listingAgentName={null}
        listingAgentPhone={null}
        syncedAt={new Date().toISOString()}
      />
    </main>
  );
}
