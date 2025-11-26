/**
 * Dropdown Component - Enhanced Version
 * 🎨 Modern design with smooth animations
 * ✨ Beautiful slide-in transitions and backdrop blur
 * ♿ Enhanced accessibility with full keyboard navigation
 * 🎯 Improved visual hierarchy and micro-interactions
 */

"use client";

import React, { ReactNode, useState, useRef, useEffect } from "react";
import { Heading, Body, Caption } from "./Typography";

interface DropdownProps {
  /** Button or element that triggers the dropdown */
  trigger: ReactNode;
  /** Dropdown menu content */
  children: ReactNode;
  /** Alignment of dropdown relative to trigger */
  align?: "left" | "right" | "center";
  /** Width preset */
  width?: "sm" | "md" | "lg" | "xl" | "auto";
  /** Controlled open state */
  isOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Optional className for dropdown container */
  className?: string;
  /** Offset from trigger (in pixels) */
  offset?: number;
  /** Disable animations */
  disableAnimation?: boolean;
}

export function Dropdown({
  trigger,
  children,
  align = "left",
  width = "auto",
  isOpen: controlledOpen,
  onOpenChange,
  className = "",
  offset = 8,
  disableAnimation = false,
}: DropdownProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, setIsOpen]);

  // Enhanced keyboard handler with focus trap
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case "Escape":
          event.preventDefault();
          setIsOpen(false);
          // Return focus to trigger
          triggerRef.current
            ?.querySelector<HTMLElement>("[role='button'], button")
            ?.focus();
          break;
        case "Tab":
          // Keep focus within dropdown
          if (dropdownRef.current) {
            const focusableElements =
              dropdownRef.current.querySelectorAll<HTMLElement>(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
              );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey && document.activeElement === firstElement) {
              event.preventDefault();
              lastElement?.focus();
            } else if (
              !event.shiftKey &&
              document.activeElement === lastElement
            ) {
              event.preventDefault();
              firstElement?.focus();
            }
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  const widthClasses = {
    sm: "w-48",
    md: "w-64",
    lg: "w-80",
    xl: "w-96",
    auto: "w-auto min-w-48",
  };

  const alignClasses = {
    left: "left-0 origin-top-left",
    right: "right-0 origin-top-right",
    center: "left-1/2 -translate-x-1/2 origin-top",
  };

  return (
    <div ref={triggerRef} className={`relative inline-block ${className}`}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={`
            absolute ${alignClasses[align]} ${widthClasses[width]}
            bg-surface border-2 border-primary rounded-xl shadow-xl
            z-50 overflow-hidden backdrop-blur-sm
            transition-all duration-200 ease-out
            ${
              isOpen && !disableAnimation
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
            }
            ${disableAnimation && isOpen ? "opacity-100" : ""}
          `}
          style={{
            marginTop: `${offset}px`,
          }}
          role="menu"
          aria-orientation="vertical"
        >
          {/* Subtle gradient border effect */}
          <div className="absolute inset-0 rounded-xl bg-linear-to-br from-white/50 via-transparent to-transparent pointer-events-none" />

          {children}
        </div>
      )}
    </div>
  );
}

// Enhanced Subcomponents
interface DropdownHeaderProps {
  title: string;
  action?: ReactNode;
  className?: string;
}

export function DropdownHeader({
  title,
  action,
  className = "",
}: DropdownHeaderProps) {
  return (
    <div
      className={`
        flex items-center justify-between px-4 py-3 
        border-b-2 border-silver-200 bg-linear-to-br from-silver-50 to-silver-100
        ${className}
      `}
      role="presentation"
    >
      <Heading level="h6" className="text-body-dark">
        {title}
      </Heading>
      {action}
    </div>
  );
}

interface DropdownContentProps {
  children: ReactNode;
  className?: string;
  maxHeight?: string;
}

export function DropdownContent({
  children,
  className = "",
  maxHeight = "max-h-96",
}: DropdownContentProps) {
  return (
    <div
      className={`py-2 ${maxHeight} overflow-y-auto ${className}`}
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "rgb(203 213 225) transparent",
      }}
    >
      {children}
    </div>
  );
}

interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
  variant?: "default" | "danger" | "success" | "primary";
  disabled?: boolean;
  className?: string;
  shortcut?: string;
}

export function DropdownItem({
  children,
  onClick,
  icon,
  variant = "default",
  disabled = false,
  className = "",
  shortcut,
}: DropdownItemProps) {
  const variantClasses = {
    default:
      "hover:bg-silver-100 text-body focus:bg-silver-100 active:bg-silver-200",
    danger:
      "hover:bg-error-lightest text-error focus:bg-error-lightest active:bg-error-light",
    success:
      "hover:bg-success-lightest text-success focus:bg-success-lightest active:bg-success-light",
    primary:
      "hover:bg-primary-lightest text-primary focus:bg-primary-lightest active:bg-primary-light",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      role="menuitem"
      className={`
        w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left
        transition-all duration-150 ease-out
        group relative
        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : `${variantClasses[variant]} cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/20`
        }
        ${className}
      `}
    >
      <div className="flex items-center gap-3 flex-1">
        {icon && (
          <span
            className={`
            w-5 h-5 shrink-0 transition-transform duration-200
            ${!disabled && "group-hover:scale-110 group-active:scale-95"}
          `}
          >
            {icon}
          </span>
        )}
        <Body className="font-medium">{children}</Body>
      </div>

      {shortcut && (
        <Caption className="text-silver-500 font-medium px-2 py-0.5 bg-silver-100 rounded group-hover:bg-silver-200 transition-colors">
          {shortcut}
        </Caption>
      )}

      {/* Hover indicator */}
      {!disabled && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-primary rounded-r transition-all duration-200 group-hover:h-8" />
      )}
    </button>
  );
}

interface DropdownDividerProps {
  className?: string;
  label?: string;
}

export function DropdownDivider({
  className = "",
  label,
}: DropdownDividerProps) {
  if (label) {
    return (
      <div className={`my-2 px-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-silver-300" />
          <Caption className="font-semibold text-silver-500 uppercase tracking-wider">
            {label}
          </Caption>
          <div className="flex-1 border-t border-silver-300" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`my-1 border-t border-silver-200 ${className}`}
      role="separator"
    />
  );
}
