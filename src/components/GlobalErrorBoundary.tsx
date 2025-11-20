"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { motion } from "framer-motion";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global Error Boundary for Production
 *
 * Catches unhandled errors and displays user-friendly fallback UI
 * In production, errors are logged to monitoring service
 */
export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to monitoring service in production
    if (process.env.NODE_ENV === "production") {
      // TODO: Send to Sentry or similar
      // Sentry.captureException(error, { extra: errorInfo });
    } else {
      console.error("Global Error Boundary caught error:", error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI with animations
      return (
        <div
          className="min-h-screen flex items-center justify-center p-4"
          style={{ background: "var(--page-gradient-energetic)" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              duration: 0.4,
            }}
            className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8"
          >
            {/* Error Icon with pulse animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 20,
                delay: 0.1,
              }}
              className="flex items-center justify-center mb-6"
            >
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-16 h-16 bg-accent-red-100 rounded-full flex items-center justify-center"
              >
                <AlertTriangle className="w-8 h-8 text-accent-red-600" />
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-[var(--color-text-primary)] text-center mb-3"
            >
              Oops! Something went wrong
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-[var(--color-text-secondary)] text-center mb-6"
            >
              We encountered an unexpected error. Don&apos;t worry, your data is
              safe.
            </motion.p>

            {/* Development Error Details */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ delay: 0.4 }}
              >
                <Alert variant="error" className="mb-6">
                  <p className="font-mono text-sm break-all">
                    {this.state.error.message}
                  </p>
                </Alert>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={this.handleReset}
                className="flex-1 px-6 py-3 bg-[var(--color-interactive-primary-base)] hover:bg-[var(--color-interactive-primary-hover)] text-[var(--color-text-inverse)] font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </motion.button>

              <Link href="/" className="flex-1">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-3 bg-neutral-200 hover:bg-neutral-300 text-navy-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </motion.div>
              </Link>
            </motion.div>

            {/* Support Message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-sm text-[var(--color-text-tertiary)] text-center mt-6"
            >
              If this problem persists, please contact support
            </motion.p>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
