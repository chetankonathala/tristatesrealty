import Image from "next/image";
import { FAIR_HOUSING_ALT } from "@/lib/constants/mls";

interface MlsAttributionProps {
  listingOfficeName: string | null;
  listingAgentName: string | null;
  listingAgentPhone: string | null;
  syncedAt: string;
}

export function MlsAttribution({ listingAgentName, listingAgentPhone, syncedAt }: MlsAttributionProps) {
  const year = new Date().getFullYear();
  return (
    <section className="border-t border-border bg-card mt-12">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-6 flex flex-col lg:flex-row items-start lg:items-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <Image src="/images/fair-housing-logo.svg" alt={FAIR_HOUSING_ALT} width={48} height={48} />
        </div>
        <div className="flex-1 space-y-1">
          <p className="font-medium text-foreground">New construction homes by Schell Brothers · Delaware</p>
          {listingAgentName && (
            <p>
              Listed by {listingAgentName}
              {listingAgentPhone ? ` · ${listingAgentPhone}` : ""}
              {" · Schell Brothers Licensed Agent"}
            </p>
          )}
          <p>Last synced {new Date(syncedAt).toLocaleString()}</p>
          <p>© {year} Tri States Realty. Information deemed reliable but not guaranteed. Equal Housing Opportunity.</p>
        </div>
      </div>
    </section>
  );
}
