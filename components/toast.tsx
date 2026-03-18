"use client";

import { useEffect, useState, useCallback } from "react";

export interface ToastState {
  message: string;
  tone: "success" | "error";
}

interface ToastProps {
  toast: ToastState | null;
  onDismiss: () => void;
  autoDismissMs?: number;
}

export function Toast({ toast, onDismiss, autoDismissMs = 4000 }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(onDismiss, autoDismissMs);
    return () => window.clearTimeout(id);
  }, [toast, onDismiss, autoDismissMs]);

  if (!toast) return null;

  return (
    <div className="fixed right-4 top-20 z-50" aria-live="polite">
      <div
        role="status"
        className={`min-w-72 rounded-2xl border-2 px-4 py-3 shadow-2xl ${
          toast.tone === "success"
            ? "border-success bg-base-200 text-success"
            : "border-error bg-base-200 text-error"
        }`}
      >
        {toast.message}
      </div>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback(
    (message: string, tone: ToastState["tone"] = "error") => {
      setToast({ message, tone });
    },
    [],
  );

  const dismissToast = useCallback(() => setToast(null), []);

  return { toast, showToast, dismissToast } as const;
}
