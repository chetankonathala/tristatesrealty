"use client";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ListingSummary } from "@/types/listing";

interface ListingCardProps {
  listing: ListingSummary;
  isSaved?: boolean;
  isAuthenticated?: boolean;
  onSave?: (mlsId: number) => void;
  onRequireSignIn?: () => void;
  highlighted?: boolean;
}

export function ListingCard({
  listing,
  isSaved = false,
  isAuthenticated = false,
  onSave,
  onRequireSignIn,
  highlighted = false,
}: ListingCardProps) {
  const photo = listing.photos?.[0];
  const photoCount = listing.photos?.length ?? 0;
  const isNew = listing.list_date
    ? Date.now() - new Date(listing.list_date).getTime() < 7 * 24 * 60 * 60 * 1000
    : false;

  const statusColor =
    listing.status === "Active"
      ? "bg-green-500"
      : listing.status === "Pending" || listing.status === "ActiveUnderContract"
        ? "bg-[#F59E0B]"
        : "bg-muted-foreground";

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      onRequireSignIn?.();
      return;
    }
    onSave?.(listing.mls_id);
  };

  return (
    <Link
      href={`/listings/${listing.mls_id}`}
      className={cn(
        "group relative block overflow-hidden rounded-lg border bg-card transition-colors",
        highlighted ? "border-accent" : "border-border hover:border-accent/60"
      )}
    >
      <div className="relative aspect-[4/3] bg-muted">
        {photo ? (
          <Image
            src={photo}
            alt={listing.address_full}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
            No photo
          </div>
        )}
        {/* Status dot */}
        <span
          className={cn(
            "absolute top-3 left-3 h-3 w-3 rounded-full ring-2 ring-background",
            statusColor
          )}
          aria-label={`Status: ${listing.status}`}
        />
        {/* Save button */}
        <button
          type="button"
          onClick={handleSaveClick}
          aria-label={isSaved ? "Saved" : "Save this home"}
          className="absolute top-2 right-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur hover:bg-background"
        >
          <Heart
            className={cn(
              "h-5 w-5",
              isSaved ? "fill-accent text-accent" : "text-muted-foreground"
            )}
          />
        </button>
        {/* Photo counter */}
        {photoCount > 0 && (
          <span className="absolute bottom-3 left-3 inline-flex items-center rounded-full bg-background/80 px-2 py-1 text-[11px] font-bold text-foreground backdrop-blur">
            {photoCount} photos
          </span>
        )}
        {/* Badges */}
        {(isNew || listing.status === "Pending") && (
          <div className="absolute top-3 left-9 flex gap-1.5">
            {isNew && (
              <span className="rounded-sm bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-background">
                NEW
              </span>
            )}
            {listing.status === "Pending" && (
              <span className="rounded-sm bg-[#F59E0B] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-background">
                PENDING
              </span>
            )}
          </div>
        )}
      </div>
      <div className="p-4 space-y-1">
        <div className="text-base font-bold text-accent tabular-nums">
          ${listing.list_price.toLocaleString()}
        </div>
        <div className="line-clamp-2 text-base text-foreground">{listing.address_full}</div>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {listing.bedrooms ?? "—"} bd · {listing.bathrooms ?? "—"} ba ·{" "}
          {listing.area?.toLocaleString() ?? "—"} sqft
        </div>
      </div>
    </Link>
  );
}
