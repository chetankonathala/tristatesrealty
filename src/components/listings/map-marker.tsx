"use client";
import { Marker } from "react-map-gl/mapbox";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface MapMarkerProps {
  lat: number;
  lng: number;
  selected?: boolean;
  viewed?: boolean;
  onClick: () => void;
  ariaLabel: string;
}

export function MapMarker({ lat, lng, selected, viewed, onClick, ariaLabel }: MapMarkerProps) {
  return (
    <Marker latitude={lat} longitude={lng} anchor="bottom">
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        className={cn(
          "relative inline-flex items-center justify-center transition-transform",
          "min-h-[44px] min-w-[44px]", // a11y touch target
          selected && "scale-125",
          viewed && !selected && "opacity-60"
        )}
      >
        {selected && (
          <span className="absolute inset-0 rounded-full bg-accent/40 animate-ping" aria-hidden="true" />
        )}
        <MapPin
          className={cn(
            "h-8 w-8 fill-accent stroke-background drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]",
            selected && "fill-accent text-accent"
          )}
        />
      </button>
    </Marker>
  );
}
