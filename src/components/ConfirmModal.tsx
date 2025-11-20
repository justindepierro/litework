"use client";

import { AlertTriangle, Info } from "lucide-react";
import {
  ModalBackdrop,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@/components/ui/Modal";
import { Body } from "@/components/ui/Typography";

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
          icon: <AlertTriangle className="w-6 h-6 text-(--status-error)" />,
          buttonColor: "bg-(--status-error) hover:bg-(--status-error)",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-(--status-warning)" />,
          buttonColor: "bg-(--status-warning) hover:bg-(--status-warning)",
        };
      case "primary":
        return {
          icon: <Info className="w-6 h-6 text-(--accent-blue-600)" />,
          buttonColor: "bg-(--accent-blue-600) hover:bg-(--accent-blue-700)",
        };
    }
  };

  const { icon, buttonColor } = getIconAndColor();

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onCancel}>
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl shadow-2xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden">
        <ModalHeader title={title} subtitle="" onClose={onCancel} icon={icon} />

        <ModalContent>
          <Body className="leading-relaxed text-base">{message}</Body>
        </ModalContent>

        <ModalFooter align="between">
          <button
            onClick={onCancel}
            className="flex-1 px-5 py-3 rounded-xl font-semibold text-base text-navy-600 bg-white hover:bg-neutral-lighter transition-colors border-2 border-neutral-light"
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
