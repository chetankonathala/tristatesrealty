import { HeroSection } from "@/components/sections/hero"
import { FeaturedListingsSection } from "@/components/sections/featured-listings"
import { CommunitiesSection } from "@/components/sections/communities-section"
import { CTABanner } from "@/components/sections/cta-banner"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedListingsSection />
      <CommunitiesSection />
      <CTABanner />
    </>
  )
}
