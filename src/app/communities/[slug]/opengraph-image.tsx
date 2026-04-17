import { ImageResponse } from "next/og";
import { getCommunityBySlug } from "@/lib/supabase/queries/communities";

export const runtime = "edge";
export const alt = "Community preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const community = await getCommunityBySlug(slug);

  if (!community) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            background: "#0a0a0a",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
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

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          position: "relative",
          padding: 64,
          fontFamily: "serif",
        }}
      >
        {/* Background image with overlay */}
        {community.featured_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={community.featured_image_url}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.4,
            }}
          />
        )}
        {/* Dark gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(transparent 20%, rgba(10,10,10,0.9) 100%)",
            display: "flex",
          }}
        />

        {/* Price top-right */}
        {community.price_from && (
          <div
            style={{
              position: "absolute",
              top: 64,
              right: 64,
              fontSize: 40,
              fontWeight: 700,
              color: "#c49a3c",
              zIndex: 1,
              display: "flex",
            }}
          >
            From ${community.price_from.toLocaleString()}
          </div>
        )}

        {/* Bottom-left content stack */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            flex: 1,
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Wordmark */}
          <div
            style={{
              fontSize: 24,
              color: "#c49a3c",
              letterSpacing: "0.1em",
              marginBottom: 16,
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            TRI STATES REALTY
          </div>

          {/* Community name */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "white",
              lineHeight: 1.1,
              maxWidth: 900,
              display: "flex",
            }}
          >
            {community.name}
          </div>

          {/* Location */}
          <div
            style={{
              fontSize: 32,
              color: "#a1a1aa",
              marginTop: 12,
              display: "flex",
            }}
          >
            {[community.city, community.state].filter(Boolean).join(", ")}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
