/**
 * Modal Component System
 * Unified modal backdrop and container with consistent z-index management
 * Uses design tokens for styling
 */

"use client";

import React, { useEffect, useCallback } from "react";
import { X } from "lucide-react";

export interface ModalBackdropProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when backdrop is clicked */
  onClose: () => void;
  /** Modal content */
  children: React.ReactNode;
  /** Custom z-index (default: z-50) */
  zIndex?: 50 | 60;
  /** Backdrop opacity variant */
  backdropVariant?: "default" | "dark" | "light";
  /** Custom className for the backdrop */
  backdropClassName?: string;
  /** Custom className for the content container */
  className?: string;
  /** Disable backdrop click to close */
  disableBackdropClick?: boolean;
  /** Disable ESC key to close */
  disableEscapeKey?: boolean;
}

/**
 * ModalBackdrop - Reusable modal backdrop with consistent behavior
 */
export const ModalBackdrop: React.FC<ModalBackdropProps> = ({
  isOpen,
  onClose,
  children,
  zIndex = 50,
  backdropVariant = "default",
  backdropClassName = "",
  className = "",
  disableBackdropClick = false,
  disableEscapeKey = false,
}) => {
  // Handle ESC key press
  const handleEscapeKey = useCallback(
    (event: KeyboardEvent) => {
      if (!disableEscapeKey && event.key === "Escape" && isOpen) {
        onClose();
      }
    },
    [disableEscapeKey, isOpen, onClose]
  );

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!disableBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  // Add/remove ESC key listener
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscapeKey]);

  if (!isOpen) return null;

  // Backdrop opacity variants
  const backdropVariants = {
    default: "bg-[rgba(15,23,42,0.75)]", // --color-bg-overlay equivalent
    dark: "bg-[rgba(0,0,0,0.8)]",
    light: "bg-[rgba(0,0,0,0.5)]",
  };

  const backdropClass = backdropVariants[backdropVariant];
  const zIndexClass = zIndex === 60 ? "z-60" : "z-50";

  return (
    <div
      className={`
        fixed inset-0 flex items-center justify-center p-4
        ${zIndexClass}
        ${backdropClass}
        ${backdropClassName}
      `}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className={className}>{children}</div>
    </div>
  );
};

ModalBackdrop.displayName = "ModalBackdrop";

/**
 * ModalHeader - Consistent modal header with close button
 */
export interface ModalHeaderProps {
  title: string;
  onClose: () => void;
  subtitle?: string;
  icon?: React.ReactNode;
  headerClassName?: string;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  onClose,
  subtitle,
  icon,
  headerClassName = "",
}) => {
  return (
    <div
      className={`
      flex items-start justify-between gap-4 p-6 pb-4
      border-b border-[var(--color-border-primary)]
      ${headerClassName}
    `}
    >
      <div className="flex items-start gap-3 flex-1">
        {icon && <div className="shrink-0 mt-1">{icon}</div>}
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={onClose}
        className="
          shrink-0 p-2 rounded-lg
          hover:bg-[var(--color-bg-secondary)]
          transition-colors
          text-[var(--color-text-secondary)]
          hover:text-[var(--color-text-primary)]
        "
        aria-label="Close modal"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  );
};

ModalHeader.displayName = "ModalHeader";

/**
 * ModalContent - Container for modal body content
 */
export interface ModalContentProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const ModalContent: React.FC<ModalContentProps> = ({
  children,
  className = "",
  noPadding = false,
}) => {
  return (
    <div
      className={`
        ${noPadding ? "" : "p-6"}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

ModalContent.displayName = "ModalContent";

/**
 * ModalFooter - Container for modal actions/buttons
 */
export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right" | "between";
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  className = "",
  align = "right",
}) => {
  const alignmentClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
    between: "justify-between",
  };

  return (
    <div
      className={`
        flex items-center gap-3 p-6 pt-4
        border-t border-[var(--color-border-primary)]
        ${alignmentClasses[align]}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

ModalFooter.displayName = "ModalFooter";

/**
 * Modal - Complete modal with all parts
 * For quick modal creation with common patterns
 */
export interface ModalProps extends ModalBackdropProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  size = "md",
  zIndex = 50,
  backdropVariant = "default",
  headerClassName,
  contentClassName,
  footerClassName,
  disableBackdropClick,
  disableEscapeKey,
}) => {
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-full mx-4",
  };

  return (
    <ModalBackdrop
      isOpen={isOpen}
      onClose={onClose}
      zIndex={zIndex}
      backdropVariant={backdropVariant}
      disableBackdropClick={disableBackdropClick}
      disableEscapeKey={disableEscapeKey}
      className={`
        w-full ${sizeClasses[size]}
        bg-white rounded-xl shadow-2xl
        max-h-[90vh] overflow-y-auto
        animate-scale-in
      `}
    >
      <ModalHeader
        title={title}
        onClose={onClose}
        subtitle={subtitle}
        icon={icon}
        headerClassName={headerClassName}
      />
      <ModalContent className={contentClassName}>{children}</ModalContent>
      {footer && <ModalFooter className={footerClassName}>{footer}</ModalFooter>}
    </ModalBackdrop>
  );
};

Modal.displayName = "Modal";
