"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Easing } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Community } from "@/types/community";

interface CommunityHeroProps {
  community: Community;
  onScheduleTour: () => void;
}

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function formatPrice(price: number): string {
  return priceFormatter.format(price);
}

const EASE_OUT: Easing = "easeOut";

export function CommunityHero({ community, onScheduleTour }: CommunityHeroProps) {
  const reduced = useReducedMotion();

  const fadeVariant = (delay: number) => ({
    initial: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: EASE_OUT, delay },
  });

  const triggerLabel = community.is_sold_out ? "Join Waitlist" : "Schedule a Tour";

  return (
    <section
      className={cn(
        "relative w-full overflow-hidden",
        "min-h-[50vh] lg:min-h-[70vh]"
      )}
      aria-label={`${community.name} hero`}
    >
      {/* Background image */}
      {community.featured_image_url ? (
        <Image
          src={community.featured_image_url}
          alt={`${community.name} community`}
          fill
          priority
          className="object-cover"
          style={
            community.is_sold_out
              ? { filter: "grayscale(0.6) brightness(0.8)" }
              : undefined
          }
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-card" />
      )}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(transparent 30%, rgba(10,10,10,0.85) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Sold-out badge */}
      {community.is_sold_out && (
        <div className="absolute top-6 right-6 z-10">
          <Badge
            variant="destructive"
            className="text-xs font-bold uppercase tracking-[0.05em]"
          >
            SOLD OUT
          </Badge>
        </div>
      )}

      {/* Content overlay — bottom-left */}
      <div className="absolute bottom-0 left-0 p-8 lg:p-12 pb-12 lg:pb-16 z-10 w-full lg:max-w-3xl">
        {/* Location label */}
        <motion.p
          {...fadeVariant(0)}
          className="text-xs font-bold uppercase tracking-[0.05em] text-muted-foreground font-[family-name:var(--font-montserrat)] mb-3"
        >
          {[community.city, community.state].filter(Boolean).join(", ")}
        </motion.p>

        {/* Community name */}
        <motion.h1
          {...fadeVariant(0.1)}
          className="text-[32px] lg:text-[48px] font-bold font-[family-name:var(--font-playfair-display)] text-foreground leading-tight mb-4"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
        >
          {community.name}
        </motion.h1>

        {/* Price */}
        {community.price_from !== null && (
          <motion.p
            {...fadeVariant(0.2)}
            className="text-2xl lg:text-[28px] font-bold font-[family-name:var(--font-playfair-display)] text-accent tabular-nums mb-6"
          >
            From {formatPrice(community.price_from)}
          </motion.p>
        )}

        {/* CTA */}
        <motion.div {...fadeVariant(0.3)}>
          <Button
            variant="default"
            className="h-11 px-6"
            onClick={onScheduleTour}
          >
            {triggerLabel}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
