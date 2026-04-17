import type { Metadata } from "next";
import { getAllCommunities } from "@/lib/supabase/queries/communities";
import { CommunityIndexHero } from "@/components/communities/community-index-hero";
import { CommunityIndexClient } from "@/components/communities/community-index-client";
import type { CommunityCardData } from "@/types/community";

export const metadata: Metadata = {
  title: "Schell Brothers Communities — New Construction Homes — Tri States Realty",
  description:
    "Explore new construction communities by Schell Brothers across Delaware, Maryland, New Jersey, and Pennsylvania. Video tours, amenities, floor plans, and live listings.",
};

export const revalidate = 86400;

export default async function CommunitiesPage() {
  let communities: CommunityCardData[];
  try {
    communities = await getAllCommunities({ activeOnly: true });
  } catch {
    communities = [];
  }

  return (
    <main className="min-h-screen bg-background pb-16">
      <CommunityIndexHero />
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 py-8">
        <CommunityIndexClient communities={communities} />
      </div>
    </main>
  );
}
