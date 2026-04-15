"use client";
import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import Map, { type MapRef, type ViewStateChangeEvent } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import useSupercluster from "use-supercluster";
import { useQueryState, parseAsString } from "nuqs";
import { MapMarker } from "./map-marker";
import { MapCluster } from "./map-cluster";
import type { ListingSummary } from "@/types/listing";

interface SearchMapProps {
  listings: ListingSummary[];
  selectedMlsId: number | null;
  onSelect: (mlsId: number | null) => void;
  initialViewState?: { longitude: number; latitude: number; zoom: number };
}

export function SearchMap({ listings, selectedMlsId, onSelect, initialViewState }: SearchMapProps) {
  const mapRef = useRef<MapRef | null>(null);
  const [, setBounds] = useQueryState("bounds", parseAsString);
  const [viewState, setViewState] = useState(
    initialViewState ?? { longitude: -75.5277, latitude: 39.0, zoom: 7 }
  );
  const [mapBounds, setMapBounds] = useState<[number, number, number, number] | null>(null);

  // Convert listings to GeoJSON points
  const points = useMemo(
    () =>
      listings
        .filter((l): l is ListingSummary & { lat: number; lng: number } => l.lat != null && l.lng != null)
        .map((l) => ({
          type: "Feature" as const,
          properties: {
            cluster: false,
            mlsId: l.mls_id,
            price: l.list_price,
          },
          geometry: { type: "Point" as const, coordinates: [l.lng, l.lat] },
        })),
    [listings]
  );

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds: mapBounds ?? undefined,
    zoom: viewState.zoom,
    options: { radius: 75, maxZoom: 16 },
  });

  // Search-as-you-move: write current bounds to URL on move-end (D-02)
  const handleMoveEnd = useCallback((e: ViewStateChangeEvent) => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const b = map.getBounds();
    if (!b) return;
    const sw = b.getSouthWest();
    const ne = b.getNorthEast();
    const boundsArr: [number, number, number, number] = [sw.lng, sw.lat, ne.lng, ne.lat];
    setMapBounds(boundsArr);
    setBounds(`${sw.lng.toFixed(6)},${sw.lat.toFixed(6)},${ne.lng.toFixed(6)},${ne.lat.toFixed(6)}`);
    setViewState(e.viewState);
  }, [setBounds]);

  // Init bounds on first map load
  const handleLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const b = map.getBounds();
    if (!b) return;
    const sw = b.getSouthWest();
    const ne = b.getNorthEast();
    setMapBounds([sw.lng, sw.lat, ne.lng, ne.lat]);
  }, []);

  // Fly to selected listing (D-04 marker → card sync)
  useEffect(() => {
    if (selectedMlsId == null) return;
    const target = listings.find((l) => l.mls_id === selectedMlsId);
    if (target?.lat != null && target?.lng != null) {
      mapRef.current?.flyTo({ center: [target.lng, target.lat], duration: 600 });
    }
  }, [selectedMlsId, listings]);

  return (
    <Map
      ref={mapRef}
      {...viewState}
      onMove={(e) => setViewState(e.viewState)}
      onMoveEnd={handleMoveEnd}
      onLoad={handleLoad}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      style={{ width: "100%", height: "100%" }}
    >
      {clusters.map((cluster) => {
        const [lng, lat] = cluster.geometry.coordinates;
        const { cluster: isCluster, point_count: pointCount, mlsId, price } = cluster.properties as {
          cluster?: boolean;
          point_count?: number;
          mlsId?: number;
          price?: number;
        };

        if (isCluster && pointCount && supercluster) {
          return (
            <MapCluster
              key={`cluster-${cluster.id}`}
              lat={lat}
              lng={lng}
              pointCount={pointCount}
              onClick={() => {
                const expansionZoom = Math.min(
                  supercluster.getClusterExpansionZoom(cluster.id as number),
                  16
                );
                mapRef.current?.flyTo({ center: [lng, lat], zoom: expansionZoom, duration: 400 });
              }}
            />
          );
        }

        return (
          <MapMarker
            key={`marker-${mlsId}`}
            lat={lat}
            lng={lng}
            selected={selectedMlsId === mlsId}
            onClick={() => onSelect(mlsId ?? null)}
            ariaLabel={`$${price?.toLocaleString() ?? ""} home, click to view`}
          />
        );
      })}
    </Map>
  );
}
