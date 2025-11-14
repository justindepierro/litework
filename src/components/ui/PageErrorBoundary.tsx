"use client";

/**
 * Page-Level Error Boundary
 * 
 * Simplified error boundary specifically for page-level components.
 * Provides a less dramatic fallback UI than GlobalErrorBoundary while
 * still gracefully handling errors and allowing recovery.
 * 
 * Usage:
 * ```tsx
 * export default withPageErrorBoundary(function MyPage() {
 *   // page content
 * });
 * ```
 */

import React from "react";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Display, Body } from "@/components/ui/Typography";
import Link from "next/link";

interface PageErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface PageErrorBoundaryProps {
  children: React.ReactNode;
  pageName?: string;
}

interface ErrorFallbackProps {
  error?: Error;
  pageName?: string;
  resetError: () => void;
}

function PageErrorFallback({ error, pageName, resetError }: ErrorFallbackProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-error-600" />
          </div>
        </div>

        <Display size="sm" className="mb-3">
          {pageName ? `Error Loading ${pageName}` : "Something Went Wrong"}
        </Display>

        <Body variant="secondary" className="mb-8">
          We encountered an unexpected error while loading this page.
          Don&apos;t worry, your data is safe. Try refreshing or go back to continue.
        </Body>

        {process.env.NODE_ENV === "development" && error && (
          <details className="mb-8 text-left bg-silver-100 rounded-lg p-4">
            <summary className="cursor-pointer text-error-600 font-medium mb-2 text-sm">
              Error Details (Development Only)
            </summary>
            <pre className="text-xs text-steel-700 overflow-auto whitespace-pre-wrap">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}

        <div className="flex gap-3 justify-center flex-wrap">
          <Button
            onClick={resetError}
            variant="primary"
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Try Again
          </Button>

          <Link href="/dashboard">
            <Button
              variant="secondary"
              leftIcon={<Home className="w-4 h-4" />}
            >
              Go to Dashboard
            </Button>
          </Link>

          <Button
            onClick={() => window.history.back()}
            variant="ghost"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}

export class PageErrorBoundary extends React.Component<
  PageErrorBoundaryProps,
  PageErrorBoundaryState
> {
  constructor(props: PageErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): PageErrorBoundaryState {
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
      console.error(`[PageErrorBoundary] Error in ${this.props.pageName || "page"}:`, error, errorInfo);
    }

    // TODO: In production, send to error monitoring service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <PageErrorFallback
          error={this.state.error}
          pageName={this.props.pageName}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-Order Component to wrap pages with error boundary
 * 
 * @example
 * ```tsx
 * export default withPageErrorBoundary(function DashboardPage() {
 *   return <div>Dashboard content</div>;
 * }, "Dashboard");
 * ```
 */
export function withPageErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  pageName?: string
) {
  const WrappedComponent = (props: P) => (
    <PageErrorBoundary pageName={pageName}>
      <Component {...props} />
    </PageErrorBoundary>
  );

  WrappedComponent.displayName = `withPageErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
