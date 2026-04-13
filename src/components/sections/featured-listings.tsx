import { ListingCard } from "@/components/cards/listing-card"
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children"

const PLACEHOLDER_LISTINGS = [
  {
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
    price: 649000,
    address: "214 Brandywine Ct, Wilmington, DE 19808",
    beds: 4,
    baths: 3,
    sqft: 2840,
    featured: true,
  },
  {
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
    price: 425000,
    address: "88 Osprey Way, Annapolis, MD 21401",
    beds: 3,
    baths: 2,
    sqft: 1920,
    isNew: true,
  },
  {
    image: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80",
    price: 825000,
    address: "6 Lighthouse Rd, Cape May, NJ 08204",
    beds: 5,
    baths: 4,
    sqft: 3600,
    featured: true,
  },
  {
    image: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=80",
    price: 375000,
    address: "1402 Valley Forge Ln, Wayne, PA 19087",
    beds: 3,
    baths: 2,
    sqft: 1750,
  },
  {
    image: "https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=800&q=80",
    price: 549000,
    address: "33 Harbor View Dr, Bethany Beach, DE 19930",
    beds: 4,
    baths: 3,
    sqft: 2300,
    isNew: true,
  },
  {
    image: "https://images.unsplash.com/photo-1505873242700-f289a29e1724?w=800&q=80",
    price: 720000,
    address: "910 Chesapeake Blvd, Easton, MD 21601",
    beds: 5,
    baths: 3,
    sqft: 3100,
  },
]

export function FeaturedListingsSection() {
  return (
    <section className="pt-16 md:pt-[64px] pb-16">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">
        <FadeIn>
          <h2 className="font-display text-[28px] font-bold text-foreground">
            Featured Properties
          </h2>
        </FadeIn>

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {PLACEHOLDER_LISTINGS.map((listing, i) => (
            <StaggerItem key={i}>
              <ListingCard {...listing} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  )
}
