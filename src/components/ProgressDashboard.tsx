"use client";

import { useEffect, useState } from "react";
import { Heading, Body, Caption } from "@/components/ui/Typography";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { OneRMProgressChart } from "@/components/charts/OneRMProgressChart";
import { VolumeChart } from "@/components/charts/VolumeChart";
import { CalendarHeatmap } from "@/components/charts/CalendarHeatmap";
import { StrengthStandards } from "@/components/goals/StrengthStandards";
import { GoalsWidget } from "@/components/goals/GoalsWidget";
import { ProgressPhotos } from "@/components/progress/ProgressPhotos";
import { TrendingUp, Calendar, Dumbbell, Loader2 } from "lucide-react";

interface ProgressDashboardProps {
  athleteId?: string;
}

interface Exercise {
  id: string;
  name: string;
}

export default function ProgressDashboard({
  athleteId,
}: ProgressDashboardProps) {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [oneRMData, setOneRMData] = useState<{
    exerciseName: string;
    data: { date: string; weight: number }[];
  } | null>(null);
  const [volumeData, setVolumeData] = useState<
    { week: string; volume: number; displayWeek: string }[]
  >([]);
  const [frequencyData, setFrequencyData] = useState<
    { date: string; count: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCharts, setIsLoadingCharts] = useState(false);

  // Fetch available exercises on mount
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await fetch("/api/exercises?limit=50");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.exercises) {
            setExercises(data.exercises);
            // Set first exercise as default
            if (data.exercises.length > 0) {
              setSelectedExerciseId(data.exercises[0].id);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching exercises:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercises();
  }, []);

  // Fetch chart data when exercise or athlete changes
  useEffect(() => {
    if (!selectedExerciseId) return;

    const fetchChartData = async () => {
      setIsLoadingCharts(true);
      try {
        const params = new URLSearchParams({
          exerciseId: selectedExerciseId,
        });
        if (athleteId) {
          params.append("athleteId", athleteId);
        }

        // Fetch 1RM history
        const oneRMResponse = await fetch(
          `/api/analytics/1rm-history?${params}`
        );
        if (oneRMResponse.ok) {
          const data = await oneRMResponse.json();
          setOneRMData(data);
        }

        // Fetch volume history
        const volumeParams = new URLSearchParams();
        if (athleteId) {
          volumeParams.append("athleteId", athleteId);
        }
        volumeParams.append("weeks", "12");

        const volumeResponse = await fetch(
          `/api/analytics/volume-history?${volumeParams}`
        );
        if (volumeResponse.ok) {
          const data = await volumeResponse.json();
          setVolumeData(data.data || []);
        }

        // Fetch workout frequency
        const frequencyParams = new URLSearchParams();
        if (athleteId) {
          frequencyParams.append("athleteId", athleteId);
        }
        frequencyParams.append("days", "84");

        const frequencyResponse = await fetch(
          `/api/analytics/workout-frequency?${frequencyParams}`
        );
        if (frequencyResponse.ok) {
          const data = await frequencyResponse.json();
          setFrequencyData(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setIsLoadingCharts(false);
      }
    };

    fetchChartData();
  }, [selectedExerciseId, athleteId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <Card variant="default" padding="lg" className="text-center">
        <Dumbbell className="w-12 h-12 mx-auto mb-4 text-silver-400" />
        <Heading level="h3" className="mb-2">
          No Exercise Data Yet
        </Heading>
        <Body variant="secondary">
          Complete some workouts to start tracking your progress!
        </Body>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section with exercise selector */}
      <Card variant="default" padding="lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Heading level="h2" className="mb-1">
              Progress Dashboard
            </Heading>
            <Caption variant="muted">
              Track your strength gains and workout consistency
            </Caption>
          </div>
          <div className="w-full md:w-64">
            <Select
              label="Exercise"
              value={selectedExerciseId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSelectedExerciseId(e.target.value)
              }
              options={exercises.map((ex) => ({
                value: ex.id,
                label: ex.name,
              }))}
            />
          </div>
        </div>
      </Card>

      {isLoadingCharts ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* 1RM Progress Chart */}
          {oneRMData && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-primary" />
                <Heading level="h3">Strength Progress</Heading>
              </div>
              <OneRMProgressChart
                exerciseName={oneRMData.exerciseName}
                data={oneRMData.data}
              />
            </div>
          )}

          {/* Volume Chart */}
          <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center gap-2 mb-3">
              <Dumbbell className="w-5 h-5 text-primary" />
              <Heading level="h3">Training Volume</Heading>
            </div>
            <VolumeChart data={volumeData} />
          </div>

          {/* Calendar Heatmap */}
          <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-primary" />
              <Heading level="h3">Workout Consistency</Heading>
            </div>
            <CalendarHeatmap data={frequencyData} />
          </div>

          {/* Goals */}
          <div className="animate-fade-in" style={{ animationDelay: "300ms" }}>
            <GoalsWidget
              athleteId={athleteId}
              limit={5}
              showAddButton={true}
              onAddClick={() => {
                // TODO: Open goal creation modal
                console.log("Open goal modal from progress page");
              }}
            />
          </div>

          {/* Strength Standards */}
          {selectedExerciseId && (
            <div
              className="animate-fade-in"
              style={{ animationDelay: "400ms" }}
            >
              <StrengthStandards
                athleteId={athleteId}
                exerciseId={selectedExerciseId}
              />
            </div>
          )}

          {/* Progress Photos */}
          {athleteId && (
            <div
              className="animate-fade-in"
              style={{ animationDelay: "500ms" }}
            >
              <ProgressPhotos
                athleteId={athleteId}
                showUpload={true}
                viewMode="grid"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
