import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export { Dialog as Modal, DialogHeader as ModalHeader, DialogTitle as ModalTitle, DialogDescription as ModalDescription }

export { DialogTrigger as ModalTrigger } from "@/components/ui/dialog"

export function ModalContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  return (
    <DialogContent
      className={cn(
        "bg-card border border-border",
        "max-w-[560px] rounded-xl",
        "sm:rounded-xl max-sm:rounded-none max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:max-w-none",
        className
      )}
      {...props}
    >
      {children}
    </DialogContent>
  )
}
