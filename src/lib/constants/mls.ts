// Bright MLS attribution copy — IDX-09 compliance.
// Update if Bright MLS issues different verbiage.
export const MLS_ATTRIBUTION = {
  copyright: (year: number) =>
    `© ${year} Bright MLS. All rights reserved. Information deemed reliable but not guaranteed.`,
  providedBy: (firmName: string, agentName?: string | null, agentPhone?: string | null) => {
    const parts = [`Listing provided by ${firmName}`];
    if (agentName) parts.push(agentName);
    if (agentPhone) parts.push(agentPhone);
    return parts.join(" — ");
  },
  lastUpdatedLabel: "Last updated",
} as const;

export const FAIR_HOUSING_ALT = "Equal Housing Opportunity";
export const BRIGHT_MLS_LOGO_ALT = "Bright MLS";
