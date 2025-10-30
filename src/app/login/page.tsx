"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [demoCredentials, setDemoCredentials] = useState<
    Array<{
      role: string;
      email: string;
      password: string;
      description: string;
    }>
  >([]);
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Load demo credentials
    const loadDemoCredentials = async () => {
      try {
        const response = await apiClient.getDemoCredentials();
        if (response.success && response.data) {
          const data = response.data as {
            demoCredentials?: Array<{
              role: string;
              email: string;
              password: string;
              description: string;
            }>;
          };
          if (data.demoCredentials) {
            setDemoCredentials(data.demoCredentials);
          }
        }
      } catch (error) {
        console.error("Failed to load demo credentials:", error);
      }
    };
    loadDemoCredentials();
  }, []);

  const fillDemoCredentials = (credential: {
    email: string;
    password: string;
  }) => {
    setEmail(credential.email);
    setPassword(credential.password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const success = await login(email, password);

    if (success) {
      router.push("/dashboard");
    } else {
      setError("Invalid email or password");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-primary container-responsive py-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h2 className="text-heading-primary text-2xl sm:text-3xl">
            Welcome Back
          </h2>
          <p className="mt-2 text-body-secondary text-sm">
            Sign in to track your workouts
          </p>

          {/* Demo Credentials */}
          {demoCredentials.length > 0 && (
            <div className="status-info mt-3 space-y-2">
              <p className="text-xs font-medium">Demo Credentials:</p>
              {demoCredentials.map((cred, index) => (
                <div key={index} className="text-left">
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials(cred)}
                    className="text-xs bg-silver-100 hover:bg-silver-200 px-2 py-1 rounded w-full text-left transition-colors"
                  >
                    <div className="font-medium text-navy-600">{cred.role}</div>
                    <div className="text-body-secondary">{cred.email}</div>
                    <div className="text-xs text-silver-600">
                      {cred.description}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="text-body-primary block text-sm font-medium mb-1"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-3 border border-color-border-primary rounded-lg text-color-text-primary placeholder-color-text-tertiary focus:outline-none focus:ring-2 focus:ring-color-border-focus focus:border-color-border-focus text-base bg-color-bg-surface"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-body-primary block text-sm font-medium mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-3 border border-color-border-primary rounded-lg text-color-text-primary placeholder-color-text-tertiary focus:outline-none focus:ring-2 focus:ring-color-border-focus focus:border-color-border-focus text-base bg-color-bg-surface"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="status-error">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
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
            className="text-body-secondary text-sm hover:text-accent-blue transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
