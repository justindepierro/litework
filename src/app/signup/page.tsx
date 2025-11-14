"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRedirectIfAuthenticated } from "@/hooks/use-auth-guard";
import { validateEmail, validatePassword } from "@/lib/security";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";
import { Alert } from "@/components/ui/Alert";
import { PageLoading, ButtonLoading } from "@/components/ui/LoadingSpinner";

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

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<
    "weak" | "fair" | "good" | "strong" | null
  >(null);

  const { signUp } = useAuth();

  // Redirect to dashboard if already logged in
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

        // Validate invite is still active
        if (data.status !== "pending") {
          setInviteError("This invitation has already been used or cancelled.");
          setInviteLoading(false);
          return;
        }

        // Check expiration
        if (new Date(data.expiresAt) < new Date()) {
          setInviteError(
            "This invitation has expired. Please contact your coach for a new invitation."
          );
          setInviteLoading(false);
          return;
        }

        // Pre-fill form with invite data
        setInviteData(data);
        setFirstName(data.firstName);
        setLastName(data.lastName);
        setEmail(data.email);
        setInviteLoading(false);
      } catch (err) {
        console.error("Error loading invite:", err);
        setInviteError("Failed to load invitation. Please try again.");
        setInviteLoading(false);
      }
    };

    loadInviteData();
  }, [inviteId]);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailError("");
    setError("");

    if (value && value.includes("@")) {
      const validation = validateEmail(value);
      if (!validation.valid) {
        setEmailError(validation.error || "Invalid email");
      }
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordError("");
    setError("");

    if (value) {
      const validation = validatePassword(value);
      if (!validation.valid) {
        setPasswordError(validation.error || "Invalid password");
      }

      // Calculate password strength
      let strength: "weak" | "fair" | "good" | "strong" = "weak";
      if (
        value.length >= 12 &&
        /[A-Z]/.test(value) &&
        /[a-z]/.test(value) &&
        /[0-9]/.test(value) &&
        /[^A-Za-z0-9]/.test(value)
      ) {
        strength = "strong";
      } else if (
        value.length >= 10 &&
        /[A-Z]/.test(value) &&
        /[a-z]/.test(value) &&
        /[0-9]/.test(value)
      ) {
        strength = "good";
      } else if (
        value.length >= 8 &&
        /[A-Z]/.test(value) &&
        /[a-z]/.test(value)
      ) {
        strength = "fair";
      }
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(null);
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    setConfirmPasswordError("");
    setError("");

    if (value && value !== password) {
      setConfirmPasswordError("Passwords do not match");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    // Validate TOS acceptance
    if (!tosAccepted) {
      setError("You must accept the Terms of Service to create an account");
      setIsLoading(false);
      return;
    }

    // Validate all fields
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setEmailError(emailValidation.error || "Invalid email");
      setIsLoading(false);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setPasswordError(passwordValidation.error || "Invalid password");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!firstName.trim()) {
      setError("First name is required");
      setIsLoading(false);
      return;
    }

    if (!lastName.trim()) {
      setError("Last name is required");
      setIsLoading(false);
      return;
    }

    try {
      // Call signUp with inviteId if available
      const result = await signUp(
        email,
        password,
        firstName.trim(),
        lastName.trim(),
        inviteId || undefined
      );

      // Check if email confirmation is required
      if (result.needsEmailConfirmation) {
        setShowEmailConfirmation(true);
        setIsLoading(false);
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
          console.error("Failed to mark invite as accepted:", err);
          // Don't fail signup if this fails
        }
      }

      // Redirect to dashboard - signUp handles this automatically
      // router.push("/dashboard"); is called by signUp in AuthContext
    } catch (err) {
      console.error("Sign up error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking auth or invite
  if (authLoading || inviteLoading) {
    return <PageLoading />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Show email confirmation message instead of form */}
        {showEmailConfirmation ? (
          <div>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-10 w-10 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Check Your Email
              </h2>
              <p className="text-gray-600 mb-6">
                We&apos;ve sent a confirmation link to <strong>{email}</strong>
              </p>
              <Alert
                variant="info"
                title="Please confirm your email address"
                className="mb-6"
              >
                <p className="text-sm">
                  Click the link we sent you. Once confirmed, you&apos;ll be
                  able to log in and start using LiteWork.
                </p>
              </Alert>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Check your spam folder if you don&apos;t see the email</p>
                <p>• The link will expire in 24 hours</p>
                <p>
                  • After confirming, return to{" "}
                  <Link
                    href="/login"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div>
              <h2 className="mt-4 text-center text-3xl sm:text-4xl font-extrabold text-gray-900">
                {inviteData ? "Accept Your Invitation" : "Create Your Account"}
              </h2>
              {inviteData && (
                <p className="mt-3 text-center text-base sm:text-lg text-gray-600">
                  Welcome to LiteWork! Your coach has invited you to join.
                </p>
              )}
            </div>

            {/* Invite Error */}
            {inviteError && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Invitation Error
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{inviteError}</p>
                    </div>
                    <div className="mt-4">
                      <Link
                        href="/login"
                        className="text-sm font-medium text-red-800 hover:text-red-700"
                      >
                        Go to Login →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sign Up Form */}
            {!inviteError && (
              <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                <div className="rounded-md space-y-5">
                  {/* First Name */}
                  <FloatingLabelInput
                    id="first-name"
                    name="first-name"
                    type="text"
                    autoComplete="given-name"
                    required
                    disabled={!!inviteData}
                    label="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    inputSize="lg"
                    fullWidth
                  />

                  {/* Last Name */}
                  <FloatingLabelInput
                    id="last-name"
                    name="last-name"
                    type="text"
                    autoComplete="family-name"
                    required
                    disabled={!!inviteData}
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    inputSize="lg"
                    fullWidth
                  />

                  {/* Email */}
                  <FloatingLabelInput
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    disabled={!!inviteData?.email}
                    label="Email Address"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    error={emailError}
                    helperText={
                      inviteData?.email
                        ? "Email from your coach's invitation (cannot be changed)"
                        : undefined
                    }
                    inputSize="lg"
                    fullWidth
                  />

                  {/* Password */}
                  <div>
                    <FloatingLabelInput
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      label="Password (min 8 characters)"
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      error={passwordError}
                      inputSize="lg"
                      fullWidth
                    />
                    {passwordStrength && !passwordError && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              passwordStrength === "weak"
                                ? "w-1/4 bg-red-500"
                                : passwordStrength === "fair"
                                  ? "w-2/4 bg-yellow-500"
                                  : passwordStrength === "good"
                                    ? "w-3/4 bg-blue-500"
                                    : "w-full bg-green-500"
                            }`}
                          />
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            passwordStrength === "weak"
                              ? "text-red-600"
                              : passwordStrength === "fair"
                                ? "text-yellow-600"
                                : passwordStrength === "good"
                                  ? "text-blue-600"
                                  : "text-green-600"
                          }`}
                        >
                          {passwordStrength.charAt(0).toUpperCase() +
                            passwordStrength.slice(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <FloatingLabelInput
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    label="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) =>
                      handleConfirmPasswordChange(e.target.value)
                    }
                    error={confirmPasswordError}
                    inputSize="lg"
                    fullWidth
                  />
                </div>

                {/* Terms of Service */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="tos"
                    checked={tosAccepted}
                    onChange={(e) => setTosAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 text-primary border-silver-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="tos" className="text-sm text-gray-700">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      target="_blank"
                      className="text-primary hover:text-primary-dark underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      target="_blank"
                      className="text-primary hover:text-primary-dark underline"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isLoading || !tosAccepted}
                    className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                          <ButtonLoading className="text-white" />
                        </span>
                        Creating account...
                      </>
                    ) : inviteData ? (
                      "Accept Invitation & Create Account"
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </div>

                {/* Login Link */}
                <div className="text-center">
                  <p className="text-base text-gray-600">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      Log in
                    </Link>
                  </p>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <SignUpForm />
    </Suspense>
  );
}
