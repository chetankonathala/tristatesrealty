"use client";
import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ListingGalleryProps {
  photos: string[];
  address: string;
}

export function ListingGallery({ photos, address }: ListingGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const open = (idx: number) => {
    setActiveIdx(idx);
    setLightboxOpen(true);
  };

  const next = () => setActiveIdx((i) => (i + 1) % photos.length);
  const prev = () => setActiveIdx((i) => (i - 1 + photos.length) % photos.length);

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center bg-muted text-muted-foreground">
        No photos available
      </div>
    );
  }

  return (
    <>
      {/* Desktop collage: 1 large + 4 small */}
      <div className="hidden lg:grid grid-cols-4 grid-rows-2 gap-2 max-w-[1280px] mx-auto h-[480px] relative">
        <button type="button" onClick={() => open(0)} className="col-span-2 row-span-2 relative overflow-hidden rounded-l-lg">
          <Image src={photos[0]} alt={`${address} photo 1 of ${photos.length}`} fill className="object-cover" priority sizes="50vw" />
        </button>
        {[1, 2, 3, 4].map((idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => open(idx)}
            className={cn(
              "relative overflow-hidden",
              idx === 2 && "rounded-tr-lg",
              idx === 4 && "rounded-br-lg"
            )}
          >
            {photos[idx] ? (
              <Image src={photos[idx]} alt={`${address} photo ${idx + 1} of ${photos.length}`} fill className="object-cover" sizes="25vw" />
            ) : (
              <div className="h-full w-full bg-muted" />
            )}
          </button>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => open(0)}
          className="absolute bottom-4 right-4"
        >
          <Expand className="h-4 w-4 mr-2" />
          View all {photos.length} photos
        </Button>
      </div>

      {/* Mobile carousel */}
      <div className="lg:hidden relative">
        <div className="aspect-[4/3] relative bg-muted">
          <Image
            src={photos[activeIdx] ?? photos[0]}
            alt={`${address} photo ${activeIdx + 1} of ${photos.length}`}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur rounded-full px-3 py-1 text-xs font-bold tabular-nums">
          {activeIdx + 1} / {photos.length}
        </div>
        <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/70 rounded-full p-2" aria-label="Previous photo">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/70 rounded-full p-2" aria-label="Next photo">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={(open) => setLightboxOpen(open)}>
        <DialogContent
          showCloseButton={false}
          className="max-w-screen max-h-screen w-screen h-screen p-0 bg-black/95 border-0"
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={photos[activeIdx]}
              alt={`${address} photo ${activeIdx + 1} of ${photos.length}`}
              fill
              className="object-contain"
              sizes="100vw"
            />
            <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 bg-background/70 rounded-full p-2" aria-label="Close photo viewer">
              <X className="h-5 w-5" />
            </button>
            <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/70 rounded-full p-3" aria-label="Previous photo">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/70 rounded-full p-3" aria-label="Next photo">
              <ChevronRight className="h-6 w-6" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur rounded-full px-4 py-1.5 text-sm font-bold tabular-nums">
              {activeIdx + 1} / {photos.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
