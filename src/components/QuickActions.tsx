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
      blue: "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200",
      orange:
        "bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200",
      purple:
        "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200",
      green: "bg-green-50 hover:bg-green-100 text-green-700 border-green-200",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getIconColorClasses = (color: string) => {
    const colors = {
      blue: "text-blue-600",
      orange: "text-orange-600",
      purple: "text-purple-600",
      green: "text-green-600",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
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
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${getColorClasses(action.color)}`}
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
