export interface POIFeature {
  id: string;
  name: string;
  category: "school" | "restaurant" | "other";
  lat: number;
  lng: number;
  distance?: number; // miles
}

const MAPBOX_CATEGORIES = {
  school: "school",
  restaurant: "restaurant",
} as const;

export async function fetchNearbyPOI(
  lng: number,
  lat: number,
  category: "school" | "restaurant",
  accessToken: string
): Promise<POIFeature[]> {
  const mapboxCategory = MAPBOX_CATEGORIES[category];
  const url = new URL(
    `https://api.mapbox.com/search/searchbox/v1/category/${mapboxCategory}`
  );
  url.searchParams.set("proximity", `${lng},${lat}`);
  url.searchParams.set("limit", "5");
  url.searchParams.set("access_token", accessToken);

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const data = await res.json();
    const features = data.features ?? [];

    return features.map((f: Record<string, unknown>) => {
      const geometry = f.geometry as { coordinates?: [number, number] } | null;
      const [fLng, fLat] = geometry?.coordinates ?? [0, 0];

      // Haversine formula — approximate distance in miles
      const R = 3959; // Earth radius in miles
      const dLat = ((fLat - lat) * Math.PI) / 180;
      const dLng = ((fLng - lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat * Math.PI) / 180) *
          Math.cos((fLat * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
      const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      const properties = f.properties as Record<string, unknown> | null;
      return {
        id:
          (properties?.mapbox_id as string | undefined) ??
          (f.id as string | undefined) ??
          `${category}-${fLng}-${fLat}`,
        name: (properties?.name as string | undefined) ?? "Unknown",
        category,
        lat: fLat,
        lng: fLng,
        distance: Math.round(distance * 10) / 10,
      };
    });
  } catch {
    // Graceful fallback — community map still renders with just the center pin
    return [];
  }
}
