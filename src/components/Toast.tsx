"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type,
  onClose,
  duration = 4000,
}: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />;
      case "error":
        return <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />;
      case "info":
        return <Info className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-300 text-green-900 shadow-green-100";
      case "error":
        return "bg-red-50 border-red-300 text-red-900 shadow-red-100";
      case "warning":
        return "bg-yellow-50 border-yellow-300 text-yellow-900 shadow-yellow-100";
      case "info":
        return "bg-blue-50 border-blue-300 text-blue-900 shadow-blue-100";
    }
  };

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3 sm:px-5 sm:py-4 rounded-xl border-2 shadow-lg
        min-w-[280px] sm:min-w-[320px] max-w-[90vw] sm:max-w-md
        ${getStyles()}
        ${isExiting ? "animate-slide-out-right" : "animate-slide-in-right"}
        touch-manipulation
      `}
      role="alert"
    >
      <div className="shrink-0 mt-0.5">{getIcon()}</div>
      <p className="flex-1 text-sm sm:text-base font-medium leading-relaxed wrap-break-word">
        {message}
      </p>
      <button
        onClick={handleClose}
        className="shrink-0 p-1 hover:bg-black/5 rounded-lg transition-colors touch-manipulation"
        aria-label="Close notification"
      >
        <X className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );
}
