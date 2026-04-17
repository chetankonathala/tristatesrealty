export default function Loading() {
  return (
    <main className="min-h-screen bg-background animate-pulse">
      {/* Hero skeleton */}
      <div className="w-full min-h-[50vh] lg:min-h-[70vh] bg-card" />

      {/* Content skeleton */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 py-16 space-y-16">
        {/* Overview */}
        <div className="space-y-4 max-w-[800px]">
          <div className="h-8 w-48 bg-card rounded" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-card rounded" />
            <div className="h-4 w-full bg-card rounded" />
            <div className="h-4 w-3/4 bg-card rounded" />
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-4">
          <div className="h-8 w-56 bg-card rounded" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-12 bg-card rounded-lg" />
            ))}
          </div>
        </div>

        {/* Floor plans */}
        <div className="space-y-4">
          <div className="h-8 w-52 bg-card rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-card rounded-lg" />
            ))}
          </div>
        </div>

        {/* Schools */}
        <div className="space-y-4">
          <div className="h-8 w-32 bg-card rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-card rounded-lg" />
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="space-y-4">
          <div className="h-8 w-44 bg-card rounded" />
          <div className="h-[320px] md:h-[480px] bg-card rounded-lg" />
        </div>
      </div>
    </main>
  );
}
