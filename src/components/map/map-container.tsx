"use client"

import "mapbox-gl/dist/mapbox-gl.css"
import Map, { NavigationControl } from "react-map-gl/mapbox"
import { cn } from "@/lib/utils"

const HEIGHT_MAP = {
  "full-page": "calc(100vh - 72px)",
  embedded: "400px",
  mini: "200px",
}

interface MapContainerProps {
  center?: [number, number]
  zoom?: number
  className?: string
  variant?: "full-page" | "embedded" | "mini"
}

export function MapContainer({
  center = [-75.5, 39.0],
  zoom = 7,
  className,
  variant = "embedded",
}: MapContainerProps) {
  return (
    <div
      className={cn("w-full overflow-hidden rounded-lg", className)}
      style={{ height: HEIGHT_MAP[variant] }}
    >
      <Map
        initialViewState={{
          longitude: center[0],
          latitude: center[1],
          zoom,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      >
        <NavigationControl position="top-right" />
      </Map>
    </div>
  )
}
