"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { NavLink } from "./nav-link"

const NAV_LINKS = [
  { href: "/listings", label: "Properties" },
  { href: "/communities", label: "Communities" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
]

interface MobileMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileMenu({ open, onOpenChange }: MobileMenuProps) {
  const close = () => onOpenChange(false)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-[300px] flex-col bg-background/[0.98] backdrop-blur-md sm:w-[360px]"
      >
        <SheetHeader>
          <SheetTitle className="font-display text-xl text-accent">
            Tri States Realty
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-8 flex flex-1 flex-col gap-6">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.label} href={link.href} onClick={close}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="pb-6">
          <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground">
            Contact Agent
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
