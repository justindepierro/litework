"use client";

import React, { useEffect, useState } from "react";
import { Heading, Body, Caption } from "./Typography";

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
      className={`bg-(--status-error-light) border border-(--status-error) rounded-lg p-4 ${className}`}
      role="alert"
    >
      <div className="flex items-start">
        <svg
          className="w-5 h-5 text-(--status-error) mr-3 mt-0.5 shrink-0"
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
          <Heading
            level="h3"
            className="text-sm font-medium text-(--status-error)"
          >
            Too Many Attempts
          </Heading>
          <Body size="sm" className="mt-1 text-(--status-error)">
            {error}
          </Body>
          {timeRemaining && (
            <div className="mt-3 flex items-center">
              <div className="flex-1">
                <div className="h-2 bg-(--status-error-light) rounded-full overflow-hidden">
                  <div className="h-full bg-(--status-error) rounded-full animate-pulse" />
                </div>
              </div>
              <Caption className="ml-3 font-medium text-(--status-error) tabular-nums">
                {timeRemaining}
              </Caption>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RateLimitError;
