"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

const DE_PRESET_CITIES = [
  "Lewes",
  "Rehoboth Beach",
  "Wilmington",
  "Dover",
  "Newark",
  "Middletown",
  "Millsboro",
  "Milton",
];

const ZIP_RE = /^\d{5}$/;

interface LocationSearchProps {
  cities: string[];
  postalCodes: string[];
  onChange: (cities: string[]) => void;
  onPostalCodesChange: (postalCodes: string[]) => void;
  placeholder?: string;
}

export function LocationSearch({
  cities,
  postalCodes,
  onChange,
  onPostalCodesChange,
  placeholder = "City, ZIP, or county",
}: LocationSearchProps) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    if (ZIP_RE.test(v)) {
      if (!postalCodes.includes(v)) onPostalCodesChange([...postalCodes, v]);
    } else {
      if (!cities.includes(v)) onChange([...cities, v]);
    }
    setDraft("");
  };

  const addCity = (city: string) => {
    if (!cities.includes(city)) onChange([...cities, city]);
  };

  const visiblePresets = DE_PRESET_CITIES.filter((c) => !cities.includes(c));
  const hasSelections = cities.length > 0 || postalCodes.length > 0;

  return (
    <div className="space-y-2">
      <Input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        }}
        placeholder={placeholder}
        aria-label="Location filter"
      />
      {visiblePresets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {visiblePresets.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => addCity(city)}
              className="bg-accent/10 text-accent text-xs px-3 py-1.5 rounded-full font-medium cursor-pointer hover:bg-accent/20 transition-colors"
            >
              {city}
            </button>
          ))}
        </div>
      )}
      {hasSelections && (
        <div className="flex flex-wrap gap-2">
          {postalCodes.map((z) => (
            <span key={z} className="inline-flex items-center gap-1 rounded-full bg-accent/15 text-accent text-xs px-3 py-1 font-bold">
              {z}
              <button type="button" onClick={() => onPostalCodesChange(postalCodes.filter((x) => x !== z))} aria-label={`Remove ${z}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {cities.map((c) => (
            <span key={c} className="inline-flex items-center gap-1 rounded-full bg-accent/15 text-accent text-xs px-3 py-1 font-bold">
              {c}
              <button type="button" onClick={() => onChange(cities.filter((x) => x !== c))} aria-label={`Remove ${c}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
