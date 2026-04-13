"use client"

import { motion, useReducedMotion, type Transition } from "framer-motion"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  const reduced = useReducedMotion()

  const item = (delay: number) => ({
    initial: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" as Transition["ease"], delay: reduced ? 0 : delay },
  })

  return (
    <section className="relative min-h-screen overflow-hidden flex items-center justify-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-card/50 to-background" />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />

      {/* Content */}
      <div
        className="relative z-10 mx-auto max-w-[560px] px-4 text-center"
        style={{ willChange: "transform, opacity" }}
      >
        <motion.h1
          {...item(0)}
          className="font-display text-[32px] md:text-5xl lg:text-6xl font-bold text-foreground leading-tight"
        >
          Find Your Dream Home
        </motion.h1>

        <motion.p
          {...item(0.15)}
          className="mt-4 font-body text-base text-muted-foreground max-w-lg mx-auto"
        >
          Discover luxury properties across Delaware, Maryland, New Jersey, and Pennsylvania.
        </motion.p>

        <motion.div
          {...item(0.3)}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button variant="default" size="lg">
            Explore Properties
          </Button>
          <Button variant="secondary" size="lg">
            Get a Home Valuation
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
