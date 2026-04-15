import Link from "next/link";
import { Home } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
      <Home className="h-12 w-12 text-muted-foreground mb-4" />
      <h1 className="text-3xl font-bold mb-2">This Home Is No Longer Available</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        The listing you&apos;re looking for may have sold, gone pending, or been removed from the MLS.
      </p>
      <Link href="/listings" className={cn(buttonVariants())}>
        Browse Active Homes
      </Link>
    </main>
  );
}
