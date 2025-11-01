"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Users, Award } from "lucide-react";

interface GroupStats {
  id: string;
  groupName: string;
  athleteCount: number;
  completedWorkouts: number;
  totalAssignments: number;
  avgCompletionRate: number;
}

export default function GroupCompletionStats() {
  const [groupStats, setGroupStats] = useState<GroupStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroupStats();
  }, []);

  const fetchGroupStats = async () => {
    try {
      // In production, fetch from API
      // For now, show example data
      const mockData: GroupStats[] = [
        {
          id: "1",
          groupName: "Football Linemen",
          athleteCount: 12,
          completedWorkouts: 45,
          totalAssignments: 50,
          avgCompletionRate: 90,
        },
        {
          id: "2",
          groupName: "Volleyball Girls",
          athleteCount: 15,
          completedWorkouts: 52,
          totalAssignments: 60,
          avgCompletionRate: 87,
        },
        {
          id: "3",
          groupName: "Cross Country",
          athleteCount: 20,
          completedWorkouts: 68,
          totalAssignments: 80,
          avgCompletionRate: 85,
        },
      ];

      setGroupStats(mockData);
    } catch (error) {
      console.error("Error fetching group stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-6 h-6 text-green-600" />
        <h2 className="text-xl font-bold text-gray-900">Group Performance</h2>
      </div>

      {groupStats.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No group data available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupStats.map((group) => (
            <div
              key={group.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {group.groupName}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{group.athleteCount} athletes</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Award
                    className={`w-5 h-5 ${
                      group.avgCompletionRate >= 90
                        ? "text-green-500"
                        : group.avgCompletionRate >= 80
                          ? "text-blue-500"
                          : "text-amber-500"
                    }`}
                  />
                  <span className="text-2xl font-bold text-gray-900">
                    {group.avgCompletionRate}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Completed</p>
                  <p className="font-semibold text-gray-900">
                    {group.completedWorkouts} workouts
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Total Assigned</p>
                  <p className="font-semibold text-gray-900">
                    {group.totalAssignments} workouts
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      group.avgCompletionRate >= 90
                        ? "bg-green-500"
                        : group.avgCompletionRate >= 80
                          ? "bg-blue-500"
                          : "bg-amber-500"
                    }`}
                    style={{ width: `${group.avgCompletionRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
