/**
 * PR Badge Component
 *
 * Displays a personal record achievement badge
 * Shows inline during workout or in celebration modal
 */

"use client";

import React from "react";
import { Trophy, TrendingUp, Award, Zap } from "lucide-react";
import {
  PRComparison,
  getPRBadgeColor,
  formatPRMessage,
} from "@/lib/pr-detection";
import {
  ModalBackdrop,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@/components/ui/Modal";

interface PRBadgeProps {
  comparison: PRComparison;
  variant?: "inline" | "large";
  animated?: boolean;
}

export function PRBadge({
  comparison,
  variant = "inline",
  animated = true,
}: PRBadgeProps) {
  if (!comparison.isPR) return null;

  const message = formatPRMessage(comparison);
  const colorClasses = getPRBadgeColor(comparison.improvement);

  // Select icon based on PR type
  const Icon = (() => {
    switch (comparison.type) {
      case "1rm":
        return Trophy;
      case "weight":
        return TrendingUp;
      case "reps":
        return Zap;
      case "volume":
        return Award;
      default:
        return Trophy;
    }
  })();

  if (variant === "large") {
    return (
      <div
        className={`rounded-xl p-6 ${colorClasses} ${animated ? "animate-bounce" : ""}`}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-8 h-8" />
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide">
              Personal Record!
            </div>
            <div className="text-lg font-bold">{message}</div>
          </div>
        </div>
      </div>
    );
  }

  // Inline variant
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${colorClasses} ${animated ? "animate-pulse" : ""}`}
    >
      <Icon className="w-4 h-4" />
      <span>PR!</span>
    </div>
  );
}

/**
 * PR Celebration Modal
 *
 * Full-screen celebration when athlete achieves a PR
 */
interface PRCelebrationModalProps {
  comparison: PRComparison;
  exerciseName: string;
  onClose: () => void;
}

export function PRCelebrationModal({
  comparison,
  exerciseName,
  onClose,
}: PRCelebrationModalProps) {
  if (!comparison.isPR) return null;

  const message = formatPRMessage(comparison);
  const { currentPerformance, previousBest } = comparison;

  return (
    <ModalBackdrop isOpen={true} onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
        <ModalHeader
          title="Personal Record!"
          subtitle={exerciseName}
          onClose={onClose}
          icon={<Trophy className="w-6 h-6 text-yellow-500" />}
        />

        <ModalContent>
          {/* PR details */}
          <div className="bg-linear-to-r from-yellow-50 to-orange-50 rounded-xl p-6 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {currentPerformance.weight}lbs × {currentPerformance.reps}
              </div>
              <div className="text-sm text-gray-600 mb-4">{message}</div>

              {previousBest && (
                <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
                  Previous Best: {previousBest.weight}lbs × {previousBest.reps}{" "}
                  ( Est. 1RM: {previousBest.estimatedOneRM}lbs)
                </div>
              )}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-600 mb-1">Est. 1RM</div>
              <div className="text-xl font-bold text-gray-900">
                {currentPerformance.estimatedOneRM}lbs
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-600 mb-1">Volume</div>
              <div className="text-xl font-bold text-gray-900">
                {currentPerformance.volume}lbs
              </div>
            </div>
          </div>
        </ModalContent>

        <ModalFooter align="center">
          <button
            onClick={onClose}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Continue Workout
          </button>
        </ModalFooter>
      </div>
    </ModalBackdrop>
  );
}
