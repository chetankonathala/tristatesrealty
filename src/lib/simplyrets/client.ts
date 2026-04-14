import type { SimplyRetsListing, SimplyRetsSearchParams } from "./types";

const BASE_URL = "https://api.simplyrets.com";

function getAuthHeader(): string {
  const key = process.env.SIMPLYRETS_API_KEY;
  const secret = process.env.SIMPLYRETS_API_SECRET;
  if (!key || !secret) {
    throw new Error("SIMPLYRETS_API_KEY and SIMPLYRETS_API_SECRET must be set");
  }
  const credentials = Buffer.from(`${key}:${secret}`).toString("base64");
  return `Basic ${credentials}`;
}

export async function fetchProperties(
  params: SimplyRetsSearchParams = {}
): Promise<{ listings: SimplyRetsListing[]; totalCount: number | null }> {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, String(v)));
    } else {
      searchParams.set(key, String(value));
    }
  }
  if (process.env.SIMPLYRETS_VENDOR && !searchParams.has("vendor")) {
    searchParams.set("vendor", process.env.SIMPLYRETS_VENDOR);
  }
  // Always request openHouses include so transform.ts can populate open_house_date (D-13 trigger)
  if (!searchParams.has("include")) {
    searchParams.append("include", "openHouses");
  }

  const res = await fetch(`${BASE_URL}/properties?${searchParams.toString()}`, {
    headers: { Authorization: getAuthHeader() },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`SimplyRETS error ${res.status}: ${await res.text()}`);
  }

  const totalCount = res.headers.get("X-Total-Count");
  const listings: SimplyRetsListing[] = await res.json();
  return { listings, totalCount: totalCount ? parseInt(totalCount, 10) : null };
}

export async function fetchProperty(mlsId: string | number): Promise<SimplyRetsListing> {
  const res = await fetch(`${BASE_URL}/properties/${mlsId}?include=openHouses`, {
    headers: { Authorization: getAuthHeader() },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`SimplyRETS error ${res.status}`);
  return res.json();
}

export type { SimplyRetsSearchParams, SimplyRetsListing };
