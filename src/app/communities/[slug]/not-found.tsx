import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function CommunityNotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="font-[family-name:var(--font-playfair-display)] text-[32px] lg:text-[48px] font-bold text-foreground">
          Community Not Found
        </h1>
        <p className="text-base text-muted-foreground font-[family-name:var(--font-montserrat)]">
          This community is no longer available or may have been removed.
        </p>
        <Link
          href="/communities"
          className={buttonVariants({ variant: "default" })}
        >
          Browse All Communities
        </Link>
      </div>
    </main>
  );
}
