"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
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
    lastName: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    let isAuthenticating = false;

    authClient
      .getCurrentUser()
      .then((user) => {
        if (mounted) {
          setUser(user);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Auth initialization error:", error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      });

    const {
      data: { subscription },
    } = authClient.onAuthChange((newUser) => {
      if (mounted && !isAuthenticating) {
        setUser(newUser);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty deps - only run once on mount

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await authClient.signIn(email, password);
      const user = await authClient.getCurrentUser();
      if (user) {
        setUser(user);
        setLoading(false);
        router.push("/dashboard");
      } else {
        setLoading(false);
        throw new Error("Failed to get user after sign in");
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    await authClient.signUp(email, password, firstName, lastName);
    const user = await authClient.getCurrentUser();
    setUser(user);
    router.push("/dashboard");
  };

  const signOut = async () => {
    await authClient.signOut();
    setUser(null);
    router.push("/login");
  };

  const refreshUser = async () => {
    const user = await authClient.getCurrentUser();
    setUser(user);
  };

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
