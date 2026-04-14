"use client";
import { Slider } from "@/components/ui/slider";

interface PriceRangeSliderProps {
  min?: number;
  max?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  absoluteMin?: number;
  absoluteMax?: number;
}

export function PriceRangeSlider({
  value,
  onChange,
  absoluteMin = 0,
  absoluteMax = 5_000_000,
  step = 25_000,
}: PriceRangeSliderProps) {
  const fmt = (n: number) =>
    n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}k`;

  return (
    <div className="space-y-3">
      <Slider
        min={absoluteMin}
        max={absoluteMax}
        step={step}
        value={value}
        onValueChange={(v) => onChange([v[0], v[1]] as [number, number])}
        className="w-full"
        aria-label="Price range"
      />
      <div className="flex justify-between text-sm tabular-nums text-muted-foreground">
        <span>{fmt(value[0])}</span>
        <span>{fmt(value[1])}</span>
      </div>
    </div>
  );
}
