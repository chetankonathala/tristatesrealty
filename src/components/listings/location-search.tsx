"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface LocationSearchProps {
  cities: string[];
  onChange: (cities: string[]) => void;
  placeholder?: string;
}

export function LocationSearch({ cities, onChange, placeholder = "City, ZIP, or county" }: LocationSearchProps) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v || cities.includes(v)) return;
    onChange([...cities, v]);
    setDraft("");
  };
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
      {cities.length > 0 && (
        <div className="flex flex-wrap gap-2">
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
