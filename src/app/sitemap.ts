import type { MetadataRoute } from "next";
import { getAllCommunities } from "@/lib/supabase/queries/communities";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://tristatesrealty.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/listings`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/communities`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  // Community pages — higher priority than listings (SEO differentiator)
  let communityPages: MetadataRoute.Sitemap = [];
  try {
    const communities = await getAllCommunities({ activeOnly: true });
    communityPages = communities.map((c) => ({
      url: `${BASE_URL}/communities/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));
  } catch {
    // DB unavailable at build time — empty is fine
  }

  return [...staticPages, ...communityPages];
}
