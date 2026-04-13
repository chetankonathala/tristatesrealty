import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface CommunityCardProps {
  image: string
  name: string
  location: string
  priceRange: string
  href?: string
  className?: string
}

export function CommunityCard({
  image,
  name,
  location,
  priceRange,
  href,
  className,
}: CommunityCardProps) {
  const card = (
    <div
      className={cn(
        "relative bg-card border border-border rounded-lg overflow-hidden aspect-[4/3]",
        "transition-all duration-200 hover:border-border-hover hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20",
        className
      )}
    >
      <Image
        src={image}
        alt={name}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,10,0.9)] via-transparent to-transparent" />

      {/* Text content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="font-display text-2xl font-bold text-foreground leading-tight">
          {name}
        </h3>
        <p className="text-muted-foreground text-sm mt-0.5">{location}</p>
        <p className="text-accent text-sm mt-0.5">{priceRange}</p>
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{card}</Link>
  }

  return card
}
