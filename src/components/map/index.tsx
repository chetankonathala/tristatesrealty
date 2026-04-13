import dynamic from "next/dynamic"

export const MapContainer = dynamic(
  () => import("./map-container").then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full bg-muted animate-pulse rounded-lg" style={{ height: 400 }} />
    ),
  }
)
