/**
 * Trusted Firebase access layer (server only).
 *
 * Uses a Firebase service account to talk to the Firestore REST API with full
 * authority, so Firestore security rules can stay strict for browsers.
 * Nothing in this file may ever be imported from client code.
 *
 * DEVELOPMENT FALLBACK: when `FIREBASE_SERVICE_ACCOUNT_JSON` is not configured,
 * requests are authorised with the caller's own Firebase ID token (sent as the
 * `x-id-token` header). This lets the admin dashboard run without a service
 * account so long as the Firestore rules allow the signed-in user access.
 */
import { getRequestHeader } from "@tanstack/react-start/server";

type ServiceAccount = {
  project_id: string;
  client_email: string;
  private_key: string;
};

const FIRESTORE = "https://firestore.googleapis.com/v1";

function serviceAccount(): ServiceAccount {
  const raw = process.env["FIREBASE_SERVICE_ACCOUNT_JSON"];
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not configured");
  const parsed = JSON.parse(raw) as ServiceAccount;
  if (!parsed.private_key || !parsed.client_email || !parsed.project_id) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is missing required fields");
  }
  return parsed;
}

export function projectId(): string {
  const raw = process.env["FIREBASE_SERVICE_ACCOUNT_JSON"];
  if (!raw) {
    const domain = process.env["VITE_FIREBASE_AUTH_DOMAIN"] ?? "oromia-academy.firebaseapp.com";
    return domain.split(".")[0]!;
  }
  return serviceAccount().project_id;
}

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToDer(pem: string): ArrayBuffer {
  const body = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\\n/g, "\n")
    .replace(/\n/g, "")
    .replace(/\r/g, "")
    .replace(/\s/g, "");
  const bin = atob(body);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}

let tokenCache: { token: string; expiresAt: number } | null = null;

async function accessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.token;

  const raw = process.env["FIREBASE_SERVICE_ACCOUNT_JSON"];
  if (!raw) {
    // No service account → use the signed-in user's own ID token (dev fallback).
    const userToken = getRequestHeader("x-id-token") ?? "";
    if (!userToken) {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_JSON is not configured. Sign in again, or set the variable in .env.",
      );
    }
    return userToken;
  }

  const sa = serviceAccount();
  const iat = Math.floor(Date.now() / 1000);
  const header = b64url(new TextEncoder().encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const claims = b64url(
    new TextEncoder().encode(
      JSON.stringify({
        iss: sa.client_email,
        scope: "https://www.googleapis.com/auth/datastore",
        aud: "https://oauth2.googleapis.com/token",
        iat,
        exp: iat + 3600,
      }),
    ),
  );
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToDer(sa.private_key.replace(/\\n/g, "\n")),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(`${header}.${claims}`),
  );
  const jwt = `${header}.${claims}.${b64url(signature)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`Firebase auth failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache = { token: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return json.access_token;
}

/* --------------------------- value (de)serialisation --------------------------- */

type FsValue = Record<string, unknown>;

function encode(value: unknown): FsValue {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number")
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (typeof value === "string") return { stringValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encode) } };
  if (typeof value === "object") {
    const fields: Record<string, FsValue> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) fields[k] = encode(v);
    return { mapValue: { fields } };
  }
  return { nullValue: null };
}

function decode(value: FsValue | undefined): unknown {
  if (!value) return undefined;
  if ("nullValue" in value) return null;
  if ("booleanValue" in value) return value["booleanValue"];
  if ("integerValue" in value) return Number(value["integerValue"]);
  if ("doubleValue" in value) return Number(value["doubleValue"]);
  if ("stringValue" in value) return value["stringValue"];
  if ("timestampValue" in value) return Date.parse(String(value["timestampValue"]));
  if ("arrayValue" in value) {
    const v = value["arrayValue"] as { values?: FsValue[] };
    return (v.values ?? []).map((x) => decode(x));
  }
  if ("mapValue" in value) {
    const v = value["mapValue"] as { fields?: Record<string, FsValue> };
    const out: Record<string, unknown> = {};
    for (const [k, f] of Object.entries(v.fields ?? {})) out[k] = decode(f);
    return out;
  }
  return undefined;
}

