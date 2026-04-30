"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatPanel } from "./chat-panel";

export function ChatBubble() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Hide bubble on listings page — chat is embedded there
  if (pathname.startsWith("/listings")) return null;

  // On non-listings pages, closing = navigate to /listings
  const handleFiltersApplied = () => {
    router.push("/listings");
    setOpen(false);
  };

  return (
    <>
      {/* Chat sheet */}
      {open && (
        <div className="fixed bottom-20 right-4 z-50 w-80 h-[480px] rounded-2xl border border-border bg-background shadow-2xl flex flex-col overflow-hidden sm:right-6">
          <ChatPanel onFiltersApplied={handleFiltersApplied} />
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close AI chat" : "Open AI home search"}
        className={cn(
          "fixed bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2 rounded-full px-4 py-3 shadow-lg transition-all",
          "bg-accent text-accent-foreground hover:bg-accent/90",
          open && "bg-muted text-foreground"
        )}
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <>
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">AI Search</span>
          </>
        )}
      </button>
    </>
  );
}
