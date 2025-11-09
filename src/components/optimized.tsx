/**
 * Memoized Components
 * Optimized versions of frequently re-rendered components
 */

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePrefetch } from "@/lib/prefetch";

// ============================================================================
// WORKOUT COMPONENTS
// ============================================================================

/**
 * Memoized Workout Card
 */
interface WorkoutCardProps {
  id: string;
  name: string;
  description?: string;
  exerciseCount: number;
  lastUsed?: string;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const WorkoutCard = React.memo<WorkoutCardProps>(
  ({
    id,
    name,
    description,
    exerciseCount,
    lastUsed,
    onClick,
    onEdit,
    onDelete,
  }) => {
    const prefetchProps = usePrefetch(`/api/workouts/${id}`, "workout-editor");

    return (
      <div
        className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
        onClick={onClick}
        {...prefetchProps}
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg">{name}</h3>
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1 hover:bg-silver-200 rounded"
                aria-label="Edit workout"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1 hover:bg-silver-200 rounded"
                aria-label="Delete workout"
              >
                🗑️
              </button>
            )}
          </div>
        </div>

        {description && (
          <p className="text-sm text-silver-700 mb-3 line-clamp-2">
            {description}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-silver-600">
          <span>{exerciseCount} exercises</span>
          {lastUsed && <span>Last used: {lastUsed}</span>}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for performance
    return (
      prevProps.id === nextProps.id &&
      prevProps.name === nextProps.name &&
      prevProps.description === nextProps.description &&
      prevProps.exerciseCount === nextProps.exerciseCount &&
      prevProps.lastUsed === nextProps.lastUsed
    );
  }
);

WorkoutCard.displayName = "WorkoutCard";

/**
 * Memoized Exercise Item
 */
interface ExerciseDisplayProps {
  name: string;
  sets?: number;
  reps?: string;
  weight?: string;
  notes?: string;
  isSuperset?: boolean;
  groupColor?: string;
}

export const ExerciseDisplay = React.memo<ExerciseDisplayProps>(
  ({ name, sets, reps, weight, notes, isSuperset, groupColor }) => {
    return (
      <div
        className={`p-3 rounded-lg ${
          isSuperset ? "bg-info-lighter border-l-4" : "bg-silver-200"
        }`}
        style={groupColor ? { borderLeftColor: groupColor } : undefined}
      >
        <div className="font-medium">{name}</div>
        <div className="text-sm text-silver-700 mt-1 flex gap-3">
          {sets && <span>{sets} sets</span>}
          {reps && <span>{reps} reps</span>}
          {weight && <span>{weight}</span>}
        </div>
        {notes && <p className="text-xs text-silver-600 mt-2">{notes}</p>}
      </div>
    );
  }
);

ExerciseDisplay.displayName = "ExerciseDisplay";

// ============================================================================
// LIST COMPONENTS
// ============================================================================

/**
 * Memoized Athlete Card
 */
interface AthleteCardProps {
  id: string;
  name: string;
  email: string;
  sport?: string;
  avatar?: string;
  onClick?: () => void;
}

export const AthleteCard = React.memo<AthleteCardProps>(
  ({ id, name, email, sport, avatar, onClick }) => {
    const prefetchProps = usePrefetch(`/api/athletes/${id}`);

    return (
      <div
        className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer"
        onClick={onClick}
        {...prefetchProps}
      >
        <div className="h-12 w-12 rounded-full bg-silver-300 flex items-center justify-center overflow-hidden">
          {avatar ? (
            <Image
              src={avatar}
              alt={name}
              width={48}
              height={48}
              className="object-cover"
            />
          ) : (
            <span className="text-lg font-semibold text-silver-700">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1">
          <div className="font-medium">{name}</div>
          <div className="text-sm text-silver-700">{email}</div>
          {sport && <div className="text-xs text-silver-600 mt-1">{sport}</div>}
        </div>
      </div>
    );
  }
);

AthleteCard.displayName = "AthleteCard";

/**
 * Memoized Group Card
 */
interface GroupCardProps {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  sport?: string;
  onClick?: () => void;
}

export const GroupCard = React.memo<GroupCardProps>(
  ({ id, name, description, memberCount, sport, onClick }) => {
    const prefetchProps = usePrefetch(`/api/groups/${id}`);

    return (
      <div
        className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
        onClick={onClick}
        {...prefetchProps}
      >
        <h3 className="font-semibold text-lg mb-1">{name}</h3>
        {sport && (
          <span className="inline-block px-2 py-1 bg-info-lighter text-accent-blue text-xs rounded mb-2">
            {sport}
          </span>
        )}
        {description && (
          <p className="text-sm text-silver-700 mb-3 line-clamp-2">
            {description}
          </p>
        )}
        <div className="text-sm text-silver-600">
          {memberCount} {memberCount === 1 ? "member" : "members"}
        </div>
      </div>
    );
  }
);

GroupCard.displayName = "GroupCard";

// ============================================================================
// NAVIGATION COMPONENTS
// ============================================================================

/**
 * Memoized Navigation Link with Prefetch
 */
interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  prefetchKeys?: string | string[];
  className?: string;
  activeClassName?: string;
  isActive?: boolean;
}

export const NavLink = React.memo<NavLinkProps>(
  ({
    href,
    children,
    prefetchKeys,
    className = "",
    activeClassName = "",
    isActive = false,
  }) => {
    const prefetchProps = usePrefetch(prefetchKeys);

    return (
      <Link
        href={href}
        className={`${className} ${isActive ? activeClassName : ""}`}
        {...prefetchProps}
      >
        {children}
      </Link>
    );
  }
);

NavLink.displayName = "NavLink";

// ============================================================================
// STAT COMPONENTS
// ============================================================================

/**
 * Memoized Stat Card
 */
interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "increase" | "decrease" | "neutral";
  icon?: React.ReactNode;
}

export const StatCard = React.memo<StatCardProps>(
  ({ title, value, change, changeType = "neutral", icon }) => {
    const changeColor =
      changeType === "increase"
        ? "text-success"
        : changeType === "decrease"
          ? "text-error"
          : "text-silver-700";

    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-silver-700">{title}</h3>
          {icon && <div className="text-2xl">{icon}</div>}
        </div>
        <div className="text-3xl font-bold mb-1">{value}</div>
        {change && <div className={`text-sm ${changeColor}`}>{change}</div>}
      </div>
    );
  }
);

StatCard.displayName = "StatCard";

// ============================================================================
// FORM COMPONENTS
// ============================================================================

/**
 * Memoized Button
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = React.memo<ButtonProps>(
  ({
    variant = "primary",
    size = "md",
    isLoading = false,
    children,
    className = "",
    disabled,
    ...props
  }) => {
    const baseClasses =
      "rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

    const variantClasses = {
      primary: "bg-accent-blue text-white hover:bg-accent-blue/90",
      secondary: "bg-silver-300 text-navy-900 hover:bg-silver-400",
      danger: "bg-accent-red text-white hover:bg-accent-red/90",
      ghost: "bg-transparent text-silver-800 hover:bg-silver-200",
    };

    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2",
      lg: "px-6 py-3 text-lg",
    };

    return (
      <button
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

/**
 * Memoized Input
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.memo<InputProps>(
  ({ label, error, helperText, className = "", ...props }) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? "border-red-500" : "border-gray-300"
          } ${className}`}
          {...props}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
