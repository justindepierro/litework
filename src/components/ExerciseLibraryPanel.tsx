"use client";

import React, { useState, useEffect } from "react";
import { Search, Dumbbell } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptySearch } from "@/components/ui/EmptyState";

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
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch exercises when search query changes
  useEffect(() => {
    const fetchExercises = async () => {
      if (searchQuery.length < 2) {
        setExercises([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `/api/exercises/search?q=${encodeURIComponent(searchQuery)}&limit=50`
        );
        const data = await response.json();
        if (data.success) {
          setExercises(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching exercises:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchExercises, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-300 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-300 bg-white">
        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
          <Dumbbell className="w-5 h-5" />
          Exercise Library
        </h3>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          <div className="text-center text-gray-500 py-8">
            <Dumbbell className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">Type to search exercises</p>
          </div>
        )}

        {!loading && searchQuery.length >= 2 && exercises.length === 0 && (
          <EmptySearch
            searchTerm={searchQuery}
            onClearSearch={() => setSearchQuery("")}
          />
        )}

        <div className="space-y-2">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "copy";
                e.dataTransfer.setData("exercise", JSON.stringify(exercise));
                onDragStart(exercise);
              }}
              className="bg-white border border-gray-300 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-blue-400 transition-all"
            >
              <div className="font-medium text-sm">{exercise.name}</div>
              {exercise.description && (
                <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {exercise.description}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Hint */}
      <div className="p-3 border-t border-gray-300 bg-white text-xs text-gray-600">
        <p className="font-medium mb-1">💡 Quick Tips:</p>
        <ul className="space-y-1 text-gray-500">
          <li>• Drag exercises into your workout</li>
          <li>• Drop on another exercise to create a group</li>
          <li>• Click values to edit inline</li>
        </ul>
      </div>
    </div>
  );
};

export default ExerciseLibraryPanel;
