import type { Metadata } from "next";
import { searchListings } from "@/lib/supabase/queries/listings";
import { parseSearchParams } from "@/lib/schemas/search-params";
import { SearchFilters } from "@/components/listings/search-filters";
import { ActiveFilterBar } from "@/components/listings/active-filter-bar";
import { SearchResultsHeader } from "@/components/listings/search-results-header";
import { SearchResultsGrid } from "@/components/listings/search-results-grid";
import { MlsAttribution } from "@/components/listings/mls-attribution";

export const metadata: Metadata = {
  title: "New Homes for Sale in Delaware | Schell Brothers | Tri States Realty",
  description:
    "Browse Schell Brothers new construction communities across Delaware. Find your perfect floor plan in Lewes, Millsboro, Middletown, and more.",
};

// Revalidated nightly by the Schell sync cron job
export const revalidate = 86400; // 24 hr fallback

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
      <SearchResultsHeader totalCount={result.totalCount} locationLabel={locationLabel} />
      <SearchResultsGrid listings={result.listings} totalCount={result.totalCount} />
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
