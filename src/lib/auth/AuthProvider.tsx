"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  User as FirebaseUser,
  AuthError,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase/config";
import { apiClient } from "@/lib/api/client";

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
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Maps Firebase Auth error codes to user-friendly messages
 */
function getReadableAuthErrorMessage(error: unknown): string {
  if (!error) {
    return "An unexpected authentication error occurred. Please try again.";
  }

  if (typeof error === "string") {
    return error;
  }

  if (typeof error === "object") {
    // If it's a DOM Event (e.g. error event from popup/iframe/script)
    if ("target" in error && !("code" in error) && !("message" in error)) {
      return "Network or browser connection error. Please check your popup settings and try again.";
    }

    const authError = error as AuthError;
    if (authError.code) {
      switch (authError.code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
          return "Invalid email or password. Please check your credentials.";
        case "auth/email-already-in-use":
          return "An account with this email address already exists. Please log in instead.";
        case "auth/weak-password":
          return "Password is too weak. Please use at least 6 characters with a combination of letters and numbers.";
        case "auth/invalid-email":
          return "Please enter a valid email address format.";
        case "auth/user-disabled":
          return "This account has been disabled. Please contact your system administrator.";
        case "auth/popup-closed-by-user":
          return "Sign in was cancelled. The popup was closed before completing.";
        case "auth/cancelled-popup-request":
          return "Only one popup request is allowed at a time.";
        case "auth/popup-blocked":
          return "Popup was blocked by your browser. Please allow popups for this site.";
        case "auth/network-request-failed":
          return "Network connection error. Please check your internet connection and try again.";
        case "auth/too-many-requests":
          return "Too many unsuccessful attempts. Access temporarily restricted. Please try again later.";
        default:
          return authError.message || "Authentication failed. Please try again.";
      }
    }

    if (authError.message && typeof authError.message === "string") {
      return authError.message;
    }
  }

  return "Authentication failed. Please try again.";
}

/**
 * AuthProvider
 * Firebase-integrated Authentication Context Provider
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to transform Firebase User to application AuthUser model
  const mapFirebaseUser = useCallback(async (firebaseUser: FirebaseUser | null): Promise<AuthUser | null> => {
    if (!firebaseUser) return null;

    let role: UserRole = "admin"; // Default admin for development/demo
    try {
      const idTokenResult = await firebaseUser.getIdTokenResult();
      if (
        idTokenResult.claims.role === "admin" ||
        idTokenResult.claims.role === "reviewer" ||
        idTokenResult.claims.role === "viewer"
      ) {
        role = idTokenResult.claims.role;
      }
    } catch (err) {
      console.warn("Could not retrieve custom claims:", err);
    }

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split("@")[0] : null),
      photoURL: firebaseUser.photoURL,
      role,
    };
  }, []);

  // Listen to Firebase auth state changes
  useEffect(() => {
    // Connect apiClient token getter
    apiClient.setAccessTokenProvider(async () => {
      if (auth.currentUser) {
        return auth.currentUser.getIdToken();
      }
      if (process.env.NODE_ENV === "development") {
        return "dev-token";
      }
      return null;
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const authUser = await mapFirebaseUser(firebaseUser);
          setUser(authUser);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth state transition error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [mapFirebaseUser]);

  // Email/Password Sign In
  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const authUser = await mapFirebaseUser(credential.user);
      setUser(authUser);
    } catch (error) {
      const message = getReadableAuthErrorMessage(error);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [mapFirebaseUser]);

  // Email/Password Sign Up / Account Creation
  const signUp = useCallback(async (data: SignUpData) => {
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        data.email.trim(),
        data.password
      );

      const fullName = `${data.firstName} ${data.lastName}`.trim();
      if (fullName) {
        await updateProfile(credential.user, {
          displayName: fullName,
        });
      }

      const authUser: AuthUser = {
        uid: credential.user.uid,
        email: credential.user.email,
        displayName: fullName || credential.user.email,
        photoURL: null,
        role: "admin",
        companyName: data.companyName ?? null,
      };

      setUser(authUser);
    } catch (error) {
      const message = getReadableAuthErrorMessage(error);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Google OAuth Sign In
  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const authUser = await mapFirebaseUser(credential.user);
      setUser(authUser);
    } catch (error) {
      const message = getReadableAuthErrorMessage(error);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [mapFirebaseUser]);

  // Sign Out
  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      const message = getReadableAuthErrorMessage(error);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Change Password
  const changePassword = useCallback(async (newPassword: string) => {
    if (!auth.currentUser) {
      throw new Error("No active user session found. Please log in again.");
    }
    try {
      await updatePassword(auth.currentUser, newPassword);
    } catch (error) {
      const message = getReadableAuthErrorMessage(error);
      throw new Error(message);
    }
  }, []);

  // Refresh Token
  const refreshToken = useCallback(async (): Promise<string | null> => {
    if (auth.currentUser) {
      return auth.currentUser.getIdToken(true);
    }
    return null;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role ?? null,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      changePassword,
      refreshToken,
    }),
    [user, loading, signIn, signUp, signInWithGoogle, signOut, changePassword, refreshToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to consume AuthContext
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return context;
}
