import {
  Waves,
  Dumbbell,
  Baby,
  Building,
  TreePine,
  CircleDot,
  Dog,
  Check,
} from "lucide-react";
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";
import type { LucideIcon } from "lucide-react";

interface CommunityAmenitiesProps {
  amenities: { name: string; icon?: string }[];
}

function getAmenityIcon(name: string): LucideIcon {
  const lower = name.toLowerCase();
  if (lower.includes("pool") || lower.includes("swimming")) return Waves;
  if (lower.includes("fitness") || lower.includes("gym")) return Dumbbell;
  if (lower.includes("playground")) return Baby;
  if (lower.includes("clubhouse") || lower.includes("club")) return Building;
  if (lower.includes("trail") || lower.includes("walking") || lower.includes("path")) return TreePine;
  if (lower.includes("tennis")) return CircleDot;
  if (lower.includes("dog") || lower.includes("pet")) return Dog;
  return Check;
}

export function CommunityAmenities({ amenities }: CommunityAmenitiesProps) {
  if (amenities.length === 0) {
    return null;
  }

  return (
    <section
      className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8"
      aria-label="Community amenities"
    >
      <h2 className="text-[28px] font-bold font-[family-name:var(--font-playfair-display)] text-foreground mb-6">
        Community Amenities
      </h2>

      <StaggerChildren
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        staggerDelay={0.03}
      >
        <ul
          className="contents"
          aria-label="Community amenities"
        >
          {amenities.map((amenity, index) => {
            const Icon = getAmenityIcon(amenity.name);
            return (
              <StaggerItem key={`${amenity.name}-${index}`}>
                <li className="bg-card rounded-lg px-4 py-2 flex items-center gap-3 border border-border">
                  <Icon
                    size={16}
                    className="text-accent shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-base font-[family-name:var(--font-montserrat)] text-foreground">
                    {amenity.name}
                  </span>
                </li>
              </StaggerItem>
            );
          })}
        </ul>
      </StaggerChildren>
    </section>
  );
}
