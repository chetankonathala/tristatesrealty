"use client"

import dynamic from "next/dynamic"
import { motion, useReducedMotion, type Transition } from "framer-motion"
import { Button } from "@/components/ui/button"
import { HeroParticles } from "./hero-particles"

const MapBackground = dynamic(
  () => import("@/components/map/map-container").then((m) => m.MapContainer),
  { ssr: false, loading: () => <div className="absolute inset-0 bg-background" /> }
)

export function HeroSection() {
  const reduced = useReducedMotion()

  const item = (delay: number) => ({
    initial: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" as Transition["ease"], delay: reduced ? 0 : delay },
  })

  return (
    <section className="relative min-h-screen overflow-hidden flex items-center justify-center">

      {/* Layer 1: Mapbox interactive map background */}
      <div className="absolute inset-0 z-0">
        <MapBackground
          variant="full-page"
          center={[-75.8, 39.2]}
          zoom={6.5}
          className="!rounded-none h-full"
        />
      </div>

      {/* Layer 2: Gradient overlay — keeps text readable */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-background/60 via-background/50 to-background/90" />

      {/* Layer 3: Gold particle constellation */}
      <HeroParticles />

      {/* Layer 4: Hero content */}
      <div className="relative z-30 mx-auto max-w-[560px] px-4 text-center">
        <motion.p
          {...item(0)}
          className="font-body text-xs uppercase tracking-[0.2em] text-accent mb-3"
        >
          Schell Brothers · Delaware
        </motion.p>

        <motion.h1
          {...item(0.05)}
          className="font-display text-[32px] md:text-5xl lg:text-6xl font-bold text-foreground leading-tight"
        >
          Find Your Dream Home in Delaware
        </motion.h1>

        <motion.p
          {...item(0.15)}
          className="mt-4 font-body text-base text-muted-foreground max-w-lg mx-auto"
        >
          Browse new construction communities by Schell Brothers — Delaware&apos;s premier home builder. Connect with a licensed agent to get started.
        </motion.p>

        <motion.div
          {...item(0.3)}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a href="/listings" className="inline-flex items-center justify-center rounded-md bg-accent px-6 py-3 text-base font-semibold text-background hover:bg-accent/90 transition-colors">
            Explore Communities
          </a>
          <a href="/listings?newConstruction=true" className="inline-flex items-center justify-center rounded-md border border-border bg-card/60 px-6 py-3 text-base font-semibold text-foreground hover:bg-card transition-colors">
            View Available Homes
          </a>
        </motion.div>
      </div>
    </section>
  )
}
