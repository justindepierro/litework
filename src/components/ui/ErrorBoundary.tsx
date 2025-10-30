"use client";

// Error Boundary Component
// Graceful error handling for React components

import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorFallbackProps {
  error?: Error;
  resetError: () => void;
  goHome: () => void;
}

function DefaultErrorFallback({ error, resetError, goHome }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-primary p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="w-12 h-12 text-red-500" />
        </div>
        
        <h1 className="text-heading-primary text-xl mb-2">
          Something went wrong
        </h1>
        
        <p className="text-body-secondary mb-6">
          An unexpected error occurred. Please try refreshing the page or return to the home page.
        </p>

        {process.env.NODE_ENV === "development" && error && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-red-600 font-medium mb-2">
              Error Details (Development Only)
            </summary>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={resetError}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          
          <button
            onClick={goHome}
            className="btn-primary flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // In production, you might want to log to an error reporting service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  goHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          goHome={this.goHome}
        />
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for imperative error throwing (useful for async operations)
export function useErrorHandler() {
  return (error: Error) => {
    throw error;
  };
}