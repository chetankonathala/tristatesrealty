"use client"

import { useCallback, useEffect, useState } from "react"
import Particles, { initParticlesEngine } from "@tsparticles/react"
import { loadSlim } from "@tsparticles/slim"
import type { ISourceOptions } from "@tsparticles/engine"

const PARTICLES_CONFIG: ISourceOptions = {
  fpsLimit: 60,
  particles: {
    number: { value: 60, density: { enable: true } },
    color: { value: "#C9A84C" },
    opacity: {
      value: { min: 0.1, max: 0.4 },
      animation: { enable: true, speed: 0.5, sync: false },
    },
    size: {
      value: { min: 1, max: 2.5 },
    },
    links: {
      enable: true,
      color: "#C9A84C",
      opacity: 0.15,
      distance: 140,
      width: 1,
    },
    move: {
      enable: true,
      speed: 0.4,
      direction: "none",
      random: true,
      outModes: { default: "bounce" },
    },
  },
  interactivity: {
    events: {
      onHover: { enable: true, mode: "grab" },
    },
    modes: {
      grab: { distance: 160, links: { opacity: 0.35 } },
    },
  },
  detectRetina: true,
}

export function HeroParticles() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => setReady(true))
  }, [])

  const particlesLoaded = useCallback(async () => {}, [])

  if (!ready) return null

  return (
    <Particles
      id="hero-particles"
      particlesLoaded={particlesLoaded}
      options={PARTICLES_CONFIG}
      className="absolute inset-0 z-20"
    />
  )
}
