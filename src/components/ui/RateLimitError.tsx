"use client";

import React, { useEffect, useState } from "react";

interface RateLimitErrorProps {
  error: string;
  className?: string;
}

export function RateLimitError({ error, className = "" }: RateLimitErrorProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    // Extract minutes from error message like "Try again in 14 minutes"
    const match = error.match(/(\d+)\s+minutes?/i);
    if (!match) return;

    const initialMinutes = parseInt(match[1], 10);
    const resetTime = Date.now() + initialMinutes * 60 * 1000;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = resetTime - now;

      if (remaining <= 0) {
        setTimeRemaining("You can try again now");
        return;
      }

      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);

      if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s remaining`);
      } else {
        setTimeRemaining(`${seconds}s remaining`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [error]);

  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}
      role="alert"
    >
      <div className="flex items-start">
        <svg
          className="w-5 h-5 text-red-500 mr-3 mt-0.5 shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Too Many Attempts
          </h3>
          <p className="mt-1 text-sm text-red-700">{error}</p>
          {timeRemaining && (
            <div className="mt-3 flex items-center">
              <div className="flex-1">
                <div className="h-2 bg-red-200 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full animate-pulse" />
                </div>
              </div>
              <span className="ml-3 text-xs font-medium text-red-700 tabular-nums">
                {timeRemaining}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RateLimitError;
