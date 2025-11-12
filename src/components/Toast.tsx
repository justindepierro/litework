"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { X, CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";
import { notificationSlideIn } from "@/lib/animation-variants";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
  action?: ToastAction;
}

export default function Toast({
  message,
  type,
  onClose,
  duration = 5000,
  action,
}: ToastProps) {
  useEffect(() => {
    if (duration === 0) return; // Don't auto-dismiss if duration is 0

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    const iconClasses = "w-6 h-6";
    switch (type) {
      case "success":
        return (
          <CheckCircle
            className={`${iconClasses} text-[var(--color-semantic-success-dark)]`}
          />
        );
      case "error":
        return (
          <XCircle
            className={`${iconClasses} text-[var(--color-semantic-error-dark)]`}
          />
        );
      case "warning":
        return (
          <AlertCircle
            className={`${iconClasses} text-[var(--color-semantic-warning-dark)]`}
          />
        );
      case "info":
        return (
          <Info
            className={`${iconClasses} text-[var(--color-semantic-info-dark)]`}
          />
        );
    }
  };

  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-[var(--color-semantic-success-lightest)] border-[var(--color-semantic-success-light)] text-[var(--color-semantic-success-darkest)]";
      case "error":
        return "bg-[var(--color-semantic-error-lightest)] border-[var(--color-semantic-error-light)] text-[var(--color-semantic-error-darkest)]";
      case "warning":
        return "bg-[var(--color-semantic-warning-lightest)] border-[var(--color-semantic-warning-light)] text-[var(--color-semantic-warning-darkest)]";
      case "info":
        return "bg-[var(--color-semantic-info-lightest)] border-[var(--color-semantic-info-light)] text-[var(--color-semantic-info-darkest)]";
    }
  };

  const getActionButtonStyles = () => {
    switch (type) {
      case "success":
        return "text-[var(--color-semantic-success-dark)] hover:bg-[var(--color-semantic-success-light)]";
      case "error":
        return "text-[var(--color-semantic-error-dark)] hover:bg-[var(--color-semantic-error-light)]";
      case "warning":
        return "text-[var(--color-semantic-warning-dark)] hover:bg-[var(--color-semantic-warning-light)]";
      case "info":
        return "text-[var(--color-semantic-info-dark)] hover:bg-[var(--color-semantic-info-light)]";
    }
  };

  return (
    <motion.div
      variants={notificationSlideIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`
        flex items-start gap-3 px-5 py-4 rounded-xl border-2 shadow-lg
        min-w-[320px] max-w-[90vw] sm:max-w-md
        ${getStyles()}
        touch-manipulation
      `}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div className="shrink-0 mt-0.5">{getIcon()}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-base font-medium leading-relaxed break-words">
          {message}
        </p>

        {/* Optional Action Button */}
        {action && (
          <button
            onClick={() => {
              action.onClick();
              onClose();
            }}
            className={`
              mt-2 px-3 py-1.5 rounded-lg font-medium text-sm
              transition-colors touch-manipulation
              ${getActionButtonStyles()}
              min-h-11 sm:min-h-0
            `}
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Close Button - Minimum 44x44px touch target */}
      <button
        onClick={onClose}
        className="shrink-0 p-2 hover:bg-black/5 rounded-lg transition-colors touch-manipulation min-w-11 min-h-11 flex items-center justify-center"
        aria-label="Close notification"
      >
        <X className="w-5 h-5" />
      </button>
    </motion.div>
  );
}
