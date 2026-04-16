"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { MessageCircle, Loader2 } from "lucide-react";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Enter a valid email"),
  phone: z.string().max(30).optional(),
  message: z.string().max(2000).optional(),
});

type FormData = z.infer<typeof schema>;

interface ContactAgentModalProps {
  mlsId: number;
  communityName?: string | null;
  floorPlanName?: string | null;
  listingAddress?: string | null;
  triggerLabel?: string;
  triggerSize?: "default" | "sm" | "lg";
  triggerVariant?: "default" | "outline" | "ghost";
  triggerClassName?: string;
  /** Controlled mode: pass open + onOpenChange to drive from a parent */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ContactAgentModal({
  mlsId,
  communityName,
  floorPlanName,
  listingAddress,
  triggerLabel = "Contact Agent",
  triggerSize = "default",
  triggerVariant = "default",
  triggerClassName,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ContactAgentModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;
  const [submitted, setSubmitted] = useState(false);
  const { user } = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : "",
      email: user?.emailAddresses?.[0]?.emailAddress ?? "",
    },
  });

  const onSubmit = async (data: FormData) => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    const body = {
      ...data,
      listing_mls_id: mlsId,
      community_name: communityName ?? undefined,
      floor_plan_name: floorPlanName ?? undefined,
      listing_address: listingAddress ?? undefined,
      listing_url: `${siteUrl}/listings/${mlsId}`,
      user_id: user?.id ?? undefined,
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Submission failed");
      }

      setSubmitted(true);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setTimeout(() => setSubmitted(false), 300);
    }
  };

  return (
    <>
      <Button variant={triggerVariant} size={triggerSize} className={triggerClassName} onClick={() => setOpen(true)}>
        <MessageCircle className="h-4 w-4 mr-2" />
        {triggerLabel}
      </Button>
      <Modal open={open} onOpenChange={handleOpenChange}>

      <ModalContent>
        {submitted ? (
          // Success state
          <div className="px-6 py-10 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
              <MessageCircle className="h-7 w-7 text-accent" />
            </div>
            <ModalHeader>
              <ModalTitle className="text-center text-xl">Message Sent!</ModalTitle>
              <ModalDescription className="text-center">
                Your inquiry has been received. The agent will be in touch shortly.
              </ModalDescription>
            </ModalHeader>
            {communityName && (
              <p className="text-sm text-muted-foreground">
                Interest in: <span className="text-foreground font-medium">{communityName}{floorPlanName ? ` — ${floorPlanName}` : ""}</span>
              </p>
            )}
            <Button variant="outline" onClick={() => handleOpenChange(false)} className="mt-2">
              Close
            </Button>
          </div>
        ) : (
          // Form state
          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-5">
            <ModalHeader>
              <ModalTitle>Contact the Agent</ModalTitle>
              <ModalDescription>
                {communityName
                  ? `Interested in ${communityName}${floorPlanName ? ` · ${floorPlanName}` : ""}? Send a message and the agent will follow up.`
                  : "Send a message and the agent will follow up with you directly."}
              </ModalDescription>
            </ModalHeader>

            <div className="space-y-3">
              <div>
                <Input
                  {...register("name")}
                  placeholder="Full name *"
                  autoComplete="name"
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="Email address *"
                  autoComplete="email"
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Input
                  {...register("phone")}
                  type="tel"
                  placeholder="Phone number (optional)"
                  autoComplete="tel"
                />
              </div>

              <div>
                <textarea
                  {...register("message")}
                  placeholder="What questions do you have? (optional)"
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
            </div>

            {listingAddress && (
              <p className="text-xs text-muted-foreground border border-border rounded px-3 py-2 bg-card">
                📍 {listingAddress}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending…
                </>
              ) : (
                "Send Inquiry"
              )}
            </Button>

            <p className="text-[11px] text-muted-foreground text-center">
              Your information will be shared with a licensed Schell Brothers agent. We do not sell your data.
            </p>
          </form>
        )}
      </ModalContent>
    </Modal>
    </>
  );
}
