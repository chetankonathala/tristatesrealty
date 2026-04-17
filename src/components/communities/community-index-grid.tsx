import { CommunityCard } from "@/components/cards/community-card";
import { Badge } from "@/components/ui/badge";
import type { CommunityCardData } from "@/types/community";

interface CommunityIndexGridProps {
  communities: CommunityCardData[];
  filter: string | null;
}

export function CommunityIndexGrid({ communities, filter }: CommunityIndexGridProps) {
  // Apply state filter
  const filtered =
    filter === null
      ? communities
      : communities.filter((c) => c.state === filter);

  const stateName =
    filter === "DE"
      ? "Delaware"
      : filter === "MD"
      ? "Maryland"
      : filter === "NJ"
      ? "New Jersey"
      : filter === "PA"
      ? "Pennsylvania"
      : filter ?? "";

  if (filtered.length === 0) {
    return (
      <p className="text-base text-muted-foreground text-center py-12 font-[family-name:var(--font-montserrat)]">
        No active communities in {stateName} right now. Explore other states or check back soon.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filtered.map((c) => (
        <div key={c.slug} className="relative">
          <CommunityCard
            image={c.featured_image_url ?? "/images/community-placeholder.jpg"}
            name={c.name}
            location={[c.city, c.state].filter(Boolean).join(", ")}
            priceRange={c.price_from ? `From $${c.price_from.toLocaleString()}` : ""}
            href={`/communities/${c.slug}`}
            className={
              c.is_sold_out ? "grayscale-[0.4] brightness-[0.9]" : undefined
            }
          />
          {c.is_sold_out && (
            <div className="absolute top-3 left-3 z-10">
              <Badge
                variant="destructive"
                className="text-xs font-bold uppercase tracking-[0.05em]"
              >
                SOLD OUT
              </Badge>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
