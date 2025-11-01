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
      color: "bg-red-500",
      textColor: "text-red-600",
      label: "Weak",
      width: "33.333%",
    },
    medium: {
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
      label: "Medium",
      width: "66.666%",
    },
    strong: {
      color: "bg-green-500",
      textColor: "text-green-600",
      label: "Strong",
      width: "100%",
    },
  };

  const config = strengthConfig[strength];

  return (
    <div className={`mt-2 ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">Password Strength</span>
        <span className={`text-xs font-medium ${config.textColor}`}>
          {config.label}
        </span>
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${config.color} transition-all duration-300 ease-out`}
          style={{ width: config.width }}
        />
      </div>
      {strength === "weak" && (
        <ul className="mt-2 text-xs text-gray-600 space-y-1">
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
