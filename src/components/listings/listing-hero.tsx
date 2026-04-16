import type { Listing } from "@/types/listing";
import { ListingActionRow } from "./listing-action-row";
import { Bed, Bath, Square, Building2 } from "lucide-react";

interface ListingHeroProps {
  listing: Listing;
}

export function ListingHero({ listing }: ListingHeroProps) {
  const raw = listing.raw_data as Record<string, unknown> | null;
  const communityName = raw?.communityName as string | null | undefined;
  const floorPlanName = raw?.planName as string | null | undefined;
  const communityUrl = raw?.communityUrl as string | null | undefined;

  return (
    <section className="max-w-[1280px] mx-auto px-4 lg:px-8 pt-12 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
      <div>
        {communityName && (
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-accent uppercase tracking-wider">
              {communityName}{floorPlanName ? ` · ${floorPlanName}` : ""}
            </span>
          </div>
        )}
        <h1 className="font-[var(--font-playfair-display)] text-4xl lg:text-5xl font-bold tabular-nums text-foreground mb-2">
          From ${listing.list_price.toLocaleString()}
        </h1>
        <h2 className="font-[var(--font-playfair-display)] text-2xl lg:text-3xl font-bold text-foreground mb-4">
          {listing.address_full}
        </h2>
        <div className="flex flex-wrap items-center gap-6 text-base font-bold text-foreground">
          <span className="flex items-center gap-2">
            <Bed className="h-4 w-4 text-accent" />
            {listing.bedrooms ?? "—"}+ bed
          </span>
          <span className="flex items-center gap-2">
            <Bath className="h-4 w-4 text-accent" />
            {listing.bathrooms ?? "—"}+ bath
          </span>
          <span className="flex items-center gap-2">
            <Square className="h-4 w-4 text-accent" />
            {listing.area?.toLocaleString() ?? "—"}+ sqft
          </span>
          {listing.new_construction && (
            <span className="text-xs uppercase tracking-wider text-accent border border-accent/40 rounded px-2 py-0.5">
              New Construction
            </span>
          )}
        </div>
      </div>
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Starting from</div>
            <div className="text-2xl font-bold text-accent tabular-nums">${listing.list_price.toLocaleString()}</div>
          </div>
          <ListingActionRow
            mlsId={listing.mls_id}
            communityName={communityName}
            floorPlanName={floorPlanName}
            listingAddress={listing.address_full}
            communityUrl={communityUrl}
          />
          {listing.listing_agent_name && (
            <div className="pt-4 border-t border-border text-xs text-muted-foreground">
              Agent: <span className="text-foreground font-bold">{listing.listing_agent_name}</span>
              {listing.listing_office_name && <div>{listing.listing_office_name}</div>}
              {listing.listing_agent_phone && (
                <a href={`tel:${listing.listing_agent_phone}`} className="text-accent hover:underline block mt-0.5">
                  {listing.listing_agent_phone}
                </a>
              )}
            </div>
          )}
          {listing.hoa_fee && (
            <div className="text-xs text-muted-foreground border-t border-border pt-3">
              HOA: <span className="text-foreground">${listing.hoa_fee}/mo</span>
            </div>
          )}
        </div>
      </aside>
    </section>
  );
}
