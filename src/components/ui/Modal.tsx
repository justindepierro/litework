/**
 * Modal Component System
 * Unified modal backdrop and container with consistent z-index management
 * Uses design tokens for styling with Framer Motion animations
 */

"use client";

import React, { useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Heading, Body } from "./Typography";
import {
  modalBackdrop,
  modalContent as modalContentVariants,
} from "@/lib/animation-variants";
import { trapFocus, focusFirstElement } from "@/lib/accessibility-utils";

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
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

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

  // Focus management and trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Store the element that had focus before modal opened
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus first focusable element in modal
      setTimeout(() => {
        if (modalRef.current) {
          const focused = focusFirstElement(modalRef.current);
          // If no focusable element found, focus the modal container itself
          if (!focused) {
            modalRef.current.focus();
          }
        }
      }, 100); // Small delay to allow modal to render

      // Setup focus trap
      const cleanup = trapFocus(modalRef.current);

      return () => {
        cleanup();
      };
    }
  }, [isOpen]);

  // Return focus when modal closes
  useEffect(() => {
    return () => {
      if (!isOpen && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen]);

  // Add/remove ESC key listener and prevent body scroll
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

  // Backdrop opacity variants
  const backdropVariants = {
    default: "bg-navy-900/75", // --color-bg-overlay equivalent
    dark: "bg-black/80",
    light: "bg-black/50",
  };

  const backdropClass = backdropVariants[backdropVariant];
  const zIndexClass = zIndex === 60 ? "z-60" : "z-50";

  const modalElement = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalBackdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={`
            fixed inset-0
            flex items-start sm:items-center justify-center 
            p-0 sm:p-4
            overflow-y-auto overflow-x-hidden
            ${zIndexClass}
            ${backdropClass}
            ${backdropClassName}
          `}
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            ref={modalRef}
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`
              relative 
              w-full h-full 
              sm:w-auto sm:h-auto
              sm:my-8 sm:max-h-[90vh]
              ${className}
            `}
            tabIndex={-1}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render modal in a portal to document.body to avoid stacking context issues
  if (typeof window === "undefined") return null;
  return createPortal(modalElement, document.body);
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
      relative
      flex items-center justify-between gap-4 p-6
      bg-gradient-header-secondary
      rounded-t-xl sm:rounded-t-xl
      ${headerClassName}
    `}
    >
      <div className="flex items-center gap-3 flex-1">
        {icon && <div className="shrink-0 !text-white">{icon}</div>}
        <div className="flex-1 min-w-0">
          <Heading level="h2" className="text-2xl font-bold !text-white">
            {title}
          </Heading>
          {subtitle && (
            <Body size="sm" className="!text-white/90 mt-0.5">
              {subtitle}
            </Body>
          )}
        </div>
      </div>
      <button
        onClick={onClose}
        className="
          shrink-0 p-2 rounded-lg
          hover:bg-white/20
          transition-colors
          !text-white
          hover:!text-white
          focus:outline-none
          focus:ring-2
          focus:ring-white/50
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
      {footer && (
        <ModalFooter className={footerClassName}>{footer}</ModalFooter>
      )}
    </ModalBackdrop>
  );
};

Modal.displayName = "Modal";
