"use client";

import React from "react";

interface PasswordStrengthIndicatorProps {
  password: string;
  strength: "weak" | "medium" | "strong";
  className?: string;
}

export function PasswordStrengthIndicator({
  password,
  strength,
  className = "",
}: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const strengthConfig = {
    weak: {
      color: "bg-(--status-error)",
      textColor: "text-(--status-error)",
      label: "Weak",
      width: "33.333%",
    },
    medium: {
      color: "bg-(--status-warning)",
      textColor: "text-(--status-warning)",
      label: "Medium",
      width: "66.666%",
    },
    strong: {
      color: "bg-(--status-success)",
      textColor: "text-(--status-success)",
      label: "Strong",
      width: "100%",
    },
  };

  const config = strengthConfig[strength];

  return (
    <div className={`mt-2 ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-(--text-secondary)">
          Password Strength
        </span>
        <span className={`text-xs font-medium ${config.textColor}`}>
          {config.label}
        </span>
      </div>
      <div className="h-2 w-full bg-(--bg-tertiary) rounded-full overflow-hidden">
        <div
          className={`h-full ${config.color} transition-all duration-300 ease-out`}
          style={{ width: config.width }}
        />
      </div>
      {strength === "weak" && (
        <ul className="mt-2 text-xs text-(--text-secondary) space-y-1">
          <li>• Use at least 8 characters</li>
          <li>• Include uppercase and lowercase letters</li>
          <li>• Add numbers and special characters</li>
          <li>• Avoid common passwords</li>
        </ul>
      )}
    </div>
  );
}

export default PasswordStrengthIndicator;
