'use client';

import * as React from 'react';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

const MOCK_USER: AuthUser = {
  id: 'mock-user-1',
  email: 'user@example.com',
  name: 'Demo User',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(MOCK_USER);
  const [isLoading, setIsLoading] = React.useState(false);

  const signOut = React.useCallback(async () => {
    setIsLoading(true);
    setUser(null);
    setIsLoading(false);
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
