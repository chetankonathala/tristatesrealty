export default function Loading() {
  return (
    <main className="min-h-screen bg-background animate-pulse">
      <div className="h-[60vh] bg-card" />
      <div className="container mx-auto px-4 lg:px-8 py-8 space-y-6">
        <div className="h-12 w-1/2 bg-card rounded" />
        <div className="h-6 w-1/3 bg-card rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 bg-card rounded" />
          ))}
        </div>
      </div>
    </main>
  );
}
