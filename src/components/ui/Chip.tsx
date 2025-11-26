/**
 * Chip Component
 * Small, compact element for labels, tags, and filters
 * Interactive variant supports selection and deletion
 */

"use client";

import React from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { Body } from "./Typography";

export interface ChipProps {
  /** Chip label */
  label: string;
  /** Visual variant */
  variant?:
    | "default"
    | "primary"
    | "success"
    | "warning"
    | "error"
    | "outlined";
  /** Size */
  size?: "sm" | "md" | "lg";
  /** Deletable chip */
  onDelete?: () => void;
  /** Clickable chip */
  onClick?: () => void;
  /** Selected state (for filter chips) */
  selected?: boolean;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Avatar image URL */
  avatar?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Custom class */
  className?: string;
}

export function Chip({
  label,
  variant = "default",
  size = "md",
  onDelete,
  onClick,
  selected = false,
  icon,
  avatar,
  disabled = false,
  className = "",
}: ChipProps) {
  const isInteractive = !!(onClick || onDelete);

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-3 py-1 gap-1.5",
    lg: "text-base px-4 py-1.5 gap-2",
  };

  const variantClasses = {
    default: selected
      ? "bg-silver-300 text-(--text-primary) border-silver-400"
      : "bg-silver-100 text-(--text-secondary) border-silver-200",
    primary: selected
      ? "bg-accent-blue-600 text-white border-accent-blue-600"
      : "bg-accent-blue-100 text-accent-blue-800 border-accent-blue-200",
    success: selected
      ? "bg-status-success text-white border-status-success"
      : "bg-success-light text-status-success border-success-border",
    warning: selected
      ? "bg-status-warning text-white border-status-warning"
      : "bg-amber-100 text-amber-800 border-amber-200",
    error: selected
      ? "bg-status-error text-white border-status-error"
      : "bg-error-light text-status-error border-error-border",
    outlined: selected
      ? "bg-accent-blue-50 text-accent-blue-700 border-accent-blue-600 border-2"
      : "bg-white text-(--text-primary) border-silver-300 border",
  };

  const iconSize = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const avatarSize = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const Component = motion[onClick ? "button" : "div"];

  return (
    <Component
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={`
        inline-flex items-center rounded-full font-medium
        transition-all duration-200
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${isInteractive && !disabled ? "cursor-pointer hover:shadow-md" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
      whileHover={isInteractive && !disabled ? { scale: 1.05 } : {}}
      whileTap={isInteractive && !disabled ? { scale: 0.95 } : {}}
    >
      {avatar && (
        <Image
          src={avatar}
          alt=""
          width={size === "sm" ? 16 : size === "md" ? 20 : 24}
          height={size === "sm" ? 16 : size === "md" ? 20 : 24}
          className={`${avatarSize[size]} rounded-full object-cover`}
        />
      )}

      {icon && (
        <Body as="span" className={iconSize[size]}>
          {icon}
        </Body>
      )}

      <Body as="span" className="truncate max-w-[200px]">
        {label}
      </Body>

      {onDelete && !disabled && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-1 rounded-full"
          aria-label="Delete"
        >
          <X className={iconSize[size]} />
        </button>
      )}
    </Component>
  );
}

export default Chip;
