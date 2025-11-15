"use client";

import { useEffect, useState, useCallback } from "react";
import { Command } from "cmdk";
import {
  Search,
  Plus,
  Dumbbell,
  Calendar,
  Users,
  BarChart3,
  Settings,
  Home,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ModalBackdrop } from "@/components/ui/Modal";

interface Exercise {
  id: string;
  name: string;
  category?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Global Command Palette (Cmd+K / Ctrl+K)
 * Provides quick access to search, navigation, and actions
 *
 * Features:
 * - Exercise search with fuzzy matching
 * - Quick navigation (Dashboard, Workouts, Calendar, etc.)
 * - Quick actions (Create workout, Create exercise)
 * - Keyboard shortcuts (Cmd+K to open, Escape to close)
 *
 * @example
 * const [isOpen, setIsOpen] = useState(false);
 * <CommandPalette isOpen={isOpen} onClose={() => setIsOpen(false)} />
 */
export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const router = useRouter();

  // Load exercises for search
  useEffect(() => {
    if (isOpen) {
      fetch("/api/exercises/search?limit=100")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setExercises(data.data);
          }
        })
        .catch((err) => console.error("Error loading exercises:", err));
    }
  }, [isOpen]);

  // Handle navigation
  const navigate = useCallback(
    (path: string) => {
      router.push(path);
      onClose();
    },
    [router, onClose]
  );

  // Handle exercise selection
  const handleExerciseSelect = useCallback(
    (exerciseId: string) => {
      // Navigate to exercise detail or open in modal
      navigate(`/exercises/${exerciseId}`);
    },
    [navigate]
  );

  // Reset search when closed
  useEffect(() => {
    if (!isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <ModalBackdrop
      isOpen={isOpen}
      onClose={onClose}
      className="flex items-start justify-center pt-[20vh] px-4"
    >
      <Command
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden shadow-lg"
        shouldFilter={false} // We'll handle filtering ourselves for exercises
      >
        <div className="flex items-center border-b border-silver-300 px-4">
          <Search className="w-5 h-5 text-(--text-tertiary) shrink-0" />
          <Command.Input
            placeholder="Type a command or search..."
            className="flex-1 px-3 py-4 text-base outline-none"
            value={search}
            onValueChange={setSearch}
          />
          <button
            onClick={onClose}
            className="p-2 hover:bg-(--interactive-hover) rounded-md transition-colors"
            aria-label="Close command palette"
          >
            <X className="w-5 h-5 text-(--text-secondary)" />
          </button>
        </div>

        <Command.List className="max-h-96 overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-(--text-secondary)">
            No results found.
          </Command.Empty>

          {/* Quick Actions */}
          {!search && (
            <Command.Group
              heading="Quick Actions"
              className="mb-2 text-xs font-semibold text-(--text-secondary) uppercase tracking-wider px-2 py-1"
            >
              <Command.Item
                onSelect={() => navigate("/workouts/new")}
                className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-(--accent-blue-50) data-[selected=true]:bg-(--accent-blue-50) transition-colors"
              >
                <Plus className="w-5 h-5 text-(--accent-blue-600)" />
                <span className="font-medium">Create New Workout</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate("/exercises/new")}
                className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-(--accent-blue-50) data-[selected=true]:bg-(--accent-blue-50) transition-colors"
              >
                <Dumbbell className="w-5 h-5 text-(--accent-blue-600)" />
                <span className="font-medium">Create New Exercise</span>
              </Command.Item>
            </Command.Group>
          )}

          {/* Navigation */}
          {!search && (
            <Command.Group
              heading="Navigation"
              className="mb-2 text-xs font-semibold text-(--text-secondary) uppercase tracking-wider px-2 py-1"
            >
              <Command.Item
                onSelect={() => navigate("/dashboard")}
                className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-(--accent-blue-50) data-[selected=true]:bg-(--accent-blue-50) transition-colors"
              >
                <Home className="w-5 h-5 text-(--text-secondary)" />
                <span>Dashboard</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate("/workouts")}
                className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-(--accent-blue-50) data-[selected=true]:bg-(--accent-blue-50) transition-colors"
              >
                <Dumbbell className="w-5 h-5 text-(--text-secondary)" />
                <span>Workouts</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate("/calendar")}
                className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-(--accent-blue-50) data-[selected=true]:bg-(--accent-blue-50) transition-colors"
              >
                <Calendar className="w-5 h-5 text-(--text-secondary)" />
                <span>Calendar</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate("/groups")}
                className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-(--accent-blue-50) data-[selected=true]:bg-(--accent-blue-50) transition-colors"
              >
                <Users className="w-5 h-5 text-(--text-secondary)" />
                <span>Groups</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate("/analytics")}
                className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-(--accent-blue-50) data-[selected=true]:bg-(--accent-blue-50) transition-colors"
              >
                <BarChart3 className="w-5 h-5 text-(--text-secondary)" />
                <span>Analytics</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate("/settings")}
                className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-(--accent-blue-50) data-[selected=true]:bg-(--accent-blue-50) transition-colors"
              >
                <Settings className="w-5 h-5 text-(--text-secondary)" />
                <span>Settings</span>
              </Command.Item>
            </Command.Group>
          )}

          {/* Exercise Search Results */}
          {search && exercises.length > 0 && (
            <Command.Group
              heading="Exercises"
              className="mb-2 text-xs font-semibold text-(--text-secondary) uppercase tracking-wider px-2 py-1"
            >
              {exercises
                .filter(
                  (ex) =>
                    ex.name.toLowerCase().includes(search.toLowerCase()) ||
                    ex.category?.toLowerCase().includes(search.toLowerCase())
                )
                .slice(0, 8)
                .map((exercise) => (
                  <Command.Item
                    key={exercise.id}
                    onSelect={() => handleExerciseSelect(exercise.id)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-(--accent-blue-50) data-[selected=true]:bg-(--accent-blue-50) transition-colors"
                  >
                    <Dumbbell className="w-5 h-5 text-(--text-tertiary)" />
                    <div className="flex-1">
                      <div className="font-medium">{exercise.name}</div>
                      {exercise.category && (
                        <div className="text-xs text-(--text-secondary)">
                          {exercise.category}
                        </div>
                      )}
                    </div>
                  </Command.Item>
                ))}
            </Command.Group>
          )}
        </Command.List>

        {/* Footer with keyboard hints */}
        <div className="border-t border-gray-200 px-4 py-2 bg-(--bg-secondary) flex items-center justify-between text-xs text-(--text-secondary)">
          <div className="flex items-center gap-4">
            <span>
              <kbd className="px-2 py-1 bg-white border border-silver-400 rounded text-xs font-mono">
                ↑↓
              </kbd>{" "}
              to navigate
            </span>
            <span>
              <kbd className="px-2 py-1 bg-white border border-silver-400 rounded text-xs font-mono">
                ↵
              </kbd>{" "}
              to select
            </span>
          </div>
          <span>
            <kbd className="px-2 py-1 bg-white border border-silver-400 rounded text-xs font-mono">
              esc
            </kbd>{" "}
            to close
          </span>
        </div>
      </Command>
    </ModalBackdrop>
  );
}

/**
 * Hook to manage command palette state and keyboard shortcuts
 * Listens for Cmd+K / Ctrl+K to open palette
 *
 * @returns {
 *   isOpen: boolean - Whether palette is open
 *   setIsOpen: (open: boolean) => void - Control palette state
 * }
 *
 * @example
 * const { isOpen, setIsOpen } = useCommandPalette();
 * <CommandPalette isOpen={isOpen} onClose={() => setIsOpen(false)} />
 */
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }

      // Escape to close
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return { isOpen, setIsOpen };
}
