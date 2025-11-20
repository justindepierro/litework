"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { AnimatePresence } from "framer-motion";
import Toast, { ToastType, ToastAction } from "./Toast";

/**
 * Options for customizing toast behavior
 *
 * @example
 * // Simple toast
 * toast.success("Saved successfully!");
 *
 * // Toast with custom duration
 * toast.info("Processing...", { duration: 10000 });
 *
 * // Toast with action button
 * toast.success("Item deleted", {
 *   action: {
 *     label: "Undo",
 *     onClick: () => restoreItem()
 *   }
 * });
 *
 * // Toast that doesn't auto-dismiss
 * toast.error("Critical error", { duration: 0 });
 */
export interface ToastOptions {
  duration?: number; // Duration in ms (default: 5000), set to 0 for no auto-dismiss
  action?: ToastAction; // Optional action button
}

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: ToastAction;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, options?: ToastOptions) => void;
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Maximum number of toasts visible at once (additional toasts go to queue)
const MAX_VISIBLE_TOASTS = 3;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [queue, setQueue] = useState<ToastMessage[]>([]);

  // Process queue when toasts are removed
  const processQueue = useCallback(() => {
    setQueue((currentQueue) => {
      if (currentQueue.length === 0) return currentQueue;

      setToasts((currentToasts) => {
        if (currentToasts.length >= MAX_VISIBLE_TOASTS) {
          return currentToasts;
        }

        // Move first queued toast to visible toasts
        const nextToast = currentQueue[0];
        setTimeout(() => {
          setToasts((prev) => [...prev, nextToast]);
        }, 100); // Small delay for smooth transition

        return currentToasts;
      });

      return currentQueue.slice(1);
    });
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType, options?: ToastOptions) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastMessage = {
        id,
        message,
        type,
        duration: options?.duration,
        action: options?.action,
      };

      setToasts((prev) => {
        if (prev.length >= MAX_VISIBLE_TOASTS) {
          // Add to queue if at limit
          setQueue((q) => [...q, newToast]);
          return prev;
        }
        return [...prev, newToast];
      });
    },
    []
  );

  const removeToast = useCallback(
    (id: string) => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
      // Process queue after toast is removed
      setTimeout(processQueue, 300); // Wait for exit animation
    },
    [processQueue]
  );

  const success = useCallback(
    (message: string, options?: ToastOptions) =>
      showToast(message, "success", options),
    [showToast]
  );

  const error = useCallback(
    (message: string, options?: ToastOptions) =>
      showToast(message, "error", options),
    [showToast]
  );

  const warning = useCallback(
    (message: string, options?: ToastOptions) =>
      showToast(message, "warning", options),
    [showToast]
  );

  const info = useCallback(
    (message: string, options?: ToastOptions) =>
      showToast(message, "info", options),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}

      {/* Toast Container - Fixed positioning with AnimatePresence */}
      <div
        className="fixed top-4 right-4 left-4 sm:left-auto sm:top-6 sm:right-6 z-50 flex flex-col gap-3 pointer-events-none"
        aria-live="polite"
        aria-atomic="false"
      >
        <div className="flex flex-col gap-3 pointer-events-auto">
          <AnimatePresence mode="sync" initial={false}>
            {toasts.map((toast) => (
              <Toast
                key={toast.id}
                message={toast.message}
                type={toast.type}
                duration={toast.duration}
                action={toast.action}
                onClose={() => removeToast(toast.id)}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Queue indicator - show if there are queued toasts */}
        {queue.length > 0 && (
          <div className="pointer-events-auto px-4 py-2 bg-silver-200 text-text-secondary rounded-lg text-sm font-medium text-center">
            +{queue.length} more notification{queue.length > 1 ? "s" : ""}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
