"use client";

import { AlertTriangle, Info } from "lucide-react";
import { ModalBackdrop, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/Modal";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "danger" | "primary" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "danger",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const getIconAndColor = () => {
    switch (confirmVariant) {
      case "danger":
        return {
          icon: (
            <AlertTriangle className="w-6 h-6 text-red-600" />
          ),
          buttonColor: "bg-red-600 hover:bg-red-700",
        };
      case "warning":
        return {
          icon: (
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          ),
          buttonColor: "bg-yellow-600 hover:bg-yellow-700",
        };
      case "primary":
        return {
          icon: <Info className="w-6 h-6 text-blue-600" />,
          buttonColor: "bg-blue-600 hover:bg-blue-700",
        };
    }
  };

  const { icon, buttonColor } = getIconAndColor();

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onCancel}>
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl shadow-2xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden">
        <ModalHeader
          title={title}
          subtitle=""
          onClose={onCancel}
          icon={icon}
        />

        <ModalContent>
          <p className="text-gray-700 leading-relaxed text-base">
            {message}
          </p>
        </ModalContent>

        <ModalFooter align="between">
          <button
            onClick={onCancel}
            className="flex-1 px-5 py-3 rounded-xl font-semibold text-base text-gray-700 bg-white hover:bg-gray-100 transition-colors border-2 border-gray-300"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`flex-1 px-5 py-3 rounded-xl font-semibold text-base text-white transition-colors shadow-lg ${buttonColor}`}
          >
            {confirmText}
          </button>
        </ModalFooter>
      </div>
    </ModalBackdrop>
  );
}
