// Reusable Loading Components
// Consistent loading states across the application

import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  message = "Loading...",
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
      {message && (
        <span className="text-heading-secondary text-sm">{message}</span>
      )}
    </div>
  );
}

interface PageLoadingProps {
  message?: string;
}

export function PageLoading({ message = "Loading..." }: PageLoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" message={message} />
    </div>
  );
}

interface SectionLoadingProps {
  message?: string;
  className?: string;
}

export function SectionLoading({
  message = "Loading...",
  className = "py-8",
}: SectionLoadingProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <LoadingSpinner message={message} />
    </div>
  );
}

interface ButtonLoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ButtonLoading({
  size = "sm",
  className = "",
}: ButtonLoadingProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
}
