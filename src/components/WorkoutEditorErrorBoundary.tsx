/**
 * Error Boundary for WorkoutEditor
 *
 * Catches errors in the workout editor and provides recovery options.
 * Automatically saves workout draft to localStorage for recovery.
 */

"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { WorkoutPlan } from "@/types";
import { AlertTriangle, RefreshCw, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import {
  ModalBackdrop,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@/components/ui/Modal";

interface Props {
  children: ReactNode;
  workout?: WorkoutPlan | Partial<WorkoutPlan>;
  onRecover?: (workout: WorkoutPlan | Partial<WorkoutPlan>) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  savedWorkout: WorkoutPlan | Partial<WorkoutPlan> | null;
}

const STORAGE_KEY = "litework-workout-recovery";

export class WorkoutEditorErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      savedWorkout: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console for debugging
    console.error("WorkoutEditor crashed:", error, errorInfo);

    // Save workout to localStorage for recovery
    if (this.props.workout) {
      try {
        const workoutToSave = {
          ...this.props.workout,
          _savedAt: new Date().toISOString(),
          _errorMessage: error.message,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(workoutToSave));
        this.setState({ savedWorkout: this.props.workout });
        // [REMOVED] console.log("✅ Workout draft saved to localStorage for recovery");
      } catch (storageError) {
        console.error("Failed to save workout draft:", storageError);
      }
    }

    this.setState({
      errorInfo,
    });
  }

  handleRecover = () => {
    if (this.state.savedWorkout && this.props.onRecover) {
      this.props.onRecover(this.state.savedWorkout);
    }
    this.handleReset();
  };

  handleReset = () => {
    // Clear error state and try to remount
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      savedWorkout: null,
    });
  };

  handleClearRecovery = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      // [REMOVED] console.log("Recovery data cleared");
    } catch (error) {
      console.error("Failed to clear recovery data:", error);
    }
    this.handleReset();
  };

  render() {
    if (this.state.hasError) {
      const { error, savedWorkout } = this.state;

      return (
        <ModalBackdrop isOpen={this.state.hasError} onClose={() => {}}>
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl">
            <ModalHeader
              title="Something Went Wrong"
              icon={<AlertTriangle className="w-12 h-12" />}
              onClose={this.handleReset}
            />
            <ModalContent>
              {/* Error Message */}
              <Alert variant="error" title="Error Details">
                <p className="text-sm font-mono">
                  {error?.message || "Unknown error occurred"}
                </p>
              </Alert>

              {/* Recovery Status */}
              {savedWorkout && (
                <Alert
                  variant="success"
                  icon={<Save />}
                  title="Your Work is Safe"
                >
                  <p className="text-sm mb-1">Your work has been saved!</p>
                  <p className="text-sm">
                    We automatically saved your workout draft. You can recover
                    it or start fresh.
                  </p>
                </Alert>
              )}

              {/* Technical Details (collapsed by default in production) */}
              {process.env.NODE_ENV === "development" &&
                this.state.errorInfo && (
                  <details className="mt-6">
                    <summary className="text-sm text-(--text-secondary) cursor-pointer hover:text-(--text-primary)">
                      Technical Details (Development Only)
                    </summary>
                    <div className="mt-3 bg-(--bg-secondary) border border-silver-300 rounded p-4">
                      <pre className="text-xs text-(--text-secondary) overflow-auto max-h-48">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  </details>
                )}
            </ModalContent>
            <ModalFooter align="between">
              {savedWorkout && this.props.onRecover && (
                <Button
                  onClick={this.handleRecover}
                  variant="primary"
                  leftIcon={<Save className="w-5 h-5" />}
                  className="flex-1"
                >
                  Recover Workout
                </Button>
              )}

              <Button
                onClick={this.handleReset}
                variant="secondary"
                leftIcon={<RefreshCw className="w-5 h-5" />}
                className="flex-1"
              >
                Try Again
              </Button>

              <button
                onClick={this.handleClearRecovery}
                className="flex-1 px-4 py-3 bg-(--bg-tertiary) text-(--text-secondary) rounded-lg hover:bg-(--interactive-hover) transition-colors font-medium"
              >
                Start Fresh
              </button>
            </ModalFooter>
          </div>
        </ModalBackdrop>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook to check for and recover saved workouts
 */
export function useWorkoutRecovery() {
  const [recoveryData, setRecoveryData] = React.useState<
    | ((WorkoutPlan | Partial<WorkoutPlan>) & {
        _savedAt?: string;
        _errorMessage?: string;
      })
    | null
  >(null);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setRecoveryData(data);
      }
    } catch (error) {
      console.error("Failed to load recovery data:", error);
    }
  }, []);

  const clearRecovery = React.useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setRecoveryData(null);
    } catch (error) {
      console.error("Failed to clear recovery data:", error);
    }
  }, []);

  const hasRecovery = recoveryData !== null;
  const savedAt = recoveryData?._savedAt
    ? new Date(recoveryData._savedAt)
    : null;

  return {
    hasRecovery,
    recoveryData,
    savedAt,
    clearRecovery,
  };
}
