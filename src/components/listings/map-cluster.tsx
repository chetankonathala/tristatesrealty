"use client";
import { Marker } from "react-map-gl/mapbox";
import { cn } from "@/lib/utils";

interface MapClusterProps {
  lat: number;
  lng: number;
  pointCount: number;
  onClick: () => void;
}

export function MapCluster({ lat, lng, pointCount, onClick }: MapClusterProps) {
  // Diameter scaling per UI-SPEC: 32 / 40 / 52
  const size = pointCount < 10 ? 32 : pointCount < 100 ? 40 : 52;
  const opacity = pointCount < 10 ? 0.6 : pointCount < 100 ? 0.75 : 0.9;

  return (
    <Marker latitude={lat} longitude={lng}>
      <button
        type="button"
        onClick={onClick}
        aria-label={`Cluster of ${pointCount} homes, press Enter to zoom in`}
        className="relative flex items-center justify-center min-h-[44px] min-w-[44px]"
      >
        <span
          className={cn(
            "flex items-center justify-center rounded-full font-bold text-white tabular-nums shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
          )}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: `rgba(201, 168, 76, ${opacity})`,
            fontSize: pointCount >= 100 ? "14px" : "13px",
          }}
        >
          {pointCount}
        </span>
      </button>
    </Marker>
  );
}
