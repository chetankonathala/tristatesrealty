import Link from "next/link";
import { LayoutDashboard, Inbox, Home as HomeIcon } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { env } from "@/lib/env";

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 h-14 flex items-center gap-6">
          <Link href="/" className="font-display text-lg font-bold text-accent tracking-wide">
            TSR<span className="text-muted-foreground/60 ml-1.5 text-xs uppercase tracking-[0.2em] font-sans">Agent</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm">
            <Link
              href="/agent/dashboard"
              className="px-3 py-1.5 rounded-md text-foreground hover:bg-accent/10 hover:text-accent transition-colors inline-flex items-center gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/agent/dashboard"
              className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
            >
              <Inbox className="h-4 w-4" />
              Leads
            </Link>
            <Link
              href="/listings"
              className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
            >
              <HomeIcon className="h-4 w-4" />
              Listings
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-muted-foreground">{env.AGENT_NAME}</span>
            <UserButton />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
