"use client"

import { useEffect, useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SkipLink } from "./skip-link"
import { NavLink } from "./nav-link"
import { MobileMenu } from "./mobile-menu"

const NAV_LINKS = [
  { href: "/listings", label: "Properties" },
  { href: "/communities", label: "Communities" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <SkipLink />
      <header
        className={cn(
          "sticky top-0 z-50 h-16 md:h-[72px] will-change-transform transition-colors duration-300",
          scrolled ? "bg-card/95 backdrop-blur-md border-b border-border" : "bg-transparent"
        )}
      >
        <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-4 md:px-6 lg:px-8">
          {/* Logo */}
          <span className="font-display text-xl font-semibold tracking-wide text-accent">
            Tri States Realty
          </span>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.label} href={link.href}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <a href="/#contact" className="inline-flex items-center justify-center rounded-md border border-accent px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-background">
              Contact Agent
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex items-center justify-center md:hidden text-foreground"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  )
}
