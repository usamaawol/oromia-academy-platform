import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updatePassword,
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type User,
} from "firebase/auth";
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

import { getUserProfile, saveUserProfile } from "./db";
import { firebaseReady, getFirebaseAuth } from "./firebase";
import { mutate, readDb, uid } from "./local-store";
import { normaliseRole, type UserProfile } from "./types";

type AuthUser = { uid: string; email: string | null; displayName: string | null };

type AuthCtx = {
  user: AuthUser | null;
  profile: UserProfile | null;
  /** True while Firebase onAuthStateChanged has NOT yet fired for the first time. */
  loading: boolean;
  /** True when we have a Firebase user but the Firestore profile is still loading
   *  (or retrying after a transient error). */
  profileLoading: boolean;
  /** True if the last profile load failed — surfaces toasts can retry. */
  profileError: string | null;
  isOwner: boolean;
  isStaff: boolean;
  /** True when the current profile has activationStatus === "active". Staff bypass this. */
  isActivated: boolean;
  activationStatus: UserProfile["activationStatus"];
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
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  /** True UNTIL onAuthStateChanged fires the FIRST time. */
  const [loading, setLoading] = useState(true);
  /** True when we know the Firebase user, but the profile still hasn't been
   *  fetched (or is retrying after a transient error). */
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const localMode = !firebaseReady;

  /**
   * Safely load the user's Firestore profile.
   *
   * RULE (critical): a transient Firestore failure MUST NEVER sign the user
   * out of their Firebase session. If the profile fetch fails we surface an
   * error, keep `user` set, and allow `refreshProfile()` to retry later.
   */
  const loadProfile = useCallback(async (u: AuthUser, opts?: { silent?: boolean }) => {
    const silent = opts?.silent ?? false;
    if (!silent) setProfileLoading(true);
    setProfileError(null);
    try {
      let p = await getUserProfile(u.uid);
      const now = Date.now();
      if (!p) {
        p = {
          id: u.uid,
          uid: u.uid,
          fullName: u.displayName ?? (u.email ?? "").split("@")[0] ?? "",
          email: u.email ?? "",
          role: "student",
          status: "active",
          activationStatus: "pending",
          enrolledCourseIds: [],
          createdAt: now,
          updatedAt: now,
        };
        try {
          await saveUserProfile(p);
        } catch (saveErr) {
          console.error("Failed to save newly-created user profile:", saveErr);
        }
      } else {
        // ──────────────── migrations ────────────────
        let changed = false;

        // 1) Role normalisation: owner / administrator / superadmin → admin
        const safeRole = normaliseRole(p.role);
        if (safeRole !== p.role) {
          p = { ...p, role: safeRole };
          changed = true;
        }

        // 2) Backfill activationStatus for legacy profiles
        if (!p.activationStatus) {
          const isStaff = p.role === "admin" || p.role === "instructor";
          const hasAnyCourse =
            (p.enrolledCourseIds?.length ?? 0) > 0 || (p.courseIds?.length ?? 0) > 0;
          p.activationStatus = isStaff || hasAnyCourse ? "active" : "pending";
          changed = true;
        }

        // 3) Backfill updatedAt
        if (!p.updatedAt) {
          p.updatedAt = now;
          changed = true;
        }

        if (changed) {
          try {
            await saveUserProfile(p);
          } catch (saveErr) {
            console.error("Failed to persist migrated profile:", saveErr);
          }
        }
      }
      setProfile(p);
      setProfileError(null);
    } catch (err) {
      // ─── CRITICAL: DO NOT CALL signOut() HERE ───
      // Auth state and data-loading state are different concerns.
      console.error("[AuthProvider] Profile load failed (keeping user logged in):", err);
      setProfileError(
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Failed to load profile",
      );
    } finally {
      if (!silent) setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    if (localMode) {
      try {
        const id = window.localStorage.getItem(SESSION_KEY);
        const p = id ? (readDb().users.find((u) => u.id === id) ?? null) : null;
        if (p) {
          setUser({ uid: p.id, email: p.email, displayName: p.fullName });
          void loadProfile({ uid: p.id, email: p.email, displayName: p.fullName });
        }
      } catch (err) {
        console.error("[AuthProvider] Local mode load error:", err);
      }
      setLoading(false);
      return;
    }
    let cancelled = false;
    const unsub = onAuthStateChanged(getFirebaseAuth(), async (u: User | null) => {
      if (cancelled) return;
      const authUser = u
        ? { uid: u.uid, email: u.email, displayName: u.displayName }
        : null;
      setUser(authUser);
      if (authUser) {
        // Known user — start the profile fetch in the background.
        // profileLoading is set inside loadProfile. Keep loading=false only
        // once we know the auth layer answer.
        void loadProfile(authUser);
      } else {
        // No user signed in: clear profile state synchronously.
        setProfile(null);
        setProfileError(null);
        setProfileLoading(false);
      }
      // First auth resolution completed — the "loading" state ends HERE
      // regardless of profile outcome. Protected routes can decide what to do.
      setLoading(false);
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [loadProfile, localMode]);

  const register: AuthCtx["register"] = useCallback(
    async (input) => {
      const email = input.email.trim();
      if (localMode) {
        const existing = readDb().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (existing) throw { code: "auth/email-already-in-use" };
        if (input.password.length < 6) throw { code: "auth/weak-password" };
        const id = uid("u");
        const now = Date.now();
        const p: UserProfile = {
          id,
          uid: id,
          fullName: input.fullName,
          email,
          ...(input.phone ? { phone: input.phone } : {}),
          ...(input.department ? { department: input.department } : {}),
          role: "student",
          status: "active",
          activationStatus: "pending",
          enrolledCourseIds: input.courseId ? [input.courseId] : [],
          courseIds: input.courseId ? [input.courseId] : [],
          createdAt: now,
          updatedAt: now,
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
      // Use the email address exactly as stored by Firebase Auth (normalised to
      // lowercase) so the Firestore allow-create rule
      // `email == request.auth.token.email` is satisfied.
      const canonicalEmail = (cred.user.email ?? email).toLowerCase().trim();
      const now = Date.now();
      const p: UserProfile = {
        id: cred.user.uid,
        uid: cred.user.uid,
        fullName: input.fullName,
        email: canonicalEmail,
        ...(input.phone ? { phone: input.phone } : {}),
        ...(input.department ? { department: input.department } : {}),
        role: "student",
        status: "active",
        activationStatus: "pending",
        enrolledCourseIds: input.courseId ? [input.courseId] : [],
        courseIds: input.courseId ? [input.courseId] : [],
        createdAt: now,
        updatedAt: now,
      };
      await saveUserProfile(p);
      setProfile(p);
    },
    [localMode],
  );

  const login: AuthCtx["login"] = useCallback(
    async (email, password) => {
      if (localMode) {
        const p = readDb().users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
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
    try {
      await signInWithPopup(getFirebaseAuth(), provider);
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "";
      if (
        code === "auth/popup-blocked" ||
        code === "auth/operation-not-supported-in-this-environment"
      ) {
        await signInWithRedirect(getFirebaseAuth(), provider);
        return;
      }
      console.error("Google Sign-In Error:", err);
      throw err;
    }
  }, [localMode]);

  const logout = useCallback(async () => {
    // Always clear local profile state BEFORE sign-out so an in-flight
    // profile fetch error can never accidentally re-populate logged-out state.
    setProfile(null);
    setProfileError(null);
    setProfileLoading(false);
    if (localMode) {
      window.localStorage.removeItem(SESSION_KEY);
      setUser(null);
      return;
    }
    try {
      await signOut(getFirebaseAuth());
    } catch (err) {
      console.warn("[AuthProvider] signOut() threw, but local state was still cleared:", err);
    } finally {
      // Hard reset — ensures even if signOut rejects (network hiccup) the
      // browser is in a visibly "logged out" state so the user can re-sign in.
      setUser(null);
    }
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

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (localMode) {
        if (!user) throw { code: "auth/user-not-found" };
        const pw = readPw();
        if (pw[user.uid] !== currentPassword) {
          throw { code: "auth/wrong-password" };
        }
        pw[user.uid] = newPassword;
        window.localStorage.setItem(PW_KEY, JSON.stringify(pw));
        return;
      }
      const auth = getFirebaseAuth();
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        throw { code: "auth/user-not-found" };
      }
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
    },
    [localMode, user],
  );

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await loadProfile(user);
  }, [user, loadProfile]);

  const updateDepartment: AuthCtx["updateDepartment"] = useCallback(
    async (department: string) => {
      if (!profile) return;
      const next: UserProfile = { ...profile, department, updatedAt: Date.now() };
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

  const activationStatus: AuthCtx["activationStatus"] = profile?.activationStatus ?? undefined;
  const isStaffComputed = profile?.role === "admin" || profile?.role === "instructor";
  // A student is considered "activated" (allowed into the student portal) when:
  //   - They are staff (admin/instructor) — always allowed
  //   - activationStatus === "active" — fully activated via code redemption
  //   - activationStatus === "approved" — admin approved them; treat as activated
  //     so they can access the portal directly without a separate code step.
  //     The activation code flow is optional UX; the authoritative gate is
  //     admin approval stored in Firestore.
  const isActivated =
    isStaffComputed ||
    profile?.activationStatus === "active" ||
    profile?.activationStatus === "approved";

  // Route guards treat "auth OR profile still loading" as the "do not redirect yet"
  // state; this alias keeps the external `loading` API simple for existing call sites
  // that only import `useAuth().loading`.
  const effectiveLoading = loading || profileLoading;

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      profile,
      loading: effectiveLoading,
      profileLoading,
      profileError,
      localMode,
      isOwner: profile?.role === "admin",
      isStaff: isStaffComputed,
      isActivated,
      activationStatus,
      register,
      login,
      loginWithGoogle,
      logout,
      resetPassword,
      changePassword,
      refreshProfile,
      updateDepartment,
    }),
    [
      user,
      profile,
      effectiveLoading,
      profileLoading,
      profileError,
      localMode,
      isStaffComputed,
      isActivated,
      activationStatus,
      register,
      login,
      loginWithGoogle,
      logout,
      resetPassword,
      changePassword,
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
):
  | "auth.invalidCredentials"
  | "auth.emailInUse"
  | "auth.weakPassword"
  | "auth.googleUnavailable"
  | "auth.googlePopupClosed"
  | "auth.registrationFailed"
  | "common.error" {
  const code = (err as { code?: string })?.code ?? "";
  const message = (err as { message?: string })?.message ?? "";
  console.error("Auth error details:", { code, message, err });

  if (code.includes("google-unavailable") || code.includes("operation-not-allowed"))
    return "auth.googleUnavailable";
  if (code.includes("popup-closed") || code.includes("cancelled-popup"))
    return "auth.googlePopupClosed";
  if (code.includes("permission-denied") || code.includes("Firestore"))
    return "auth.registrationFailed";
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
