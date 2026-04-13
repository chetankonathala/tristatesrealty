import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/motion/fade-in"

export function CTABanner() {
  return (
    <section className="bg-accent-muted">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 py-16 text-center">
        <FadeIn>
          <h2 className="font-display text-[28px] md:text-[36px] font-bold text-foreground">
            Ready to Find Your Dream Home?
          </h2>
          <p className="mt-4 font-body text-base text-muted-foreground max-w-xl mx-auto">
            Let us help you navigate the market with expert guidance and cutting-edge tools.
          </p>
          <div className="mt-8">
            <Button variant="default" size="lg">
              Contact Agent
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
