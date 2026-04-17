"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Community } from "@/types/community";

interface CommunityOverviewProps {
  community: Community;
}

const TRUNCATION_THRESHOLD = 500;

export function CommunityOverview({ community }: CommunityOverviewProps) {
  const [expanded, setExpanded] = useState(false);

  const description = community.description ?? community.short_description;

  if (!description) {
    return null;
  }

  const shouldTruncate = description.length > TRUNCATION_THRESHOLD;
  const displayText =
    shouldTruncate && !expanded
      ? description.slice(0, TRUNCATION_THRESHOLD)
      : description;

  const directionsUrl = community.sales_center_address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(community.sales_center_address)}`
    : null;

  return (
    <FadeIn>
      <section
        className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8"
        aria-label={`About ${community.name}`}
      >
        <h2 className="text-[28px] font-bold font-[family-name:var(--font-playfair-display)] text-foreground mb-6">
          About {community.name}
        </h2>

        <div className="max-w-[800px]">
          {/* Description with truncation */}
          <div className="relative">
            <p
              className={cn(
                "text-base font-[family-name:var(--font-montserrat)] text-foreground leading-[1.6]",
                shouldTruncate && !expanded && "line-clamp-none"
              )}
            >
              {displayText}
              {shouldTruncate && !expanded && "..."}
            </p>

            {/* Fade gradient when truncated */}
            {shouldTruncate && !expanded && (
              <div
                className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(transparent, var(--background))",
                }}
                aria-hidden="true"
              />
            )}
          </div>

          {/* Read more / Show less toggle */}
          {shouldTruncate && (
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className="mt-3 text-accent text-base font-[family-name:var(--font-montserrat)] cursor-pointer hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-expanded={expanded}
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}

          {/* Sales center card */}
          {community.sales_center_address && (
            <div className="mt-6 bg-card border border-border rounded-lg p-4 flex items-start gap-3">
              <MapPin
                className="text-accent shrink-0 mt-0.5"
                size={16}
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.05em] text-muted-foreground font-[family-name:var(--font-montserrat)] mb-1">
                  Sales Center
                </p>
                <p className="text-base font-[family-name:var(--font-montserrat)] text-foreground leading-snug">
                  {community.sales_center_address}
                </p>
              </div>
              {directionsUrl && (
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0"
                  aria-label={`Get directions to ${community.name} sales center`}
                >
                  <Button variant="ghost" size="sm">
                    Get Directions
                  </Button>
                </a>
              )}
            </div>
          )}
        </div>
      </section>
    </FadeIn>
  );
}
