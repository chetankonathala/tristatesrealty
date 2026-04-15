import Image from "next/image";
import { MLS_ATTRIBUTION, FAIR_HOUSING_ALT, BRIGHT_MLS_LOGO_ALT } from "@/lib/constants/mls";

interface MlsAttributionProps {
  listingOfficeName: string | null;
  listingAgentName: string | null;
  listingAgentPhone: string | null;
  syncedAt: string;
}

export function MlsAttribution({ listingOfficeName, listingAgentName, listingAgentPhone, syncedAt }: MlsAttributionProps) {
  const year = new Date().getFullYear();
  return (
    <section className="border-t border-border bg-card mt-12">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-6 flex flex-col lg:flex-row items-start lg:items-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <Image src="/images/fair-housing-logo.svg" alt={FAIR_HOUSING_ALT} width={48} height={48} />
          <Image src="/images/bright-mls-logo.svg" alt={BRIGHT_MLS_LOGO_ALT} width={96} height={36} />
        </div>
        <div className="flex-1 space-y-1">
          {listingOfficeName && (
            <p>{MLS_ATTRIBUTION.providedBy(listingOfficeName, listingAgentName, listingAgentPhone)}</p>
          )}
          <p>{MLS_ATTRIBUTION.copyright(year)}</p>
          <p>
            {MLS_ATTRIBUTION.lastUpdatedLabel} {new Date(syncedAt).toLocaleString()}
          </p>
        </div>
      </div>
    </section>
  );
}
