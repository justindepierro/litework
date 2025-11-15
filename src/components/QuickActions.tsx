"use client";

import { Dumbbell, Users, Calendar, Plus, ChevronRight } from "lucide-react";
import Link from "next/link";
import { memo } from "react";

const QuickActions = memo(function QuickActions() {
  const actions = [
    {
      icon: Plus,
      label: "Assign",
      href: "/schedule",
      color: "blue",
    },
    {
      icon: Dumbbell,
      label: "Create Workout",
      href: "/workouts",
      color: "orange",
    },
    {
      icon: Users,
      label: "Athletes",
      href: "/athletes",
      color: "purple",
    },
    {
      icon: Calendar,
      label: "Full Calendar",
      href: "/schedule",
      color: "green",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-gradient-to-br from-(--accent-blue-50) to-(--accent-blue-100) hover:from-(--accent-blue-100) hover:to-(--accent-blue-200) text-(--accent-blue-700) shadow-sm hover:shadow-lg border border-(--accent-blue-200)",
      orange:
        "bg-gradient-to-br from-(--accent-orange-50) to-(--accent-orange-100) hover:from-(--accent-orange-100) hover:to-(--accent-orange-200) text-(--accent-orange-700) shadow-sm hover:shadow-lg border border-(--accent-orange-200)",
      purple:
        "bg-gradient-to-br from-(--accent-purple-50) to-(--accent-purple-100) hover:from-(--accent-purple-100) hover:to-(--accent-purple-200) text-(--accent-purple-700) shadow-sm hover:shadow-lg border border-(--accent-purple-200)",
      green:
        "bg-gradient-to-br from-(--status-success-light) to-(--accent-green-100) hover:from-(--accent-green-100) hover:to-(--accent-green-200) text-(--accent-green-700) shadow-sm hover:shadow-lg border border-(--status-success-light)",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getIconColorClasses = (color: string) => {
    const colors = {
      blue: "text-(--accent-blue-600)",
      orange: "text-(--accent-orange-600)",
      purple: "text-(--accent-purple-600)",
      green: "text-(--status-success)",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-(--text-secondary) uppercase tracking-wide">
          Quick Actions
        </h2>
      </div>

      <div className="flex flex-wrap gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${getColorClasses(action.color)}`}
            >
              <Icon
                className={`w-4 h-4 ${getIconColorClasses(action.color)}`}
              />
              <span className="font-medium text-sm">{action.label}</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </Link>
          );
        })}
      </div>
    </div>
  );
});

export default QuickActions;
