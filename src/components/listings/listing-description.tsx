"use client";
import { useState } from "react";

export function ListingDescription({ remarks }: { remarks: string | null }) {
  const [expanded, setExpanded] = useState(false);
  if (!remarks) return null;
  return (
    <section className="max-w-[1280px] mx-auto px-4 lg:px-8">
      <h2 className="font-[var(--font-playfair-display)] text-2xl lg:text-3xl font-bold text-foreground mb-4">About This Home</h2>
      <div className="relative">
        <p
          className={`text-base text-foreground leading-relaxed ${expanded ? "" : "line-clamp-[8]"}`}
          style={{ lineHeight: 1.6 }}
        >
          {remarks}
        </p>
        {!expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        )}
      </div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-2 text-sm text-accent underline"
      >
        {expanded ? "Show less" : "Read more"}
      </button>
    </section>
  );
}
