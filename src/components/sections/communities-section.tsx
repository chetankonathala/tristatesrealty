import { CommunityCard } from "@/components/cards/community-card"
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children"

const PLACEHOLDER_COMMUNITIES = [
  {
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    name: "Bayberry at Bethany",
    location: "Bethany Beach, DE",
    priceRange: "$450k – $750k",
  },
  {
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    name: "The Overlook at Rockhill",
    location: "Rockville, MD",
    priceRange: "$550k – $900k",
  },
  {
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    name: "Coastal Club",
    location: "Ocean City, NJ",
    priceRange: "$600k – $1.2M",
  },
]

export function CommunitiesSection() {
  return (
    <section className="pt-16 md:pt-[64px] pb-16 bg-card/30">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">
        <FadeIn>
          <h2 className="font-display text-[28px] font-bold text-foreground">
            Explore Communities
          </h2>
        </FadeIn>

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {PLACEHOLDER_COMMUNITIES.map((community, i) => (
            <StaggerItem key={i}>
              <CommunityCard {...community} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  )
}
