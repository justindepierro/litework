"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Plus, Dumbbell } from "lucide-react";

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
  const [suggestions, setSuggestions] = useState<Exercise[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!value || value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/exercises/search?q=${encodeURIComponent(value)}&limit=10`
        );
        const data = await response.json();

        if (data.success && data.data) {
          setSuggestions(data.data);
          setShowSuggestions(true);
          setSelectedIndex(0);
        }
      } catch (error) {
        console.error("Error searching exercises:", error);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [value]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
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
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
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
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className={`w-full p-4 sm:p-3 pl-10 border-2 border-silver-300 rounded-xl sm:rounded-lg text-lg sm:text-base focus:ring-2 focus:ring-accent-blue focus:border-accent-blue transition-all touch-manipulation ${className}`}
          autoComplete="off"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {suggestions.length > 0 ? (
            <>
              {suggestions.map((exercise, index) => (
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
                      <div className="font-medium text-gray-900 truncate">
                        {exercise.name}
                      </div>
                      {exercise.description && (
                        <div className="text-xs text-gray-500 truncate mt-0.5">
                          {exercise.description}
                        </div>
                      )}
                    </div>
                    {exercise.category && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded shrink-0">
                        {exercise.category}
                      </span>
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
