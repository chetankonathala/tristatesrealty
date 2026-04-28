"use client"

import { cn } from "@/lib/utils"

interface FilterPillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean
  className?: string
}

export function FilterPill({ selected = false, children, className, ...rest }: FilterPillProps) {
  return (
    <button
      type="button"
      className={cn(
        "h-9 px-4 rounded-full text-sm font-medium transition-colors",
        "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected
          ? "bg-accent-muted text-accent border-accent"
          : "bg-muted text-foreground border-border hover:border-border-hover",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
