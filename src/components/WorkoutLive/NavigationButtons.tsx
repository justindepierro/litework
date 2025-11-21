import React from "react";
import { CheckCircle, ChevronRight, Trophy } from "lucide-react";

interface NavigationButtonsProps {
  isLastExercise: boolean;
  onNext: () => void;
  onComplete: () => void;
}

export const NavigationButtons = React.memo(function NavigationButtons({
  isLastExercise,
  onNext,
  onComplete,
}: NavigationButtonsProps) {
  return (
    <div className="shrink-0 bg-white border-t-2 border-neutral-light shadow-2xl">
      <div className="px-4 py-5">
        {isLastExercise ? (
          <button
            onClick={onComplete}
            className="w-full py-5 bg-gradient-cta-green text-white rounded-xl font-bold text-xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-150 flex items-center justify-center gap-2"
            style={{ minHeight: "64px" }}
          >
            <Trophy className="w-7 h-7" />
            Finish Workout
          </button>
        ) : (
          <button
            onClick={onNext}
            className="w-full py-5 bg-gradient-cta-blue text-white rounded-xl font-bold text-xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-150 flex items-center justify-center gap-2"
            style={{ minHeight: "64px" }}
          >
            Next Exercise
            <ChevronRight className="w-7 h-7" />
          </button>
        )}
      </div>
    </div>
  );
});
