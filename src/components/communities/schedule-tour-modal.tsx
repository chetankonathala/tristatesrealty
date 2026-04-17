"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const tourSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Enter a valid email"),
  phone: z.string().max(30).optional(),
  preferred_date: z.string().optional(),
  message: z.string().max(2000).optional(),
  honeypot: z.string().max(0).optional(), // spam prevention — must remain empty
});

type TourFormData = z.infer<typeof tourSchema>;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ScheduleTourModalProps {
  communityName: string;
  communitySlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ScheduleTourModal({
  communityName,
  communitySlug,
  open,
  onOpenChange,
}: ScheduleTourModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const { user } = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TourFormData>({
    resolver: zodResolver(tourSchema),
    defaultValues: {
      name: user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : "",
      email: user?.emailAddresses?.[0]?.emailAddress ?? "",
    },
  });

  const onSubmit = async (data: TourFormData) => {
    setSubmitError(false);

    // Honeypot check — silently succeed if bot filled the hidden field
    if (data.honeypot) {
      setSubmitted(true);
      return;
    }

    const messageParts = [
      data.preferred_date ? `Preferred tour date: ${data.preferred_date}` : null,
      data.message || null,
    ].filter(Boolean);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    const body = {
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      message: messageParts.join("\n") || undefined,
      community_name: communityName,
      listing_url: `${siteUrl}/communities/${communitySlug}`,
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
        throw new Error((err as { error?: string }).error ?? "Submission failed");
      }

      setSubmitted(true);
      reset();
    } catch (err) {
      setSubmitError(true);
      toast.error(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  };

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      // Delay reset so exit animation completes before clearing form state
      setTimeout(() => {
        setSubmitted(false);
        setSubmitError(false);
        reset();
      }, 300);
    }
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent className="max-w-[480px]">
        {submitted ? (
          // ----------------------------------------------------------------
          // Success state
          // ----------------------------------------------------------------
          <div className="px-6 py-10 text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto"
            >
              <Check className="h-7 w-7 text-green-500" />
            </motion.div>
            <ModalHeader>
              <ModalTitle className="text-center text-[28px] font-bold">
                Tour Requested
              </ModalTitle>
              <ModalDescription className="text-center text-base text-green-500">
                {`We'll confirm your visit to ${communityName} within 2 hours.`}
              </ModalDescription>
            </ModalHeader>
            <Button variant="outline" onClick={() => handleOpenChange(false)} className="mt-2">
              Close
            </Button>
          </div>
        ) : (
          // ----------------------------------------------------------------
          // Form state
          // ----------------------------------------------------------------
          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-5" noValidate>
            <ModalHeader>
              <ModalTitle className="text-[28px] font-bold">Schedule a Tour</ModalTitle>
              <ModalDescription className="text-base text-muted-foreground">
                Visit {communityName} in person
              </ModalDescription>
            </ModalHeader>

            {/* Honeypot — hidden from humans, visible to bots */}
            <input
              type="text"
              {...register("honeypot")}
              className="sr-only"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="tour-name"
                  className="block text-xs font-bold uppercase tracking-[0.05em] text-muted-foreground mb-1.5"
                >
                  Full Name
                </label>
                <Input
                  id="tour-name"
                  {...register("name")}
                  placeholder="Your name"
                  autoComplete="name"
                  aria-required="true"
                  aria-describedby={errors.name ? "tour-name-error" : undefined}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p id="tour-name-error" className="text-xs text-destructive mt-1" role="alert">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label
                  htmlFor="tour-email"
                  className="block text-xs font-bold uppercase tracking-[0.05em] text-muted-foreground mb-1.5"
                >
                  Email Address
                </label>
                <Input
                  id="tour-email"
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-required="true"
                  aria-describedby={errors.email ? "tour-email-error" : undefined}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p id="tour-email-error" className="text-xs text-destructive mt-1" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone (optional) */}
              <div>
                <label
                  htmlFor="tour-phone"
                  className="block text-xs font-bold uppercase tracking-[0.05em] text-muted-foreground mb-1.5"
                >
                  Phone (optional)
                </label>
                <Input
                  id="tour-phone"
                  {...register("phone")}
                  type="tel"
                  placeholder="(302) 555-0100"
                  autoComplete="tel"
                />
              </div>

              {/* Preferred Date — native input for mobile UX + dark theme compatibility */}
              <div>
                <label
                  htmlFor="tour-date"
                  className="block text-xs font-bold uppercase tracking-[0.05em] text-muted-foreground mb-1.5"
                >
                  Preferred Date
                </label>
                <input
                  id="tour-date"
                  type="date"
                  {...register("preferred_date")}
                  className="bg-card border border-border text-foreground rounded-lg px-3 py-2 w-full [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Message (optional) */}
              <div>
                <label
                  htmlFor="tour-message"
                  className="block text-xs font-bold uppercase tracking-[0.05em] text-muted-foreground mb-1.5"
                >
                  Message (optional)
                </label>
                <textarea
                  id="tour-message"
                  {...register("message")}
                  placeholder="Any questions or special requests?"
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
            </div>

            {/* Error state */}
            {submitError && (
              <p className="text-sm text-destructive" role="alert">
                {`We couldn't submit your request. Please try again or call us directly.`}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-11"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Request Tour"
              )}
            </Button>

            <p className="text-[11px] text-muted-foreground text-center">
              Your information will be shared with a licensed Schell Brothers agent. We do not sell your data.
            </p>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
}
