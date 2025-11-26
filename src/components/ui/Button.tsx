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
import { Body } from "./Typography";

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
        minHeight: "2.25rem", // 36px - below WCAG minimum, use for secondary actions only
      },
      md: {
        fontSize: "var(--font-size-base)",
        paddingInline: "var(--spacing-5)",
        paddingBlock: "var(--spacing-2-5)",
        minHeight: "3rem", // 48px - WCAG 2.1 compliant touch target (was 2.75rem)
      },
      lg: {
        fontSize: "var(--font-size-lg)",
        paddingInline: "var(--spacing-6)",
        paddingBlock: "var(--spacing-3)",
        minHeight: "3.5rem", // 56px - optimal for workout/gym context (was 3.25rem)
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

    // Variant styles with VIBRANT OKLCH gradients!
    const variantStyles: Record<ButtonVariant, string> = {
      primary: `
        bg-linear-to-br from-accent-orange-500 to-accent-orange-600
        text-white
        border border-white/20
        shadow-lg shadow-accent-orange-500/30
        font-semibold
        ${
          disabled || isLoading
            ? "opacity-50 from-accent-orange-300 to-accent-orange-400"
            : "hover:from-accent-orange-600 hover:to-accent-orange-700 hover:shadow-xl hover:shadow-accent-orange-600/40 hover:scale-105 active:scale-100 active:from-accent-orange-700 active:to-accent-orange-800 focus:ring-2 focus:ring-accent-orange-400 focus:ring-offset-2"
        }
      `,
      secondary: `
        glass backdrop-blur-lg
        bg-white/80
        text-navy-700
        border border-white/40
        shadow-md
        font-medium
        ${
          disabled || isLoading
            ? "opacity-50 bg-neutral-lighter/50"
            : "hover:bg-white/90 hover:border-white/60 hover:shadow-lg hover:scale-105 active:scale-100 active:bg-white active:shadow-inner focus:ring-2 focus:ring-accent-blue-300 focus:ring-offset-2"
        }
      `,
      danger: `
        bg-linear-to-br from-accent-red-500 to-accent-red-600
        text-white
        border border-white/20
        shadow-lg shadow-accent-red-500/30
        font-semibold
        ${
          disabled || isLoading
            ? "opacity-50 from-accent-red-300 to-accent-red-400"
            : "hover:from-accent-red-600 hover:to-accent-red-700 hover:shadow-xl hover:shadow-accent-red-600/40 hover:scale-105 active:scale-100 active:from-accent-red-700 active:to-accent-red-800 focus:ring-2 focus:ring-accent-red-400 focus:ring-offset-2"
        }
      `,
      ghost: `
        bg-transparent
        text-navy-700
        border border-transparent
        ${
          disabled || isLoading
            ? "opacity-50 text-navy-400"
            : "hover:bg-accent-blue-50 hover:text-accent-blue-700 active:bg-accent-blue-100 focus:ring-2 focus:ring-accent-blue-300 focus:ring-offset-2"
        }
      `,
      success: `
        bg-linear-to-br from-accent-green-500 to-accent-green-600
        text-white
        border border-white/20
        shadow-lg shadow-accent-green-500/30
        font-semibold
        ${
          disabled || isLoading
            ? "opacity-50 from-accent-green-300 to-accent-green-400"
            : "hover:from-accent-green-600 hover:to-accent-green-700 hover:shadow-xl hover:shadow-accent-green-600/40 hover:scale-105 active:scale-100 active:from-accent-green-700 active:to-accent-green-800 focus:ring-2 focus:ring-accent-green-400 focus:ring-offset-2"
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
        {leftIcon && (
          <Body as="span" className="inline-flex">
            {leftIcon}
          </Body>
        )}
        <Body as="span">{children}</Body>
        {rightIcon && (
          <Body as="span" className="inline-flex">
            {rightIcon}
          </Body>
        )}
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
