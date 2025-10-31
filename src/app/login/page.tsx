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
    <div className="min-h-screen flex items-center justify-center bg-gradient-primary container-responsive py-8 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h2 className="text-heading-primary text-3xl sm:text-2xl font-bold mb-2">
            Welcome Back
          </h2>
          <p className="mt-2 text-body-secondary text-base sm:text-sm">
            Sign in to track your workouts
          </p>

          {/* Enhanced mobile-first demo credentials */}
          {demoCredentials.length > 0 && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mt-6 space-y-3">
              <p className="text-sm font-bold text-navy-700">
                Demo Credentials:
              </p>
              <div className="space-y-2">
                {demoCredentials.map((cred, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => fillDemoCredentials(cred)}
                    className="w-full text-left bg-white hover:bg-blue-50 px-4 py-3 rounded-xl border border-blue-200 transition-all touch-manipulation shadow-sm hover:shadow-md"
                  >
                    <div className="font-bold text-navy-700 text-sm">
                      {cred.role}
                    </div>
                    <div className="text-body-secondary text-xs">
                      {cred.email}
                    </div>
                    <div className="text-xs text-silver-600 mt-1">
                      {cred.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
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
              className="w-full px-4 py-4 sm:px-3 sm:py-3 border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white touch-manipulation"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-body-primary block text-base sm:text-sm font-medium mb-2"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-4 sm:px-3 sm:py-3 border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white touch-manipulation"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
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
