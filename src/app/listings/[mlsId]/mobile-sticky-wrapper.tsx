"use client";

import { MobileDetailStickyBar } from "@/components/listings/mobile-detail-sticky-bar";

interface MobileDetailStickyBarWrapperProps {
  price: number;
  daysOnMarket: number | null;
}

// Thin client wrapper so the server page component can render MobileDetailStickyBar
// without passing a non-serializable function prop across the server/client boundary.
// The contact-agent modal will be wired in a future plan (plan 02-12).
export function MobileDetailStickyBarWrapper({ price, daysOnMarket }: MobileDetailStickyBarWrapperProps) {
  return (
    <MobileDetailStickyBar
      price={price}
      daysOnMarket={daysOnMarket}
      onContactAgent={() => {
        /* stub — plan 02-12 wires the agent contact modal */
      }}
    />
  );
}
