import type { Community } from "@/types/community";

export function CommunityJsonLd({ community }: { community: Community }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Residence",
    name: community.name,
    description: community.short_description,
    address: {
      "@type": "PostalAddress",
      streetAddress: community.address,
      addressLocality: community.city,
      addressRegion: community.state,
      postalCode: community.zip,
      addressCountry: "US",
    },
    geo:
      community.lat && community.lng
        ? {
            "@type": "GeoCoordinates",
            latitude: community.lat,
            longitude: community.lng,
          }
        : undefined,
    url: `https://tristatesrealty.com/communities/${community.slug}`,
    ...(community.price_from
      ? {
          offers: {
            "@type": "Offer",
            price: community.price_from,
            priceCurrency: "USD",
            availability: community.is_sold_out
              ? "https://schema.org/SoldOut"
              : "https://schema.org/InStock",
          },
        }
      : {}),
  };

  // Escape < as \u003c to prevent XSS in JSON-LD (same pattern as ListingJsonLd)
  const safeJson = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJson }}
    />
  );
}
