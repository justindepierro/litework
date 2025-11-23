"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { completePasswordReset, getSession } from "@/lib/auth-client";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";
import { Alert } from "@/components/ui/Alert";
import { Display, Body } from "@/components/ui/Typography";
import { CenteredContainer } from "@/components/layout/PageContainer";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isValidSession, setIsValidSession] = useState(false);

  useEffect(() => {
    // Check if user has a valid recovery session
    getSession()
      .then((session) => {
        if (!session) {
          setError("Invalid or expired reset link. Please request a new one.");
        } else {
          setIsValidSession(true);
        }
      })
      .catch((err) => {
        console.error("Password reset session error:", err);
        setError("Unable to verify reset session. Please request a new link.");
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      await completePasswordReset(password);
      setSuccess(true);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Password update error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidSession && error) {
    return (
      <CenteredContainer background="gradient">
        <div className="w-full max-w-md mx-auto space-y-6">
          <Alert variant="error" title="Invalid Reset Link">
            <p className="mb-4">{error}</p>
            <Link
              href="/reset-password"
              className="inline-block px-4 py-2 bg-error text-white rounded-lg hover:bg-error-dark font-medium"
            >
              Request New Reset Link
            </Link>
          </Alert>
        </div>
      </CenteredContainer>
    );
  }

  return (
    <CenteredContainer background="gradient">
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center">
          <Display size="sm" className="mb-2">
            Create New Password
          </Display>
          <Body variant="secondary" size="sm" className="mt-2">
            Choose a strong password for your account
          </Body>
        </div>

        {success ? (
          <Alert variant="success" title="Password Updated!">
            Your password has been successfully updated. Redirecting to
            dashboard...
          </Alert>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FloatingLabelInput
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              label="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              helperText="Must be at least 8 characters long"
              inputSize="lg"
              fullWidth
            />

            <FloatingLabelInput
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              inputSize="lg"
              fullWidth
            />

            {error && <Alert variant="error">{error}</Alert>}

            <button
              type="submit"
              disabled={isLoading || !isValidSession}
              className="w-full py-4 px-6 bg-primary hover:bg-primary-dark disabled:bg-steel-400 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all touch-manipulation"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Updating password...
                </div>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        )}

        <div className="text-center">
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
