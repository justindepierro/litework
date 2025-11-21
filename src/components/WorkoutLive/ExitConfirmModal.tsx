import React from "react";
import { AlertCircle } from "lucide-react";
import { ModalBackdrop, ModalHeader, ModalContent } from "@/components/ui/Modal";

interface ExitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAndExit: () => Promise<void>;
  onAbandon: () => Promise<void>;
}

export const ExitConfirmModal = React.memo(function ExitConfirmModal({
  isOpen,
  onClose,
  onSaveAndExit,
  onAbandon,
}: ExitConfirmModalProps) {
  const handleAbandon = async () => {
    if (
      confirm(
        "Are you sure? This workout will be marked as abandoned and cannot be resumed."
      )
    ) {
      await onAbandon();
    }
  };

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full">
        <ModalHeader
          title="Exit Workout?"
          subtitle="Choose how you'd like to handle this workout session."
          icon={<AlertCircle className="w-6 h-6" />}
          onClose={onClose}
        />
        <ModalContent>
          <div className="space-y-3">
            <button
              onClick={onSaveAndExit}
              className="w-full p-4 bg-primary-lighter hover:bg-primary-light active:bg-primary text-primary-dark rounded-xl font-medium text-left border-2 border-primary-light transition-all duration-150 active:scale-[0.99]"
            >
              <div className="font-semibold mb-1">💾 Save & Exit</div>
              <div className="text-sm text-primary-dark">
                Your progress will be saved. Resume anytime.
              </div>
            </button>

            <button
              onClick={handleAbandon}
              className="w-full p-4 bg-error-lighter hover:bg-error-light active:bg-error text-error-dark rounded-xl font-medium text-left border-2 border-error-light transition-all duration-150 active:scale-[0.99]"
            >
              <div className="font-semibold mb-1">🗑️ Abandon Workout</div>
              <div className="text-sm text-error-dark">
                Discard this session completely.
              </div>
            </button>

            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-neutral-lighter hover:bg-neutral-light active:bg-neutral text-navy-700 rounded-xl font-medium active:scale-95 transition-all duration-150"
            >
              Cancel
            </button>
          </div>
        </ModalContent>
      </div>
    </ModalBackdrop>
  );
});
