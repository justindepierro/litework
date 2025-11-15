/**
 * Success Animation Component
 * Shows animated checkmark for successful actions
 *
 * Usage:
 * <SuccessAnimation show={showSuccess} onComplete={() => setShowSuccess(false)} />
 */

"use client";

import React, { useEffect } from "react";
import { Check } from "lucide-react";

interface SuccessAnimationProps {
  /** Whether to show the animation */
  show: boolean;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Animation duration in ms */
  duration?: number;
  /** Size of the checkmark */
  size?: "sm" | "md" | "lg";
  /** Position */
  position?: "fixed" | "absolute" | "relative";
  /** Custom message */
  message?: string;
}

export function SuccessAnimation({
  show,
  onComplete,
  duration = 2000,
  size = "md",
  position = "fixed",
  message,
}: SuccessAnimationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  if (!show) return null;

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const positionClasses = {
    fixed: "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50",
    absolute: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    relative: "relative",
  };

  return (
    <>
      {/* Backdrop */}
      {position === "fixed" && (
        <div className="fixed inset-0 bg-(--overlay-dark) z-40 animate-in fade-in duration-200" />
      )}

      {/* Success Icon */}
      <div
        className={`${positionClasses[position]} flex flex-col items-center gap-3`}
      >
        <div
          className={`
            ${sizeClasses[size]}
            bg-(--status-success) rounded-full
            flex items-center justify-center
            shadow-lg
            animate-in zoom-in duration-300
          `}
          style={{
            animation: "successPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
          }}
        >
          <Check className={`${iconSizes[size]} text-white stroke-3`} />
        </div>

        {message && (
          <p className="text-sm font-medium text-(--text-primary) animate-in fade-in slide-in-from-bottom-2 duration-300 delay-100">
            {message}
          </p>
        )}
      </div>

      <style jsx>{`
        @keyframes successPop {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(180deg);
          }
          100% {
            transform: scale(1) rotate(360deg);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

/**
 * Mini Success Badge - Inline success indicator
 */
interface SuccessBadgeProps {
  show: boolean;
  message?: string;
  onComplete?: () => void;
}

export function SuccessBadge({
  show,
  message = "Success!",
  onComplete,
}: SuccessBadgeProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-(--status-success-light) border border-(--status-success) rounded-lg text-(--status-success) text-sm font-medium animate-in slide-in-from-top-2 fade-in duration-300">
      <div className="w-4 h-4 bg-(--status-success) rounded-full flex items-center justify-center animate-in zoom-in duration-200">
        <Check className="w-3 h-3 text-white stroke-3" />
      </div>
      <span>{message}</span>
    </div>
  );
}
