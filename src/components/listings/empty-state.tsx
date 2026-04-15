"use client";
import { Home, AlertCircle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function EmptyState({ variant = "no-results" }: { variant?: "no-results" | "error" }) {
  if (variant === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-2xl font-bold mb-2">We Couldn&apos;t Load Listings</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Our MLS feed is catching up. Refresh the page or try again in a moment.
        </p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Home className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-2xl font-bold mb-2">No Homes Match Your Search</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Try widening your price range or removing a filter to see more listings.
      </p>
      <Link href="/listings" className={cn(buttonVariants({ variant: "outline" }))}>
        Clear Filters
      </Link>
    </div>
  );
}
