"use client";

import { useEffect } from "react";
import { AlertTriangle, X, Info } from "lucide-react";

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
  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden"; // Prevent background scroll

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const getIconAndColor = () => {
    switch (confirmVariant) {
      case "danger":
        return {
          icon: (
            <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" />
          ),
          bgColor: "bg-red-100",
          buttonColor: "bg-red-600 hover:bg-red-700 active:bg-red-800",
        };
      case "warning":
        return {
          icon: (
            <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-600" />
          ),
          bgColor: "bg-yellow-100",
          buttonColor: "bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800",
        };
      case "primary":
        return {
          icon: <Info className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />,
          bgColor: "bg-blue-100",
          buttonColor: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800",
        };
    }
  };

  const { icon, bgColor, buttonColor } = getIconAndColor();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal - Full width on mobile, centered on desktop */}
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl shadow-2xl animate-slide-up sm:animate-scale-in max-h-[90vh] sm:max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-3 sm:gap-4 p-5 sm:p-6 border-b border-gray-200">
          <div
            className={`shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full ${bgColor} flex items-center justify-center`}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3
              id="modal-title"
              className="text-lg sm:text-xl font-bold text-gray-900 leading-tight"
            >
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="shrink-0 p-1.5 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors touch-manipulation"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto max-h-[50vh]">
          <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
            {message}
          </p>
        </div>

        {/* Footer - Stacked on mobile, side-by-side on desktop */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 p-5 sm:p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onCancel}
            className="flex-1 px-5 py-3.5 sm:py-3 rounded-xl font-semibold text-base text-gray-700 bg-white hover:bg-gray-100 active:bg-gray-200 transition-colors border-2 border-gray-300 touch-manipulation"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`flex-1 px-5 py-3.5 sm:py-3 rounded-xl font-semibold text-base text-white transition-colors shadow-lg touch-manipulation ${buttonColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
