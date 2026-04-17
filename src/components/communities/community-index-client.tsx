"use client";

import { useState } from "react";
import { CommunityStateFilter } from "@/components/communities/community-state-filter";
import { CommunityIndexGrid } from "@/components/communities/community-index-grid";
import type { CommunityCardData } from "@/types/community";

interface CommunityIndexClientProps {
  communities: CommunityCardData[];
}

export function CommunityIndexClient({ communities }: CommunityIndexClientProps) {
  const [filter, setFilter] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <CommunityStateFilter selected={filter} onFilterChange={setFilter} />
      <CommunityIndexGrid communities={communities} filter={filter} />
    </div>
  );
}
