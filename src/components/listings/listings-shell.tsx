"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Sparkles, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchResultsGrid } from "./search-results-grid";
import { SearchResultsHeader } from "./search-results-header";
import type { ListingSummary } from "@/types/listing";

const ChatPanel = dynamic(
  () => import("@/components/chat/chat-panel").then((m) => m.ChatPanel),
  { ssr: false }
);

interface ListingsShellProps {
  listings: ListingSummary[];
  totalCount: number;
  locationLabel?: string;
}

export function ListingsShell({
  listings,
  totalCount,
  locationLabel,
}: ListingsShellProps) {
  const [chatOpen, setChatOpen] = useState(false);

  // Chat toggle button injected as leftSlot of the header
  const chatToggle = (
    <button
      onClick={() => setChatOpen((v) => !v)}
      aria-label={chatOpen ? "Close AI chat sidebar" : "Open AI chat sidebar"}
      className={cn(
        "hidden lg:flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm border flex-shrink-0 transition-colors",
        chatOpen
          ? "bg-accent/10 text-accent border-accent"
          : "border-border text-muted-foreground hover:text-foreground hover:border-border-hover"
      )}
    >
      <Sparkles className="h-3.5 w-3.5" />
      <span>AI Search</span>
      {chatOpen ? (
        <PanelLeftClose className="h-3.5 w-3.5" />
      ) : (
        <PanelLeftOpen className="h-3.5 w-3.5" />
      )}
    </button>
  );

  return (
    <>
      <SearchResultsHeader
        totalCount={totalCount}
        locationLabel={locationLabel}
        leftSlot={chatToggle}
      />

      {/*
        Desktop: flex row — chat sidebar (optional) + results.
        Height = 100vh minus stacked elements above:
          navbar 4rem + filter-bar 3rem + active-filter ~2rem + this header 3rem = 12rem
      */}
      <div className="flex overflow-hidden lg:h-[calc(100vh-12rem)]">
        {/* Chat sidebar — desktop only */}
        {chatOpen && (
          <div className="hidden lg:flex w-80 flex-shrink-0 flex-col border-r border-border overflow-hidden">
            <ChatPanel compact />
          </div>
        )}

        {/* Results column: fills remaining width; h-full makes SearchResultsGrid fill the flex row */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <SearchResultsGrid listings={listings} totalCount={totalCount} />
        </div>
      </div>
    </>
  );
}
