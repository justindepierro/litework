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

      console.log("[AUTH] Initializing authentication...");

      // Set a timeout to prevent infinite loading (5 seconds should be enough)
      const timeout = setTimeout(() => {
        console.warn(
          "[AUTH] Authentication initialization taking longer than expected"
        );
        if (mountedRef.current) {
          console.log(
            "[AUTH] Proceeding without authentication - user can login manually"
          );
          setUser(null);
          setLoading(false);
          setInitializing(false);
          initializingRef.current = false;
        }
      }, 5000); // 5 second timeout (should be plenty for local dev)

      try {
        const currentUser = await authClient.getCurrentUser();
        clearTimeout(timeout);
        console.log(
          "[AUTH] Current user:",
          currentUser ? `Found (${currentUser.email})` : "Not found"
        );
        if (mountedRef.current) {
          setUser(currentUser);
          setLoading(false);
          setInitializing(false);
          initializingRef.current = false;
        }
      } catch (error) {
        clearTimeout(timeout);
        console.error("[AUTH] Auth initialization error:", error);
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
          console.log("[AUTH] User session started:", newUser.email);
        } else if (newUser && previousUser && newUser.id !== previousUser.id) {
          console.log(
            "[AUTH] User session changed from",
            previousUser.email,
            "to",
            newUser.email
          );
        }

        // If user logged out elsewhere, redirect to login
        if (!newUser && !initializingRef.current) {
          console.log("[AUTH] Redirecting to login page");
          router.push("/login");
        }
      }
    });

    // Set up periodic session refresh to prevent expiry
    const refreshInterval = setInterval(
      async () => {
        if (
          mountedRef.current &&
          userRef.current &&
          !authOperationInProgress.current
        ) {
          try {
            // Refresh session every 4 hours (tokens expire after 1 hour by default, but are auto-refreshed)
            console.log("[AUTH] Refreshing session...");
            await authClient.refreshSession();
            console.log("[AUTH] Session refreshed successfully");
          } catch (error) {
            console.error("[AUTH] Failed to refresh session:", error);
          }
        }
      },
      4 * 60 * 60 * 1000
    ); // 4 hours

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]); // Run once on mount, user tracked via userRef

  // Sign in with proper state management
  const signIn = useCallback(
    async (email: string, password: string) => {
      if (authOperationInProgress.current) {
        throw new Error("Authentication operation already in progress");
      }

      authOperationInProgress.current = true;
      setLoading(true);

      try {
        // Sign in with Supabase
        await authClient.signIn(email, password);

        // Get fresh user data
        const currentUser = await authClient.getCurrentUser();

        if (!currentUser) {
          throw new Error(
            "Authentication succeeded but failed to retrieve user data"
          );
        }

        if (mountedRef.current) {
          setUser(currentUser);
          setLoading(false);
        }

        // Navigate to dashboard
        router.push("/dashboard");
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

        router.push("/dashboard");
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
