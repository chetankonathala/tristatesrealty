import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded border border-border bg-muted px-4 py-3 text-base text-foreground transition-colors outline-none placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
