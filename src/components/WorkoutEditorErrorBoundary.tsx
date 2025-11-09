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
        <div className="fixed inset-0 bg-overlay z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-8 shadow-2xl">
            {/* Error Icon */}
            <div className="flex items-center justify-center mb-6">
              <div className="bg-red-100 rounded-full p-4">
                <AlertTriangle className="w-12 h-12 text-red-600" />
              </div>
            </div>

            {/* Error Title */}
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
              Something Went Wrong
            </h2>

            {/* Error Message */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 font-medium mb-2">
                Error Details:
              </p>
              <p className="text-sm text-red-700 font-mono">
                {error?.message || "Unknown error occurred"}
              </p>
            </div>

            {/* Recovery Status */}
            {savedWorkout && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <Save className="w-5 h-5 text-green-600 mt-0.5 mr-3 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800 mb-1">
                      Your work has been saved!
                    </p>
                    <p className="text-sm text-green-700">
                      We automatically saved your workout draft. You can recover
                      it or start fresh.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
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
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Start Fresh
              </button>
            </div>

            {/* Technical Details (collapsed by default in production) */}
            {process.env.NODE_ENV === "development" && this.state.errorInfo && (
              <details className="mt-6">
                <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                  Technical Details (Development Only)
                </summary>
                <div className="mt-3 bg-gray-50 border border-gray-200 rounded p-4">
                  <pre className="text-xs text-gray-700 overflow-auto max-h-48">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}

            {/* Help Text */}
            <p className="text-center text-sm text-gray-500 mt-6">
              If this problem persists, please contact support or try refreshing
              the page.
            </p>
          </div>
        </div>
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
