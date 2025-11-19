/**
 * Polished Button Component with Micro-Interactions
 * Uses design tokens for consistency
 * Includes: hover lift, active press, ripple effect, loading states
 * Enhanced with Framer Motion for smooth 60fps animations
 */

"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Check } from "lucide-react";

const cx = (...classes: Array<string | undefined | false>) =>
  classes.filter(Boolean).join(" ");

const mergeStyles = (
  ...styles: Array<React.CSSProperties | undefined>
): React.CSSProperties => Object.assign({}, ...styles.filter(Boolean));

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost"
  | "success";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  showSuccessState?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  /** ARIA label for accessibility (required for icon-only buttons) */
  "aria-label"?: string;
  /** ARIA pressed state for toggle buttons */
  "aria-pressed"?: boolean;
  /** ARIA expanded state for dropdown/accordion triggers */
  "aria-expanded"?: boolean;
  /** ARIA controls - ID of element controlled by this button */
  "aria-controls"?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      loadingText,
      showSuccessState = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      className = "",
      disabled,
      onClick,
      children,
      type,
      form,
      style,
      ...restProps
    },
    ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [ripples, setRipples] = useState<
      Array<{ x: number; y: number; id: number }>
    >([]);

    // Combine refs
    React.useImperativeHandle(ref, () => buttonRef.current!);

    // Ripple effect on click
    const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      const newRipple = {
        x,
        y,
        id: Date.now(),
      };

      setRipples((prev) => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) =>
          prev.filter((ripple) => ripple.id !== newRipple.id)
        );
      }, 600);
    };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !isLoading) {
        createRipple(event);
        onClick?.(event);
      }
    };

    const sizeMetrics: Record<
      ButtonSize,
      {
        fontSize: string;
        paddingInline: string;
        paddingBlock: string;
        minHeight: string;
      }
    > = {
      sm: {
        fontSize: "var(--font-size-sm)",
        paddingInline: "var(--spacing-4)",
        paddingBlock: "var(--spacing-2)",
        minHeight: "2.25rem",
      },
      md: {
        fontSize: "var(--font-size-base)",
        paddingInline: "var(--spacing-5)",
        paddingBlock: "var(--spacing-2-5)",
        minHeight: "2.75rem",
      },
      lg: {
        fontSize: "var(--font-size-lg)",
        paddingInline: "var(--spacing-6)",
        paddingBlock: "var(--spacing-3)",
        minHeight: "3.25rem",
      },
    };

    const baseClasses = cx(
      "relative inline-flex items-center justify-center gap-2 focus-ring smooth-transition overflow-hidden touch-manipulation",
      fullWidth && "w-full",
      disabled || isLoading
        ? "cursor-not-allowed opacity-60"
        : "cursor-pointer",
      className
    );

    // Variant styles using interactive state tokens
    const variantStyles: Record<ButtonVariant, string> = {
      primary: `
        bg-(--color-interactive-primary-base)
        text-(--color-text-inverse)
        border border-(--color-interactive-primary-base)
        shadow-[var(--elevation-1)]
        ${
          disabled || isLoading
            ? "bg-(--color-interactive-primary-disabled) border-(--color-interactive-primary-disabled)"
            : "hover:bg-(--color-interactive-primary-hover) hover:border-(--color-interactive-primary-hover) hover:shadow-[var(--elevation-2)] hover:-translate-y-0.5 active:bg-(--color-interactive-primary-active) active:border-(--color-interactive-primary-active) active:translate-y-0 focus:ring-2 focus:ring-(--color-interactive-primary-focus) focus:ring-offset-2"
        }
      `,
      secondary: `
        bg-(--color-bg-secondary)
        text-(--color-text-primary)
        border-2 border-(--color-border-secondary)
        ${
          disabled || isLoading
            ? "bg-(--color-bg-tertiary) border-(--color-border-primary)"
            : "hover:bg-(--color-bg-tertiary) hover:border-(--color-text-tertiary) hover:-translate-y-0.5 active:bg-(--color-border-secondary) active:text-(--color-text-inverse) active:translate-y-0 focus:ring-2 focus:ring-(--color-text-tertiary) focus:ring-offset-2"
        }
      `,
      danger: `
        bg-(--color-interactive-danger-base)
        text-(--color-text-inverse)
        border border-(--color-interactive-danger-base)
        shadow-[var(--elevation-1)]
        ${
          disabled || isLoading
            ? "bg-(--color-interactive-danger-disabled) border-(--color-interactive-danger-disabled)"
            : "hover:bg-(--color-interactive-danger-hover) hover:border-(--color-interactive-danger-hover) hover:shadow-[var(--elevation-2)] hover:-translate-y-0.5 active:bg-(--color-interactive-danger-active) active:border-(--color-interactive-danger-active) active:translate-y-0 focus:ring-2 focus:ring-(--color-interactive-danger-focus) focus:ring-offset-2"
        }
      `,
      ghost: `
        bg-(--color-interactive-ghost-base)
        text-(--color-text-primary)
        border border-transparent
        ${
          disabled || isLoading
            ? "text-(--color-text-tertiary)"
            : "hover:bg-(--color-interactive-ghost-hover) hover:text-(--color-text-primary) active:bg-(--color-interactive-ghost-active) focus:ring-2 focus:ring-(--color-interactive-ghost-focus) focus:ring-offset-2"
        }
      `,
      success: `
        bg-(--color-interactive-success-base)
        text-(--color-text-inverse)
        border border-(--color-interactive-success-base)
        shadow-[var(--elevation-1)]
        ${
          disabled || isLoading
            ? "bg-(--color-interactive-success-disabled) border-(--color-interactive-success-disabled)"
            : "hover:bg-(--color-interactive-success-hover) hover:border-(--color-interactive-success-hover) hover:shadow-[var(--elevation-2)] hover:-translate-y-0.5 active:bg-(--color-interactive-success-active) active:border-(--color-interactive-success-active) active:translate-y-0 focus:ring-2 focus:ring-(--color-interactive-success-focus) focus:ring-offset-2"
        }
      `,
    };

    const buttonStyle = mergeStyles(
      {
        borderRadius: "var(--radius-xl)",
        fontFamily: "var(--font-family-primary)",
        fontWeight: "var(--font-weight-semibold)",
        letterSpacing: "var(--letter-spacing-normal)",
        transition: "var(--transition-transform-spring)",
        paddingInline: sizeMetrics[size].paddingInline,
        paddingBlock: sizeMetrics[size].paddingBlock,
        fontSize: sizeMetrics[size].fontSize,
        minHeight: sizeMetrics[size].minHeight,
      },
      style
    );

    // Success state content
    if (showSuccessState) {
      return (
        <motion.button
          ref={buttonRef as React.Ref<HTMLButtonElement>}
          className={`${baseClasses} ${variantStyles.success}`}
          style={buttonStyle}
          disabled={true}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Check className="w-5 h-5 animate-success" />
          <span>Saved!</span>
        </motion.button>
      );
    }

    // Loading state content
    const content = isLoading ? (
      <>
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>{loadingText || "Loading..."}</span>
      </>
    ) : (
      <>
        {leftIcon && <span className="inline-flex">{leftIcon}</span>}
        <span>{children}</span>
        {rightIcon && <span className="inline-flex">{rightIcon}</span>}
      </>
    );

    return (
      <motion.button
        ref={buttonRef as React.Ref<HTMLButtonElement>}
        className={`${baseClasses} ${variantStyles[variant]}`}
        style={buttonStyle}
        disabled={disabled || isLoading}
        onClick={handleClick}
        type={type}
        form={form}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...Object.fromEntries(
          Object.entries(restProps).filter(
            ([key]) =>
              !key.startsWith("onAnimation") &&
              !key.startsWith("onDrag") &&
              !key.startsWith("while") &&
              !key.startsWith("animate")
          )
        )}
      >
        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 pointer-events-none animate-[ripple_600ms_ease-out]"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: "100px",
              height: "100px",
            }}
          />
        ))}

        {/* Button content */}
        {content}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

