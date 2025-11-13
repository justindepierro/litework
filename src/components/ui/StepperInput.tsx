"use client";

import React from "react";

interface StepperInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  unit?: string;
  className?: string;
}

export function StepperInput({
  label,
  value,
  onChange,
  step,
  min = 0,
  max,
  disabled = false,
  unit = "",
  className = "",
}: StepperInputProps) {
  const handleIncrement = () => {
    const newValue = value + step;
    if (max === undefined || newValue <= max) {
      onChange(newValue);
    }
  };

  const handleDecrement = () => {
    const newValue = value - step;
    if (newValue >= min) {
      onChange(newValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0;
    if (newValue >= min && (max === undefined || newValue <= max)) {
      onChange(newValue);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-2">
        {/* Decrement Button */}
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          className="flex items-center justify-center w-12 h-12 bg-linear-to-b from-red-500 to-red-600 text-white rounded-lg font-bold text-xl shadow-md active:shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
          aria-label={`Decrease ${label.toLowerCase()} by ${step}`}
        >
          −{step}
        </button>

        {/* Input Field */}
        <div className="flex-1 relative">
          <input
            type="number"
            value={value}
            onChange={handleInputChange}
            disabled={disabled}
            className="w-full px-4 py-3 text-center text-lg font-semibold border-2 border-silver-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            aria-label={label}
          />
          {unit && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">
              {unit}
            </span>
          )}
        </div>

        {/* Increment Button */}
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || (max !== undefined && value >= max)}
          className="flex items-center justify-center w-12 h-12 bg-linear-to-b from-green-500 to-green-600 text-white rounded-lg font-bold text-xl shadow-md active:shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
          aria-label={`Increase ${label.toLowerCase()} by ${step}`}
        >
          +{step}
        </button>
      </div>
    </div>
  );
}
