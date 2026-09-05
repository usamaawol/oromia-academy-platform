import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

import { getUserProfile, saveUserProfile } from "./db";
import { firebaseReady, getFirebaseAuth } from "./firebase";
import { OWNER_EMAIL, type UserProfile } from "./types";

type AuthCtx = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isOwner: boolean;
  isStaff: boolean;
  register: (input: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    courseId?: string;
  }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (u: User) => {
    let p = await getUserProfile(u.uid);
    const shouldBeOwner = (u.email ?? "").toLowerCase() === OWNER_EMAIL.toLowerCase();
    if (!p) {
      p = {
        id: u.uid,
        fullName: u.displayName ?? (u.email ?? "").split("@")[0] ?? "",
        email: u.email ?? "",
        role: shouldBeOwner ? "owner" : "student",
        enrolledCourseIds: [],
        createdAt: Date.now(),
      };
      await saveUserProfile(p);
    } else if (shouldBeOwner && p.role !== "owner") {
      p = { ...p, role: "owner" };
      await saveUserProfile(p);
    }
    setProfile(p);
  }, []);

  useEffect(() => {
    if (!firebaseReady) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(getFirebaseAuth(), async (u) => {
      setUser(u);
      if (u) {
        try {
          await loadProfile(u);
        } catch (err) {
          console.error(err);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, [loadProfile]);

  const register: AuthCtx["register"] = useCallback(async (input) => {
    const cred = await createUserWithEmailAndPassword(
      getFirebaseAuth(),
      input.email.trim(),
      input.password,
    );
    await updateProfile(cred.user, { displayName: input.fullName });
    const isOwnerEmail = input.email.trim().toLowerCase() === OWNER_EMAIL.toLowerCase();
    const p: UserProfile = {
      id: cred.user.uid,
      fullName: input.fullName,
      email: input.email.trim(),
      ...(input.phone ? { phone: input.phone } : {}),
      role: isOwnerEmail ? "owner" : "student",
      enrolledCourseIds: input.courseId ? [input.courseId] : [],
      createdAt: Date.now(),
    };
    await saveUserProfile(p);
    setProfile(p);
  }, []);

  const login: AuthCtx["login"] = useCallback(async (email, password) => {
    await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
  }, []);

  const logout = useCallback(async () => {
    await signOut(getFirebaseAuth());
    setProfile(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(getFirebaseAuth(), email.trim(), {
      url: `${window.location.origin}/auth`,
    });
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user);
  }, [user, loadProfile]);

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      profile,
      loading,
      isOwner: profile?.role === "owner",
      isStaff: profile?.role === "owner" || profile?.role === "instructor",
      register,
      login,
      logout,
      resetPassword,
      refreshProfile,
    }),
    [user, profile, loading, register, login, logout, resetPassword, refreshProfile],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function authErrorKey(err: unknown): "auth.invalidCredentials" | "auth.emailInUse" | "auth.weakPassword" | "common.error" {
  const code = (err as { code?: string })?.code ?? "";
  if (code.includes("email-already-in-use")) return "auth.emailInUse";
  if (code.includes("weak-password")) return "auth.weakPassword";
  if (
    code.includes("wrong-password") ||
    code.includes("user-not-found") ||
    code.includes("invalid-credential") ||
    code.includes("invalid-email")
  )
    return "auth.invalidCredentials";
  return "common.error";
}
