"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRedirectIfAuthenticated } from "@/hooks/use-auth-guard";
import { validateEmail, validatePassword } from "@/lib/security";

interface InviteData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  expires_at: string;
  status: string;
}

export default function SignUpPage() {
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
            setInviteError("Invitation not found. It may have expired or been cancelled.");
          } else if (response.status === 410) {
            setInviteError("This invitation has expired. Please contact your coach for a new invitation.");
          } else {
            setInviteError("Failed to load invitation. Please contact your coach.");
          }
          setInviteLoading(false);
          return;
        }

        const data = await response.json();
        
        // Validate invite is still active
        if (data.status !== 'pending') {
          setInviteError("This invitation has already been used or cancelled.");
          setInviteLoading(false);
          return;
        }

        // Check expiration
        if (new Date(data.expires_at) < new Date()) {
          setInviteError("This invitation has expired. Please contact your coach for a new invitation.");
          setInviteLoading(false);
          return;
        }

        // Pre-fill form with invite data
        setInviteData(data);
        setFirstName(data.first_name);
        setLastName(data.last_name);
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
      // Call signUp with 4 separate parameters as expected by AuthContext
      await signUp(email, password, firstName.trim(), lastName.trim());

      // If signing up from an invite, mark it as accepted
      if (inviteId) {
        try {
          await fetch(`/api/invites/${inviteId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'accepted' }),
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
        err instanceof Error ? err.message : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking auth or invite
  if (authLoading || inviteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {inviteData ? "Accept Your Invitation" : "Create Your Account"}
          </h2>
          {inviteData && (
            <p className="mt-2 text-center text-sm text-gray-600">
              Welcome to LiteWork! Your coach has invited you to join.
            </p>
          )}
        </div>

        {/* Invite Error */}
        {inviteError && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Invitation Error</h3>
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
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              {/* First Name */}
              <div>
                <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  id="first-name"
                  name="first-name"
                  type="text"
                  autoComplete="given-name"
                  required
                  disabled={!!inviteData}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="First Name"
                />
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  id="last-name"
                  name="last-name"
                  type="text"
                  autoComplete="family-name"
                  required
                  disabled={!!inviteData}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Last Name"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={!!inviteData}
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Email address"
                />
                {emailError && (
                  <p className="mt-1 text-sm text-red-600">{emailError}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password (min 8 characters)"
                />
                {passwordError && (
                  <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm password"
                />
                {confirmPasswordError && (
                  <p className="mt-1 text-sm text-red-600">{confirmPasswordError}</p>
                )}
              </div>
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
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    </span>
                    Creating account...
                  </>
                ) : (
                  inviteData ? "Accept Invitation & Create Account" : "Create Account"
                )}
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
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
      </div>
    </div>
  );
}
