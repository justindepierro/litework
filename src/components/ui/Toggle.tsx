/**
 * Toggle/Switch Component
 * Accessible toggle switch with proper design tokens
 * Uses native checkbox with custom styling
 */

"use client";

import React from "react";
import { Body, Caption } from "./Typography";

export interface ToggleProps {
  /** Whether the toggle is checked */
  checked: boolean;
  /** Callback when toggle state changes */
  onChange: (checked: boolean) => void;
  /** Label text */
  label?: string;
  /** Helper text below toggle */
  helperText?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Custom className */
  className?: string;
  /** ID for the input */
  id?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  helperText,
  disabled = false,
  size = "md",
  className = "",
  id,
}) => {
  const sizes = {
    sm: {
      track: "w-9 h-5",
      thumb: "w-4 h-4",
      translate: "peer-checked:translate-x-4",
    },
    md: {
      track: "w-11 h-6",
      thumb: "w-5 h-5",
      translate: "peer-checked:translate-x-5",
    },
    lg: {
      track: "w-14 h-7",
      thumb: "w-6 h-6",
      translate: "peer-checked:translate-x-7",
    },
  };

  const sizeConfig = sizes[size];

  return (
    <label
      className={`flex items-center gap-3 ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${className}`}
    >
      <div className="relative inline-block flex-shrink-0">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div
          className={`
            ${sizeConfig.track}
            bg-silver-300 rounded-full peer
            peer-checked:bg-primary
            peer-focus-visible:ring-4 peer-focus-visible:ring-primary-lighter
            peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
            transition-colors duration-200 ease-in-out
            after:content-[''] after:absolute after:top-0.5 after:left-0.5
            after:bg-white after:rounded-full after:transition-transform after:duration-200
            ${sizeConfig.thumb} ${sizeConfig.translate}
          `}
        />
      </div>
      {(label || helperText) && (
        <div className="flex-1">
          {label && <Body>{label}</Body>}
          {helperText && <Caption variant="muted">{helperText}</Caption>}
        </div>
      )}
    </label>
  );
};

Toggle.displayName = "Toggle";
