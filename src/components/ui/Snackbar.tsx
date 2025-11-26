/**
 * Snackbar Component
 * Modern, lightweight notification system (alternative to heavy toast libraries)
 * Bottom-anchored, mobile-friendly, with undo actions
 */

"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Body } from "./Typography";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

export interface SnackbarAction {
  label: string;
  onClick: () => void;
}

export interface SnackbarOptions {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number; // Auto-dismiss after ms (0 = no auto-dismiss)
  action?: SnackbarAction;
}

interface SnackbarItem extends SnackbarOptions {
  id: string;
}

interface SnackbarContextType {
  show: (options: SnackbarOptions) => void;
  success: (message: string, action?: SnackbarAction) => void;
  error: (message: string, action?: SnackbarAction) => void;
  warning: (message: string, action?: SnackbarAction) => void;
  info: (message: string, action?: SnackbarAction) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined
);

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within SnackbarProvider");
  }
  return context;
}

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [snackbars, setSnackbars] = useState<SnackbarItem[]>([]);

  const show = useCallback((options: SnackbarOptions) => {
    const id = Math.random().toString(36).substring(7);
    const snackbar: SnackbarItem = {
      id,
      type: "info",
      duration: 4000,
      ...options,
    };

    setSnackbars((prev) => [...prev, snackbar]);

    if (snackbar.duration && snackbar.duration > 0) {
      setTimeout(() => {
        setSnackbars((prev) => prev.filter((s) => s.id !== id));
      }, snackbar.duration);
    }
  }, []);

  const success = useCallback(
    (message: string, action?: SnackbarAction) => {
      show({ message, type: "success", action });
    },
    [show]
  );

  const error = useCallback(
    (message: string, action?: SnackbarAction) => {
      show({ message, type: "error", duration: 6000, action });
    },
    [show]
  );

  const warning = useCallback(
    (message: string, action?: SnackbarAction) => {
      show({ message, type: "warning", action });
    },
    [show]
  );

  const info = useCallback(
    (message: string, action?: SnackbarAction) => {
      show({ message, type: "info", action });
    },
    [show]
  );

  const dismiss = useCallback((id: string) => {
    setSnackbars((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const colors = {
    success: "bg-status-success text-white",
    error: "bg-status-error text-white",
    warning: "bg-status-warning text-white",
    info: "bg-accent-blue-600 text-white",
  };

  return (
    <SnackbarContext.Provider value={{ show, success, error, warning, info }}>
      {children}

      {/* Snackbar container - bottom center on mobile, bottom left on desktop */}
      <div className="fixed bottom-0 left-0 right-0 md:left-6 md:right-auto z-50 p-4 md:p-0 md:pb-6 pointer-events-none">
        <div className="flex flex-col gap-2 max-w-md mx-auto md:mx-0">
          <AnimatePresence>
            {snackbars.map((snackbar) => {
              const Icon = icons[snackbar.type || "info"];
              const colorClass = colors[snackbar.type || "info"];

              return (
                <motion.div
                  key={snackbar.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`
                    ${colorClass}
                    rounded-lg shadow-xl
                    pointer-events-auto
                    flex items-center gap-3 p-4
                    min-w-[280px] max-w-md
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <Body size="sm" weight="medium" className="flex-1">
                    {snackbar.message}
                  </Body>

                  {snackbar.action && (
                    <button
                      onClick={() => {
                        snackbar.action!.onClick();
                        dismiss(snackbar.id);
                      }}
                      className="text-sm font-bold uppercase hover:opacity-80 transition-opacity"
                    >
                      {snackbar.action.label}
                    </button>
                  )}

                  <button
                    onClick={() => dismiss(snackbar.id)}
                    className="hover:opacity-80 transition-opacity"
                    aria-label="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </SnackbarContext.Provider>
  );
}
