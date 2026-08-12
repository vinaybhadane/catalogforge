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
}

interface AuthContextValue {
  user: AuthUser | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * AuthProvider — Section 74.
 *
 * Wraps the app with authentication context.
 * Currently provides a stub implementation ready for Firebase connect.
 * When Firebase is integrated, replace the signIn/signOut methods with
 * firebase.auth().signInWithEmailAndPassword() etc.
 *
 * Section 12: Frontend role checks are only for UX — backend authorization
 * remains authoritative.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, check for existing session
  useEffect(() => {
    // Firebase onAuthStateChanged stub
    // When Firebase is connected:
    //   onAuthStateChanged(auth, async (firebaseUser) => { ... })
    setLoading(false);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      // Firebase stub: signInWithEmailAndPassword(auth, email, password)
      // For now, simulate auth ready state
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

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      // Firebase stub: auth.signOut()
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<string | null> => {
    // Firebase stub: return auth.currentUser?.getIdToken(true) ?? null
    return null;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role ?? null,
      loading,
      signIn,
      signOut,
      refreshToken,
    }),
    [user, loading, signIn, signOut, refreshToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth() — Section 74.
 * Must be used within AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