function encodeFields(data: Record<string, unknown>): Record<string, FsValue> {
  const fields: Record<string, FsValue> = {};
  for (const [k, v] of Object.entries(data)) fields[k] = encode(v);
  return fields;
}

function docToObject<T>(doc: { name: string; fields?: Record<string, FsValue> }): T {
  const id = doc.name.split("/").pop() as string;
  const out: Record<string, unknown> = { id };
  for (const [k, v] of Object.entries(doc.fields ?? {})) out[k] = decode(v);
  return out as T;
}

async function api(path: string, init?: RequestInit): Promise<unknown> {
  const token = await accessToken();
  const res = await fetch(
    `${FIRESTORE}/projects/${projectId()}/databases/(default)/documents${path}`,
    {
      ...init,
      headers: {
        ...(init?.headers as Record<string, string> | undefined),
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
    },
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Firestore ${res.status}: ${await res.text()}`);
  return res.json();
}

/* ------------------------------- document CRUD ------------------------------- */

export async function fsGet<T>(collection: string, id: string): Promise<T | null> {
  const doc = (await api(`/${collection}/${encodeURIComponent(id)}`)) as {
    name: string;
    fields?: Record<string, FsValue>;
  } | null;
  return doc ? docToObject<T>(doc) : null;
}

/** Create or fully overwrite a document at a known id. */
export async function fsSet(
  collection: string,
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  const mask = Object.keys(data)
    .map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
    .join("&");
  await api(`/${collection}/${encodeURIComponent(id)}?${mask}`, {
    method: "PATCH",
    body: JSON.stringify({ fields: encodeFields(data) }),
  });
}

export async function fsCreate(collection: string, data: Record<string, unknown>): Promise<string> {
  const doc = (await api(`/${collection}`, {
    method: "POST",
    body: JSON.stringify({ fields: encodeFields(data) }),
  })) as { name: string };
  return doc.name.split("/").pop() as string;
}

export async function fsDelete(collection: string, id: string): Promise<void> {
  await api(`/${collection}/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function fsList<T>(collection: string): Promise<T[]> {
  const out: T[] = [];
  let pageToken: string | undefined;
  do {
    const q = new URLSearchParams({ pageSize: "300" });
    if (pageToken) q.set("pageToken", pageToken);
    const page = (await api(`/${collection}?${q.toString()}`)) as {
      documents?: { name: string; fields?: Record<string, FsValue> }[];
      nextPageToken?: string;
    } | null;
    for (const d of page?.documents ?? []) out.push(docToObject<T>(d));
    pageToken = page?.nextPageToken;
  } while (pageToken);
  return out;
}

export type Filter = [field: string, op: "EQUAL" | "GREATER_THAN" | "LESS_THAN", value: unknown];

export async function fsQuery<T>(collection: string, filters: Filter[], limit = 500): Promise<T[]> {
  const token = await accessToken();
  const body = {
    structuredQuery: {
      from: [{ collectionId: collection }],
      limit,
      ...(filters.length
        ? {
            where: {
              compositeFilter: {
                op: "AND",
                filters: filters.map(([field, op, value]) => ({
                  fieldFilter: { field: { fieldPath: field }, op, value: encode(value) },
                })),
              },
            },
          }
        : {}),
    },
  };
  const res = await fetch(
    `${FIRESTORE}/projects/${projectId()}/databases/(default)/documents:runQuery`,
    {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) throw new Error(`Firestore query ${res.status}: ${await res.text()}`);
  const rows = (await res.json()) as {
    document?: { name: string; fields?: Record<string, FsValue> };
  }[];
  return rows.filter((r) => r.document).map((r) => docToObject<T>(r.document!));
}

/* --------------------------- identity verification --------------------------- */

/**
 * Resolve the Firebase Web API key used for verifying client ID tokens.
 *
 * On Vercel / serverless runtimes, `VITE_*` variables are only baked into
 * client bundles at build time. Server-side, TanStack Start / Nitro / Vercel
 * typically expose them through `import.meta.env` (Vite SSR) or plain
 * `process.env` if the user added them to the Vercel project settings.
 *
 * We also accept a bare `FIREBASE_API_KEY` / `GOOGLE_API_KEY` so operators can
 * avoid the VITE_ prefix entirely on the server.
 */
function resolveFirebaseApiKey(): string | undefined {
  const direct =
    process.env["GOOGLE_API_KEY"] ??
    process.env["FIREBASE_API_KEY"] ??
    process.env["VITE_FIREBASE_API_KEY"];
  if (direct) return direct;

  if (typeof import.meta !== "undefined") {
    const env = (
      import.meta as unknown as Record<string, Record<string, string> | undefined>
    ).env;
    if (env) {
      const vite = env["VITE_FIREBASE_API_KEY"] ?? env["FIREBASE_API_KEY"] ?? env["GOOGLE_API_KEY"];
      if (vite) return vite;
    }
  }

  return undefined;
}

export type VerifiedUser = { uid: string; email: string; emailVerified: boolean; name: string };

/**
 * Validates a Firebase ID token with Google's identity service. The client can
 * never fake this: an invalid or expired token is rejected upstream.
 */
export async function verifyIdToken(idToken: string): Promise<VerifiedUser> {
  if (!idToken) throw new Error("auth/required");

  const key = resolveFirebaseApiKey();
  if (!key) {
    throw new Error(
      "Firebase API key is not configured on the server. " +
        "Set GOOGLE_API_KEY, FIREBASE_API_KEY, or VITE_FIREBASE_API_KEY in Vercel project settings.",
    );
  }

  let res: Response;
  try {
    res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ idToken }),
      },
    );
  } catch (cause) {
    throw new Error("auth/network-error", { cause: cause as Error });
  }

  if (res.status === 400) {
    throw new Error("auth/invalid-session");
  }
  if (!res.ok) {
    throw new Error(`auth/id-token-check-failed (${res.status})`);
  }

  const json = (await res.json()) as {
    users?: { localId: string; email?: string; emailVerified?: boolean; displayName?: string }[];
  };
  const u = json.users?.[0];
  if (!u) throw new Error("auth/invalid-session");
  return {
    uid: u.localId,
    email: u.email ?? "",
    emailVerified: Boolean(u.emailVerified),
    name: u.displayName ?? "",
  };
}

