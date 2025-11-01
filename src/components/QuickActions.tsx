"use client";

import { Dumbbell, Users, Calendar, Plus } from "lucide-react";
import Link from "next/link";

export default function QuickActions() {
  const actions = [
    {
      icon: Plus,
      label: "Assign Workout",
      description: "Schedule workouts for groups",
      href: "/schedule",
      color: "blue",
    },
    {
      icon: Dumbbell,
      label: "Create Workout",
      description: "Build a new workout plan",
      href: "/workouts",
      color: "orange",
    },
    {
      icon: Users,
      label: "View Athletes",
      description: "Manage your athletes",
      href: "/athletes",
      color: "purple",
    },
    {
      icon: Calendar,
      label: "Full Calendar",
      description: "See all scheduled workouts",
      href: "/schedule",
      color: "green",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700",
      orange:
        "bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700",
      purple:
        "bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700",
      green: "bg-green-50 border-green-200 hover:bg-green-100 text-green-700",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getIconColorClasses = (color: string) => {
    const colors = {
      blue: "text-blue-600 bg-blue-100",
      orange: "text-orange-600 bg-orange-100",
      purple: "text-purple-600 bg-purple-100",
      green: "text-green-600 bg-green-100",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className={`border rounded-lg p-4 transition-all hover:shadow-md ${getColorClasses(action.color)}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${getIconColorClasses(action.color)}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {action.label}
                  </h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
