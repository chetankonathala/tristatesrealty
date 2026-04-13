"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface NavLinkProps {
  href: string
  children: React.ReactNode
  onClick?: () => void
}

export function NavLink({ href, children, onClick }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "relative font-body text-base font-bold uppercase tracking-[0.04em] text-foreground transition-colors duration-200 hover:text-accent",
        "after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-full after:bg-accent after:transition-opacity after:duration-200",
        isActive ? "text-accent after:opacity-100" : "after:opacity-0 hover:after:opacity-100"
      )}
    >
      {children}
    </Link>
  )
}
