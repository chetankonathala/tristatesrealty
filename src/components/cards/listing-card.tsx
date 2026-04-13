import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ListingCardProps {
  image: string
  price: number
  address: string
  beds: number
  baths: number
  sqft: number
  status?: "active" | "pending" | "sold"
  featured?: boolean
  isNew?: boolean
  href?: string
  className?: string
}

export function ListingCard({
  image,
  price,
  address,
  beds,
  baths,
  sqft,
  featured,
  isNew,
  href,
  className,
}: ListingCardProps) {
  const card = (
    <div
      className={cn(
        "bg-card border border-border rounded-lg overflow-hidden",
        "transition-all duration-200 hover:border-border-hover hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={image}
          alt={address}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Badge overlay */}
        {(featured || isNew) && (
          <div className="absolute top-3 right-3">
            {featured && <Badge variant="featured">Featured</Badge>}
            {isNew && !featured && <Badge variant="new">New</Badge>}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="font-display text-xl font-bold text-accent">
          ${price.toLocaleString()}
        </p>
        <p className="text-foreground text-base mt-1 line-clamp-1">{address}</p>
        <p className="text-muted-foreground text-xs uppercase tracking-[0.05em] mt-2">
          {beds} beds &nbsp;|&nbsp; {baths} baths &nbsp;|&nbsp; {sqft.toLocaleString()} sqft
        </p>
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{card}</Link>
  }

  return card
}
