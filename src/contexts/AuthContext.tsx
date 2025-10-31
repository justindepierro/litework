"use client";

import { User } from "@/types";
import { 
  signInWithEmailPassword, 
  signOut, 
  getCurrentUser,
  onAuthStateChange,
  AuthenticatedUser
} from "@/lib/supabase-auth";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // Only run on client side
      if (typeof window === "undefined") {
        setIsLoading(false);
        return;
      }

      try {
        // Check current Supabase auth state
        const authResult = await getCurrentUser();
        if (authResult.success && authResult.user) {
          // Convert Supabase user to our User type
          const appUser: User = convertToAppUser(authResult.user);
          setUser(appUser);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      }

      setIsLoading(false);
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = onAuthStateChange((supabaseUser) => {
      if (supabaseUser) {
        const appUser = convertToAppUser(supabaseUser);
        setUser(appUser);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await signInWithEmailPassword(email, password);
      
      if (result.success && result.user) {
        const appUser = convertToAppUser(result.user);
        setUser(appUser);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Helper function to convert Supabase user to app User type
function convertToAppUser(supabaseUser: AuthenticatedUser): User {
  return {
    id: supabaseUser.userId,
    email: supabaseUser.email,
    name: supabaseUser.name || supabaseUser.email,
    role: supabaseUser.role,
    groupIds: [], // Will be populated from database if needed
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
