"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type ToastVariant = "default" | "note";
type ToastItem = { id: number; message: string; variant: ToastVariant };
type ToastFn = (message: string, opts?: { variant?: ToastVariant; duration?: number }) => void;

const ToastContext = createContext<ToastFn | null>(null);

export function useToast(): ToastFn {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

/**
 * Lightweight toasts. `variant: "note"` renders the handwritten sticky note
 * used for "copied!" moments. Announced politely to screen readers.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    setItems((list) => list.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const toast = useCallback<ToastFn>(
    (message, opts) => {
      const id = nextId.current++;
      // Keep at most 3 on screen; newest last.
      setItems((list) => [...list.slice(-2), { id, message, variant: opts?.variant ?? "default" }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), opts?.duration ?? 2600),
      );
    },
    [dismiss],
  );

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex flex-col items-center gap-2 px-4"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto animate-pop-in",
              t.variant === "note"
                ? "-rotate-2 rounded-[4px] bg-[#FDE68A] px-5 pt-2 pb-2.5 font-hand text-2xl leading-none text-ink shadow-[0_10px_24px_-10px_rgb(20_20_20/0.45)]"
                : "rounded-full bg-ink px-4 py-2.5 text-sm text-paper shadow-pop",
            )}
            data-testid="toast"
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
