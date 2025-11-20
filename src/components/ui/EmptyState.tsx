/**
 * EmptyState Component
 * Consistent, helpful empty states across the app
 * Uses design tokens and Framer Motion animations for smooth fade-ins
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Button } from "./Button";
import { fadeInUp, scaleIn } from "@/lib/animation-variants";

export interface EmptyStateProps {
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Main heading */
  title: string;
  /** Descriptive text */
  description: string;
  /** Primary call-to-action */
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  /** Optional secondary action */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Custom illustration (optional) */
  illustration?: React.ReactNode;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Animation delay in seconds (default: 0) */
  delay?: number;
  /** Show subtle gradient background */
  showGradient?: boolean;
  /** Custom className */
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  illustration,
  size = "md",
  delay = 0,
  showGradient = false,
  className = "",
}) => {
  const sizeStyles = {
    sm: {
      container: "py-8 px-4",
      icon: "w-12 h-12 mb-3",
      title: "text-lg",
      description: "text-sm",
    },
    md: {
      container: "py-12 px-6",
      icon: "w-16 h-16 mb-4",
      title: "text-xl",
      description: "text-base",
    },
    lg: {
      container: "py-16 px-8",
      icon: "w-20 h-20 mb-6",
      title: "text-2xl",
      description: "text-lg",
    },
  };

  const styles = sizeStyles[size];

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      className={`
        flex flex-col items-center justify-center text-center
        ${styles.container}
        ${showGradient ? "bg-gradient-subtle-primary rounded-xl border border-silver-200" : ""}
        ${className}
      `}
    >
      {/* Custom illustration or icon */}
      {illustration ? (
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: delay + 0.1 }}
          className="mb-6"
        >
          {illustration}
        </motion.div>
      ) : (
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: delay + 0.1 }}
          className={`
          ${styles.icon}
          text-[var(--color-text-tertiary)]
          flex items-center justify-center
          bg-neutral-200
          rounded-full
        `}
        >
          <Icon className="w-3/5 h-3/5" />
        </motion.div>
      )}

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.2 }}
        className={`
        ${styles.title}
        font-[var(--font-family-heading)]
        font-[var(--font-weight-semibold)]
        text-[var(--color-text-primary)]
        mb-2
      `}
      >
        {title}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.3 }}
        className={`
        ${styles.description}
        text-[var(--color-text-secondary)]
        max-w-md
        mb-6
      `}
      >
        {description}
      </motion.p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.4 }}
          className="flex flex-col sm:flex-row gap-3 items-center justify-center"
        >
          {action && (
            <Button
              variant="primary"
              size={size === "sm" ? "sm" : "md"}
              onClick={action.onClick}
              leftIcon={action.icon}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="ghost"
              size={size === "sm" ? "sm" : "md"}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

EmptyState.displayName = "EmptyState";

/**
 * Preset Empty States for common scenarios
 */

import {
  Dumbbell,
  Users,
  Calendar,
  FileText,
  Search,
  Inbox,
  AlertCircle,
} from "lucide-react";

export const EmptyWorkouts: React.FC<{
  onCreateWorkout: () => void;
}> = ({ onCreateWorkout }) => (
  <EmptyState
    icon={Dumbbell}
    title="No workouts yet"
    description="Create your first workout to get started with your training program."
    showGradient={true}
    action={{
      label: "Create Workout",
      onClick: onCreateWorkout,
      icon: <Dumbbell className="w-4 h-4" />,
    }}
  />
);

export const EmptyAthletes: React.FC<{
  onInviteAthlete: () => void;
}> = ({ onInviteAthlete }) => (
  <EmptyState
    icon={Users}
    title="No athletes yet"
    description="Invite athletes to join your program and start tracking their progress."
    action={{
      label: "Invite Athlete",
      onClick: onInviteAthlete,
      icon: <Users className="w-4 h-4" />,
    }}
  />
);

export const EmptyAssignments: React.FC<{
  onAssignWorkout?: () => void;
}> = ({ onAssignWorkout }) => (
  <EmptyState
    icon={Calendar}
    title="No assignments yet"
    description="You don't have any workouts assigned. Check back later or contact your coach."
    action={
      onAssignWorkout
        ? {
            label: "Assign Workout",
            onClick: onAssignWorkout,
          }
        : undefined
    }
  />
);

export const EmptySearch: React.FC<{
  searchTerm: string;
  onClearSearch: () => void;
}> = ({ searchTerm, onClearSearch }) => (
  <EmptyState
    icon={Search}
    title="No results found"
    description={`We couldn't find any results for "${searchTerm}". Try different keywords.`}
    action={{
      label: "Clear Search",
      onClick: onClearSearch,
    }}
    size="sm"
  />
);

export const EmptyNotifications: React.FC = () => (
  <EmptyState
    icon={Inbox}
    title="You're all caught up!"
    description="No new notifications at the moment."
    size="sm"
  />
);

export const EmptyProgress: React.FC<{
  onLogWorkout?: () => void;
}> = ({ onLogWorkout }) => (
  <EmptyState
    icon={FileText}
    title="No progress data yet"
    description="Complete some workouts to start tracking your progress and see your stats."
    action={
      onLogWorkout
        ? {
            label: "Log a Workout",
            onClick: onLogWorkout,
          }
        : undefined
    }
  />
);

export const EmptyError: React.FC<{
  message?: string;
  onRetry: () => void;
}> = ({ message = "Something went wrong", onRetry }) => (
  <EmptyState
    icon={AlertCircle}
    title="Oops!"
    description={message}
    action={{
      label: "Try Again",
      onClick: onRetry,
    }}
    size="sm"
  />
);
