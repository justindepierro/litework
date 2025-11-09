"use client";

import { useState, useEffect } from "react";
import { Play, Pause, SkipForward, Volume2, Clock } from "lucide-react";
import { ModalBackdrop } from "@/components/ui/Modal";

interface RestTimerProps {
  duration: number; // seconds
  onComplete: () => void;
  onSkip: () => void;
  autoStart?: boolean;
}

export default function RestTimer({
  duration,
  onComplete,
  onSkip,
  autoStart = true,
}: RestTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [hasCompleted, setHasCompleted] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (!isRunning || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setHasCompleted(true);

          // Play sound notification (if supported)
          try {
            const audio = new Audio("/sounds/timer-complete.mp3");
            audio.volume = 0.5;
            audio.play().catch(() => {
              // Silently fail if audio not available
            });
          } catch {
            // Silently fail if audio not supported
          }

          // Vibrate (if supported)
          if ("vibrate" in navigator) {
            navigator.vibrate([200, 100, 200]);
          }

          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeRemaining, onComplete]);

  const togglePause = () => {
    setIsRunning(!isRunning);
  };

  const handleSkip = () => {
    setIsRunning(false);
    setTimeRemaining(0);
    onSkip();
  };

  const progressPercentage = ((duration - timeRemaining) / duration) * 100;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  // Prevent closing by ESC or backdrop click - user must skip
  const handleNoClose = () => {};

  return (
    <ModalBackdrop isOpen={true} onClose={handleNoClose}>
      <div className="bg-white rounded-3xl p-8 w-full max-w-md mx-4 text-center">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Clock className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Rest Timer</h2>
        </div>

        {/* Circular Progress */}
        <div className="relative w-64 h-64 mx-auto mb-6">
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="#E5E7EB"
              strokeWidth="16"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke={hasCompleted ? "#10B981" : "#3B82F6"}
              strokeWidth="16"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 120}`}
              strokeDashoffset={`${2 * Math.PI * 120 * (1 - progressPercentage / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Timer text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div>
              <div className="text-6xl font-bold text-gray-900">
                {minutes}:{seconds.toString().padStart(2, "0")}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {hasCompleted ? "Rest Complete!" : "Remaining"}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          {/* Pause/Resume */}
          <button
            onClick={togglePause}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-medium transition-colors"
            disabled={hasCompleted}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Resume
              </>
            )}
          </button>

          {/* Skip */}
          <button
            onClick={handleSkip}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          >
            <SkipForward className="w-5 h-5" />
            {hasCompleted ? "Continue" : "Skip Rest"}
          </button>
        </div>

        {/* Sound indicator */}
        {hasCompleted && (
          <div className="flex items-center justify-center gap-2 mt-4 text-green-600">
            <Volume2 className="w-4 h-4" />
            <span className="text-sm font-medium">Rest period complete!</span>
          </div>
        )}
      </div>
    </ModalBackdrop>
  );
}
