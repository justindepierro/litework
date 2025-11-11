"use client";

import React, { useState } from "react";
import {
  ModalBackdrop,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Heading, Body, Label } from "@/components/ui/Typography";
import {
  MessageSquare,
  TrendingUp,
  Activity,
  Zap,
  CheckCircle2,
} from "lucide-react";

interface WorkoutFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  workoutName?: string;
  onSubmitSuccess?: () => void;
}

interface RatingSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  icon: React.ReactNode;
  labels: string[];
}

const RatingSlider: React.FC<RatingSliderProps> = ({
  label,
  value,
  onChange,
  icon,
  labels,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="text-primary">{icon}</div>
        <Label className="text-base font-semibold">
          {label}
        </Label>
      </div>

      {/* Rating buttons */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={`
              flex-1 p-3 rounded-lg border-2 transition-all
              ${
                value === rating
                  ? "border-primary bg-primary-50 text-primary font-semibold"
                  : "border-silver-300 bg-white hover:border-primary-200 hover:bg-silver-50"
              }
            `}
          >
            <div className="text-lg font-bold">{rating}</div>
          </button>
        ))}
      </div>

      {/* Helper labels */}
      <div className="flex justify-between">
        <Body size="sm" variant="tertiary">
          {labels[0]}
        </Body>
        <Body size="sm" variant="tertiary">
          {labels[1]}
        </Body>
      </div>
    </div>
  );
};

export function WorkoutFeedbackModal({
  isOpen,
  onClose,
  sessionId,
  workoutName,
  onSubmitSuccess,
}: WorkoutFeedbackModalProps) {
  const [difficultyRating, setDifficultyRating] = useState(3);
  const [sorenessRating, setSorenessRating] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/sessions/${sessionId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          difficulty_rating: difficultyRating,
          soreness_rating: sorenessRating,
          energy_level: energyLevel,
          notes: notes.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit feedback");
      }

      setIsSuccess(true);
      
      // Call success callback after a brief delay
      setTimeout(() => {
        onSubmitSuccess?.();
        onClose();
        
        // Reset state
        setIsSuccess(false);
        setDifficultyRating(3);
        setSorenessRating(3);
        setEnergyLevel(3);
        setNotes("");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setError(null);
    }
  };

  return (
    <ModalBackdrop isOpen={isOpen} onClose={handleClose}>
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <ModalHeader
          title={isSuccess ? "Feedback Submitted!" : "Workout Feedback"}
          subtitle={workoutName}
          icon={isSuccess ? <CheckCircle2 /> : <MessageSquare />}
          onClose={handleClose}
        />

        <ModalContent>
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-100 text-success-600 mb-4">
                <CheckCircle2 size={32} />
              </div>
              <Heading level="h3" className="mb-2">
                Thank you for your feedback!
              </Heading>
              <Body variant="secondary">
                Your coach will use this to adjust your training.
              </Body>
            </div>
          ) : (
            <div className="space-y-6">
              <Body variant="secondary">
                Help your coach understand your workout experience. This
                information is used to adjust future training.
              </Body>

              {error && (
                <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
                  <Body variant="error">{error}</Body>
                </div>
              )}

              <RatingSlider
                label="Workout Difficulty"
                value={difficultyRating}
                onChange={setDifficultyRating}
                icon={<TrendingUp size={20} />}
                labels={["Too Easy", "Too Hard"]}
              />

              <RatingSlider
                label="Soreness Level"
                value={sorenessRating}
                onChange={setSorenessRating}
                icon={<Activity size={20} />}
                labels={["Not Sore", "Very Sore"]}
              />

              <RatingSlider
                label="Energy Level"
                value={energyLevel}
                onChange={setEnergyLevel}
                icon={<Zap size={20} />}
                labels={["Very Low", "Very High"]}
              />

              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  Additional Notes (Optional)
                </Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any injuries, concerns, or comments about the workout..."
                  rows={4}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </ModalContent>

        {!isSuccess && (
          <ModalFooter>
            <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </ModalFooter>
        )}
      </div>
    </ModalBackdrop>
  );
}
