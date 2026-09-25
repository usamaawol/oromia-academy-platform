/**
 * Student Activation Page — /activate
 *
 * A student must redeem a valid activation code issued by Oromia Academy
 * before they can access the Student Dashboard.
 *
 * Security: The actual validation runs entirely on the server (server fn).
 * No local/session storage, no frontend boolean, no hidden button tricks.
 */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { KeyRound, CheckCircle2, AlertCircle, Loader2, GraduationCap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { useAuth } from "@/lib/auth";
import { redeemActivationCode } from "@/lib/server-fns";
import { serverErrorMessage } from "@/lib/server-error";
import { useServerFn } from "@/hooks/use-server-fn";
import { getFirebaseAuth, firebaseReady } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/activate")({
  head: () => ({
    meta: [
      { title: "Herrega Haa Hojiirra Oolu — Oromia Academy" },
      { name: "description", content: "Koodii activation kee galchi." },
    ],
  }),
  component: ActivatePage,
});

// Map server AppError codes → Afaan Oromoo / English messages
function activationErrorMessage(err: unknown, lang: "om" | "en"): string {
  const msg = String((err as { message?: string })?.message ?? "");
  const code = String((err as { code?: string })?.code ?? msg);

  const om_msgs: Record<string, string> = {
    "activation/invalid-code": "Koodiin kun sirrii miti.",
    "activation/code-used": "Koodiin kun duraan hojii irra ooleera.",
    "activation/code-revoked": "Koodiin kun haqameera.",
    "activation/code-expired": "Koodiin kun yeroo isaa darbeera.",
    "activation/code-wrong-user": "Koodiin kun herrega kanaaf hin ramadamne.",
    "activation/account-locked": "Herregni kee dhaabbateera. Admin qunnami.",
    "activation/already-active": "Herregni kee duraan hojii irra jira.",
    "activation/not-approved": "Herregni kee amma eeyyamame miti. Bulchiinsa eegi.",
    "auth/required": "Maaloo dursii seeni.",
    "auth/suspended": "Herregni kee dhaabbateera.",
  };
  const en_msgs: Record<string, string> = {
    "activation/invalid-code": "This code is invalid.",
    "activation/code-used": "This code has already been used.",
    "activation/code-revoked": "This code has been revoked.",
    "activation/code-expired": "This code has expired.",
    "activation/code-wrong-user": "This code is not assigned to your account.",
    "activation/account-locked": "Your account is locked. Contact the admin.",
    "activation/already-active": "Your account is already activated.",
    "activation/not-approved": "Your account has not been approved yet. Please wait for admin review.",
    "auth/required": "Please sign in first.",
    "auth/suspended": "Your account has been suspended.",
  };

  const map = lang === "om" ? om_msgs : en_msgs;

  // try exact code match first
  if (map[code]) return map[code]!;
  // then partial match
  for (const [k, v] of Object.entries(map)) {
    if (code.includes(k) || msg.includes(k)) return v;
  }
  return lang === "om"
    ? "Rakkoon network uumame. Mee irra deebi'ii yaali."
    : "A network error occurred. Please try again.";
}

// Controlled OTP-style input for OA-XXXX-XXXX
function CodeInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Normalize: uppercase, strip invalid chars, format as OA-XXXX-XXXX
    let raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");

    // Auto-insert "OA" prefix if user started typing without it
    if (raw.length > 0 && !raw.startsWith("OA")) {
      raw = "OA" + raw;
    }

    // Build formatted: OA-XXXX-XXXX (max 12 alphanum chars = OA + 4 + 4 + separators)
    let out = "";
    if (raw.length >= 2) {
      out = raw.slice(0, 2); // OA
      if (raw.length > 2) {
        out += "-" + raw.slice(2, 6);
        if (raw.length > 6) {
          out += "-" + raw.slice(6, 10);
        }
      }
    } else {
      out = raw;
    }

    onChange(out);
  }

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="text"
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="characters"
      spellCheck={false}
      placeholder="OA-____-____"
      value={value}
      onChange={handleChange}
      disabled={disabled}
      maxLength={12}
      className={cn(
        "w-full rounded-2xl border-2 border-border bg-background px-6 py-5 text-center",
        "font-mono text-2xl font-bold tracking-[0.25em] uppercase text-foreground",
        "placeholder:text-muted-foreground/40 placeholder:tracking-[0.25em]",
        "focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "transition-all duration-200",
      )}
    />
  );
}

