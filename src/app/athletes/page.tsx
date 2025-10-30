"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { User, Trophy, Plus, BarChart3, Zap, Edit } from "lucide-react";

export default function AthletesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
    if (!isLoading && user && user.role === "athlete") {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-primary">
        <div className="text-heading-secondary text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || user.role === "athlete") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-primary container-responsive section-spacing">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-heading-primary text-3xl mb-2">Team Athletes</h1>
            <p className="text-heading-secondary">
              Manage your athletes and their personal records for percentage-based workouts
            </p>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Athlete
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card-primary">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-accent-blue bg-opacity-10 rounded-full flex items-center justify-center mr-3">
                <User className="w-6 h-6 text-accent-blue" />
              </div>
              <div className="flex-1">
                <h3 className="text-body-primary font-medium">Alex Johnson</h3>
                <p className="text-body-small">Athlete since Jan 2024</p>
              </div>
              <button className="p-2 hover:bg-surface-gray rounded-lg transition-colors">
                <Edit className="w-4 h-4 text-heading-secondary" />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-accent-orange" />
                <span className="text-body-small font-medium">Personal Records (3)</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1">
                  <span className="text-body-small">Bench Press:</span>
                  <div className="text-right">
                    <span className="text-body-primary font-medium">185 lbs</span>
                    <p className="text-xs text-heading-secondary">Oct 15, 2024</p>
                  </div>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-body-small">Back Squat:</span>
                  <div className="text-right">
                    <span className="text-body-primary font-medium">225 lbs</span>
                    <p className="text-xs text-heading-secondary">Oct 20, 2024</p>
                  </div>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-body-small">Deadlift:</span>
                  <div className="text-right">
                    <span className="text-body-primary font-medium">275 lbs</span>
                    <p className="text-xs text-heading-secondary">Oct 25, 2024</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button className="btn-secondary flex items-center justify-center gap-2 text-sm">
                <Zap className="w-4 h-4" />
                Manage KPIs
              </button>
              <button className="btn-primary flex items-center justify-center gap-2 text-sm">
                <BarChart3 className="w-4 h-4" />
                Progress
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-lg p-6 border border-surface-border">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary-600 bg-opacity-10 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-heading-primary text-lg font-semibold mb-2">
                Percentage-Based Workouts
              </h3>
              <p className="text-heading-secondary mb-4">
                Set up Key Performance Indicators (KPIs) for your athletes to enable percentage-based 
                workout programming. When creating workouts, you can specify exercises as percentages 
                of their personal records.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent-blue rounded-full"></div>
                  <span>Set personal records for key lifts</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent-green rounded-full"></div>
                  <span>Use percentages in workout planning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent-orange rounded-full"></div>
                  <span>Automatic weight calculations</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
