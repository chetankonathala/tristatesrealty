import { ListingCardSkeleton } from "@/components/listings/listing-card-skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="h-14 border-b border-border bg-card/50" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}
