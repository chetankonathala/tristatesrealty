import type { HeartbeatCommunity, HeartbeatFloorPlan } from "./types";

const HEARTBEAT_BASE =
  "https://heartbeat.schellbrothers.com/?engine=data-warehouse&widget=admin/page-designer&opt=data";

const REFERER = "https://schellbrothers.com/";

// Delaware Beaches division_parent_id
const DIVISION_PARENT_ID = "1";
const SITE_ID = "8";

async function heartbeatGet<T>(params: Record<string, string>): Promise<T> {
  const url = new URL(HEARTBEAT_BASE);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), {
    headers: {
      Referer: REFERER,
      "User-Agent":
        "Mozilla/5.0 (compatible; TristatesRealty/1.0; +https://tristatesrealty.vercel.app)",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Heartbeat API error ${res.status}: ${url.toString()}`);
  }

  const data = await res.json();
  if (data === false) {
    throw new Error(`Heartbeat API returned false for params: ${JSON.stringify(params)}`);
  }

  return data as T;
}

export async function fetchDelawareCommunities(): Promise<HeartbeatCommunity[]> {
  const communities = await heartbeatGet<HeartbeatCommunity[]>({
    source: "communities",
    division_parent_id: DIVISION_PARENT_ID,
    t: Date.now().toString(),
  });
  return communities;
}

export async function fetchFloorPlans(communityId: string): Promise<HeartbeatFloorPlan[]> {
  const plans = await heartbeatGet<HeartbeatFloorPlan[]>({
    source: "floor-plans",
    division_parent_id: DIVISION_PARENT_ID,
    community_id: communityId,
    site_id: SITE_ID,
    order_by: "price",
    t: Date.now().toString(),
  });
  return Array.isArray(plans) ? plans : [];
}

// Division parent IDs for Schell Brothers states.
// Delaware = "1" is CONFIRMED from codebase (DIVISION_PARENT_ID constant).
// IDs 2-4 are ASSUMED sequential for MD/NJ/PA — unverified from Heartbeat API.
// DESIGN DECISION: Delaware-only at launch is the fallback. If IDs 2-4 return
// empty/false, those divisions are silently skipped — no breakage.
// The sync function logs actual API responses per division to confirm behavior.
export const SCHELL_DIVISIONS: Record<string, string> = {
  "1": "Delaware Beaches",
  "2": "Maryland",
  "3": "New Jersey",
  "4": "Pennsylvania",
};

export async function fetchCommunitiesByDivision(
  divisionId: string
): Promise<HeartbeatCommunity[]> {
  try {
    const result = await heartbeatGet<HeartbeatCommunity[]>({
      source: "communities",
      division_parent_id: divisionId,
      t: Date.now().toString(),
    });
    const communities = Array.isArray(result) ? result : [];
    // Log discovery: confirm which divisions actually return data
    console.log(
      `[Heartbeat] division_parent_id=${divisionId} (${SCHELL_DIVISIONS[divisionId] ?? "unknown"}): returned ${communities.length} communities`
    );
    return communities;
  } catch (err) {
    // Division may not exist — log and return empty
    console.warn(
      `[Heartbeat] division_parent_id=${divisionId} (${SCHELL_DIVISIONS[divisionId] ?? "unknown"}): fetch failed`,
      err instanceof Error ? err.message : err
    );
    return [];
  }
}

export async function fetchAllStateCommunities(): Promise<HeartbeatCommunity[]> {
  const allCommunities: HeartbeatCommunity[] = [];
  for (const divisionId of Object.keys(SCHELL_DIVISIONS)) {
    const communities = await fetchCommunitiesByDivision(divisionId);
    allCommunities.push(...communities);
    if (communities.length > 0) {
      // 300ms delay between successful requests to be polite
      await new Promise((r) => setTimeout(r, 300));
    }
  }
  return allCommunities;
}
