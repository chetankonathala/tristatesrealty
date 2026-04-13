"use client"

import { motion, useReducedMotion } from "framer-motion"

const DIRECTION_MAP = {
  up: { y: 24, x: 0 },
  down: { y: -24, x: 0 },
  left: { x: 24, y: 0 },
  right: { x: -24, y: 0 },
}

interface ScrollRevealProps {
  children: React.ReactNode
  direction?: "up" | "down" | "left" | "right"
  delay?: number
  duration?: number
  className?: string
}

export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.5,
  className,
}: ScrollRevealProps) {
  const reduced = useReducedMotion()
  const offset = DIRECTION_MAP[direction]

  return (
    <motion.div
      initial={reduced ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, ease: "easeOut", delay }}
      style={{ willChange: "transform, opacity" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
