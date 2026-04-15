import type { Listing } from "@/types/listing";

interface SpecCellProps { label: string; value: string | number | null }
function SpecCell({ label, value }: SpecCellProps) {
  return (
    <div className="space-y-1">
      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-base font-bold text-foreground">{value ?? "—"}</div>
    </div>
  );
}

export function ListingSpecGrid({ listing }: { listing: Listing }) {
  return (
    <section className="max-w-[1280px] mx-auto px-4 lg:px-8">
      <h2 className="font-[var(--font-playfair-display)] text-2xl lg:text-3xl font-bold text-foreground mb-6">Property Details</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 rounded-lg border border-border bg-card p-6">
        <SpecCell label="MLS #" value={listing.mls_id} />
        <SpecCell label="Lot Size" value={listing.lot_size ? `${listing.lot_size} acres` : null} />
        <SpecCell label="Year Built" value={listing.year_built} />
        <SpecCell label="Property Type" value={listing.type} />
        <SpecCell label="Days on Market" value={listing.days_on_market} />
        <SpecCell label="HOA Fee" value={listing.hoa_fee ? `$${listing.hoa_fee}/${listing.hoa_frequency ?? "mo"}` : null} />
        <SpecCell label="Garage" value={listing.garage_spaces ? `${listing.garage_spaces} car` : null} />
        <SpecCell label="Stories" value={listing.stories} />
      </div>
    </section>
  );
}
