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
      blue: "bg-accent-blue-500/10 hover:bg-accent-blue-500/20 text-accent-blue-700 border border-accent-blue-200 hover:border-accent-blue-300",
      orange:
        "bg-accent-orange-500/10 hover:bg-accent-orange-500/20 text-accent-orange-700 border border-accent-orange-200 hover:border-accent-orange-300",
      purple:
        "bg-accent-purple-500/10 hover:bg-accent-purple-500/20 text-accent-purple-700 border border-accent-purple-200 hover:border-accent-purple-300",
      green:
        "bg-accent-green-500/10 hover:bg-accent-green-500/20 text-accent-green-700 border border-accent-green-200 hover:border-accent-green-300",
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
