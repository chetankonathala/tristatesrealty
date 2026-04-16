import type { Metadata } from "next";
import { getAllLeads } from "@/lib/supabase/queries/leads";
import { LeadStatusClient } from "./lead-status-client";
import { Mail, Phone, Home, Clock, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Lead Dashboard | Tri States Realty",
  description: "Agent dashboard — manage buyer inquiries",
};

// Always fresh — no caching for the dashboard
export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default async function AgentDashboardPage() {
  const leads = await getAllLeads();

  const newCount = leads.filter((l) => l.status === "New").length;
  const contactedCount = leads.filter((l) => l.status === "Contacted").length;
  const closedCount = leads.filter((l) => l.status === "Closed").length;

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-12">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-accent mb-2">Agent Portal</p>
          <h1 className="font-display text-4xl font-bold text-foreground">Lead Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Buyer inquiries submitted through your Tri States Realty website.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Leads", value: leads.length, icon: Users, color: "text-foreground" },
            { label: "New", value: newCount, icon: Clock, color: "text-yellow-400" },
            { label: "Contacted", value: contactedCount, icon: Mail, color: "text-blue-400" },
            { label: "Closed", value: closedCount, icon: Home, color: "text-green-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center gap-3 mb-1">
                <Icon className={`h-4 w-4 ${color}`} />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
              </div>
              <div className={`text-3xl font-bold ${color}`}>{value}</div>
            </div>
          ))}
        </div>

        {/* Leads table */}
        {leads.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">No leads yet</h2>
            <p className="text-muted-foreground text-sm">
              When buyers submit contact forms on your listings, they&apos;ll appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="rounded-lg border border-border bg-card p-5 grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto] gap-4 items-start"
              >
                {/* Buyer info */}
                <div className="space-y-2">
                  <div className="font-semibold text-foreground text-base">{lead.name}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                    <p className="text-sm text-muted-foreground italic border-l-2 border-accent/30 pl-3 mt-2 line-clamp-3">
                      &ldquo;{lead.message}&rdquo;
                    </p>
                  )}
                </div>

                {/* Property interest */}
                <div className="space-y-1.5">
                  {lead.community_name && (
                    <div className="flex items-start gap-2 text-sm">
                      <Home className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
                      <span className="text-foreground font-medium">
                        {lead.community_name}
                        {lead.floor_plan_name ? ` · ${lead.floor_plan_name}` : ""}
                      </span>
                    </div>
                  )}
                  {lead.listing_address && (
                    <div className="text-xs text-muted-foreground pl-5">{lead.listing_address}</div>
                  )}
                  {lead.listing_url && (
                    <a
                      href={lead.listing_url}
                      className="text-xs text-accent hover:underline pl-5 block"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View listing →
                    </a>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground pl-5 mt-2">
                    <Clock className="h-3 w-3" />
                    {formatDate(lead.created_at)}
                  </div>
                </div>

                {/* Status control */}
                <div className="flex lg:flex-col items-start gap-2">
                  <LeadStatusClient leadId={lead.id} initialStatus={lead.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
