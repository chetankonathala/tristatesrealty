import Link from "next/link"
import { Globe, Mail, Share2 } from "lucide-react"

const QUICK_LINKS = [
  { href: "/", label: "Properties" },
  { href: "/", label: "Communities" },
  { href: "/", label: "About" },
  { href: "/", label: "Contact" },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-[1280px] px-4 py-12 md:px-6 lg:px-8">
        <div className="grid min-h-[160px] grid-cols-1 gap-10 md:grid-cols-4">
          {/* Column 1: Brand */}
          <div className="flex flex-col gap-3">
            <span className="font-display text-xl font-semibold text-accent">
              Tri States Realty
            </span>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your Trusted Real Estate Partner in Delaware, Maryland, New Jersey &amp; Pennsylvania
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-3">
            <h3 className="font-body text-sm font-bold uppercase tracking-[0.04em] text-foreground">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors duration-200 hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="flex flex-col gap-3">
            <h3 className="font-body text-sm font-bold uppercase tracking-[0.04em] text-foreground">
              Contact
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li>(302) 555-0100</li>
              <li>info@tristatesrealty.com</li>
              <li>Serving DE, MD, NJ &amp; PA</li>
            </ul>
          </div>

          {/* Column 4: Social */}
          <div className="flex flex-col gap-3">
            <h3 className="font-body text-sm font-bold uppercase tracking-[0.04em] text-foreground">
              Follow Us
            </h3>
            <div className="flex gap-4">
              <a href="#" aria-label="Website" className="text-muted-foreground transition-colors duration-200 hover:text-accent">
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Email" className="text-muted-foreground transition-colors duration-200 hover:text-accent">
                <Mail className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Share" className="text-muted-foreground transition-colors duration-200 hover:text-accent">
                <Share2 className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 Tri States Realty. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
