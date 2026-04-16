"use client";

import { useState } from "react";
import { MobileDetailStickyBar } from "@/components/listings/mobile-detail-sticky-bar";
import { ContactAgentModal } from "@/components/listings/contact-agent-modal";

interface MobileDetailStickyBarWrapperProps {
  price: number;
  daysOnMarket: number | null;
  mlsId: number;
  communityName?: string | null;
  floorPlanName?: string | null;
  listingAddress?: string | null;
}

export function MobileDetailStickyBarWrapper({
  price,
  daysOnMarket,
  mlsId,
  communityName,
  floorPlanName,
  listingAddress,
}: MobileDetailStickyBarWrapperProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <MobileDetailStickyBar
        price={price}
        daysOnMarket={daysOnMarket}
        onContactAgent={() => setModalOpen(true)}
      />
      {/* Render modal outside sticky bar so it can portal correctly */}
      <ContactAgentModal
        mlsId={mlsId}
        communityName={communityName}
        floorPlanName={floorPlanName}
        listingAddress={listingAddress}
        triggerClassName="hidden"
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}
