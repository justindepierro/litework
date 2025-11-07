"use client";

import { useState } from "react";
import { Calendar, Clock } from "lucide-react";

interface DateTimePickerProps {
  selectedDate?: Date;
  startTime?: string;
  endTime?: string;
  onDateChange: (date: Date) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  minDate?: Date;
  maxDate?: Date;
  showTimePicker?: boolean; // Option to hide time picker
  label?: string;
}

export default function DateTimePicker({
  selectedDate,
  startTime = "15:30",
  endTime = "16:30",
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  minDate,
  maxDate,
  showTimePicker = true,
  label = "Schedule Date & Time",
}: DateTimePickerProps) {
  // Use selectedDate directly from props, initialize month from it
  const [currentMonth, setCurrentMonth] = useState(
    () => selectedDate || new Date()
  );

  const handleDateSelect = (date: Date) => {
    onDateChange(date);
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentMonth(newDate);
  };

  const isDateDisabled = (date: Date) => {
    // Normalize dates to midnight for comparison (ignore time)
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    
    if (minDate) {
      const normalizedMinDate = new Date(minDate);
      normalizedMinDate.setHours(0, 0, 0, 0);
      if (normalizedDate < normalizedMinDate) return true;
    }
    
    if (maxDate) {
      const normalizedMaxDate = new Date(maxDate);
      normalizedMaxDate.setHours(0, 0, 0, 0);
      if (normalizedDate > normalizedMaxDate) return true;
    }
    
    return false;
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  // Generate calendar grid
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayOfWeek = getFirstDayOfMonth(currentMonth);
  const days: (Date | null)[] = [];

  // Add empty cells for days before the 1st
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null);
  }

  // Add all days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-4">
      {/* Label */}
      <label className="text-body-primary font-medium block">
        <Calendar className="w-4 h-4 inline mr-2" />
        {label}
      </label>

      {/* Calendar */}
      <div className="border border-silver-400 rounded-lg p-4 bg-white">
        {/* Month Navigation */}
        <div className="flex justify-between items-center mb-4">
          <button
            type="button"
            onClick={() => navigateMonth(-1)}
            className="btn-secondary text-sm px-3 py-1"
          >
            ←
          </button>
          <div className="text-heading-secondary font-semibold">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </div>
          <button
            type="button"
            onClick={() => navigateMonth(1)}
            className="btn-secondary text-sm px-3 py-1"
          >
            →
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-body-small font-medium text-silver-600 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (!day) {
              return (
                <div key={`empty-${index}`} className="aspect-square p-1" />
              );
            }

            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isTodayDay = isToday(day);
            const isDisabled = isDateDisabled(day);

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => !isDisabled && handleDateSelect(day)}
                disabled={isDisabled}
                className={`
                  aspect-square p-1 rounded-md text-sm font-medium
                  transition-colors
                  ${
                    isSelected
                      ? "bg-primary text-white"
                      : isTodayDay
                        ? "bg-blue-100 text-primary"
                        : "hover:bg-silver-200"
                  }
                  ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                  ${!isSelected && !isTodayDay && !isDisabled ? "text-body-primary" : ""}
                `}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>

        {/* Selected Date Display */}
        {selectedDate && (
          <div className="mt-4 pt-4 border-t border-silver-300">
            <div className="text-body-small text-silver-600">
              Selected Date:
            </div>
            <div className="text-body-primary font-medium">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        )}
      </div>

      {/* Time Picker */}
      {showTimePicker && (
        <div className="space-y-3">
          <label className="text-body-primary font-medium block">
            <Clock className="w-4 h-4 inline mr-2" />
            Training Time
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-body-small block mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => onStartTimeChange(e.target.value)}
                className="w-full p-3 border border-silver-400 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-body-small block mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => onEndTimeChange(e.target.value)}
                className="w-full p-3 border border-silver-400 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Duration Display */}
          {startTime && endTime && (
            <div className="text-body-small text-silver-600">
              Duration:{" "}
              {(() => {
                const start = new Date(`2000-01-01T${startTime}`);
                const end = new Date(`2000-01-01T${endTime}`);
                const diffMinutes = Math.round(
                  (end.getTime() - start.getTime()) / 60000
                );
                if (diffMinutes < 0) return "Invalid time range";
                const hours = Math.floor(diffMinutes / 60);
                const minutes = diffMinutes % 60;
                return hours > 0
                  ? `${hours}h ${minutes}m`
                  : `${minutes} minutes`;
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
