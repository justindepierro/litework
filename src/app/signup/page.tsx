"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRedirectIfAuthenticated } from "@/hooks/use-auth-guard";
import { validateEmail, validatePassword } from "@/lib/security";
import { Alert } from "@/components/ui/Alert";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { Heading, Body, Caption } from "@/components/ui/Typography";
import {
  Form,
  FormField,
  FormCheckbox,
  FormSubmitButton,
} from "@/components/ui/Form";
import { validationRules } from "@/lib/form-validation";
import { CenteredContainer } from "@/components/layout/PageContainer";

interface InviteData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  expiresAt: string;
  status: string;
}

function SignUpForm() {
  const searchParams = useSearchParams();
  const inviteId = searchParams.get("invite");

  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [inviteLoading, setInviteLoading] = useState(true);
  const [inviteError, setInviteError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<
    "weak" | "fair" | "good" | "strong" | null
  >(null);

  const { signUp } = useAuth();
  const { isLoading: authLoading } = useRedirectIfAuthenticated();

  // Load invite data if invite ID is provided
  useEffect(() => {
    const loadInviteData = async () => {
      if (!inviteId) {
        setInviteLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/invites/${inviteId}`);

        if (!response.ok) {
          if (response.status === 404) {
            setInviteError(
              "Invitation not found. It may have expired or been cancelled."
            );
          } else if (response.status === 410) {
            setInviteError(
              "This invitation has expired. Please contact your coach for a new invitation."
            );
          } else {
            setInviteError(
              "Failed to load invitation. Please contact your coach."
            );
          }
          setInviteLoading(false);
          return;
        }

        const data = await response.json();

        if (data.status !== "pending") {
          setInviteError("This invitation has already been used or cancelled.");
          setInviteLoading(false);
          return;
        }

        if (new Date(data.expiresAt) < new Date()) {
          setInviteError(
            "This invitation has expired. Please contact your coach for a new invitation."
          );
          setInviteLoading(false);
          return;
        }

        setInviteData(data);
        setInviteLoading(false);
      } catch (err) {
        console.error("Error loading invite:", err);
        setInviteError("Failed to load invitation. Please try again.");
        setInviteLoading(false);
      }
    };

    loadInviteData();
  }, [inviteId]);

  const calculatePasswordStrength = (password: string) => {
    if (!password) return null;

    if (
      password.length >= 12 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    ) {
      return "strong";
    } else if (
      password.length >= 10 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password)
    ) {
      return "good";
    } else if (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password)
    ) {
      return "fair";
    }
    return "weak";
  };

  const handleSubmit = async (values: Record<string, any>) => {
    setSubmitError("");

    try {
      const result = await signUp(
        values.email,
        values.password,
        values.firstName.trim(),
        values.lastName.trim(),
        inviteId || undefined
      );

      if (result.needsEmailConfirmation) {
        setShowEmailConfirmation(true);
        return;
      }

      // If signing up from an invite, mark it as accepted
      if (inviteId) {
        try {
          await fetch(`/api/invites/${inviteId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "accepted" }),
          });
        } catch (err) {
          console.error("Failed to update invite status:", err);
        }
      }

      // AuthContext will handle redirect to /dashboard
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred during sign up";
      setSubmitError(errorMessage);
    }
  };

  if (authLoading || inviteLoading) {
    return <PageLoading />;
  }

  if (showEmailConfirmation) {
    return (
      <CenteredContainer background="gradient">
        <div className="w-full max-w-md mx-auto text-center space-y-6 bg-(--bg-surface) p-8 rounded-xl shadow-xl">
          <div className="w-16 h-16 bg-(--status-success-light) text-(--status-success) rounded-full flex items-center justify-center mx-auto text-3xl">
            ✓
          </div>
          <Heading level="h2">Check Your Email</Heading>
          <Body variant="secondary">
            We&apos;ve sent a confirmation link to your email address. Please
            check your inbox and click the link to verify your account.
          </Body>
          <Body variant="secondary" className="text-sm">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <Link
              href="/support"
              className="text-(--accent-blue-600) hover:text-(--accent-blue-700) font-[var(--font-weight-medium)]"
            >
              contact support
            </Link>
            .
          </Body>
          <Link
            href="/"
            className="inline-block text-(--text-secondary) hover:text-(--accent-blue-600) font-[var(--font-weight-medium)] transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </CenteredContainer>
    );
  }

  return (
    <CenteredContainer background="gradient">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Heading level="h2" className="mb-2">
            {inviteData
              ? `Welcome, ${inviteData.firstName}!`
              : "Create Your Account"}
          </Heading>
          <Body variant="secondary">
            {inviteData
              ? "Complete your profile to get started"
              : "Join us to track your workouts and progress"}
          </Body>
        </div>

        {inviteError && (
          <Alert variant="error">
            <div>
              <Body className="font-[var(--font-weight-semibold)] mb-1">
                Invitation Error
              </Body>
              <Caption>{inviteError}</Caption>
              <Link
                href="/"
                className="inline-block mt-3 text-(--accent-blue-600) hover:text-(--accent-blue-700) font-[var(--font-weight-medium)]"
              >
                ← Return home
              </Link>
            </div>
          </Alert>
        )}

        {!inviteError && (
          <Form
            onSubmit={handleSubmit}
            initialValues={{
              firstName: inviteData?.firstName || "",
              lastName: inviteData?.lastName || "",
              email: inviteData?.email || "",
              password: "",
              confirmPassword: "",
              tosAccepted: false,
            }}
            validation={{
              firstName: validationRules.required("First name is required"),
              lastName: validationRules.required("Last name is required"),
              email: {
                required: "Email is required",
                custom: (value: any) => {
                  const validation = validateEmail(value);
                  return validation.valid
                    ? undefined
                    : validation.error || "Invalid email";
                },
              },
              password: {
                required: "Password is required",
                custom: (value: any) => {
                  const validation = validatePassword(value);
                  setPasswordStrength(calculatePasswordStrength(value));
                  return validation.valid
                    ? undefined
                    : validation.error || "Invalid password";
                },
              },
              confirmPassword: {
                required: "Please confirm your password",
                custom: (value: any, allValues: Record<string, any>) => {
                  if (value !== allValues.password) {
                    return "Passwords do not match";
                  }
                  return undefined;
                },
              },
              tosAccepted: {
                custom: (value: any) => {
                  if (!value) {
                    return "You must accept the Terms of Service";
                  }
                  return undefined;
                },
              },
            }}
            validateOnBlur={true}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="firstName"
                label="First Name"
                type="text"
                required
                fullWidth
                inputSize="lg"
                disabled={!!inviteData}
              />
              <FormField
                name="lastName"
                label="Last Name"
                type="text"
                required
                fullWidth
                inputSize="lg"
                disabled={!!inviteData}
              />
            </div>

            <FormField
              name="email"
              label="Email address"
              type="email"
              required
              fullWidth
              inputSize="lg"
              disabled={!!inviteData}
            />

            <div>
              <FormField
                name="password"
                label="Password"
                type="password"
                required
                fullWidth
                inputSize="lg"
                helperText="Must be at least 8 characters with uppercase, lowercase, and number"
              />
              {passwordStrength && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <Caption variant="muted">Password Strength:</Caption>
                    <Caption
                      className={
                        passwordStrength === "strong"
                          ? "text-(--status-success) font-[var(--font-weight-semibold)]"
                          : passwordStrength === "good"
                            ? "text-(--accent-blue-600) font-[var(--font-weight-semibold)]"
                            : passwordStrength === "fair"
                              ? "text-(--status-warning) font-[var(--font-weight-semibold)]"
                              : "text-(--status-error) font-[var(--font-weight-semibold)]"
                      }
                    >
                      {passwordStrength.charAt(0).toUpperCase() +
                        passwordStrength.slice(1)}
                    </Caption>
                  </div>
                  <div className="flex gap-1 h-1.5">
                    <div
                      className={`flex-1 rounded-full ${
                        passwordStrength === "weak"
                          ? "bg-(--status-error)"
                          : passwordStrength === "fair"
                            ? "bg-(--status-warning)"
                            : passwordStrength === "good"
                              ? "bg-(--accent-blue-500)"
                              : "bg-(--status-success)"
                      }`}
                    />
                    <div
                      className={`flex-1 rounded-full ${
                        passwordStrength === "fair" ||
                        passwordStrength === "good" ||
                        passwordStrength === "strong"
                          ? passwordStrength === "fair"
                            ? "bg-(--status-warning)"
                            : passwordStrength === "good"
                              ? "bg-(--accent-blue-500)"
                              : "bg-(--status-success)"
                          : "bg-(--bg-tertiary)"
                      }`}
                    />
                    <div
                      className={`flex-1 rounded-full ${
                        passwordStrength === "good" ||
                        passwordStrength === "strong"
                          ? passwordStrength === "good"
                            ? "bg-(--accent-blue-500)"
                            : "bg-(--status-success)"
                          : "bg-(--bg-tertiary)"
                      }`}
                    />
                    <div
                      className={`flex-1 rounded-full ${
                        passwordStrength === "strong"
                          ? "bg-(--status-success)"
                          : "bg-(--bg-tertiary)"
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>

            <FormField
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              required
              fullWidth
              inputSize="lg"
            />

            <FormCheckbox
              name="tosAccepted"
              label="I agree to the Terms of Service and Privacy Policy"
            />

            {submitError && <Alert variant="error">{submitError}</Alert>}

            <FormSubmitButton
              fullWidth
              loadingText="Creating account..."
              className="py-4 px-6 text-lg font-[var(--font-weight-bold)] rounded-xl shadow-lg hover:shadow-xl"
            >
              Create Account
            </FormSubmitButton>
          </Form>
        )}

        <div className="text-center">
          <Body variant="secondary" className="mb-2">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-(--accent-blue-600) hover:text-(--accent-blue-700) font-[var(--font-weight-medium)]"
            >
              Sign in
            </Link>
          </Body>
          <Link
            href="/"
            className="inline-block text-(--text-secondary) hover:text-(--accent-blue-600) font-[var(--font-weight-medium)] transition-colors py-2 px-4 rounded-lg"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </CenteredContainer>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <SignUpForm />
    </Suspense>
  );
}
