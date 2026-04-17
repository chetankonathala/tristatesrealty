"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Marker, NavigationControl, Popup } from "react-map-gl/mapbox";
import { MapPin, GraduationCap, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import { FadeIn } from "@/components/motion/fade-in";
import type { POIFeature } from "@/lib/mapbox/poi";

const Map = dynamic(() => import("react-map-gl/mapbox").then((m) => m.default), {
  ssr: false,
});

interface CommunityMapProps {
  community: { name: string; lat: number; lng: number };
  schools: POIFeature[];
  restaurants: POIFeature[];
}

interface FilterState {
  schools: boolean;
  restaurants: boolean;
}

interface SelectedPOI {
  poi: POIFeature;
}

export function CommunityMap({ community, schools, restaurants }: CommunityMapProps) {
  const [filters, setFilters] = useState<FilterState>({
    schools: true,
    restaurants: true,
  });
  const [selected, setSelected] = useState<SelectedPOI | null>(null);

  const toggleFilter = (key: keyof FilterState) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filterPillClass = (active: boolean) =>
    cn(
      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.05em] cursor-pointer transition-colors select-none",
      active
        ? "bg-accent/20 text-accent border-accent"
        : "bg-card text-muted-foreground border-border hover:border-accent/50"
    );

  return (
    <FadeIn>
      <section>
        <h2 className="font-[var(--font-display)] text-2xl lg:text-[28px] font-bold text-foreground mb-6">
          Location &amp; Nearby
        </h2>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={() => toggleFilter("schools")}
            className={filterPillClass(filters.schools)}
            aria-pressed={filters.schools}
          >
            <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
            Schools
          </button>
          <button
            type="button"
            onClick={() => toggleFilter("restaurants")}
            className={filterPillClass(filters.restaurants)}
            aria-pressed={filters.restaurants}
          >
            <UtensilsCrossed className="h-3.5 w-3.5" aria-hidden="true" />
            Restaurants
          </button>
          <button
            type="button"
            disabled
            className={cn(filterPillClass(false), "opacity-40 cursor-not-allowed")}
            aria-disabled="true"
          >
            Nearby
          </button>
        </div>

        {/* Map container */}
        <div className="h-[320px] md:h-[480px] w-full rounded-lg overflow-hidden border border-border">
          <Map
            initialViewState={{
              longitude: community.lng,
              latitude: community.lat,
              zoom: 13,
            }}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            style={{ width: "100%", height: "100%" }}
          >
            <NavigationControl position="bottom-right" />

            {/* Community center marker */}
            <Marker
              longitude={community.lng}
              latitude={community.lat}
              anchor="bottom"
            >
              <div
                className="flex items-center justify-center"
                aria-label={`${community.name} location`}
                style={{ width: 44, height: 44 }}
              >
                <MapPin className="h-8 w-8 fill-accent stroke-background drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]" />
              </div>
            </Marker>

            {/* School markers */}
            {filters.schools &&
              schools.map((poi) => (
                <Marker
                  key={poi.id}
                  longitude={poi.lng}
                  latitude={poi.lat}
                  anchor="center"
                >
                  <button
                    type="button"
                    onClick={() => setSelected({ poi })}
                    aria-label={`${poi.name}, school, ${poi.distance ?? "?"} miles away`}
                    className="flex items-center justify-center rounded-full bg-green-500/90 transition-opacity hover:opacity-90"
                    style={{ width: 44, height: 44 }}
                  >
                    <span className="flex items-center justify-center rounded-full bg-green-500/90" style={{ width: 32, height: 32 }}>
                      <GraduationCap className="h-4 w-4 text-white" aria-hidden="true" />
                    </span>
                  </button>
                </Marker>
              ))}

            {/* Restaurant markers */}
            {filters.restaurants &&
              restaurants.map((poi) => (
                <Marker
                  key={poi.id}
                  longitude={poi.lng}
                  latitude={poi.lat}
                  anchor="center"
                >
                  <button
                    type="button"
                    onClick={() => setSelected({ poi })}
                    aria-label={`${poi.name}, restaurant, ${poi.distance ?? "?"} miles away`}
                    className="flex items-center justify-center rounded-full bg-amber-500/90 transition-opacity hover:opacity-90"
                    style={{ width: 44, height: 44 }}
                  >
                    <span className="flex items-center justify-center rounded-full bg-amber-500/90" style={{ width: 32, height: 32 }}>
                      <UtensilsCrossed className="h-4 w-4 text-white" aria-hidden="true" />
                    </span>
                  </button>
                </Marker>
              ))}

            {/* POI popup */}
            {selected && (
              <Popup
                longitude={selected.poi.lng}
                latitude={selected.poi.lat}
                anchor="bottom"
                onClose={() => setSelected(null)}
                closeButton={true}
                closeOnClick={false}
                className="[&_.mapboxgl-popup-content]:bg-card [&_.mapboxgl-popup-content]:border [&_.mapboxgl-popup-content]:border-border [&_.mapboxgl-popup-content]:rounded-lg [&_.mapboxgl-popup-content]:p-3 [&_.mapboxgl-popup-content]:shadow-xl"
              >
                <div className="min-w-[140px]">
                  <p className="text-base font-bold text-foreground leading-tight">
                    {selected.poi.name}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.05em] mt-0.5 capitalize">
                    {selected.poi.category}
                  </p>
                  {selected.poi.distance !== undefined && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {selected.poi.distance} mi away
                    </p>
                  )}
                </div>
              </Popup>
            )}
          </Map>
        </div>
      </section>
    </FadeIn>
  );
}
