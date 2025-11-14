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
      blue: "bg-linear-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 shadow-sm hover:shadow-lg border border-blue-200",
      orange:
        "bg-linear-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 text-orange-700 shadow-sm hover:shadow-lg border border-orange-200",
      purple:
        "bg-linear-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-700 shadow-sm hover:shadow-lg border border-purple-200",
      green:
        "bg-linear-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-700 shadow-sm hover:shadow-lg border border-green-200",
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
    <div className="bg-white rounded-lg shadow-md p-5 mb-6">
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
