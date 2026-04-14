"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { cn } from "@/lib/utils"

interface SliderProps {
  min?: number
  max?: number
  step?: number
  value?: number[]
  defaultValue?: number[]
  onValueChange?: (value: number[]) => void
  disabled?: boolean
  className?: string
  "aria-label"?: string
}

function Slider({
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue,
  onValueChange,
  disabled,
  className,
  "aria-label": ariaLabel,
}: SliderProps) {
  return (
    <SliderPrimitive.Root
      min={min}
      max={max}
      step={step}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      aria-label={ariaLabel}
    >
      <SliderPrimitive.Control className="relative flex w-full items-center">
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted">
          <SliderPrimitive.Indicator className="absolute h-full bg-accent" />
        </SliderPrimitive.Track>
        {/* Render thumbs for each value */}
        {(value ?? defaultValue ?? [0]).map((_, i) => (
          <SliderPrimitive.Thumb
            key={i}
            className={cn(
              "block h-5 w-5 rounded-full border-2 border-accent bg-background ring-offset-background transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:opacity-50",
              "data-dragging:scale-110"
            )}
            aria-label={ariaLabel ? `${ariaLabel} ${i + 1}` : undefined}
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
