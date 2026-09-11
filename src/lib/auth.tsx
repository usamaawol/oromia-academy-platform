import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

import { getUserProfile, saveUserProfile } from "./db";
import { firebaseReady, getFirebaseAuth } from "./firebase";
import { mutate, readDb, uid } from "./local-store";
import { OWNER_EMAIL, type UserProfile } from "./types";

type AuthUser = { uid: string; email: string | null; displayName: string | null };

type AuthCtx = {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isOwner: boolean;
  isStaff: boolean;
  localMode: boolean;
  register: (input: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    department?: string;
    courseId?: string;
  }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateDepartment: (department: string) => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

const SESSION_KEY = "oa.session";
const PW_KEY = "oa.pw";

function readPw(): Record<string, string> {
  try {
    return JSON.parse(window.localStorage.getItem(PW_KEY) ?? "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

function isOwnerEmail(email: string) {
  return email.trim().toLowerCase() === OWNER_EMAIL.toLowerCase();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const localMode = !firebaseReady;

  const loadProfile = useCallback(async (u: AuthUser) => {
    let p = await getUserProfile(u.uid);
    const shouldBeOwner = isOwnerEmail(u.email ?? "");
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
    if (localMode) {
      try {
        const id = window.localStorage.getItem(SESSION_KEY);
        const p = id ? (readDb().users.find((u) => u.id === id) ?? null) : null;
        if (p) {
          setUser({ uid: p.id, email: p.email, displayName: p.fullName });
          setProfile(p);
        }
      } catch {
        /* ignore */
      }
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(getFirebaseAuth(), async (u: User | null) => {
      setUser(u ? { uid: u.uid, email: u.email, displayName: u.displayName } : null);
      if (u) {
        try {
          await loadProfile({ uid: u.uid, email: u.email, displayName: u.displayName });
        } catch (err) {
          console.error(err);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, [loadProfile, localMode]);

  const register: AuthCtx["register"] = useCallback(
    async (input) => {
      const email = input.email.trim();
      if (localMode) {
        const existing = readDb().users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase(),
        );
        if (existing) throw { code: "auth/email-already-in-use" };
        if (input.password.length < 6) throw { code: "auth/weak-password" };
        const p: UserProfile = {
          id: uid("u"),
          fullName: input.fullName,
          email,
          ...(input.phone ? { phone: input.phone } : {}),
          ...(input.department ? { department: input.department } : {}),
          role: isOwnerEmail(email) ? "owner" : "student",
          enrolledCourseIds: input.courseId ? [input.courseId] : [],
          createdAt: Date.now(),
        };
        mutate((db) => {
          db.users = [...db.users, p];
        });
        const pw = readPw();
        pw[p.id] = input.password;
        window.localStorage.setItem(PW_KEY, JSON.stringify(pw));
        window.localStorage.setItem(SESSION_KEY, p.id);
        setUser({ uid: p.id, email: p.email, displayName: p.fullName });
        setProfile(p);
        return;
      }
      const cred = await createUserWithEmailAndPassword(getFirebaseAuth(), email, input.password);
      await updateProfile(cred.user, { displayName: input.fullName });
      const p: UserProfile = {
        id: cred.user.uid,
        fullName: input.fullName,
        email,
        ...(input.phone ? { phone: input.phone } : {}),
        ...(input.department ? { department: input.department } : {}),
        role: isOwnerEmail(email) ? "owner" : "student",
        enrolledCourseIds: input.courseId ? [input.courseId] : [],
        createdAt: Date.now(),
      };
      await saveUserProfile(p);
      setProfile(p);
    },
    [localMode],
  );

  const login: AuthCtx["login"] = useCallback(
    async (email, password) => {
      if (localMode) {
        const p = readDb().users.find(
          (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
        );
        const pw = readPw();
        if (!p || pw[p.id] !== password) throw { code: "auth/invalid-credential" };
        window.localStorage.setItem(SESSION_KEY, p.id);
        setUser({ uid: p.id, email: p.email, displayName: p.fullName });
        setProfile(p);
        return;
      }
      await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
    },
    [localMode],
  );

  const loginWithGoogle: AuthCtx["loginWithGoogle"] = useCallback(async () => {
    if (localMode) throw { code: "auth/google-unavailable" };
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    await signInWithPopup(getFirebaseAuth(), provider);
  }, [localMode]);

  const logout = useCallback(async () => {
    if (localMode) {
      window.localStorage.removeItem(SESSION_KEY);
      setUser(null);
      setProfile(null);
      return;
    }
    await signOut(getFirebaseAuth());
    setProfile(null);
  }, [localMode]);

  const resetPassword = useCallback(
    async (email: string) => {
      if (localMode) return;
      await sendPasswordResetEmail(getFirebaseAuth(), email.trim(), {
        url: `${window.location.origin}/auth`,
      });
    },
    [localMode],
  );

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    if (localMode) {
      setProfile(readDb().users.find((u) => u.id === user.uid) ?? null);
      return;
    }
    await loadProfile(user);
  }, [user, loadProfile, localMode]);

  const updateDepartment: AuthCtx["updateDepartment"] = useCallback(
    async (department: string) => {
      if (!profile) return;
      const next: UserProfile = { ...profile, department };
      if (localMode) {
        mutate((db) => {
          db.users = db.users.map((u) => (u.id === next.id ? next : u));
        });
      } else {
        await saveUserProfile(next);
      }
      setProfile(next);
    },
    [profile, localMode],
  );

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      profile,
      loading,
      localMode,
      isOwner: profile?.role === "owner",
      isStaff: profile?.role === "owner" || profile?.role === "instructor",
      register,
      login,
      loginWithGoogle,
      logout,
      resetPassword,
      refreshProfile,
      updateDepartment,
    }),
    [
      user,
      profile,
      loading,
      localMode,
      register,
      login,
      loginWithGoogle,
      logout,
      resetPassword,
      refreshProfile,
      updateDepartment,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function authErrorKey(
  err: unknown,
): "auth.invalidCredentials" | "auth.emailInUse" | "auth.weakPassword" | "common.error" {
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
