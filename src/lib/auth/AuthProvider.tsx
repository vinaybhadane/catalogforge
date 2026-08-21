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
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  User as FirebaseUser,
  AuthError,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase/config";
import { apiClient } from "@/lib/api/client";
import {
  isSharedOrganizationMember,
  getInvitedMembers,
  DEFAULT_ADMIN_EMAILS,
} from "@/lib/auth/workspace-guard";

export type UserRole = "admin" | "reviewer" | "viewer";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  companyName?: string | null;
  isSharedMember: boolean;
  isInvited: boolean;
  isWorkspaceOwner: boolean;
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
  isSharedMember: boolean;
  isInvited: boolean;
  isWorkspaceOwner: boolean;
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
 * Firebase-integrated Authentication Context Provider with Multi-Tenancy / Invitation Guard
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("catalogforge_active_user");
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Helper to transform Firebase User to application AuthUser model
  const mapFirebaseUser = useCallback(async (firebaseUser: FirebaseUser | null): Promise<AuthUser | null> => {
    if (!firebaseUser) return null;

    const email = firebaseUser.email || "";
    const isShared = isSharedOrganizationMember(email);
    const isOwner = DEFAULT_ADMIN_EMAILS.some((adm) => adm.toLowerCase() === email.toLowerCase());

    let role: UserRole = "admin";
    const invitedList = getInvitedMembers();
    const invitedMatch = invitedList.find((m) => m.email.toLowerCase() === email.toLowerCase());

    if (invitedMatch) {
      if (invitedMatch.role === "Catalog Manager") role = "reviewer";
      else if (invitedMatch.role === "Auditor") role = "viewer";
      else role = "admin";
    } else if (isOwner) {
      role = "admin";
    }

    const mapped: AuthUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split("@")[0] : null),
      photoURL: firebaseUser.photoURL,
      role,
      isSharedMember: isShared,
      isInvited: !!invitedMatch,
      isWorkspaceOwner: isOwner,
    };

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("catalogforge_active_user", JSON.stringify(mapped));
      } catch {}
    }

    return mapped;
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

    // Process redirect result if returning from Google Redirect
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          const authUser = await mapFirebaseUser(result.user);
          setUser(authUser);
          if (typeof window !== "undefined") {
            window.location.href = "/dashboard";
          }
        }
      })
      .catch((err) => {
        console.warn("Redirect sign-in notice:", err);
      });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const authUser = await mapFirebaseUser(firebaseUser);
          setUser(authUser);
        } else {
          setUser(null);
          if (typeof window !== "undefined") {
            try {
              localStorage.removeItem("catalogforge_active_user");
            } catch {}
          }
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

      const email = credential.user.email || "";
      const isShared = isSharedOrganizationMember(email);
      const isOwner = DEFAULT_ADMIN_EMAILS.some((adm) => adm.toLowerCase() === email.toLowerCase());

      const invitedList = getInvitedMembers();
      const invitedMatch = invitedList.find((m) => m.email.toLowerCase() === email.toLowerCase());

      let role: UserRole = "admin";
      if (invitedMatch) {
        if (invitedMatch.role === "Catalog Manager") role = "reviewer";
        else if (invitedMatch.role === "Auditor") role = "viewer";
        else role = "admin";
      }

      const authUser: AuthUser = {
        uid: credential.user.uid,
        email: credential.user.email,
        displayName: fullName || credential.user.email,
        photoURL: null,
        role,
        companyName: data.companyName ?? null,
        isSharedMember: isShared,
        isInvited: !!invitedMatch,
        isWorkspaceOwner: isOwner,
      };

      setUser(authUser);
    } catch (error) {
      const message = getReadableAuthErrorMessage(error);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Google OAuth Sign In (with automatic redirect fallback for popup blockers)
  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const authUser = await mapFirebaseUser(credential.user);
      setUser(authUser);
    } catch (error: any) {
      console.warn("Popup sign-in blocked or failed, attempting redirect login:", error);
      if (
        error?.code === "auth/popup-blocked" ||
        error?.code === "auth/cancelled-popup-request" ||
        error?.code === "auth/popup-closed-by-user" ||
        !error?.code
      ) {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr) {
          const message = getReadableAuthErrorMessage(redirectErr);
          throw new Error(message);
        }
      }
      const message = getReadableAuthErrorMessage(error);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [mapFirebaseUser]);

  // Change Password
  const changePassword = useCallback(async (newPassword: string) => {
    if (!auth.currentUser) {
      throw new Error("No authenticated user found. Please log in again.");
    }
    try {
      await updatePassword(auth.currentUser, newPassword);
    } catch (error) {
      const message = getReadableAuthErrorMessage(error);
      throw new Error(message);
    }
  }, []);

  // Sign Out
  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("catalogforge_active_user");
        } catch {}
      }
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh Token
  const refreshToken = useCallback(async (): Promise<string | null> => {
    if (!auth.currentUser) return null;
    try {
      return await auth.currentUser.getIdToken(true);
    } catch {
      return null;
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role ?? null,
      loading,
      isSharedMember: user?.isSharedMember ?? false,
      isInvited: user?.isInvited ?? false,
      isWorkspaceOwner: user?.isWorkspaceOwner ?? false,
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

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
