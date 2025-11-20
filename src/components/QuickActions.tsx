"use client";

import { Dumbbell, Users, Calendar, Plus, ChevronRight } from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import { Body } from "@/components/ui/Typography";

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
      blue: "bg-gradient-button-blue text-white shadow-lg hover:shadow-2xl hover:shadow-accent-blue-500/40 border-2 border-accent-blue-400/30 hover:border-accent-blue-300/50",
      orange:
        "bg-gradient-button-orange text-white shadow-lg hover:shadow-2xl hover:shadow-accent-orange-500/40 border-2 border-accent-orange-400/30 hover:border-accent-orange-300/50",
      purple:
        "bg-gradient-button-purple text-white shadow-lg hover:shadow-2xl hover:shadow-accent-purple-500/40 border-2 border-accent-purple-400/30 hover:border-accent-purple-300/50",
      green:
        "bg-gradient-button-green text-white shadow-lg hover:shadow-2xl hover:shadow-accent-green-500/40 border-2 border-accent-green-400/30 hover:border-accent-green-300/50",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getIconColorClasses = (color: string) => {
    // All white now since we have gradient backgrounds
    return "text-white drop-shadow-md";
  };

  return (
    <div className="glass-thick backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-xl p-6 mb-6 relative overflow-hidden">
      {/* Gradient accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-header-tertiary" />

      <div className="flex items-center justify-between mb-5">
        <Body
          size="xs"
          weight="bold"
          className="text-navy-700 uppercase tracking-[0.35em]"
        >
          Quick Actions
        </Body>
      </div>

      <div className="flex flex-wrap gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className={`group relative inline-flex items-center gap-2.5 px-5 py-3.5 rounded-xl transition-all duration-300 hover:scale-[1.05] active:scale-[0.98] overflow-hidden ${getColorClasses(action.color)}`}
            >
              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300" />

              <Icon
                className={`w-5 h-5 ${getIconColorClasses(action.color)} relative z-10 group-hover:scale-110 transition-transform duration-300`}
              />
              <span className="font-semibold text-sm relative z-10">
                {action.label}
              </span>
              <ChevronRight className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 relative z-10 transition-all duration-300" />
            </Link>
          );
        })}
      </div>
    </div>
  );
});

export default QuickActions;
