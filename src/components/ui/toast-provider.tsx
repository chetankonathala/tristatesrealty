"use client"

import { Toaster } from "sonner"

export function ToastProvider() {
  return (
    <Toaster
      theme="dark"
      position="bottom-right"
      toastOptions={{
        duration: 5000,
        style: {
          background: "var(--card)",
          border: "1px solid var(--border)",
          color: "var(--foreground)",
        },
      }}
    />
  )
}
