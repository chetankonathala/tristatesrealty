"use client";

import { useMemo, useState } from "react";
import { Mail, Phone, Home, Clock, Search, ExternalLink } from "lucide-react";
import type { Lead, LeadSource, LeadStatus } from "@/types/lead";
import { LeadStatusClient } from "./lead-status-client";

type StatusFilter = "all" | LeadStatus;
type SourceFilter = "all" | LeadSource;

const SOURCE_BADGE: Record<LeadSource, { label: string; cls: string }> = {
  ai_chat: { label: "AI Chat", cls: "bg-violet-500/15 text-violet-300 border-violet-500/30" },
  map_click: { label: "Map", cls: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" },
  filter_search: { label: "Search", cls: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  community_page: { label: "Community", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  direct: { label: "Direct", cls: "bg-slate-500/15 text-slate-300 border-slate-500/30" },
};

const STATUS_OPTIONS: StatusFilter[] = ["all", "New", "Contacted", "Closed"];
const SOURCE_OPTIONS: SourceFilter[] = ["all", "ai_chat", "map_click", "filter_search", "community_page", "direct"];

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatPrice(p: number | null): string | null {
  if (p == null) return null;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(p);
}

export function DashboardClient({ leads }: { leads: Lead[] }) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (sourceFilter !== "all" && l.source !== sourceFilter) return false;
      if (q) {
        const hay = `${l.name} ${l.email} ${l.phone ?? ""} ${l.community_name ?? ""} ${l.listing_address ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [leads, statusFilter, sourceFilter, query]);

  const counts = useMemo(
    () => ({
      total: leads.length,
      new: leads.filter((l) => l.status === "New").length,
      contacted: leads.filter((l) => l.status === "Contacted").length,
      closed: leads.filter((l) => l.status === "Closed").length,
    }),
    [leads]
  );

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Leads" value={counts.total} className="text-foreground" />
        <StatCard label="New" value={counts.new} className="text-yellow-400" />
        <StatCard label="Contacted" value={counts.contacted} className="text-blue-400" />
        <StatCard label="Closed" value={counts.closed} className="text-green-400" />
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-border bg-card p-4 mb-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground mr-2">Status</span>
          {STATUS_OPTIONS.map((s) => (
            <FilterPill key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
              {s === "all" ? "All" : s}
            </FilterPill>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground mr-2">Source</span>
          {SOURCE_OPTIONS.map((s) => (
            <FilterPill key={s} active={sourceFilter === s} onClick={() => setSourceFilter(s)}>
              {s === "all" ? "All" : SOURCE_BADGE[s].label}
            </FilterPill>
          ))}
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, phone, address…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-xs text-muted-foreground hover:text-foreground">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <h2 className="text-lg font-semibold text-foreground mb-2">No leads match these filters</h2>
          <p className="text-muted-foreground text-sm">Adjust the filters above to see more leads.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => (
            <LeadRow key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </>
  );
}

function StatCard({ label, value, className }: { label: string; value: number; className?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className={`text-3xl font-bold ${className ?? "text-foreground"}`}>{value}</div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
        active
          ? "border-accent bg-accent/15 text-accent font-semibold"
          : "border-border text-muted-foreground hover:text-foreground hover:border-accent/40"
      }`}
    >
      {children}
    </button>
  );
}

function LeadRow({ lead }: { lead: Lead }) {
  const badge = SOURCE_BADGE[lead.source];
  const price = formatPrice(lead.list_price);
  return (
    <div className="rounded-lg border border-border bg-card p-5 grid grid-cols-1 lg:grid-cols-[1.1fr_1.4fr_auto] gap-5 items-start">
      {/* Buyer */}
      <div className="space-y-2 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-foreground text-base truncate">{lead.name}</span>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${badge.cls}`}>
            {badge.label}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
          <Mail className="h-3.5 w-3.5 shrink-0" />
          <a href={`mailto:${lead.email}`} className="hover:text-accent transition-colors truncate">
            {lead.email}
          </a>
        </div>
        {lead.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <a href={`tel:${lead.phone}`} className="hover:text-accent transition-colors">
              {lead.phone}
            </a>
          </div>
        )}
        {lead.message && (
          <p className="text-sm text-muted-foreground italic border-l-2 border-accent/30 pl-3 mt-2 line-clamp-3 whitespace-pre-wrap">
            &ldquo;{lead.message}&rdquo;
          </p>
        )}
      </div>

      {/* Property */}
      <div className="space-y-1.5 min-w-0">
        {lead.community_name && (
          <div className="flex items-start gap-2 text-sm">
            <Home className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
            <span className="text-foreground font-medium truncate">
              {lead.community_name}
              {lead.floor_plan_name ? ` · ${lead.floor_plan_name}` : ""}
            </span>
          </div>
        )}
        {lead.listing_address && (
          <div className="text-xs text-muted-foreground pl-5 truncate">{lead.listing_address}</div>
        )}
        {price && (
          <div className="text-sm font-bold text-accent pl-5 tabular-nums">{price}</div>
        )}
        {lead.listing_url && (
          <a
            href={lead.listing_url}
            className="text-xs text-accent hover:underline pl-5 inline-flex items-center gap-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            View listing <ExternalLink className="h-3 w-3" />
          </a>
        )}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pl-5 pt-1">
          <Clock className="h-3 w-3" />
          {formatDate(lead.created_at)}
        </div>
      </div>

      {/* Status */}
      <div className="flex lg:flex-col items-start gap-2">
        <LeadStatusClient leadId={lead.id} initialStatus={lead.status} />
      </div>
    </div>
  );
}
