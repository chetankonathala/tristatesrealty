import { ListingCard } from "@/components/cards/listing-card"
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children"
import type { ListingSummary } from "@/types/listing"

const PLACEHOLDER_LISTINGS: ListingSummary[] = [
  {
    mls_id: 1001,
    list_price: 649000,
    status: "Active",
    address_full: "214 Brandywine Ct, Wilmington, DE 19808",
    address_city: "Wilmington",
    address_state: "DE",
    bedrooms: 4,
    bathrooms: 3,
    area: 2840,
    photos: ["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80"],
    lat: 39.7391,
    lng: -75.5398,
    list_date: null,
    days_on_market: null,
    open_house_date: null,
  },
  {
    mls_id: 1002,
    list_price: 425000,
    status: "Active",
    address_full: "88 Osprey Way, Annapolis, MD 21401",
    address_city: "Annapolis",
    address_state: "MD",
    bedrooms: 3,
    bathrooms: 2,
    area: 1920,
    photos: ["https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80"],
    lat: 38.9784,
    lng: -76.4922,
    list_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    days_on_market: 3,
    open_house_date: null,
  },
  {
    mls_id: 1003,
    list_price: 825000,
    status: "Active",
    address_full: "6 Lighthouse Rd, Cape May, NJ 08204",
    address_city: "Cape May",
    address_state: "NJ",
    bedrooms: 5,
    bathrooms: 4,
    area: 3600,
    photos: ["https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80"],
    lat: 38.9351,
    lng: -74.9060,
    list_date: null,
    days_on_market: null,
    open_house_date: null,
  },
  {
    mls_id: 1004,
    list_price: 375000,
    status: "Active",
    address_full: "1402 Valley Forge Ln, Wayne, PA 19087",
    address_city: "Wayne",
    address_state: "PA",
    bedrooms: 3,
    bathrooms: 2,
    area: 1750,
    photos: ["https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=80"],
    lat: 40.0440,
    lng: -75.3862,
    list_date: null,
    days_on_market: null,
    open_house_date: null,
  },
  {
    mls_id: 1005,
    list_price: 549000,
    status: "Active",
    address_full: "33 Harbor View Dr, Bethany Beach, DE 19930",
    address_city: "Bethany Beach",
    address_state: "DE",
    bedrooms: 4,
    bathrooms: 3,
    area: 2300,
    photos: ["https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=800&q=80"],
    lat: 38.5376,
    lng: -75.0596,
    list_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    days_on_market: 2,
    open_house_date: null,
  },
  {
    mls_id: 1006,
    list_price: 720000,
    status: "Active",
    address_full: "910 Chesapeake Blvd, Easton, MD 21601",
    address_city: "Easton",
    address_state: "MD",
    bedrooms: 5,
    bathrooms: 3,
    area: 3100,
    photos: ["https://images.unsplash.com/photo-1505873242700-f289a29e1724?w=800&q=80"],
    lat: 38.7743,
    lng: -76.0763,
    list_date: null,
    days_on_market: null,
    open_house_date: null,
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
          {PLACEHOLDER_LISTINGS.map((listing) => (
            <StaggerItem key={listing.mls_id}>
              <ListingCard listing={listing} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  )
}
