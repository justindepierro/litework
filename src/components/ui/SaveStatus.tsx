/**
 * SaveStatus Component
 * Shows visual feedback for save operations: "Saving..." → "Saved" with check icon → fade out
 * Industry pattern used by Notion, Linear, Airtable
 */

"use client";

import React, { useEffect } from "react";
import { Check, Loader2 } from "lucide-react";

export type SaveState = "idle" | "saving" | "saved" | "error";

interface SaveStatusProps {
  status: SaveState;
  /** Auto-hide after saved (default: true) */
  autoHide?: boolean;
  /** Delay before hiding in ms (default: 2000) */
  hideDelay?: number;
  /** Custom saved message (default: "Saved") */
  savedMessage?: string;
  /** Custom saving message (default: "Saving...") */
  savingMessage?: string;
  /** Custom error message */
  errorMessage?: string;
  /** Callback when status changes to idle after saved */
  onHidden?: () => void;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Custom className */
  className?: string;
}

export const SaveStatus: React.FC<SaveStatusProps> = ({
  status,
  autoHide = true,
  hideDelay = 2000,
  savedMessage = "Saved",
  savingMessage = "Saving...",
  errorMessage = "Error saving",
  onHidden,
  size = "md",
  className = "",
}) => {
  useEffect(() => {
    if (status === "saved" && autoHide) {
      const timer = setTimeout(() => {
        onHidden?.();
      }, hideDelay);
      return () => clearTimeout(timer);
    }
  }, [status, autoHide, hideDelay, onHidden]);

  // Size styles
  const sizeStyles = {
    sm: "text-xs gap-1",
    md: "text-sm gap-1.5",
    lg: "text-base gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  if (status === "idle") return null;

  return (
    <div
      className={`inline-flex items-center ${sizeStyles[size]} font-medium transition-all duration-300 ${className}`}
      role="status"
      aria-live="polite"
    >
      {status === "saving" && (
        <>
          <Loader2 className={`${iconSizes[size]} animate-spin text-silver-600`} />
          <span className="text-silver-600">{savingMessage}</span>
        </>
      )}

      {status === "saved" && (
        <>
          <Check className={`${iconSizes[size]} text-success`} />
          <span className="text-success">{savedMessage}</span>
        </>
      )}

      {status === "error" && (
        <>
          <span className={`${iconSizes[size]} text-error`}>✕</span>
          <span className="text-error">{errorMessage}</span>
        </>
      )}
    </div>
  );
};

/**
 * Hook to manage save status state
 * Returns [status, setSaving, setSaved, setError, setIdle]
 */
export function useSaveStatus(): [
  SaveState,
  () => void,
  () => void,
  (error?: string) => void,
  () => void
] {
  const [status, setStatus] = React.useState<SaveState>("idle");

  const setSaving = React.useCallback(() => setStatus("saving"), []);
  const setSaved = React.useCallback(() => setStatus("saved"), []);
  const setError = React.useCallback(() => setStatus("error"), []);
  const setIdle = React.useCallback(() => setStatus("idle"), []);

  return [status, setSaving, setSaved, setError, setIdle];
}

/**
 * Compact save indicator for inline editing
 * Shows next to the edited field
 */
export const InlineSaveStatus: React.FC<{
  status: SaveState;
  className?: string;
}> = ({ status, className = "" }) => {
  if (status === "idle") return null;

  return (
    <span
      className={`inline-flex items-center ml-2 text-xs ${className}`}
      role="status"
      aria-live="polite"
    >
      {status === "saving" && (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-silver-500 mr-1" />
          <span className="text-silver-500">Saving...</span>
        </>
      )}

      {status === "saved" && (
        <>
          <Check className="w-3 h-3 text-success mr-1" />
          <span className="text-success">Saved</span>
        </>
      )}

      {status === "error" && (
        <span className="text-error text-xs">Error</span>
      )}
    </span>
  );
};
