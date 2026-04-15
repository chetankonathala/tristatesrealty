import { cn } from "@/lib/utils";

interface StreetViewEmbedProps {
  address: string;
  className?: string;
}

export function StreetViewEmbed({ address, className }: StreetViewEmbedProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const encoded = encodeURIComponent(address);
  return (
    <section className={cn("max-w-[1280px] mx-auto px-4 lg:px-8", className)}>
      <h2 className="font-[var(--font-playfair-display)] text-2xl lg:text-3xl font-bold text-foreground mb-4">Street View</h2>
      <div className="rounded-lg overflow-hidden border border-border aspect-video">
        {apiKey ? (
          <iframe
            title={`Google Street View of ${address}`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed/v1/streetview?key=${apiKey}&location=${encoded}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-sm">
            Street View unavailable (Google Maps API key not configured)
          </div>
        )}
      </div>
    </section>
  );
}
