import { Check } from "lucide-react";

export function ListingFeaturesList({ features }: { features: string[] }) {
  if (!features || features.length === 0) return null;
  return (
    <section className="max-w-[1280px] mx-auto px-4 lg:px-8">
      <h2 className="font-[var(--font-playfair-display)] text-2xl lg:text-3xl font-bold text-foreground mb-4">Features &amp; Amenities</h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-foreground">
            <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
