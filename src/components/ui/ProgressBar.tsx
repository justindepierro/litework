/**
 * Progress Bar Component
 * Smooth animated progress indicator with multiple variants
 */

"use client";

import React from "react";
import { motion } from "framer-motion";

export interface ProgressBarProps {
  /** Progress value (0-100) */
  value: number;
  /** Maximum value */
  max?: number;
  /** Visual variant */
  variant?: "default" | "success" | "warning" | "error" | "gradient";
  /** Size */
  size?: "sm" | "md" | "lg";
  /** Show percentage label */
  showLabel?: boolean;
  /** Custom label text */
  label?: string;
  /** Animate on mount */
  animated?: boolean;
  /** Striped pattern */
  striped?: boolean;
  /** Indeterminate loading state */
  indeterminate?: boolean;
  /** Custom class */
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  variant = "default",
  size = "md",
  showLabel = false,
  label,
  animated = true,
  striped = false,
  indeterminate = false,
  className = "",
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const variantClasses = {
    default: "bg-accent-blue-600",
    success: "bg-status-success",
    warning: "bg-status-warning",
    error: "bg-status-error",
    gradient:
      "bg-gradient-to-r from-accent-blue-600 via-purple-600 to-pink-600",
  };

  return (
    <div className={className}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-(--text-primary)">
            {label || `${Math.round(percentage)}%`}
          </span>
        </div>
      )}

      <div
        className={`
          w-full bg-silver-200 rounded-full overflow-hidden
          ${sizeClasses[size]}
        `}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        {indeterminate ? (
          <motion.div
            className={`h-full ${variantClasses[variant]} rounded-full`}
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
            }}
            style={{ width: "50%" }}
          />
        ) : (
          <motion.div
            className={`
              h-full rounded-full
              ${variantClasses[variant]}
              ${striped ? "bg-striped" : ""}
            `}
            initial={animated ? { width: 0 } : { width: `${percentage}%` }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        )}
      </div>
    </div>
  );
}

export default ProgressBar;
