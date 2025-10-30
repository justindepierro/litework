"use client";

import { User } from "@/types";
import { apiClient } from "@/lib/api-client";
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
      // Check for stored auth token and validate
      const token = localStorage.getItem("auth-token");
      if (token) {
        // Set token in API client
        apiClient.setToken(token);

        // For now, create a mock user based on stored token
        // In production, you'd validate the token with the backend
        const mockUser: User = {
          id: "1",
          email: "coach@example.com",
          name: "Coach Smith",
          role: "coach",
          groupIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setUser(mockUser);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiClient.login(email, password);

      if (response.success && response.data?.user) {
        setUser(response.data.user as User);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    apiClient.logout();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
