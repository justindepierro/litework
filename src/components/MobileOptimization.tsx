import { useEffect, useState } from "react";

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasTouch: boolean;
  screenWidth: number;
  isLandscape: boolean;
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    hasTouch: false,
    screenWidth: 1920,
    isLandscape: true,
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

      setDeviceInfo({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        hasTouch,
        screenWidth: width,
        isLandscape: width > height,
      });
    };

    // Initial check
    updateDeviceInfo();

    // Listen for window resize
    window.addEventListener("resize", updateDeviceInfo);
    window.addEventListener("orientationchange", updateDeviceInfo);

    return () => {
      window.removeEventListener("resize", updateDeviceInfo);
      window.removeEventListener("orientationchange", updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}

export function getMobileOptimizedClasses(
  baseClasses: string,
  mobileClasses?: string,
  isMobile?: boolean
): string {
  if (isMobile && mobileClasses) {
    return `${baseClasses} ${mobileClasses}`;
  }

  return baseClasses;
}

// Touch-friendly button component
interface TouchButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
}

export function TouchButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
}: TouchButtonProps) {
  const deviceInfo = useDeviceDetection();

  const baseClasses =
    "transition-all duration-200 font-medium rounded-xl touch-manipulation active:scale-95";

  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
  };

  const sizeClasses = {
    sm: deviceInfo.isMobile ? "px-4 py-3 text-sm" : "px-3 py-2 text-sm",
    md: deviceInfo.isMobile ? "px-6 py-4 text-base" : "px-4 py-2 text-sm",
    lg: deviceInfo.isMobile ? "px-8 py-5 text-lg" : "px-6 py-3 text-base",
  };

  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
}

// Mobile-optimized modal component
interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export function MobileModal({
  isOpen,
  onClose,
  title,
  children,
  size = "lg",
}: MobileModalProps) {
  const deviceInfo = useDeviceDetection();

  if (!isOpen) return null;

  const sizeClasses = {
    sm: deviceInfo.isMobile ? "w-full h-full" : "w-full max-w-md",
    md: deviceInfo.isMobile ? "w-full h-full" : "w-full max-w-lg",
    lg: deviceInfo.isMobile ? "w-full h-full" : "w-full max-w-2xl",
    xl: deviceInfo.isMobile ? "w-full h-full" : "w-full max-w-4xl",
    full: "w-full h-full",
  };

  const containerClasses = deviceInfo.isMobile
    ? "fixed inset-0 bg-white z-50 flex flex-col"
    : "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50";

  const modalClasses = deviceInfo.isMobile
    ? "flex-1 flex flex-col"
    : `bg-white rounded-xl ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col`;

  return (
    <div className={containerClasses}>
      <div className={modalClasses}>
        {/* Header */}
        <div
          className={`flex justify-between items-center p-4 sm:p-6 border-b ${deviceInfo.isMobile ? "shrink-0" : ""}`}
        >
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
            {title}
          </h2>
          <TouchButton variant="secondary" size="sm" onClick={onClose}>
            <span className="text-lg">×</span>
          </TouchButton>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

// Mobile-optimized input component
interface MobileInputProps {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  label?: string;
  required?: boolean;
}

export function MobileInput({
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
  label,
  required = false,
}: MobileInputProps) {
  const deviceInfo = useDeviceDetection();

  const inputClasses = deviceInfo.isMobile
    ? "w-full px-4 py-4 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
    : "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClasses} ${className}`}
        required={required}
      />
    </div>
  );
}

// Mobile-optimized card component
interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function MobileCard({
  children,
  className = "",
  onClick,
  hoverable = false,
}: MobileCardProps) {
  const deviceInfo = useDeviceDetection();

  const baseClasses = deviceInfo.isMobile
    ? "bg-white rounded-xl shadow-sm border border-gray-100 p-4"
    : "bg-white rounded-lg shadow-sm border border-gray-100 p-6";

  const interactiveClasses =
    onClick || hoverable
      ? "cursor-pointer hover:shadow-md transition-all duration-200 touch-manipulation active:scale-[0.98]"
      : "";

  return (
    <div
      className={`${baseClasses} ${interactiveClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Utility functions for responsive design
export const responsive = {
  // Padding classes
  padding: {
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8",
  },

  // Text size classes
  text: {
    xs: "text-xs sm:text-sm",
    sm: "text-sm sm:text-base",
    md: "text-base sm:text-lg",
    lg: "text-lg sm:text-xl",
    xl: "text-xl sm:text-2xl",
    "2xl": "text-2xl sm:text-3xl",
  },

  // Button sizes
  button: {
    sm: "px-3 py-2 sm:px-4 sm:py-2 text-sm",
    md: "px-4 py-3 sm:px-4 sm:py-2 text-sm sm:text-base",
    lg: "px-6 py-4 sm:px-6 sm:py-3 text-base",
  },

  // Grid layouts
  grid: {
    auto: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    two: "grid-cols-1 sm:grid-cols-2",
    three: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    four: "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4",
  },
};

const MobileOptimization = {
  useDeviceDetection,
  getMobileOptimizedClasses,
  TouchButton,
  MobileModal,
  MobileInput,
  MobileCard,
  responsive,
};

export default MobileOptimization;
