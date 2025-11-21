"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkoutSession } from "@/contexts/WorkoutSessionContext";
import WorkoutLive from "@/components/WorkoutLive";
import { AlertCircle, Dumbbell } from "lucide-react";
import { Heading, Body } from "@/components/ui/Typography";

interface StartWorkoutPageProps {
  params: Promise<{ assignmentId: string }>;
}

export default function StartWorkoutPage({ params }: StartWorkoutPageProps) {
  const router = useRouter();
  const {
    session,
    startSession,
    isLoading: sessionLoading,
  } = useWorkoutSession();
  const [assignmentId, setAssignmentId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Unwrap async params
  useEffect(() => {
    params.then((p) => setAssignmentId(p.assignmentId));
  }, [params]);

  useEffect(() => {
    if (!assignmentId) return;

    const initializeSession = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if there's already an active session for this assignment
        if (session && session.assignment_id === assignmentId) {
          // Session already exists, just show the WorkoutLive component
          setIsLoading(false);
          return;
        }

        // Start new session via API
        const response = await fetch("/api/sessions/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ assignment_id: assignmentId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to start workout session");
        }

        const { session: newSession } = await response.json();

        // Initialize session in context
        startSession(newSession);

        setIsLoading(false);
      } catch (err) {
        console.error("Failed to start workout:", err);
        setError(
          err instanceof Error ? err.message : "Failed to start workout"
        );
        setIsLoading(false);
      }
    };

    initializeSession();
  }, [assignmentId, session, startSession]);

  // Loading state
  if (isLoading || sessionLoading || !assignmentId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--bg-secondary)">
        <div className="text-center">
          <Dumbbell className="w-16 h-16 text-(--accent-blue-600) mx-auto mb-4 animate-bounce" />
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-(--accent-blue-600) mx-auto mb-4" />
          <p className="text-lg text-(--text-secondary)">
            Starting your workout...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--bg-secondary) p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-(--status-error) mx-auto mb-4" />
          <Heading level="h3" className="mb-2">
            Failed to Start Workout
          </Heading>
          <Body variant="secondary" className="mb-6">
            {error}
          </Body>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex-1 px-6 py-3 bg-(--bg-tertiary) hover:bg-(--interactive-hover) text-(--text-primary) rounded-lg font-medium"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-6 py-3 bg-(--accent-blue-600) hover:bg-(--accent-blue-700) text-white rounded-lg font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render WorkoutLive component
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--bg-secondary) p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-(--status-warning) mx-auto mb-4" />
          <Heading level="h3" className="mb-2">
            No Active Session
          </Heading>
          <Body variant="secondary" className="mb-6">
            Unable to load workout session. Please try again.
          </Body>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-(--accent-blue-600) text-white rounded-lg hover:bg-(--accent-blue-700)"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <WorkoutLive assignmentId={assignmentId} />;
}
