"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, Plus, Dumbbell, Clock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import Fuse from "fuse.js";
import { highlightMatch } from "@/lib/highlight-match";
import { useRecentExercises } from "@/hooks/use-recent-exercises";

interface Exercise {
  id: string;
  name: string;
  category?: string;
  description?: string;
  video_url?: string;
}

interface ExerciseAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onExerciseSelect: (exercise: Exercise) => void;
  placeholder?: string;
  className?: string;
}

export default function ExerciseAutocomplete({
  value,
  onChange,
  onExerciseSelect,
  placeholder = "Type exercise name...",
  className = "",
}: ExerciseAutocompleteProps) {
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [suggestions, setSuggestions] = useState<Exercise[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Recent exercises hook
  const { recentExercises, addRecentExercise } = useRecentExercises();

  // Load all exercises once on mount
  useEffect(() => {
    const loadExercises = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/exercises/search?limit=1000");
        const data = await response.json();

        if (data.success && data.data) {
          setAllExercises(data.data);
        }
      } catch (error) {
        console.error("Error loading exercises:", error);
      } finally {
        setLoading(false);
      }
    };

    loadExercises();
  }, []);

  // Initialize Fuse.js with fuzzy search config
  const fuse = useMemo(() => {
    return new Fuse(allExercises, {
      keys: [
        { name: "name", weight: 2 }, // Prioritize name matches
        { name: "description", weight: 1 },
        { name: "category", weight: 1.5 },
      ],
      threshold: 0.3, // 0 = exact match, 1 = match anything
      includeScore: true,
      includeMatches: true, // For highlighting
      minMatchCharLength: 2,
      ignoreLocation: true, // Don't care where in string match occurs
    });
  }, [allExercises]);

  // Debounced fuzzy search
  useEffect(() => {
    if (!value || value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      // Perform fuzzy search with Fuse.js
      const results = fuse.search(value, { limit: 10 });
      const exercises = results.map((result) => result.item);

      setSuggestions(exercises);
      setShowSuggestions(true);
      setSelectedIndex(0);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [value, fuse]);

  // Show recent exercises when focused and search is empty
  const showRecent = !value && recentExercises.length > 0;
  const displayItems = showRecent ? recentExercises : suggestions;

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || displayItems.length === 0) {
      if (e.key === "Enter") {
        // Create new exercise if no suggestions
        handleCreateNew();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < displayItems.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (displayItems[selectedIndex]) {
          handleSelect(displayItems[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        break;
    }
  };

  const handleSelect = (exercise: Exercise) => {
    onChange(exercise.name);
    onExerciseSelect(exercise);
    setShowSuggestions(false);
    inputRef.current?.blur();

    // Add to recent exercises
    addRecentExercise(exercise);
  };

  const handleCreateNew = async () => {
    if (!value.trim()) return;

    try {
      // Create new exercise in library
      const response = await fetch("/api/exercises/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: value.trim(),
          category: "strength",
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        onExerciseSelect({
          id: data.data.id,
          name: data.data.name,
        });
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Error creating exercise:", error);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full">
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (displayItems.length > 0 || recentExercises.length > 0) {
            setShowSuggestions(true);
          }
        }}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
        selectOnFocus
        fullWidth
        inputSize="lg"
        leftIcon={<Search className="w-5 h-5" />}
        rightIcon={loading ? <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" /> : undefined}
      />

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {displayItems.length > 0 ? (
            <>
              {/* Section Header */}
              {showRecent && (
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <Clock className="w-4 h-4" />
                  Recent Exercises
                </div>
              )}

              {/* Exercise List */}
              {displayItems.map((exercise, index) => (
                <button
                  key={exercise.id}
                  onClick={() => handleSelect(exercise)}
                  className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors ${
                    index === selectedIndex ? "bg-blue-50" : ""
                  } ${index > 0 ? "border-t border-gray-100" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <Dumbbell className="w-5 h-5 text-gray-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-medium text-gray-900 truncate"
                        dangerouslySetInnerHTML={{
                          __html: highlightMatch(exercise.name, value),
                        }}
                      />
                      {exercise.description && (
                        <div
                          className="text-xs text-gray-500 truncate mt-0.5"
                          dangerouslySetInnerHTML={{
                            __html: highlightMatch(
                              exercise.description,
                              value
                            ),
                          }}
                        />
                      )}
                    </div>
                    {exercise.category && (
                      <Badge variant="neutral" size="sm">
                        {exercise.category}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
              <button
                onClick={handleCreateNew}
                className="w-full text-left px-4 py-3 border-t-2 border-gray-200 hover:bg-green-50 transition-colors text-green-700 font-medium"
              >
                <div className="flex items-center gap-3">
                  <Plus className="w-5 h-5" />
                  <span>Create &quot;{value}&quot; as new exercise</span>
                </div>
              </button>
            </>
          ) : (
            <button
              onClick={handleCreateNew}
              className="w-full text-left px-4 py-4 hover:bg-green-50 transition-colors"
            >
              <div className="flex items-center gap-3 text-green-700">
                <Plus className="w-5 h-5" />
                <div>
                  <div className="font-medium">
                    Create &quot;{value}&quot; as new exercise
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    This will be added to your exercise library
                  </div>
                </div>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Helper text */}
      <p className="text-xs text-gray-500 mt-1">
        Start typing to search existing exercises or create a new one
      </p>
    </div>
  );
}
