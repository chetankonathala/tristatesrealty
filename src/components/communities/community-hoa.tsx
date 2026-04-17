import { FadeIn } from "@/components/motion/fade-in";
import type { Community } from "@/types/community";

interface CommunityHoaProps {
  community: Community;
}

interface HoaColumnProps {
  label: string;
  value: string;
}

function HoaColumn({ label, value }: HoaColumnProps) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.05em] text-muted-foreground font-[family-name:var(--font-montserrat)] mb-1">
        {label}
      </p>
      <p className="text-base font-bold font-[family-name:var(--font-montserrat)] text-foreground tabular-nums">
        {value}
      </p>
    </div>
  );
}

export function CommunityHoa({ community }: CommunityHoaProps) {
  const { hoa_name, hoa_fee, hoa_yearly_fee } = community;

  // Return null if all HOA fields are null
  if (hoa_name === null && hoa_fee === null && hoa_yearly_fee === null) {
    return null;
  }

  // No-HOA variant: zero fees
  const noFees = hoa_fee === 0 && hoa_yearly_fee === 0;

  return (
    <FadeIn>
      <section
        className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8"
        aria-label="HOA Information"
      >
        <h2 className="text-[28px] font-bold font-[family-name:var(--font-playfair-display)] text-foreground mb-6">
          HOA Information
        </h2>

        <div className="bg-card border border-border rounded-lg p-6">
          {noFees ? (
            <p className="text-base font-[family-name:var(--font-montserrat)] text-muted-foreground">
              No HOA fees for this community
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {hoa_name && (
                <HoaColumn label="HOA Name" value={hoa_name} />
              )}
              {hoa_fee !== null && hoa_fee !== 0 && (
                <HoaColumn label="Monthly Fee" value={`$${hoa_fee.toLocaleString()}/mo`} />
              )}
              {hoa_yearly_fee !== null && hoa_yearly_fee !== 0 && (
                <HoaColumn label="Annual Fee" value={`$${hoa_yearly_fee.toLocaleString()}/yr`} />
              )}
            </div>
          )}
        </div>
      </section>
    </FadeIn>
  );
}
