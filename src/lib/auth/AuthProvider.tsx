"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";

export type UserRole = "admin" | "reviewer" | "viewer";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  companyName?: string | null;
}

export interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyName?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * AuthProvider — Section 74.
 * Wraps the app with authentication context.
 * Firebase-ready authentication stub supporting login and signup.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      setUser({
        uid: "stub-uid",
        email,
        displayName: email.split("@")[0],
        photoURL: null,
        role: "admin",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (data: SignUpData) => {
    setLoading(true);
    try {
      setUser({
        uid: "stub-uid-" + Date.now(),
        email: data.email,
        displayName: `${data.firstName} ${data.lastName}`.trim(),
        photoURL: null,
        role: "admin",
        companyName: data.companyName ?? null,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<string | null> => {
    return null;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role ?? null,
      loading,
      signIn,
      signUp,
      signOut,
      refreshToken,
    }),
    [user, loading, signIn, signUp, signOut, refreshToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
