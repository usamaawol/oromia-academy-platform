/**
 * Server-side authentication + authorisation. Server only.
 *
 * Every privileged operation resolves the caller from a Firebase ID token that
 * Google validated, then reads the role from Firestore. The browser never
 * supplies its own role.
 */
import { fsCreate, fsGet, fsSet, verifyIdToken } from "./fb-admin.server";
import { ADMIN_ROLES, STAFF_ROLES, type Profile, type Role } from "./schema";

export class AppError extends Error {
  constructor(public code: string) {
    super(code);
  }
}

/** Resolves the caller and guarantees a `/users/{uid}` profile exists. */
export async function requireProfile(idToken: string): Promise<Profile> {
  if (!idToken) throw new AppError("auth/required");
  let verified;
  try {
    verified = await verifyIdToken(idToken);
  } catch (err) {
    const msg = (err as Error | undefined)?.message ?? "";
    // Preserve descriptive server-misconfiguration messages (e.g. missing API
    // key, missing service account) so operators can immediately see why
    // Vercel deploys fail, instead of masking everything as "session expired".
    const isConfigError =
      msg.includes("API key is not configured") ||
      msg.includes("SERVICE_ACCOUNT_JSON") ||
      msg.includes("id-token-check-failed") ||
      msg.includes("auth/network-error");
    if (isConfigError) throw new Error(msg);
    throw new AppError("auth/invalid-session");
  }

  const existing = await fsGet<Profile & { activationStatus?: Profile["activationStatus"] }>(
    "users",
    verified.uid,
  );
  if (existing) {
    if (existing.status === "suspended") throw new AppError("auth/suspended");

    // Activation-level suspension
    if (existing.activationStatus === "suspended") throw new AppError("auth/suspended");

    // Backfill activationStatus for legacy profiles
    let migrated = existing as Profile;
    if (!migrated.activationStatus) {
      const staff: Profile["role"][] = ["owner", "admin", "instructor"];
      const isStaff = staff.includes(migrated.role);
      const hasCourse = (migrated.courseIds?.length ?? 0) > 0;
      const activationStatus: Profile["activationStatus"] =
        isStaff || hasCourse ? "active" : "pending";
      migrated = {
        ...migrated,
        courseIds: migrated.courseIds ?? [],
        activationStatus,
        updatedAt: Date.now(),
      };
      // Fire+forget: persist the backfilled value
      void fsSet("users", verified.uid, migrated as unknown as Record<string, unknown>).catch(
        () => undefined,
      );
    } else {
      migrated = { ...migrated, courseIds: migrated.courseIds ?? [] };
    }
    return migrated;
  }

  // Recovery path: the auth account exists but the profile write failed
  // earlier. Recreate it as a student — never with elevated privileges.
  // New auto-created student profiles are always pending activation.
  const now = Date.now();
  const profile: Profile = {
    id: verified.uid,
    uid: verified.uid,
    fullName: verified.name || verified.email.split("@")[0] || "Student",
    email: verified.email,
    role: "student",
    courseIds: [],
    status: "active",
    activationStatus: "pending",
    createdAt: now,
    updatedAt: now,
  };
  await fsSet("users", verified.uid, { ...profile });
  return profile;
}

export async function requireRole(idToken: string, roles: Role[]): Promise<Profile> {
  const profile = await requireProfile(idToken);
  if (!roles.includes(profile.role)) throw new AppError("auth/forbidden");
  return profile;
}

export function requireStaff(idToken: string): Promise<Profile> {
  return requireRole(idToken, STAFF_ROLES);
}

export function requireAdmin(idToken: string): Promise<Profile> {
  return requireRole(idToken, ADMIN_ROLES);
}

export async function logAudit(
  actor: Profile,
  action: string,
  target?: string,
  details?: string,
): Promise<void> {
  try {
    await fsCreate("auditLogs", {
      userId: actor.id,
      userName: actor.fullName || actor.email,
      action,
      target: target ?? null,
      details: details ?? null,
      createdAt: Date.now(),
    });
  } catch {
    /* auditing must never break the operation it records */
  }
}
