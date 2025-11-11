/**
 * Achievement Badge Display Components
 *
 * Shows earned achievements and progress towards locked badges
 */

"use client";

import React, { memo } from "react";
import {
  Achievement,
  ACHIEVEMENTS,
  AchievementType,
} from "@/lib/achievement-system";
import {
  Lock,
  Trophy,
  Target,
  Flame,
  Zap,
  Crown,
  Dumbbell,
  BarChart3,
} from "lucide-react";
import {
  ModalBackdrop,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@/components/ui/Modal";

// Map icon names to Lucide components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Trophy,
  Target,
  Flame,
  Zap,
  Crown,
  Dumbbell,
  BarChart3,
};

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: "small" | "medium" | "large";
  showDate?: boolean;
}

export function AchievementBadge({
  achievement,
  size = "medium",
  showDate = false,
}: AchievementBadgeProps) {
  const IconComponent = ICON_MAP[achievement.icon] || Trophy;

  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-24 h-24",
    large: "w-32 h-32",
  };

  const iconSizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12",
    large: "w-16 h-16",
  };

  const textSizeClasses = {
    small: "text-xs",
    medium: "text-sm",
    large: "text-base",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`${sizeClasses[size]} ${achievement.color} rounded-full flex items-center justify-center shadow-lg text-white`}
      >
        <IconComponent className={iconSizeClasses[size]} />
      </div>
      <div className="text-center max-w-[120px]">
        <div className={`font-semibold text-navy-900 ${textSizeClasses[size]}`}>
          {achievement.name}
        </div>
        {showDate && achievement.earned_at && (
          <div className="text-xs text-silver-600 mt-1">
            {new Date(achievement.earned_at).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}

interface LockedBadgeProps {
  type: AchievementType;
  size?: "small" | "medium" | "large";
}

export function LockedBadge({ type, size = "medium" }: LockedBadgeProps) {
  const achievement = ACHIEVEMENTS[type];

  const sizeClasses = {
    small: "w-16 h-16 text-sm",
    medium: "w-24 h-24 text-base",
    large: "w-32 h-32 text-lg",
  };

  const textSizeClasses = {
    small: "text-xs",
    medium: "text-sm",
    large: "text-base",
  };

  return (
    <div className="flex flex-col items-center gap-2 opacity-50">
      <div
        className={`${sizeClasses[size]} bg-silver-400 rounded-full flex items-center justify-center relative`}
      >
        <Lock className="w-8 h-8 text-silver-600" />
      </div>
      <div className="text-center max-w-[120px]">
        <div
          className={`font-semibold text-silver-700 ${textSizeClasses[size]}`}
        >
          {achievement.name}
        </div>
        <div className="text-xs text-silver-600 mt-1">
          {achievement.description}
        </div>
      </div>
    </div>
  );
}

interface AchievementGridProps {
  achievements: Achievement[];
  showLocked?: boolean;
}

export function AchievementGrid({
  achievements,
  showLocked = true,
}: AchievementGridProps) {
  const earnedTypes = new Set(achievements.map((a) => a.type));
  const allTypes = Object.keys(ACHIEVEMENTS) as AchievementType[];

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {achievements.map((achievement) => (
        <AchievementBadge
          key={achievement.id}
          achievement={achievement}
          size="medium"
          showDate
        />
      ))}
      {showLocked &&
        allTypes
          .filter((type) => !earnedTypes.has(type))
          .map((type) => <LockedBadge key={type} type={type} size="medium" />)}
    </div>
  );
}

/**
 * Achievement notification modal
 */
interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

export function AchievementNotification({
  achievement,
  onClose,
}: AchievementNotificationProps) {
  const IconComponent = ICON_MAP[achievement.icon] || Trophy;

  return (
    <ModalBackdrop isOpen={true} onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full text-center animate-scale-in">
        <ModalHeader
          title="Achievement Unlocked!"
          subtitle=""
          onClose={onClose}
          icon={<Trophy className="w-6 h-6 text-[var(--color-semantic-warning-base)]" />}
        />

        <ModalContent>
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div
              className={`w-32 h-32 ${achievement.color} rounded-full flex items-center justify-center shadow-xl animate-bounce text-white`}
            >
              <IconComponent className="w-16 h-16" />
            </div>
          </div>

          {/* Achievement name and description */}
          <div>
            <h3 className="text-xl font-semibold text-navy-800 mb-2">
              {achievement.name}
            </h3>
            <p className="text-silver-700">{achievement.description}</p>
          </div>
        </ModalContent>

        <ModalFooter align="center">
          <button
            onClick={onClose}
            className="w-full py-3 bg-accent-blue text-white rounded-xl font-semibold hover:bg-accent-blue/90 transition-colors"
          >
            Continue
          </button>
        </ModalFooter>
      </div>
    </ModalBackdrop>
  );
}

/**
 * Fade-in animation keyframes (add to celebrations.css)
 */
