import type { Metadata } from "next";
import { searchListings } from "@/lib/supabase/queries/listings";
import { parseSearchParams } from "@/lib/schemas/search-params";
import { SearchFilters } from "@/components/listings/search-filters";
import { ActiveFilterBar } from "@/components/listings/active-filter-bar";
import { SearchResultsHeader } from "@/components/listings/search-results-header";
import { SearchResultsGrid } from "@/components/listings/search-results-grid";

export const metadata: Metadata = {
  title: "Homes for Sale in DE, MD, NJ, PA | Tri States Realty",
  description:
    "Search every active home for sale in Delaware, Maryland, New Jersey, and Pennsylvania. Live MLS data updated every 15 minutes.",
};

// Tagged for ISR revalidation by sync job (plan 02-02)
export const revalidate = 900; // 15 min fallback

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
    </main>
  );
}
