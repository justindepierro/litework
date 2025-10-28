'use client';

import { User } from '@/types';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
      const token = localStorage.getItem('auth-token');
      if (token) {
        // In a real app, validate the token with your backend
        // For now, we'll create a mock user
        const mockUser: User = {
          id: '1',
          email: 'coach@example.com',
          name: 'Coach Smith',
          role: 'coach',
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
      // Mock login - replace with actual API call
      if (email === 'coach@example.com' && password === 'password') {
        const mockUser: User = {
          id: '1',
          email: 'coach@example.com',
          name: 'Coach Smith',
          role: 'coach',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setUser(mockUser);
        localStorage.setItem('auth-token', 'mock-token');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth-token');
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}