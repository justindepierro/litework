"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/update-password`,
        }
      );

      if (resetError) {
        throw resetError;
      }

      setSuccess(true);
      setEmail("");
    } catch (err) {
      console.error("Password reset error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send reset email. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-primary container-responsive py-8 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h2 className="text-heading-primary text-3xl sm:text-2xl font-bold mb-2">
            Reset Password
          </h2>
          <p className="mt-2 text-body-secondary text-base sm:text-sm">
            Enter your email address and we'll send you instructions to reset
            your password
          </p>
        </div>

        {success ? (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <svg
                className="w-8 h-8 text-green-600 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-green-800">
                  Check your email
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  We've sent password reset instructions to your email address.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-green-200">
              <p className="text-sm text-green-700 mb-3">
                <strong>Next steps:</strong>
              </p>
              <ol className="text-sm text-green-700 space-y-2 list-decimal list-inside">
                <li>Check your inbox (and spam folder)</li>
                <li>Click the reset link in the email</li>
                <li>Create a new password</li>
                <li>Sign in with your new password</li>
              </ol>
            </div>
            <div className="pt-4">
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail("");
                }}
                className="text-green-700 hover:text-green-800 font-medium text-sm"
              >
                Need to try a different email?
              </button>
            </div>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="text-body-primary block text-base sm:text-sm font-medium mb-2"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-4 sm:px-3 sm:py-3 border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white touch-manipulation"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
              <p className="text-sm text-gray-600 mt-2">
                We'll send reset instructions to this email if it's associated
                with an account.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all touch-manipulation"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sending instructions...
                </div>
              ) : (
                "Send reset instructions"
              )}
            </button>
          </form>
        )}

        <div className="text-center space-y-2">
          <Link
            href="/login"
            className="text-body-secondary text-base sm:text-sm hover:text-blue-600 transition-colors font-medium touch-manipulation inline-block py-2 px-4 rounded-lg"
          >
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
