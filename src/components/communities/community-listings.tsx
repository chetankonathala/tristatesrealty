"use client";

import Link from "next/link";
import { ListingCard } from "@/components/cards/listing-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";
import type { Listing } from "@/types/listing";

interface CommunityListingsProps {
  listings: Listing[];
  communityName: string;
  communitySlug: string;
  communityId: string;
  onScheduleTour: () => void;
}

const MAX_VISIBLE = 6;

export function CommunityListings({
  listings,
  communityName,
  communitySlug: _communitySlug,
  communityId,
  onScheduleTour,
}: CommunityListingsProps) {
  const visibleListings = listings.slice(0, MAX_VISIBLE);
  const hasMore = listings.length > MAX_VISIBLE;

  return (
    <FadeIn>
      <section>
        <div className="flex flex-wrap items-baseline gap-3 mb-6">
          <h2 className="font-[var(--font-display)] text-2xl lg:text-[28px] font-bold text-foreground">
            Available Homes in {communityName}
          </h2>
          <span className="text-base font-bold text-foreground tabular-nums">
            {listings.length} homes available
          </span>
        </div>

        {listings.length === 0 ? (
          <div className="flex flex-col items-start gap-4">
            <p className="text-base text-muted-foreground font-bold">
              No Active Listings Right Now
            </p>
            <p className="text-base text-muted-foreground">
              Schedule a tour to learn about upcoming availability.
            </p>
            <Button variant="outline" onClick={onScheduleTour}>
              Schedule a Tour
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleListings.map((listing) => (
                <ListingCard key={listing.mls_id} listing={listing} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 flex justify-center">
                <Link
                  href={`/listings?communityId=${communityId}`}
                  className={buttonVariants({ variant: "outline" })}
                >
                  View All {listings.length} Homes
                </Link>
              </div>
            )}
          </>
        )}
      </section>
    </FadeIn>
  );
}
