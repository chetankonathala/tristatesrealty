"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { LeadStatus } from "@/types/lead";

const STATUS_STYLES: Record<LeadStatus, string> = {
  New: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Contacted: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Closed: "bg-green-500/15 text-green-400 border-green-500/30",
};

const NEXT_STATUS: Record<LeadStatus, LeadStatus | null> = {
  New: "Contacted",
  Contacted: "Closed",
  Closed: null,
};

const NEXT_LABEL: Record<LeadStatus, string> = {
  New: "Mark Contacted",
  Contacted: "Mark Closed",
  Closed: "",
};

interface LeadStatusClientProps {
  leadId: string;
  initialStatus: LeadStatus;
}

export function LeadStatusClient({ leadId, initialStatus }: LeadStatusClientProps) {
  const [status, setStatus] = useState<LeadStatus>(initialStatus);
  const [pending, startTransition] = useTransition();

  const advance = () => {
    const next = NEXT_STATUS[status];
    if (!next) return;
    startTransition(async () => {
      try {
        const res = await fetch(`/api/leads/${leadId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: next }),
        });
        if (!res.ok) throw new Error(await res.text());
        setStatus(next);
        toast.success(`Lead marked as ${next}`);
      } catch {
        toast.error("Failed to update status. Please try again.");
      }
    });
  };

  const next = NEXT_STATUS[status];

  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-semibold px-2.5 py-1 rounded border ${STATUS_STYLES[status]}`}>
        {status}
      </span>
      {next && (
        <button
          onClick={advance}
          disabled={pending}
          className="text-xs text-muted-foreground hover:text-foreground border border-border rounded px-2 py-1 transition-colors disabled:opacity-50"
        >
          {pending ? "Saving…" : NEXT_LABEL[status]}
        </button>
      )}
    </div>
  );
}