function ActivatePage() {
  const { lang } = useI18n();
  const { user, profile, loading, refreshProfile, isActivated } = useAuth();
  const navigate = useNavigate();
  const call = useServerFn();

  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [activated, setActivated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already activated, redirect to dashboard
  useEffect(() => {
    if (!loading && isActivated) {
      void navigate({ to: "/dashboard" });
    }
  }, [loading, isActivated, navigate]);

  // If not logged in, redirect to auth
  useEffect(() => {
    if (!loading && !user) {
      void navigate({ to: "/auth" });
    }
  }, [loading, user, navigate]);

  // Pending / rejected / suspended → waiting-for-approval page
  useEffect(() => {
    if (!loading && user && !isActivated) {
      const s = profile?.activationStatus;
      if (s === "pending" || s === "rejected" || s === "suspended") {
        void navigate({ to: "/waiting-for-approval" });
      }
      // approved → student can stay on /activate to enter their code directly,
      // OR they can go to /waiting-for-approval where it's shown to them.
    }
  }, [loading, user, isActivated, profile, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed || trimmed.length < 8) {
      setError(
        lang === "om"
          ? "Koodii sirrii galchi (fakkeenyaaf: OA-A7K9-P2XM)."
          : "Enter a valid code (e.g. OA-A7K9-P2XM).",
      );
      return;
    }

    setError(null);
    setBusy(true);

    try {
      // Ensure Firebase token is fully available before calling server
      if (firebaseReady) {
        const auth = getFirebaseAuth();
        if (!auth.currentUser) {
          await new Promise<void>((resolve) => {
            const unsub = onAuthStateChanged(auth, (u) => {
              if (u) { unsub(); resolve(); }
            });
            setTimeout(() => resolve(), 4000);
          });
        }
      }

      await call(redeemActivationCode, { code: trimmed });

      // Refresh local profile so isActivated becomes true
      await refreshProfile();
      setActivated(true);

      // Brief success animation then redirect
      setTimeout(() => {
        void navigate({ to: "/dashboard" });
      }, 2000);
    } catch (err) {
      setError(activationErrorMessage(err, lang as "om" | "en"));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  // Success state
  if (activated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-6 text-center max-w-sm">
          <div className="flex size-24 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle2 className="size-12 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {lang === "om" ? "Baga milkaa'ite!" : "Activation successful!"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {lang === "om"
                ? "Herregni kee hojii irra ooleera. Daashboordii kee banuuf eeggadhu..."
                : "Your account is now activated. Opening your dashboard..."}
            </p>
          </div>
          <div className="h-1 w-32 overflow-hidden rounded-full bg-muted">
            <div className="h-full animate-[slide_1s_ease-in-out_infinite] rounded-full bg-emerald-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex h-16 items-center gap-3 border-b border-border/60 bg-card/50 px-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <GraduationCap className="size-5 text-primary" />
          </div>
          <span className="font-bold text-sm">Oromia Academy</span>
        </div>
        <div className="ml-auto">
          <span className="text-xs text-muted-foreground">
            Oromia Academy
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Icon + title */}
          <div className="mb-8 flex flex-col items-center gap-4 text-center">
            <div className="relative">
              <div className="flex size-20 items-center justify-center rounded-3xl bg-primary/10 shadow-lg shadow-primary/10">
                <KeyRound className="size-10 text-primary" />
              </div>
              <div className="absolute -right-1 -top-1 size-5 rounded-full bg-primary" />
            </div>

            <div>
              <h1 className="text-2xl font-bold leading-tight text-foreground">
                {lang === "om"
                  ? "Herrega Kee Haa Hojiirra Oolu"
                  : "Activate Your Account"}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {lang === "om"
                  ? "Herregni kee milkaa'inaan uumameera. Daashboordii Barataa seenuuf, koodii activation Oromia Academy irraa argatte galchi."
                  : "Your account has been created successfully. To access the Student Dashboard, enter the activation code provided by Oromia Academy."}
              </p>
            </div>

            {/* Student name badge */}
            {profile?.fullName && (
              <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5">
                <div className="size-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground grid place-items-center">
                  {profile.fullName[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium text-foreground">{profile.fullName}</span>
              </div>
            )}
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-xl shadow-black/5">
            <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-5">
              {/* Code input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-foreground">
                  {lang === "om" ? "Koodii Activation" : "Activation Code"}
                </label>
                <CodeInput value={code} onChange={setCode} disabled={busy} />
                <p className="text-xs text-muted-foreground text-center">
                  {lang === "om"
                    ? "Fakkeenya: OA-A7K9-P2XM"
                    : "Example: OA-A7K9-P2XM"}
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                size="lg"
                disabled={busy || code.length < 8}
                className="w-full rounded-xl py-6 text-base font-semibold shadow-lg shadow-primary/25"
              >
                {busy ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    {lang === "om" ? "Madaalaa jira..." : "Validating..."}
                  </span>
                ) : lang === "om" ? (
                  "Herrega Haa Hojiirra Oolu"
                ) : (
                  "Activate Account"
                )}
              </Button>
            </form>
          </div>

          {/* No code? Contact */}
          <div className="mt-8 rounded-2xl border border-border/60 bg-muted/30 p-5 text-center">
            <p className="text-sm font-medium text-foreground">
              {lang === "om" ? "Koodii hin qabduu?" : "Don't have an activation code?"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {lang === "om"
                ? "Admin Telegram irratti qunnami:"
                : "Contact the admin on Telegram:"}
            </p>
            <a
              href="https://t.me/SuufiyaanBJICS"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-lg"
            >
              <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.932z"/>
              </svg>
              @SuufiyaanBJICS
            </a>
          </div>

          {/* Language note */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            {lang === "om"
              ? "Koodiin kun Oromia Academy'n barattoota isaaf qofa kennamaadha."
              : "Activation codes are issued exclusively by Oromia Academy."}
          </p>
        </div>
      </main>
    </div>
  );
}
