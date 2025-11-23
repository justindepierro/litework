"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRedirectIfAuthenticated } from "@/hooks/use-auth-guard";
import { validateEmail } from "@/lib/security";
import { RateLimitError } from "@/components/ui/RateLimitError";
import { Alert } from "@/components/ui/Alert";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { Display, Body, Label } from "@/components/ui/Typography";
import { Form, FormField, FormSubmitButton } from "@/components/ui/Form";
import { validationRules } from "@/lib/form-validation";
import { CenteredContainer } from "@/components/layout/PageContainer";

export default function LoginPage() {
  const [submitError, setSubmitError] = useState("");
  const [isRateLimited, setIsRateLimited] = useState(false);
  const { signIn } = useAuth();

  // Redirect to dashboard if already logged in
  const { isLoading: authLoading } = useRedirectIfAuthenticated();

  const handleSubmit = async (values: Record<string, any>) => {
    setSubmitError("");
    setIsRateLimited(false);

    try {
      await signIn(values.email, values.password);
      // AuthContext will handle redirect to /dashboard
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Invalid email or password";

      // Check if it's a rate limit error
      if (errorMessage.includes("Too many")) {
        setIsRateLimited(true);
        setSubmitError(errorMessage);
      } else {
        setSubmitError(errorMessage);
      }
    }
  };

  // Show loading while checking auth status
  if (authLoading) {
    return <PageLoading />;
  }

  return (
    <CenteredContainer maxWidth="4xl">
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center">
          <Display size="lg" className="mb-2">
            Welcome Back
          </Display>
          <Body variant="secondary" className="mt-2">
            Sign in to track your workouts
          </Body>
        </div>

        <Form
          onSubmit={handleSubmit}
          initialValues={{ email: "", password: "" }}
          validation={{
            email: {
              required: "Email is required",
              custom: (value: any) => {
                const validation = validateEmail(value);
                return validation.valid
                  ? undefined
                  : validation.error || "Invalid email";
              },
            },
            password: validationRules.required("Password is required"),
          }}
          validateOnBlur={true}
          className="space-y-6"
        >
          <FormField
            name="email"
            label="Email address"
            type="email"
            required
            fullWidth
            inputSize="lg"
            disabled={isRateLimited}
          />

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="password" className="block text-base sm:text-sm">
                Password
              </Label>
              <Link
                href="/reset-password"
                className="text-sm text-(--accent-blue-600) hover:text-(--accent-blue-700) font-[var(--font-weight-medium)] touch-manipulation"
              >
                Forgot password?
              </Link>
            </div>
            <FormField
              name="password"
              label="Password"
              type="password"
              required
              fullWidth
              inputSize="lg"
              disabled={isRateLimited}
            />
          </div>

          {isRateLimited && submitError ? (
            <RateLimitError error={submitError} />
          ) : submitError ? (
            <Alert variant="error">{submitError}</Alert>
          ) : null}

          <FormSubmitButton
            fullWidth
            loadingText="Signing in..."
            disabled={isRateLimited}
            className="py-4 px-6 text-lg font-[var(--font-weight-bold)] rounded-xl shadow-lg hover:shadow-xl"
          >
            Sign in
          </FormSubmitButton>
        </Form>

        <div className="text-center">
          <Link
            href="/"
            className="text-(--text-secondary) text-base sm:text-sm hover:text-(--accent-blue-600) transition-colors font-[var(--font-weight-medium)] touch-manipulation inline-block py-2 px-4 rounded-lg"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </CenteredContainer>
  );
}
