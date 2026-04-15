import { ImageResponse } from "next/og";
import { getListingByMlsId } from "@/lib/supabase/queries/listings";

export const runtime = "nodejs";
export const revalidate = 900;

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ mlsId: string }>;
}

export default async function Image({ params }: Props) {
  const { mlsId } = await params;
  const listing = await getListingByMlsId(Number(mlsId));

  if (!listing) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0A0A0A",
            color: "#C9A84C",
            fontSize: 48,
            fontFamily: "serif",
          }}
        >
          Tri States Realty
        </div>
      ),
      { ...size }
    );
  }

  const priceFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(listing.list_price);

  const heroPhoto = listing.photos?.[0] ?? null;
  // Price-reduced badge: no price events column exists in the current schema.
  // Defer this signal until a price_events table is added (out of Phase 2 scope).
  const isPriceReduced = false;
  const isPending =
    listing.status === "Pending" || listing.status === "ActiveUnderContract";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          background: "#0A0A0A",
          color: "#FFFFFF",
          fontFamily: "serif",
        }}
      >
        {/* Hero photo full-bleed */}
        {heroPhoto && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroPhoto}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        {/* 60% dark gradient from bottom */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.6) 40%, rgba(10,10,10,0.0) 70%)",
            display: "flex",
          }}
        />

        {/* Variant badges top-right */}
        {(isPriceReduced || isPending) && (
          <div
            style={{
              position: "absolute",
              top: 64,
              right: 64,
              display: "flex",
              gap: 12,
            }}
          >
            {isPriceReduced && (
              <div
                style={{
                  background: "#DC2626",
                  color: "#FFFFFF",
                  padding: "12px 24px",
                  borderRadius: 8,
                  fontSize: 24,
                  fontWeight: 700,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  display: "flex",
                }}
              >
                Price Reduced
              </div>
            )}
            {isPending && (
              <div
                style={{
                  background: "#F59E0B",
                  color: "#0A0A0A",
                  padding: "12px 24px",
                  borderRadius: 8,
                  fontSize: 24,
                  fontWeight: 700,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  display: "flex",
                }}
              >
                Pending
              </div>
            )}
          </div>
        )}

        {/* Bottom-left content stack */}
        <div
          style={{
            position: "absolute",
            left: 64,
            bottom: 64,
            right: 64,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontSize: 24,
              color: "#C9A84C",
              letterSpacing: 4,
              textTransform: "uppercase",
              fontFamily: "sans-serif",
              fontWeight: 700,
              display: "flex",
            }}
          >
            Tri States Realty
          </div>
          <div
            style={{
              fontSize: 40,
              color: "#FFFFFF",
              marginTop: 12,
              display: "flex",
            }}
          >
            {listing.address_full}
          </div>
          <div
            style={{
              fontSize: 96,
              color: "#C9A84C",
              fontWeight: 700,
              marginTop: 8,
              fontVariantNumeric: "tabular-nums",
              display: "flex",
            }}
          >
            {priceFormatted}
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#FFFFFF",
              marginTop: 8,
              display: "flex",
              gap: 24,
            }}
          >
            <span>{listing.bedrooms} beds</span>
            <span>{listing.bathrooms} baths</span>
            <span>
              {new Intl.NumberFormat("en-US").format(listing.area ?? 0)} sqft
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
