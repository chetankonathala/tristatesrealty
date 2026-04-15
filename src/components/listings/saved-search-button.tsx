"use client";
import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function SavedSearchButton() {
  const { isSignedIn } = useAuth();
  const params = useSearchParams();
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleSave = () => {
    if (!isSignedIn) {
      window.dispatchEvent(new CustomEvent("require-sign-in", { detail: { returnUrl: window.location.pathname + window.location.search } }));
      return;
    }
    // D-14: capture current URL filters as criteria — no modal, no naming
    const criteria: Record<string, string> = {};
    params.forEach((value, key) => {
      criteria[key] = value;
    });
    startTransition(async () => {
      try {
        const res = await fetch("/api/saved-searches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ criteria }),
        });
        if (!res.ok) throw new Error(await res.text());
        setSaved(true);
        toast.success("Search saved · You'll get alerts on new matches");
      } catch (err) {
        toast.error("Couldn't save search. Please try again.");
        console.error(err);
      }
    });
  };

  return (
    <Button variant={saved ? "default" : "outline"} size="sm" onClick={handleSave} disabled={pending}>
      {saved ? <BookmarkCheck className="h-4 w-4 mr-2 fill-accent" /> : <Bookmark className="h-4 w-4 mr-2" />}
      {saved ? "Search Saved" : "Save This Search"}
    </Button>
  );
}
