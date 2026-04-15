"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function SignInRequiredModal() {
  const [open, setOpen] = useState(false);
  const [returnUrl, setReturnUrl] = useState("/listings");

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ returnUrl?: string }>).detail;
      if (detail?.returnUrl) setReturnUrl(detail.returnUrl);
      else if (typeof window !== "undefined") setReturnUrl(window.location.pathname + window.location.search);
      setOpen(true);
    };
    window.addEventListener("require-sign-in", handler);
    return () => window.removeEventListener("require-sign-in", handler);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign in to save homes</DialogTitle>
          <DialogDescription>
            Create a free account to save listings, get alerts on new matches, and pick up where you left off.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="ghost"
            render={<Link href={`/sign-up?redirect_url=${encodeURIComponent(returnUrl)}`} />}
          >
            Create Account
          </Button>
          <Button
            render={<Link href={`/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`} />}
          >
            Sign In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
