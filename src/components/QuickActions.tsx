"use client";

import { Dumbbell, Users, Calendar, Plus } from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import { Caption } from "@/components/ui/Typography";

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
      label: "Workout",
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
      label: "Calendar",
      href: "/schedule",
      color: "green",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-linear-to-br from-accent-blue-100 to-accent-blue-200 hover:from-accent-blue-200 hover:to-accent-blue-300 text-accent-blue-700 border-2 border-accent-blue-400 hover:border-accent-blue-500 shadow-md hover:shadow-lg",
      orange:
        "bg-linear-to-br from-accent-orange-100 to-accent-orange-200 hover:from-accent-orange-200 hover:to-accent-orange-300 text-accent-orange-700 border-2 border-accent-orange-400 hover:border-accent-orange-500 shadow-md hover:shadow-lg",
      purple:
        "bg-linear-to-br from-accent-purple-100 to-accent-purple-200 hover:from-accent-purple-200 hover:to-accent-purple-300 text-accent-purple-700 border-2 border-accent-purple-400 hover:border-accent-purple-500 shadow-md hover:shadow-lg",
      green:
        "bg-linear-to-br from-accent-green-100 to-accent-green-200 hover:from-accent-green-200 hover:to-accent-green-300 text-accent-green-700 border-2 border-accent-green-400 hover:border-accent-green-500 shadow-md hover:shadow-lg",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.label}
            href={action.href}
            className={`group inline-flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${getColorClasses(action.color)}`}
            title={action.label}
          >
            <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            <Caption className="text-xs font-medium whitespace-nowrap">
              {action.label}
            </Caption>
          </Link>
        );
      })}
    </div>
  );
});

export default QuickActions;
