"use client";
import dynamic from "next/dynamic";
import { Marker } from "react-map-gl/mapbox";
import { MapPin } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";

const Map = dynamic(() => import("react-map-gl/mapbox").then((m) => m.default), { ssr: false });

interface LocationMapProps {
  lat: number;
  lng: number;
  address: string;
}

export function LocationMap({ lat, lng }: LocationMapProps) {
  return (
    <section className="max-w-[1280px] mx-auto px-4 lg:px-8">
      <h2 className="font-[var(--font-playfair-display)] text-2xl lg:text-3xl font-bold text-foreground mb-4">Location</h2>
      <div className="h-[400px] w-full rounded-lg overflow-hidden border border-border">
        <Map
          initialViewState={{ longitude: lng, latitude: lat, zoom: 14 }}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          style={{ width: "100%", height: "100%" }}
        >
          <Marker latitude={lat} longitude={lng} anchor="bottom">
            <MapPin className="h-8 w-8 fill-accent stroke-background drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
          </Marker>
        </Map>
      </div>
    </section>
  );
}
