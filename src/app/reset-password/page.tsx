"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/auth-client";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Display } from "@/components/ui/Typography";

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
      await requestPasswordReset(email);
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
          <Display size="lg" className="mb-2">
            Reset Password
          </Display>
          <p className="mt-2 text-body-secondary text-base sm:text-sm">
            Enter your email address and we&apos;ll send you instructions to
            reset your password
          </p>
        </div>

        {success ? (
          <Alert variant="success" title="Check your email">
            <div className="space-y-4">
              <p>
                We&apos;ve sent password reset instructions to your email
                address.
              </p>
              <div className="pt-4 border-t border-success-light">
                <p className="mb-3">
                  <strong>Next steps:</strong>
                </p>
                <ol className="space-y-2 list-decimal list-inside">
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
                  className="text-success hover:text-success-dark font-medium text-sm"
                >
                  Need to try a different email?
                </button>
              </div>
            </div>
          </Alert>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              id="email"
              name="email"
              type="email"
              required
              label="Email address"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              helperText="We'll send reset instructions to this email if it's associated with an account."
              inputSize="lg"
              fullWidth
            />

            {error && <Alert variant="error">{error}</Alert>}

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
