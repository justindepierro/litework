"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/auth-client";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";
import { Alert } from "@/components/ui/Alert";
import { Display, Body } from "@/components/ui/Typography";
import { CenteredContainer } from "@/components/layout/PageContainer";

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
    <CenteredContainer background="gradient">
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center">
          <Display size="lg" className="mb-2">
            Reset Password
          </Display>
          <Body variant="secondary" className="mt-2 text-base sm:text-sm">
            Enter your email address and we&apos;ll send you instructions to
            reset your password
          </Body>
        </div>

        {success ? (
          <Alert variant="success" title="Check your email">
            <div className="space-y-4">
              <Body>
                We&apos;ve sent password reset instructions to your email
                address.
              </Body>
              <div className="pt-4 border-t border-success-light">
                <Body className="mb-3">
                  <strong>Next steps:</strong>
                </Body>
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
            <FloatingLabelInput
              id="email"
              name="email"
              type="email"
              required
              label="Email address"
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
              className="w-full py-4 px-6 bg-accent-blue-500 hover:bg-accent-blue-700 disabled:bg-steel-400 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all touch-manipulation"
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
            className="text-body-secondary text-base sm:text-sm hover:text-primary transition-colors font-medium touch-manipulation inline-block py-2 px-4 rounded-lg"
          >
            ← Back to login
          </Link>
        </div>
      </div>
    </CenteredContainer>
  );
}
