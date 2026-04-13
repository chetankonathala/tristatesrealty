import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded px-2 text-xs font-bold uppercase tracking-[0.05em] whitespace-nowrap transition-all",
  {
    variants: {
      variant: {
        default: "bg-muted text-foreground",
        featured: "bg-accent-muted text-accent",
        new: "bg-accent-muted text-accent",
        status: "bg-muted text-muted-foreground",
        destructive: "bg-destructive/10 text-destructive",
        outline: "border border-border text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
