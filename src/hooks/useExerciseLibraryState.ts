import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface Exercise {
  id: string;
  name: string;
  description: string;
  category_name: string;
  category_color: string;
  muscle_groups: Array<{ name: string; involvement: string }>;
  equipment_needed: string[];
  difficulty_level: number;
  is_compound: boolean;
  is_bodyweight: boolean;
  instructions: string[];
  video_url?: string;
  usage_count: number;
}

export interface ExerciseCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  sort_order: number;
}

export interface MuscleGroup {
  id: string;
  name: string;
  description?: string;
}

export interface EquipmentType {
  id: string;
  name: string;
  description?: string;
  availability: string;
}

interface NewExercise {
  name: string;
  description: string;
  categoryId: string;
  instructions: string[];
  difficultyLevel: number;
  equipmentNeeded: string[];
  isCompound: boolean;
  isBodyweight: boolean;
  videoUrl: string;
}

const initialNewExercise: NewExercise = {
  name: "",
  description: "",
  categoryId: "",
  instructions: [""],
  difficultyLevel: 2,
  equipmentNeeded: [],
  isCompound: false,
  isBodyweight: false,
  videoUrl: "",
};

export function useExerciseLibraryState() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<ExerciseCategory[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newExercise, setNewExercise] = useState<NewExercise>(initialNewExercise);

  const fetchExercises = useCallback(
    async (filters: {
      search?: string;
      category?: string;
      muscleGroup?: string;
      equipment?: string;
      difficulty?: string;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters.search) params.append("search", filters.search);
        if (filters.category) params.append("category", filters.category);
        if (filters.muscleGroup) params.append("muscleGroup", filters.muscleGroup);
        if (filters.equipment) params.append("equipment", filters.equipment);
        if (filters.difficulty) params.append("difficulty", filters.difficulty);

        // Get token from Supabase session
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
          throw new Error("Authentication required. Please log in.");
        }

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        const response = await fetch(`/api/exercises?${params}`, {
          headers,
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Authentication failed. Please log in again.");
          }
          throw new Error("Failed to fetch exercises");
        }

        const data = await response.json();
        setExercises(data.exercises);
        setCategories(data.categories);
        setMuscleGroups(data.muscleGroups);
        setEquipmentTypes(data.equipmentTypes);
      } catch (error) {
        console.error("Error fetching exercises:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch exercises"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleCreateExercise = useCallback(
    async (onSuccess?: () => void) => {
      if (!newExercise.name || !newExercise.categoryId) {
        setError("Name and category are required");
        return;
      }

      setCreating(true);
      setError(null);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
          throw new Error("Authentication required");
        }

        const response = await fetch("/api/exercises", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newExercise),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create exercise");
        }

        // Reset form
        setNewExercise(initialNewExercise);
        setShowCreateForm(false);
        
        // Call success callback to refresh exercises
        onSuccess?.();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create exercise"
        );
      } finally {
        setCreating(false);
      }
    },
    [newExercise]
  );

  const resetNewExercise = useCallback(() => {
    setNewExercise(initialNewExercise);
  }, []);

  return {
    // State
    exercises,
    categories,
    muscleGroups,
    equipmentTypes,
    loading,
    error,
    showCreateForm,
    creating,
    newExercise,

    // Actions
    setShowCreateForm,
    setNewExercise,
    setError,
    fetchExercises,
    handleCreateExercise,
    resetNewExercise,
  };
}
