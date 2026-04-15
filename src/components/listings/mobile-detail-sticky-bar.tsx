"use client";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface MobileDetailStickyBarProps {
  price: number;
  daysOnMarket: number | null;
  onContactAgent: () => void;
}

export function MobileDetailStickyBar({ price, daysOnMarket, onContactAgent }: MobileDetailStickyBarProps) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-[72px] bg-card/95 backdrop-blur border-t border-border flex items-center justify-between px-4 pb-safe">
      <div>
        <div className="text-base font-bold text-accent tabular-nums">${price.toLocaleString()}</div>
        {daysOnMarket != null && (
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">DOM {daysOnMarket}</div>
        )}
      </div>
      <Button onClick={onContactAgent} size="sm">
        <MessageCircle className="h-4 w-4 mr-2" />
        Contact Agent
      </Button>
    </div>
  );
}