/* ---------------------------------- helpers ---------------------------------- */

export type SystemDiagnostics = {
  serviceAccountSet: boolean;
  serviceAccountValid: boolean;
  projectId: string | null;
  apiKeySet: boolean;
  tokenAcquired: boolean;
  firestoreReachable: boolean;
};

/**
 * Reports the server-side Firebase configuration without leaking secrets.
 * Used by the admin "Server status" card so misconfiguration is obvious in-app.
 */
export async function systemDiagnostics(): Promise<SystemDiagnostics> {
  const apiKey = resolveFirebaseApiKey();
  const out: SystemDiagnostics = {
    serviceAccountSet: false,
    serviceAccountValid: false,
    projectId: null,
    apiKeySet: Boolean(apiKey),
    tokenAcquired: false,
    firestoreReachable: false,
  };

  const raw = process.env["FIREBASE_SERVICE_ACCOUNT_JSON"];
  out.serviceAccountSet = Boolean(raw);
  if (!raw) return out;

  let sa: ServiceAccount;
  try {
    sa = JSON.parse(raw) as ServiceAccount;
  } catch {
    return out; // invalid JSON → invalid
  }
  out.serviceAccountValid = Boolean(sa.private_key && sa.client_email && sa.project_id);
  out.projectId = sa.project_id ?? null;
  if (!out.serviceAccountValid) return out;

  try {
    await accessToken();
    out.tokenAcquired = true;
  } catch {
    return out;
  }

  try {
    // fsGet returns null for a missing doc (404) but throws on transport/auth errors
    await fsGet("settings", "site");
    out.firestoreReachable = true;
  } catch {
    /* unreachable */
  }
  return out;
}

export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function randomShuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0]! % (i + 1);
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}
