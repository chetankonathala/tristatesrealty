"use client";

import { useState } from "react";
import { ScheduleTourModal } from "@/components/communities/schedule-tour-modal";
import type { Community } from "@/types/community";
import type { Listing } from "@/types/listing";
import type { POIFeature } from "@/lib/mapbox/poi";
import { CommunityHero } from "@/components/communities/community-hero";
import { CommunityOverview } from "@/components/communities/community-overview";
import { CommunityAmenities } from "@/components/communities/community-amenities";
import { CommunityFloorPlans } from "@/components/communities/community-floor-plans";
import { CommunityVideos } from "@/components/communities/community-videos";
import { CommunitySchools } from "@/components/communities/community-schools";
import { CommunityHoa } from "@/components/communities/community-hoa";
import { CommunityListings } from "@/components/communities/community-listings";
import { CommunityMap } from "@/components/communities/community-map";
import { CommunityJsonLd } from "@/components/communities/community-json-ld";
import { Button } from "@/components/ui/button";

interface CommunityPageClientProps {
  community: Community;
  listings: Listing[];
  schools: POIFeature[];
  restaurants: POIFeature[];
}

export function CommunityPageClient({
  community,
  listings,
  schools,
  restaurants,
}: CommunityPageClientProps) {
  const [tourModalOpen, setTourModalOpen] = useState(false);

  const hasLocation = community.lat !== null && community.lng !== null;

  return (
    <>
      {/* Hero — full bleed */}
      <CommunityHero
        community={community}
        onScheduleTour={() => setTourModalOpen(true)}
      />

      {/* Content sections with consistent spacing */}
      <div className="space-y-16 lg:space-y-20 py-16 lg:py-20">
        {/* Overview */}
        <CommunityOverview community={community} />

        {/* Amenities */}
        {community.amenities.length > 0 && (
          <CommunityAmenities amenities={community.amenities} />
        )}

        {/* Floor Plans */}
        <section className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">
          <CommunityFloorPlans
            listings={listings}
            communityName={community.name}
          />
        </section>

        {/* Videos */}
        {(community.youtube_video_ids.length > 0 ||
          community.custom_video_urls.length > 0) && (
          <section className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">
            <CommunityVideos
              youtubeVideoIds={community.youtube_video_ids}
              customVideoUrls={community.custom_video_urls}
              communityName={community.name}
            />
          </section>
        )}

        {/* Schools */}
        <section className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">
          <CommunitySchools community={community} />
        </section>

        {/* HOA */}
        <section className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">
          <CommunityHoa community={community} />
        </section>

        {/* Listings */}
        <section className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">
          <CommunityListings
            listings={listings}
            communityName={community.name}
            communitySlug={community.slug}
            communityId={community.community_id}
            onScheduleTour={() => setTourModalOpen(true)}
          />
        </section>

        {/* Map */}
        {hasLocation && (
          <section className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">
            <CommunityMap
              community={{
                name: community.name,
                lat: community.lat!,
                lng: community.lng!,
              }}
              schools={schools}
              restaurants={restaurants}
            />
          </section>
        )}
      </div>

      {/* Tour CTA Banner — full bleed */}
      <div className="w-full bg-card border-t border-b border-border py-12">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h2 className="font-[family-name:var(--font-playfair-display)] text-2xl lg:text-[28px] font-bold text-foreground mb-3">
            Ready to Visit {community.name}?
          </h2>
          <p className="text-base text-muted-foreground font-[family-name:var(--font-montserrat)] mb-6 max-w-[600px] mx-auto">
            See the community, tour model homes, and find the perfect floor plan
            for your family.
          </p>
          <Button
            variant="default"
            className="h-11 px-8"
            onClick={() => setTourModalOpen(true)}
          >
            Schedule a Tour
          </Button>
        </div>
      </div>

      {/* JSON-LD — invisible */}
      <CommunityJsonLd community={community} />

      {/* Tour modal */}
      <ScheduleTourModal
        communityName={community.name}
        communitySlug={community.slug}
        open={tourModalOpen}
        onOpenChange={setTourModalOpen}
      />
    </>
  );
}