/**
 * Icon Button - Circular button for icons only
 */
export interface IconButtonProps
  extends Omit<ButtonProps, "leftIcon" | "rightIcon" | "children"> {
  icon: React.ReactNode;
  "aria-label": string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = "md", className = "", style, ...props }, ref) => {
    const dimensionMap: Record<ButtonSize, string> = {
      sm: "2.25rem",
      md: "2.75rem",
      lg: "3.25rem",
    };

    return (
      <Button
        ref={ref}
        size={size}
        className={cx("rounded-full", className)}
        style={mergeStyles(
          {
            width: dimensionMap[size],
            height: dimensionMap[size],
            paddingInline: 0,
            paddingBlock: 0,
          },
          style
        )}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = "IconButton";

/**
 * Button Group - For grouped buttons
 */
export interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className = "",
  orientation = "horizontal",
}) => {
  return (
    <div
      className={`
        inline-flex
        ${orientation === "horizontal" ? "flex-row" : "flex-col"}
        ${orientation === "horizontal" ? "[&>button]:rounded-none [&>button:first-child]:rounded-l-lg [&>button:last-child]:rounded-r-lg" : "[&>button]:rounded-none [&>button:first-child]:rounded-t-lg [&>button:last-child]:rounded-b-lg"}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

ButtonGroup.displayName = "ButtonGroup";
