"use client";
import { EmptyState } from "@/components/listings/empty-state";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div>
        <EmptyState variant="error" />
        <div className="text-center mt-4">
          <button onClick={reset} className="text-accent underline text-sm">Reload</button>
        </div>
      </div>
    </main>
  );
}
