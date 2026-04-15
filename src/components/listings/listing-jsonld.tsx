import type { Listing } from "@/types/listing";

interface ListingJsonLdProps {
  listing: Listing;
  baseUrl?: string;
}

export function ListingJsonLd({ listing, baseUrl = "https://tristatesrealty.com" }: ListingJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.address_full,
    datePosted: listing.list_date,
    description: listing.remarks ?? "",
    image: listing.photos.slice(0, 6),
    url: `${baseUrl}/listings/${listing.mls_id}`,
    offers: {
      "@type": "Offer",
      price: listing.list_price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: listing.address_street ?? listing.address_full,
      addressLocality: listing.address_city,
      addressRegion: listing.address_state,
      postalCode: listing.address_postal_code ?? "",
      addressCountry: "US",
    },
    geo:
      listing.lat != null && listing.lng != null
        ? {
            "@type": "GeoCoordinates",
            latitude: listing.lat,
            longitude: listing.lng,
          }
        : undefined,
    numberOfRooms: listing.bedrooms ?? undefined,
    numberOfBathroomsTotal: listing.bathrooms ?? undefined,
    floorSize: listing.area
      ? {
          "@type": "QuantitativeValue",
          value: listing.area,
          unitCode: "FTK",
        }
      : undefined,
  };

  // SECURITY (T-02-08-01): escape `<` to prevent `</script>` injection via remarks/address
  // fields. JSON.stringify does NOT escape `<` by default — without this replace, an
  // MLS-provided remarks string containing `</script><script>alert(1)</script>` would break
  // out of the JSON-LD context. The `\u003c` form is valid JSON and renders as `<` only
  // after JSON.parse, never as raw HTML.
  const safeJson = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJson }}
    />
  );
}
