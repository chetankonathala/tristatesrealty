"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useQueryStates } from "nuqs";
import { SendHorizonal, Sparkles, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchParamParsers } from "@/lib/schemas/nuqs-parsers";

type SearchInput = {
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  minBaths?: number;
  cities?: string;
  postalCodes?: string;
  type?: string;
  waterfront?: boolean;
  newConstruction?: boolean;
  garage?: boolean;
  minSqft?: number;
  maxSqft?: number;
  sort?: string;
};

const SUGGESTIONS = [
  "4 bed house in Lewes under $600k",
  "Waterfront condos in Rehoboth Beach",
  "New construction in Middletown DE",
  "3 bed 2 bath under $400k in Dover",
];

interface ChatPanelProps {
  onFiltersApplied?: () => void;
  compact?: boolean;
}

export function ChatPanel({ onFiltersApplied, compact }: ChatPanelProps) {
  const pathname = usePathname();
  const router = useRouter();
  const onListings = pathname.startsWith("/listings");

  const [, setFilters] = useQueryStates(searchParamParsers, {
    shallow: false,
  });
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, status, clearError } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat/search" }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Apply search params from tool output
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.role !== "assistant") return;
    for (const part of lastMsg.parts) {
      if (
        part.type === "tool-searchListings" &&
        part.state === "output-available"
      ) {
        const p = part.input as SearchInput;

        if (onListings) {
          // Already on listings page — apply filters via nuqs (server re-renders with new results)
          setFilters({
            minPrice: p.minPrice ?? null,
            maxPrice: p.maxPrice ?? null,
            minBeds: p.minBeds ?? null,
            minBaths: p.minBaths ?? null,
            cities: p.cities ?? null,
            postalCodes: p.postalCodes ?? null,
            type: p.type ?? null,
            waterfront: p.waterfront ?? null,
            newConstruction: p.newConstruction ?? null,
            garage: p.garage ?? null,
            minSqft: p.minSqft ?? null,
            maxSqft: p.maxSqft ?? null,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            sort: (p.sort as any) ?? null,
            page: null,
          });
        } else {
          // From any other page — navigate to /listings with params encoded in URL
          const qs = new URLSearchParams();
          if (p.minPrice != null) qs.set("minPrice", String(p.minPrice));
          if (p.maxPrice != null) qs.set("maxPrice", String(p.maxPrice));
          if (p.minBeds != null) qs.set("minBeds", String(p.minBeds));
          if (p.minBaths != null) qs.set("minBaths", String(p.minBaths));
          if (p.cities) qs.set("cities", p.cities);
          if (p.postalCodes) qs.set("postalCodes", p.postalCodes);
          if (p.type) qs.set("type", p.type);
          if (p.waterfront) qs.set("waterfront", "true");
          if (p.newConstruction) qs.set("newConstruction", "true");
          if (p.garage) qs.set("garage", "true");
          if (p.minSqft != null) qs.set("minSqft", String(p.minSqft));
          if (p.maxSqft != null) qs.set("maxSqft", String(p.maxSqft));
          if (p.sort) qs.set("sort", p.sort);
          router.push(`/listings?${qs.toString()}`);
        }

        onFiltersApplied?.();
        break;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submit = useCallback(
    (text: string) => {
      if (!text.trim() || isLoading) return;
      clearError();
      setInput("");
      sendMessage({ text: text.trim() });
    },
    [isLoading, clearError, sendMessage]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit(input);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className={cn("flex flex-col h-full bg-background", compact && "text-sm")}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border flex-shrink-0">
        <Sparkles className="h-4 w-4 text-accent" />
        <span className="font-semibold text-sm">AI Home Search</span>
        {messages.length > 0 && (
          <button
            onClick={() => window.location.reload()}
            className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
            title="Start new conversation"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {isEmpty && (
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Describe what you&apos;re looking for in plain English.
            </p>
            <div className="space-y-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  className="w-full text-left text-sm px-3 py-2 rounded-lg border border-border hover:border-accent hover:text-accent transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                msg.role === "user"
                  ? "bg-accent text-accent-foreground rounded-tr-sm"
                  : "bg-card border border-border rounded-tl-sm"
              )}
            >
              {msg.parts.map((part, i) => {
                if (part.type === "text") {
                  return <p key={i} className="whitespace-pre-wrap leading-relaxed">{part.text}</p>;
                }
                if (part.type === "tool-searchListings") {
                  if (part.state === "input-streaming" || part.state === "input-available") {
                    return (
                      <p key={i} className="text-muted-foreground italic text-xs">
                        Searching listings…
                      </p>
                    );
                  }
                  if (part.state === "output-available") {
                    return (
                      <p key={i} className="text-muted-foreground italic text-xs">
                        ✓ Filters applied
                      </p>
                    );
                  }
                }
                return null;
              })}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-2.5">
              <div className="flex gap-1 items-center h-4">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex-shrink-0 p-3 border-t border-border"
      >
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 focus-within:border-accent transition-colors">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="4 bed house in Lewes under $500k…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            disabled={isLoading}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="text-accent disabled:text-muted-foreground transition-colors"
            aria-label="Send"
          >
            <SendHorizonal className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
