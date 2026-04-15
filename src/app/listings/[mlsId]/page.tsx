import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getListingByMlsId,
  getComparableSales,
  getTopListingsForStaticParams,
} from "@/lib/supabase/queries/listings";
import { ListingGallery } from "@/components/listings/listing-gallery";
import { ListingHero } from "@/components/listings/listing-hero";
import { ListingSpecGrid } from "@/components/listings/listing-spec-grid";
import { ListingDescription } from "@/components/listings/listing-description";
import { ListingFeaturesList } from "@/components/listings/listing-features-list";
import { PriceHistoryTable } from "@/components/listings/price-history-table";
import { LocationMap } from "@/components/listings/location-map";
import { StreetViewEmbed } from "@/components/listings/street-view-embed";
import { ComparableSalesGrid } from "@/components/listings/comparable-sales-grid";
import { MlsAttribution } from "@/components/listings/mls-attribution";
import { ListingJsonLd } from "@/components/listings/listing-jsonld";
import { MobileDetailStickyBarWrapper } from "./mobile-sticky-wrapper";

interface PageProps {
  params: Promise<{ mlsId: string }>;
}

// ISR — sync job (plan 02-02) calls revalidateTag(`listing-${mls_id}`) on changes.
export const revalidate = 900;
export const dynamicParams = true;

export async function generateStaticParams() {
  // Pre-render the top 500 most-recent active listings at build time.
  // Misses fall through to ISR (dynamicParams=true).
  // getTopListingsForStaticParams already returns `{ mlsId: string }[]` (plan 02-03).
  // Gracefully return [] if Supabase is unreachable at build time (CI / local without creds).
  try {
    const top = await getTopListingsForStaticParams(500);
    return top.map((row) => ({ mlsId: row.mlsId }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { mlsId } = await params;
  const listing = await getListingByMlsId(Number(mlsId));
  if (!listing) {
    return { title: "Listing Not Found | Tri States Realty" };
  }
  const priceFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(listing.list_price);
  const title = `${listing.bedrooms} bed ${listing.bathrooms} bath home at ${listing.address_full} — ${priceFormatted} — Tri States Realty`;
  const description = (listing.remarks ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: `/listings/${mlsId}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${listing.address_full} — ${priceFormatted}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { mlsId } = await params;
  const id = Number(mlsId);
  if (!Number.isFinite(id)) notFound();

  const listing = await getListingByMlsId(id);
  if (!listing) notFound();

  // Plan 02-03 signature: getComparableSales(listing, options)
  const comparables = await getComparableSales(listing, {
    radiusMiles: 1,
    monthsBack: 6,
    limit: 6,
  });

  return (
    <main className="min-h-screen bg-background pb-24 lg:pb-12">
      {/* JSON-LD (escaped via plan 02-08) */}
      <ListingJsonLd listing={listing} />

      {/* Photo gallery hero (D-09) */}
      <ListingGallery photos={listing.photos ?? []} address={listing.address_full} />

      {/* Hero strip — price + address + bed/bath/sqft + ListingActionRow (self-contained per plan 02-07) */}
      <ListingHero listing={listing} />

      {/* === D-12 content order begins === */}

      {/* 1. Description (D-10 long copy clamp) */}
      <section className="container mx-auto px-4 lg:px-8 py-8">
        <ListingDescription remarks={listing.remarks ?? ""} />
      </section>

      {/* 2. Property details: spec grid + features list */}
      <section className="container mx-auto px-4 lg:px-8 py-8">
        <ListingSpecGrid listing={listing} />
      </section>
      {listing.features && listing.features.length > 0 && (
        <section className="container mx-auto px-4 lg:px-8 py-8">
          <ListingFeaturesList features={listing.features} />
        </section>
      )}

      {/* 3. Price history — no price_history column in schema yet; pass [] (component renders empty state) */}
      <section className="container mx-auto px-4 lg:px-8 py-8">
        <PriceHistoryTable history={[]} />
      </section>

      {/* 4. Comparable sales (IDX-08) */}
      {comparables.length > 0 && (
        <section className="container mx-auto px-4 lg:px-8 py-8">
          <ComparableSalesGrid comps={comparables} />
        </section>
      )}

      {/* 5. Location map (paired with Street View per UI-SPEC) */}
      {listing.lat != null && listing.lng != null && (
        <section className="container mx-auto px-4 lg:px-8 py-8">
          <LocationMap lat={listing.lat} lng={listing.lng} address={listing.address_full} />
        </section>
      )}

      {/* 6. Google Street View */}
      <section className="container mx-auto px-4 lg:px-8 py-8">
        <StreetViewEmbed address={listing.address_full} />
      </section>

      {/* 7. MLS attribution + Fair Housing (IDX-09 — required on every page) */}
      <section className="container mx-auto px-4 lg:px-8 py-8 border-t border-border">
        <MlsAttribution
          listingOfficeName={listing.listing_office_name}
          listingAgentName={listing.listing_agent_name}
          listingAgentPhone={listing.listing_agent_phone}
          syncedAt={listing.synced_at}
        />
      </section>

      {/* === D-12 content order ends === */}

      {/* Mobile sticky bottom bar (D-11) — client wrapper handles onContactAgent */}
      <MobileDetailStickyBarWrapper
        price={listing.list_price}
        daysOnMarket={listing.days_on_market}
      />
    </main>
  );
}
