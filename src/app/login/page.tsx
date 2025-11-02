"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRedirectIfAuthenticated } from "@/hooks/use-auth-guard";
import { validateEmail } from "@/lib/security";
import { RateLimitError } from "@/components/ui/RateLimitError";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const { signIn } = useAuth();

  // Redirect to dashboard if already logged in
  const { isLoading: authLoading } = useRedirectIfAuthenticated();

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailError("");
    setError("");

    // Only validate if user has entered something and moved on
    if (value && value.includes("@")) {
      const validation = validateEmail(value);
      if (!validation.valid) {
        setEmailError(validation.error || "Invalid email");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setEmailError("");
    setIsRateLimited(false);

    // Final validation before submit
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setEmailError(emailValidation.error || "Invalid email");
      setIsLoading(false);
      return;
    }

    try {
      await signIn(email, password);
      // AuthContext will handle redirect to /dashboard
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Invalid email or password";

      // Check if it's a rate limit error
      if (errorMessage.includes("Too many")) {
        setIsRateLimited(true);
        setError(errorMessage);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth status
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-primary container-responsive py-8 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h2 className="text-heading-primary text-3xl sm:text-2xl font-bold mb-2">
            Welcome Back
          </h2>
          <p className="mt-2 text-body-secondary text-base sm:text-sm">
            Sign in to track your workouts
          </p>
        </div>

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
              className={`w-full px-4 py-4 sm:px-3 sm:py-3 border-2 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 text-base bg-white touch-manipulation ${
                emailError
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              disabled={isLoading || isRateLimited}
            />
            {emailError && (
              <p className="mt-1 text-sm text-red-600">{emailError}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="password"
                className="text-body-primary block text-base sm:text-sm font-medium"
              >
                Password
              </label>
              <Link
                href="/reset-password"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium touch-manipulation"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-4 sm:px-3 sm:py-3 border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white touch-manipulation"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              disabled={isLoading || isRateLimited}
            />
          </div>

          {isRateLimited && error ? (
            <RateLimitError error={error} />
          ) : error ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isLoading || isRateLimited || !!emailError}
            className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all touch-manipulation"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing in...
              </div>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div className="text-center">
          <Link
            href="/"
            className="text-body-secondary text-base sm:text-sm hover:text-blue-600 transition-colors font-medium touch-manipulation inline-block py-2 px-4 rounded-lg"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
