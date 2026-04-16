"use client";
import { useEffect, useState, useTransition } from "react";
import { useUser } from "@clerk/nextjs";
import { Heart, Share2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ContactAgentModal } from "./contact-agent-modal";

interface ListingActionRowProps {
  mlsId: number;
  communityName?: string | null;
  floorPlanName?: string | null;
  listingAddress?: string | null;
  communityUrl?: string | null;
}

export function ListingActionRow({
  mlsId,
  communityName,
  floorPlanName,
  listingAddress,
  communityUrl,
}: ListingActionRowProps) {
  const { isSignedIn, isLoaded } = useUser();
  const [isSaved, setIsSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let cancelled = false;
    fetch(`/api/saved-listings?mlsId=${mlsId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { saved?: boolean } | null) => {
        if (!cancelled && data?.saved) setIsSaved(true);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isLoaded, isSignedIn, mlsId]);

  const requireSignIn = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("require-sign-in", {
        detail: { returnUrl: window.location.pathname + window.location.search },
      })
    );
  };

  const handleSave = () => {
    if (!isSignedIn) { requireSignIn(); return; }
    startTransition(async () => {
      try {
        const method = isSaved ? "DELETE" : "POST";
        const url = isSaved ? `/api/saved-listings?mlsId=${mlsId}` : "/api/saved-listings";
        const res = await fetch(url, {
          method,
          ...(isSaved ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mlsId }) }),
        });
        if (!res.ok) throw new Error(await res.text());
        setIsSaved((v) => !v);
        toast.success(isSaved ? "Removed from saved homes" : "Home saved");
      } catch {
        toast.error("Couldn't update saved homes. Please try again.");
      }
    });
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: "Listing — Tri States Realty", url: window.location.href }); return; } catch {}
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={handleSave} disabled={pending} aria-label={isSaved ? "Home Saved" : "Save Home"}>
        <Heart className={isSaved ? "h-4 w-4 mr-2 fill-accent text-accent" : "h-4 w-4 mr-2"} />
        {isSaved ? "Home Saved" : "Save Home"}
      </Button>
      <Button variant="ghost" onClick={handleShare}>
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
      {communityUrl && (
        <a
          href={communityUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent/10 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          View on Schell
        </a>
      )}
      <ContactAgentModal
        mlsId={mlsId}
        communityName={communityName}
        floorPlanName={floorPlanName}
        listingAddress={listingAddress}
      />
    </div>
  );
}
