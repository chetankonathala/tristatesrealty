import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCommunityBySlug,
  getAllCommunities,
  getCommunityListings,
} from "@/lib/supabase/queries/communities";
import { fetchNearbyPOI } from "@/lib/mapbox/poi";
import { CommunityPageClient } from "./community-page-client";

export const revalidate = 86400; // 24hr ISR
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const communities = await getAllCommunities({ activeOnly: true });
    return communities.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const community = await getCommunityBySlug(slug);
  if (!community) {
    return { title: "Community Not Found | Tri States Realty" };
  }

  const title =
    community.seo_title ??
    `${community.name} by Schell Brothers in ${community.city}, ${community.state} — New Homes — Tri States Realty`;
  const description =
    community.seo_description ??
    (community.short_description?.slice(0, 155) ??
      `Explore ${community.name} by Schell Brothers`);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: `/communities/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CommunityDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const community = await getCommunityBySlug(slug);
  if (!community) notFound();

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

  const [listings, schools, restaurants] = await Promise.all([
    getCommunityListings(community.community_id),
    community.lat && community.lng
      ? fetchNearbyPOI(community.lng, community.lat, "school", mapboxToken)
      : Promise.resolve([]),
    community.lat && community.lng
      ? fetchNearbyPOI(community.lng, community.lat, "restaurant", mapboxToken)
      : Promise.resolve([]),
  ]);

  return (
    <main className="min-h-screen bg-background">
      <CommunityPageClient
        community={community}
        listings={listings}
        schools={schools}
        restaurants={restaurants}
      />
    </main>
  );
}
