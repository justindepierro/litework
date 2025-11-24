"use client";

import { Card } from "@/components/ui/Card";
import { Heading, Caption, Body } from "@/components/ui/Typography";

interface WorkoutDay {
  date: string; // YYYY-MM-DD format
  count: number; // Number of workouts that day
}

interface CalendarHeatmapProps {
  data: WorkoutDay[];
  className?: string;
}

export function CalendarHeatmap({
  data,
  className = "",
}: CalendarHeatmapProps) {
  if (!data || data.length === 0) {
    return (
      <Card variant="default" padding="lg" className={className}>
        <Heading level="h3" className="mb-2">
          Workout Frequency
        </Heading>
        <Caption variant="muted">Last 12 weeks</Caption>
        <Body variant="secondary" className="mt-4 text-center py-8">
          No workout data available. Complete your first workout to start
          tracking!
        </Body>
      </Card>
    );
  }

  // Calculate 12 weeks (84 days) of data
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 83); // 84 days including today

  // Create map of dates to counts
  const dataMap = new Map<string, number>();
  data.forEach((day) => {
    dataMap.set(day.date, day.count);
  });

  // Generate all days for the last 12 weeks
  const allDays: { date: Date; dateStr: string; count: number }[] = [];
  for (let i = 0; i < 84; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    allDays.push({
      date,
      dateStr,
      count: dataMap.get(dateStr) || 0,
    });
  }

  // Organize into weeks (Sunday - Saturday)
  type DayData = { date: Date; dateStr: string; count: number };
  const weeks: DayData[][] = [];
  let currentWeek: DayData[] = [];

  // Pad beginning with empty days to start on Sunday
  const firstDayOfWeek = allDays[0].date.getDay();
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push({
      date: new Date(0),
      dateStr: "",
      count: -1, // Indicator for empty cell
    });
  }

  allDays.forEach((day) => {
    currentWeek.push(day);
    if (day.date.getDay() === 6) {
      // Saturday, end of week
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  // Add remaining days
  if (currentWeek.length > 0) {
    // Pad end with empty days
    while (currentWeek.length < 7) {
      currentWeek.push({
        date: new Date(0),
        dateStr: "",
        count: -1,
      });
    }
    weeks.push(currentWeek);
  }

  // Calculate stats
  const totalWorkouts = data.reduce((sum, d) => sum + d.count, 0);
  const daysWithWorkouts = data.filter((d) => d.count > 0).length;
  const currentStreak = calculateStreak(allDays);
  const maxCount = Math.max(...data.map((d) => d.count));

  // Color intensity based on workout count
  const getIntensityColor = (count: number): string => {
    if (count === -1) return "bg-transparent"; // Empty cell
    if (count === 0) return "bg-silver-200";
    if (count === 1) return "bg-cyan-300";
    if (count === 2) return "bg-cyan-500";
    return "bg-cyan-700"; // 3+ workouts
  };

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthLabels = getMonthLabels(weeks);

  return (
    <Card variant="default" padding="lg" className={className}>
      <div className="mb-6">
        <Heading level="h3" className="mb-1">
          Workout Frequency
        </Heading>
        <Caption variant="muted">
          Last 12 weeks • {totalWorkouts} total workouts
        </Caption>
      </div>

      {/* Month labels */}
      <div className="mb-2 flex">
        <div className="w-8"></div>
        <div className="flex-1 flex gap-1">
          {monthLabels.map((label, idx) => (
            <div
              key={idx}
              className="text-xs text-gray-600"
              style={{ width: label.width }}
            >
              {label.text}
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 pt-1">
          {dayLabels.map((label, idx) => (
            <div key={label} className="h-4 text-xs text-gray-600 w-8">
              {idx % 2 === 1 ? label : ""}
            </div>
          ))}
        </div>

        {/* Week columns */}
        <div className="flex-1 flex gap-1">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-1">
              {week.map((day, dayIdx) => {
                const isToday =
                  day.dateStr === today.toISOString().split("T")[0];
                return (
                  <div
                    key={`${weekIdx}-${dayIdx}`}
                    className={`w-4 h-4 rounded-sm ${getIntensityColor(
                      day.count
                    )} ${isToday ? "ring-2 ring-primary ring-offset-1" : ""}`}
                    title={
                      day.count >= 0
                        ? `${day.date.toLocaleDateString()}: ${day.count} workout${
                            day.count !== 1 ? "s" : ""
                          }`
                        : ""
                    }
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Caption variant="muted">Less</Caption>
          <div className="flex gap-1">
            <div
              className="w-4 h-4 bg-silver-200 rounded-sm"
              title="0 workouts"
            />
            <div className="w-4 h-4 bg-cyan-300 rounded-sm" title="1 workout" />
            <div
              className="w-4 h-4 bg-cyan-500 rounded-sm"
              title="2 workouts"
            />
            <div
              className="w-4 h-4 bg-cyan-700 rounded-sm"
              title="3+ workouts"
            />
          </div>
          <Caption variant="muted">More</Caption>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-silver-300">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <Body className="font-semibold text-navy-900">{currentStreak}</Body>
            <Caption variant="muted">Day Streak</Caption>
          </div>
          <div>
            <Body className="font-semibold text-primary">
              {daysWithWorkouts}
            </Body>
            <Caption variant="muted">Active Days</Caption>
          </div>
          <div>
            <Body className="font-semibold text-navy-900">{maxCount}</Body>
            <Caption variant="muted">Most/Day</Caption>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Helper: Calculate current streak
function calculateStreak(days: { dateStr: string; count: number }[]): number {
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// Helper: Generate month labels for weeks
function getMonthLabels(
  weeks: { date: Date; dateStr: string; count: number }[][]
): { text: string; width: string }[] {
  const labels: { text: string; width: string }[] = [];
  let currentMonth = -1;
  let weekCount = 0;

  weeks.forEach((week) => {
    const firstValidDay = week.find((d) => d.count >= 0);
    if (firstValidDay) {
      const month = firstValidDay.date.getMonth();
      if (month !== currentMonth && weekCount > 0) {
        const monthName = firstValidDay.date.toLocaleDateString("en-US", {
          month: "short",
        });
        labels.push({
          text: monthName,
          width: `${weekCount * 20}px`,
        });
        weekCount = 0;
        currentMonth = month;
      }
      if (currentMonth === -1) {
        currentMonth = month;
      }
    }
    weekCount++;
  });

  // Add final month
  if (weekCount > 0 && weeks.length > 0) {
    const lastWeek = weeks[weeks.length - 1];
    const lastValidDay = lastWeek.reverse().find((d) => d.count >= 0);
    if (lastValidDay) {
      const monthName = lastValidDay.date.toLocaleDateString("en-US", {
        month: "short",
      });
      labels.push({
        text: monthName,
        width: `${weekCount * 20}px`,
      });
    }
  }

  return labels;
}
