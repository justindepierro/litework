/**
 * Alert/Banner Component
 * Uses design tokens for semantic color consistency
 * Variants: info, success, warning, error
 */

import React, { HTMLAttributes, ReactNode } from "react";
import { Info, CheckCircle, AlertTriangle, XCircle, X } from "lucide-react";

export type AlertVariant = "info" | "success" | "warning" | "error";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  icon?: ReactNode;
  onDismiss?: () => void;
  children: ReactNode;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      variant = "info",
      title,
      icon,
      onDismiss,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    // Default icons for each variant
    const defaultIcons: Record<AlertVariant, ReactNode> = {
      info: <Info className="w-5 h-5" />,
      success: <CheckCircle className="w-5 h-5" />,
      warning: <AlertTriangle className="w-5 h-5" />,
      error: <XCircle className="w-5 h-5" />,
    };

    // Variant styles using semantic utilities
    const variantStyles: Record<AlertVariant, string> = {
      info: "bg-info-lighter border-info-light text-info-dark",
      success: "bg-success-lighter border-success-light text-success-dark",
      warning: "bg-warning-lighter border-warning-light text-warning-dark",
      error: "bg-error-lighter border-error-light text-error-dark",
    };

    // Icon color
    const iconColor: Record<AlertVariant, string> = {
      info: "text-info",
      success: "text-success",
      warning: "text-warning",
      error: "text-error",
    };

    const displayIcon = icon !== undefined ? icon : defaultIcons[variant];

    return (
      <div
        ref={ref}
        role="alert"
        className={`flex items-start gap-3 p-4 rounded-lg border-2 ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {displayIcon && (
          <span className={`shrink-0 mt-0.5 ${iconColor[variant]}`}>
            {displayIcon}
          </span>
        )}
        <div className="flex-1 min-w-0">
          {title && <h4 className="font-semibold mb-1 text-sm">{title}</h4>}
          <div className="text-sm">{children}</div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`shrink-0 p-1 rounded hover:bg-black/5 transition-colors ${iconColor[variant]}`}
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = "Alert";
