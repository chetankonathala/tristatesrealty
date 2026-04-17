"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";
import { cn } from "@/lib/utils";
import type { Listing } from "@/types/listing";

interface FloorPlanRawData {
  floorPlanName?: string;
  floorPlanUrl?: string;
  communityId?: string;
  communityName?: string;
  communityUrl?: string;
  featured_image_url?: string;
  filters?: string[];
}

interface CommunityFloorPlansProps {
  listings: Listing[];
  communityName: string;
}

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

interface FloorPlanCardProps {
  listing: Listing;
}

function FloorPlanCard({ listing }: FloorPlanCardProps) {
  const raw = (listing.raw_data as FloorPlanRawData | null) ?? {};

  const planName = raw.floorPlanName ?? listing.address_full;
  const planUrl = raw.floorPlanUrl
    ? `https://www.schellbrothers.com${raw.floorPlanUrl}`
    : listing.raw_data !== null
    ? undefined
    : undefined;

  const imageUrl = raw.featured_image_url ?? listing.photos[0] ?? null;

  const filters = Array.isArray(raw.filters) ? raw.filters.slice(0, 3) : [];

  const specsArray: string[] = [];
  if (listing.bedrooms !== null) specsArray.push(`${listing.bedrooms} Beds`);
  if (listing.bathrooms !== null) specsArray.push(`${listing.bathrooms} Baths`);
  if (listing.area !== null) specsArray.push(`${listing.area.toLocaleString()} Sqft`);
  const specs = specsArray.join(" | ");

  const accessibleLabel = [
    planName,
    listing.bedrooms !== null ? `${listing.bedrooms} bedrooms` : null,
    listing.bathrooms !== null ? `${listing.bathrooms} bathrooms` : null,
    `from ${priceFormatter.format(listing.list_price)}`,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <a
      href={planUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={accessibleLabel}
      className={cn(
        "group bg-card border border-border rounded-lg overflow-hidden cursor-pointer block",
        "hover:border-border-hover hover:-translate-y-0.5 transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      )}
    >
      {/* Image area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={planName}
            fill
            loading="lazy"
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-muted to-card"
            aria-hidden="true"
          />
        )}

        {/* External link indicator */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-background/80 rounded-full p-1">
            <ExternalLink
              size={12}
              className="text-foreground"
              aria-label="Opens on Schell Brothers website"
            />
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        <p className="text-base font-bold font-[family-name:var(--font-montserrat)] text-foreground mb-1 truncate">
          {planName}
        </p>

        <p className="text-base font-bold font-[family-name:var(--font-montserrat)] text-accent tabular-nums mb-2">
          {priceFormatter.format(listing.list_price)}
        </p>

        {specs && (
          <p className="text-xs uppercase tracking-[0.05em] text-muted-foreground font-[family-name:var(--font-montserrat)] mb-3">
            {specs}
          </p>
        )}

        {filters.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {filters.map((filter, i) => (
              <span
                key={`${filter}-${i}`}
                className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5 font-[family-name:var(--font-montserrat)]"
              >
                {filter}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}

export function CommunityFloorPlans({ listings, communityName }: CommunityFloorPlansProps) {
  return (
    <section
      className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8"
      aria-label={`Available floor plans in ${communityName}`}
    >
      {/* Heading + count badge */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-[28px] font-bold font-[family-name:var(--font-playfair-display)] text-foreground">
          Available Floor Plans
        </h2>
        <Badge variant="featured" className="text-xs">
          {listings.length} {listings.length === 1 ? "plan" : "plans"}
        </Badge>
      </div>

      {listings.length === 0 ? (
        <p className="text-base font-[family-name:var(--font-montserrat)] text-muted-foreground">
          No floor plans currently available. Check back soon or schedule a tour for
          the latest options.
        </p>
      ) : (
        <StaggerChildren
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          staggerDelay={0.06}
        >
          {listings.map((listing) => (
            <StaggerItem key={listing.id}>
              <FloorPlanCard listing={listing} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      )}
    </section>
  );
}
