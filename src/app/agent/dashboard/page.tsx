import type { Metadata } from "next";
import { getAllLeads } from "@/lib/supabase/queries/leads";
import { DashboardClient } from "./dashboard-client";

export const metadata: Metadata = {
  title: "Lead Dashboard | Tri States Realty",
  description: "Agent dashboard — manage buyer inquiries",
};

// Always fresh — no caching for the dashboard
export const dynamic = "force-dynamic";

export default async function AgentDashboardPage() {
  const leads = await getAllLeads();

  return (
    <main className="bg-background">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-accent mb-2">Agent Portal</p>
          <h1 className="font-display text-4xl font-bold text-foreground">Lead Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Buyer inquiries from listings, communities, AI chat, and direct contact.
          </p>
        </div>

        <DashboardClient leads={leads} />
      </div>
    </main>
  );
}
