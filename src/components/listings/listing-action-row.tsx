"use client";
import { useEffect, useState, useTransition } from "react";
import { useUser } from "@clerk/nextjs";
import { Heart, Share2, Calendar, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ListingActionRowProps {
  mlsId: number;
}

export function ListingActionRow({ mlsId }: ListingActionRowProps) {
  const { isSignedIn, isLoaded } = useUser();
  const [isSaved, setIsSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  // On mount, if signed in, check whether THIS listing is already saved
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let cancelled = false;
    fetch(`/api/saved-listings?mlsId=${mlsId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { saved?: boolean } | null) => {
        if (!cancelled && data?.saved) setIsSaved(true);
      })
      .catch(() => {
        // silent — no toast on the read; only on user-initiated writes
      });
    return () => {
      cancelled = true;
    };
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
    if (!isSignedIn) {
      requireSignIn();
      return;
    }
    startTransition(async () => {
      try {
        const method = isSaved ? "DELETE" : "POST";
        const url = isSaved ? `/api/saved-listings?mlsId=${mlsId}` : "/api/saved-listings";
        const res = await fetch(url, {
          method,
          ...(isSaved
            ? {}
            : {
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mlsId }),
              }),
        });
        if (!res.ok) throw new Error(await res.text());
        setIsSaved((v) => !v);
        toast.success(isSaved ? "Removed from saved homes" : "Home saved");
      } catch (err) {
        toast.error("Couldn't update saved homes. Please try again.");
        console.error(err);
      }
    });
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Listing — Tri States Realty",
          url: window.location.href,
        });
        return;
      } catch {
        // fall through to clipboard
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  const handleScheduleTour = () => {
    toast.info("Tour scheduling launches in Phase 9 — call the agent for now");
  };

  const handleContactAgent = () => {
    toast.info("Agent contact form launches in Phase 9");
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={handleSave}
        disabled={pending}
        aria-label={isSaved ? "Home Saved" : "Save Home"}
      >
        <Heart className={isSaved ? "h-4 w-4 mr-2 fill-accent text-accent" : "h-4 w-4 mr-2"} />
        {isSaved ? "Home Saved" : "Save Home"}
      </Button>
      <Button variant="ghost" onClick={handleShare}>
        <Share2 className="h-4 w-4 mr-2" />
        Share Listing
      </Button>
      <Button variant="outline" onClick={handleScheduleTour}>
        <Calendar className="h-4 w-4 mr-2" />
        Schedule a Tour
      </Button>
      <Button onClick={handleContactAgent}>
        <MessageCircle className="h-4 w-4 mr-2" />
        Contact Agent
      </Button>
    </div>
  );
}
