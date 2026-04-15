import { ListingCard } from "@/components/cards/listing-card";
import type { ListingSummary } from "@/types/listing";

interface ComparableSalesGridProps {
  comps: ListingSummary[];
}

export function ComparableSalesGrid({ comps }: ComparableSalesGridProps) {
  return (
    <section className="max-w-[1280px] mx-auto px-4 lg:px-8">
      <h2 className="font-[var(--font-playfair-display)] text-2xl lg:text-3xl font-bold text-foreground mb-2">Comparable Recent Sales</h2>
      <p className="text-sm text-muted-foreground mb-6">Homes sold within 1 mile in the last 6 months</p>
      {comps.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comparable sales found in this area.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comps.map((c) => (
            <ListingCard key={c.mls_id} listing={c} />
          ))}
        </div>
      )}
    </section>
  );
}
