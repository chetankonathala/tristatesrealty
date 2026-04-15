import type { Listing } from "@/types/listing";
import { ListingActionRow } from "./listing-action-row";
import { Bed, Bath, Square } from "lucide-react";

interface ListingHeroProps {
  listing: Listing;
}

export function ListingHero({ listing }: ListingHeroProps) {
  return (
    <section className="max-w-[1280px] mx-auto px-4 lg:px-8 pt-12 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
      <div>
        <h1 className="font-[var(--font-playfair-display)] text-4xl lg:text-5xl font-bold tabular-nums text-foreground mb-2">
          ${listing.list_price.toLocaleString()}
        </h1>
        <h2 className="font-[var(--font-playfair-display)] text-2xl lg:text-3xl font-bold text-foreground mb-4">
          {listing.address_full}
        </h2>
        <div className="flex flex-wrap items-center gap-6 text-base font-bold text-foreground">
          <span className="flex items-center gap-2">
            <Bed className="h-4 w-4 text-accent" />
            {listing.bedrooms ?? "—"} bed
          </span>
          <span className="flex items-center gap-2">
            <Bath className="h-4 w-4 text-accent" />
            {listing.bathrooms ?? "—"} bath
          </span>
          <span className="flex items-center gap-2">
            <Square className="h-4 w-4 text-accent" />
            {listing.area?.toLocaleString() ?? "—"} sqft
          </span>
          {listing.days_on_market != null && (
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {listing.days_on_market} days on market
            </span>
          )}
        </div>
      </div>
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Listed price</div>
            <div className="text-2xl font-bold text-accent tabular-nums">${listing.list_price.toLocaleString()}</div>
          </div>
          {/* Self-contained: handles auth + save state + API fetch internally */}
          <ListingActionRow mlsId={listing.mls_id} />
          {listing.listing_agent_name && (
            <div className="pt-4 border-t border-border text-xs text-muted-foreground">
              Agent: <span className="text-foreground font-bold">{listing.listing_agent_name}</span>
              {listing.listing_office_name && <div>{listing.listing_office_name}</div>}
            </div>
          )}
        </div>
      </aside>
    </section>
  );
}
