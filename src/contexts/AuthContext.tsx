"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import * as authClient from "@/lib/auth-client";
import {
  generateCorrelationId,
  logAuthEvent,
  checkAuthHealth,
  AuthTimer,
} from "@/lib/auth-logger";

type User = authClient.User;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    inviteId?: string
  ) => Promise<{ needsEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const router = useRouter();

  // Refs to prevent race conditions
  const mountedRef = useRef(true);
  const authOperationInProgress = useRef(false);
  const hasInitialized = useRef(false);
  const initializingRef = useRef(initializing);
  const userRef = useRef<User | null>(user);

  useEffect(() => {
    initializingRef.current = initializing;
  }, [initializing]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Initialize auth on mount
  useEffect(() => {
    mountedRef.current = true;

    const initAuth = async () => {
      // Prevent multiple initializations
      if (hasInitialized.current) return;
      hasInitialized.current = true;
      initializingRef.current = true;

      const correlationId = generateCorrelationId();
      const timer = new AuthTimer(correlationId, "init");

      logAuthEvent(
        correlationId,
        "info",
        "init",
        "Initializing authentication system"
      );

      // Run health check first
      try {
        const healthCheck = await checkAuthHealth();

        if (!healthCheck.healthy) {
          logAuthEvent(
            correlationId,
            "warn",
            "init",
            "Auth system health check failed",
            {
              checks: healthCheck.checks,
              errors: healthCheck.errors,
            }
          );

          // Show warnings in console for debugging
          healthCheck.errors.forEach((error) => {
            console.warn(`[AUTH_HEALTH] ${error}`);
          });
        } else {
          logAuthEvent(
            correlationId,
            "debug",
            "init",
            "Auth system health check passed",
            {
              checks: healthCheck.checks,
            }
          );
        }
      } catch (error) {
        logAuthEvent(
          correlationId,
          "warn",
          "init",
          "Health check failed but continuing",
          { error }
        );
      }

      // Set a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        logAuthEvent(
          correlationId,
          "warn",
          "timeout",
          "Authentication initialization timeout - proceeding without auth"
        );

        if (mountedRef.current) {
          setUser(null);
          setLoading(false);
          setInitializing(false);
          initializingRef.current = false;
        }
      }, 5000);

      try {
        logAuthEvent(correlationId, "debug", "init", "Fetching current user");

        const currentUser = await authClient.getCurrentUser();
        clearTimeout(timeout);

        timer.end(
          currentUser ? "User session restored" : "No existing session",
          { userId: currentUser?.id, email: currentUser?.email }
        );

        if (mountedRef.current) {
          setUser(currentUser);
          setLoading(false);
          setInitializing(false);
          initializingRef.current = false;
        }
      } catch (error) {
        clearTimeout(timeout);
        timer.error("Auth initialization failed", error);

        if (mountedRef.current) {
          setUser(null);
          setLoading(false);
          setInitializing(false);
          initializingRef.current = false;
        }
      }
    };

    initAuth();

    // Listen for auth state changes (logout, session expiry, etc.)
    const {
      data: { subscription },
    } = authClient.onAuthChange((newUser) => {
      // Ignore auth changes during active operations (sign in/up/out)
      if (!authOperationInProgress.current && mountedRef.current) {
        const previousUser = user;
        setUser(newUser);

        // Log session changes for debugging
        if (previousUser && !newUser) {
          console.warn("[AUTH] User session ended - possible logout or expiry");
        } else if (!previousUser && newUser) {
          // User session started
        } else if (newUser && previousUser && newUser.id !== previousUser.id) {
          console.warn(
            "[AUTH] User session changed - security alert",
            previousUser.email,
            "->",
            newUser.email
          );
        }

        // If user logged out elsewhere, redirect to login
        if (!newUser && !initializingRef.current) {
          // [REMOVED] console.log("[AUTH] Redirecting to login page");
          router.push("/login");
        }
      }
    });

    // Set up periodic session refresh to prevent expiry
    // Supabase tokens expire after 1 hour, so refresh every 30 minutes
    const refreshInterval = setInterval(
      async () => {
        if (
          mountedRef.current &&
          userRef.current &&
          !authOperationInProgress.current
        ) {
          try {
            console.log("[AUTH] Refreshing session...");
            await authClient.refreshSession();
            console.log("[AUTH] Session refreshed successfully");
          } catch (error) {
            console.error("[AUTH] Failed to refresh session:", error);
            // If refresh fails, try to get current user
            try {
              const currentUser = await authClient.getCurrentUser();
              if (!currentUser && mountedRef.current) {
                console.error("[AUTH] Session expired, redirecting to login");
                router.push("/login");
              }
            } catch (e) {
              console.error("[AUTH] Failed to verify user session:", e);
            }
          }
        }
      },
      30 * 60 * 1000
    ); // 30 minutes (half of token lifetime)

    // Refresh session when app becomes visible (mobile PWA support)
    const handleVisibilityChange = async () => {
      if (
        document.visibilityState === "visible" &&
        mountedRef.current &&
        userRef.current &&
        !authOperationInProgress.current
      ) {
        try {
          console.log("[AUTH] App became visible, refreshing session...");
          await authClient.refreshSession();
          // Refresh user data to ensure we have latest info
          const currentUser = await authClient.getCurrentUser();
          if (mountedRef.current && currentUser) {
            setUser(currentUser);
          }
        } catch (error) {
          console.error(
            "[AUTH] Failed to refresh session on visibility change:",
            error
          );
        }
      }
    };

    // Listen for visibility changes (app switching, screen lock, etc.)
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
      clearInterval(refreshInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]); // Run once on mount, user tracked via userRef

  // Sign in with proper state management
  const signIn = useCallback(
    async (email: string, password: string) => {
      const correlationId = generateCorrelationId();

      if (authOperationInProgress.current) {
        logAuthEvent(
          correlationId,
          "warn",
          "sign_in",
          "Auth operation already in progress"
        );
        throw new Error("Authentication operation already in progress");
      }

      authOperationInProgress.current = true;
      setLoading(true);

      try {
        logAuthEvent(
          correlationId,
          "info",
          "sign_in",
          "Starting sign in process",
          { email }
        );

        // Sign in with Supabase
        await authClient.signIn(email, password);

        logAuthEvent(
          correlationId,
          "debug",
          "sign_in",
          "Sign in successful, fetching user data"
        );

        // Get fresh user data
        const currentUser = await authClient.getCurrentUser();

        if (!currentUser) {
          logAuthEvent(
            correlationId,
            "error",
            "sign_in",
            "Failed to retrieve user data after successful auth"
          );
          throw new Error(
            "Authentication succeeded but failed to retrieve user data"
          );
        }

        if (mountedRef.current) {
          setUser(currentUser);
          setLoading(false);
        }

        logAuthEvent(
          correlationId,
          "info",
          "sign_in",
          "Sign in complete, navigating to dashboard",
          {
            userId: currentUser.id,
          }
        );

        // Navigate to dashboard
        router.push("/dashboard");
      } catch (error) {
        logAuthEvent(correlationId, "error", "sign_in", "Sign in failed", {
          error,
        });

        if (mountedRef.current) {
          setLoading(false);
        }
        throw error;
      } finally {
        authOperationInProgress.current = false;
      }
    },
    [router]
  );

  // Sign up with proper state management
  const signUp = useCallback(
    async (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
      inviteId?: string
    ): Promise<{ needsEmailConfirmation?: boolean }> => {
      if (authOperationInProgress.current) {
        throw new Error("Authentication operation already in progress");
      }

      authOperationInProgress.current = true;
      setLoading(true);

      try {
        const result = await authClient.signUp(
          email,
          password,
          firstName,
          lastName,
          inviteId
        );

        // If email confirmation is required, don't try to load user or navigate
        if (result.needsEmailConfirmation) {
          if (mountedRef.current) {
            setLoading(false);
          }
          return { needsEmailConfirmation: true };
        }

        // Wait a moment for the user profile to be created in the database
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const currentUser = await authClient.getCurrentUser();

        if (!currentUser) {
          throw new Error("Sign up succeeded but failed to retrieve user data");
        }

        if (mountedRef.current) {
          setUser(currentUser);
          setLoading(false);
        }

        // Redirect to setup page for new accounts to show sync progress
        router.push("/setup");
        return {};
      } catch (error) {
        if (mountedRef.current) {
          setLoading(false);
        }
        throw error;
      } finally {
        authOperationInProgress.current = false;
      }
    },
    [router]
  );

  // Sign out with proper cleanup
  const signOut = useCallback(async () => {
    if (authOperationInProgress.current) {
      return; // Ignore duplicate sign out attempts
    }

    authOperationInProgress.current = true;

    try {
      await authClient.signOut();

      if (mountedRef.current) {
        setUser(null);
        setLoading(false);
      }

      router.push("/login");
    } catch (error) {
      console.error("Sign out error:", error);
      // Still clear local state and redirect even if API call fails
      if (mountedRef.current) {
        setUser(null);
        setLoading(false);
      }
      router.push("/login");
    } finally {
      authOperationInProgress.current = false;
    }
  }, [router]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authClient.getCurrentUser();
      if (mountedRef.current) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error("Refresh user error:", error);
      if (mountedRef.current) {
        setUser(null);
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signOut, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
