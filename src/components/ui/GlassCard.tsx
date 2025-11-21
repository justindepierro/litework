/**
 * GlassCard Component
 * Reusable glass-morphism card with consistent styling
 * Eliminates duplicate wrapper patterns across the codebase
 */

"use client";

import React from "react";

export type GlassCardVariant = "default" | "thick" | "subtle";
export type GradientAccent =
  | "primary"
  | "secondary"
  | "tertiary"
  | "cyan"
  | "green"
  | "blue"
  | "purple"
  | "orange"
  | "none";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: GlassCardVariant;
  gradientAccent?: GradientAccent;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

const gradientClasses: Record<GradientAccent, string> = {
  primary:
    "bg-linear-to-r from-accent-orange-500 via-accent-pink-500 to-accent-purple-500",
  secondary:
    "bg-linear-to-r from-accent-orange-500 via-accent-purple-500 to-accent-pink-500",
  tertiary:
    "bg-linear-to-r from-accent-blue-500 via-accent-purple-500 to-accent-pink-500",
  cyan: "bg-gradient-progress-cyan",
  green: "bg-gradient-progress-green",
  blue: "bg-gradient-progress-blue",
  purple: "bg-gradient-button-purple",
  orange: "bg-gradient-button-orange",
  none: "",
};

const paddingClasses: Record<string, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const variantClasses: Record<GlassCardVariant, string> = {
  default: "glass backdrop-blur-lg bg-white/60 border border-white/10",
  thick: "glass-thick backdrop-blur-xl bg-white/70 border border-white/20",
  subtle: "backdrop-blur-md bg-white/40 border border-white/10",
};

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = "thick",
  gradientAccent = "none",
  className = "",
  padding = "md",
  ...props
}) => {
  return (
    <div
      {...props}
      className={`
        ${variantClasses[variant]}
        rounded-2xl shadow-xl relative overflow-hidden
        ${paddingClasses[padding]}
        ${className}
      `}
    >
      {gradientAccent !== "none" && (
        <div
          className={`absolute top-0 left-0 right-0 h-1 ${gradientClasses[gradientAccent]}`}
        />
      )}
      {children}
    </div>
  );
};

GlassCard.displayName = "GlassCard";
