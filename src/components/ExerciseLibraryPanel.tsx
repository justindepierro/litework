"use client";

import React, { useState, useEffect } from "react";
import { Search, Dumbbell } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptySearch } from "@/components/ui/EmptyState";
import { Heading, Body, Caption } from "@/components/ui/Typography";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAsyncState } from "@/hooks/use-async-state";

interface Exercise {
  id: string;
  name: string;
  description?: string;
  video_url?: string;
}

interface ExerciseLibraryPanelProps {
  onDragStart: (exercise: Exercise) => void;
}

const ExerciseLibraryPanel: React.FC<ExerciseLibraryPanelProps> = ({
  onDragStart,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    data: exercises,
    isLoading: loading,
    error,
    execute,
    setData: setExercises,
    setError,
  } = useAsyncState<Exercise[]>();

  // Fetch exercises when search query changes
  useEffect(() => {
    if (searchQuery.length < 2) {
      setExercises([]);
      setError(null);
      return;
    }

    const fetchExercises = () =>
      execute(async () => {
        const response = await fetch(
          `/api/exercises/search?q=${encodeURIComponent(searchQuery)}&limit=50`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch exercises: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.success) {
          return data.data || [];
        } else {
          throw new Error(data.error || "Failed to load exercises");
        }
      });

    const debounce = setTimeout(fetchExercises, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, execute, setExercises, setError]);

  return (
    <div className="hidden lg:flex w-80 bg-neutral-lighter border-l border-neutral-light flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-neutral-light">
        <Heading level="h3" className="mb-3 flex items-center gap-2">
          <Dumbbell className="w-5 h-5" />
          Exercise Library
        </Heading>

        {/* Search */}
        <div className="relative">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises..."
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Exercise List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <div className="text-center py-8">
            <LoadingSpinner size="md" message="Searching..." />
          </div>
        )}

        {!loading && searchQuery.length < 2 && (
          <div className="text-center text-navy-600 py-8">
            <Dumbbell className="w-12 h-12 mx-auto mb-3 text-navy-500" />
            <Body className="text-sm">Type to search exercises</Body>
          </div>
        )}

        {!loading &&
          searchQuery.length >= 2 &&
          (!exercises || exercises.length === 0) &&
          !error && (
            <EmptySearch
              searchTerm={searchQuery}
              onClearSearch={() => setSearchQuery("")}
            />
          )}

        {error && (
          <div className="text-center py-8 px-4">
            <div className="bg-error-lighter border border-error-light rounded-lg p-4">
              <Body className="text-sm text-error-dark font-medium mb-2">
                {error}
              </Body>
              <Button
                onClick={() => {
                  setError(null);
                  setSearchQuery("");
                }}
                variant="ghost"
                size="sm"
                className="text-xs text-error hover:text-error-dark underline"
              >
                Try again
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {exercises?.map((exercise) => (
            <div
              key={exercise.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "copy";
                e.dataTransfer.setData("exercise", JSON.stringify(exercise));
                onDragStart(exercise);
              }}
              className="bg-white border border-neutral-light rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-accent-blue-400 transition-all"
            >
              <div className="font-medium text-sm">{exercise.name}</div>
              {exercise.description && (
                <div className="text-xs text-navy-600 mt-1 line-clamp-2">
                  {exercise.description}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Hint */}
      <div className="p-3 border-t border-neutral-light bg-white text-xs text-navy-600">
        <Caption className="mb-1 font-medium">💡 Quick Tips:</Caption>
        <ul className="space-y-1 text-navy-500">
          <li>• Drag exercises into your workout</li>
          <li>• Drop on another exercise to create a group</li>
          <li>• Click values to edit inline</li>
        </ul>
      </div>
    </div>
  );
};

export default ExerciseLibraryPanel;
