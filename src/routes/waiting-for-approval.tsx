/**
 * Waiting-for-Approval Page — /waiting-for-approval
 *
 * Shown to students who have registered but are not yet activated.
 *
 * State machine (mirrors activationStatus on the user profile):
 *   pending   → "Waiting for admin approval" (no code shown)
 *   approved  → "Approved! Your activation code is OA-XXXX-XXXX" + Activate button
 *   rejected  → "Your request was not approved" + optional reason
 *   suspended → "Your account has been suspended"
 *   active    → redirect to /dashboard (already activated)
 *
 * Real-time: uses Firestore onSnapshot so the page auto-updates when admin
 * approves or rejects without the student needing to refresh.
 *
 * Security: the raw activation code is fetched via a server function that
 * verifies activationStatus === "approved" + userId match server-side.
 * The browser never directly reads the activationCodeSecrets collection.
 */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  Clock,
  XCircle,
  ShieldOff,
  KeyRound,
  Loader2,
  GraduationCap,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { onSnapshot, doc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { useAuth } from "@/lib/auth";
import { getMyPendingCode, redeemActivationCode } from "@/lib/server-fns";
import { serverErrorMessage } from "@/lib/server-error";
import { useServerFn } from "@/hooks/use-server-fn";
import { getDb, firebaseReady } from "@/lib/firebase";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/waiting-for-approval")({
  head: () => ({
    meta: [
      { title: "Eeyyama Eegachaa — Oromia Academy" },
      {
        name: "description",
        content: "Eeyyama bulchiinsaa eegachaa jirta.",
      },
    ],
  }),
  component: WaitingForApprovalPage,
});

type PageStatus = "loading" | "pending" | "approved" | "rejected" | "suspended" | "active";

function WaitingForApprovalPage() {
  const { lang } = useI18n();
  const { user, profile, loading, isActivated, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const call = useServerFn();

  const [pageStatus, setPageStatus] = useState<PageStatus>("loading");
  const [activationCode, setActivationCode] = useState<string | null>(null);
  const [fetchingCode, setFetchingCode] = useState(false);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const snapshotUnsub = useRef<(() => void) | null>(null);

  // Fetch the raw activation code from the server (only works when approved)
  const fetchCode = useCallback(async () => {
    if (!user) return;
    setFetchingCode(true);
    try {
      const result = await call(getMyPendingCode, undefined);
      if (result.code) {
        setActivationCode(result.code);
      }
    } catch (err) {
      console.error("Failed to fetch activation code:", err);
    } finally {
      setFetchingCode(false);
    }
  }, [user, call]);

  // Update page state based on a given activationStatus
  const updateFromStatus = useCallback(
    async (status: string | undefined | null, reason?: string | null) => {
      const s = (status ?? "pending") as PageStatus;
      setPageStatus(s);
      if (s === "active") {
        await navigate({ to: "/dashboard" });
      } else if (s === "approved" && !activationCode) {
        await fetchCode();
      }
      if (reason !== undefined) setRejectionReason(reason ?? null);
    },
    [activationCode, fetchCode, navigate],
  );

  // Set up Firestore real-time listener on the user's own profile doc
  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/auth" });
      return;
    }
    if (isActivated) {
      void navigate({ to: "/dashboard" });
      return;
    }

    // Initial state from profile (no flicker)
    const initStatus = (profile?.activationStatus ?? "pending") as PageStatus;
    setPageStatus(initStatus);
    if (initStatus === "rejected") {
      setRejectionReason((profile as { rejectionReason?: string })?.rejectionReason ?? null);
    }
    if (initStatus === "approved" && !activationCode) {
      void fetchCode();
    }

    // Real-time listener (Firebase only)
    if (firebaseReady) {
      const db = getDb();
      const userRef = doc(db, "users", user.uid);
      snapshotUnsub.current = onSnapshot(
        userRef,
        (snap) => {
          if (!snap.exists()) return;
          const data = snap.data();
          const newStatus = data["activationStatus"] as string | undefined;
          const reason = data["rejectionReason"] as string | undefined;
          void updateFromStatus(newStatus, reason);
          // Refresh auth context profile so guards pick up the change
          void refreshProfile();
        },
        (err) => {
          console.error("Profile snapshot error:", err);
        },
      );
    }

    return () => {
      snapshotUnsub.current?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshProfile();
      const status = (profile?.activationStatus ?? "pending") as PageStatus;
      setPageStatus(status);
      if (status === "approved" && !activationCode) {
        await fetchCode();
      }
      if (status === "active") {
        await navigate({ to: "/dashboard" });
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleActivate = async () => {
    if (!activationCode) return;
    setActivating(true);
    try {
      const result = await call(redeemActivationCode, { code: activationCode });
      if (result.ok) {
        setActivated(true);
        await refreshProfile();
        toast.success(
          lang === "om"
            ? "Herregni kee milkaa'inaan hojiiirra kaafame! Daashboordii kee baniisaa."
            : "Your account has been successfully activated! Opening your dashboard.",
        );
        setTimeout(() => {
          void navigate({ to: "/dashboard" });
        }, 1500);
      }
    } catch (err) {
      const msg = serverErrorMessage(err, { t: (k: string) => k });
      toast.error(
        lang === "om"
          ? `Dhiibbaa: ${msg}`
          : `Activation failed: ${msg}`,
      );
    } finally {
      setActivating(false);
    }
  };

  const handleCopy = async () => {
    if (!activationCode) return;
    try {
      await navigator.clipboard.writeText(activationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  if (loading || pageStatus === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Academy branding */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 shadow-inner">
          <GraduationCap className="size-8 text-primary" />
        </div>
        <p className="text-xl font-bold tracking-tight">{lang === "om" ? "Oromia Academy" : "Oromia Academy"}</p>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-8 shadow-soft">

        {/* ───── PENDING ───── */}
        {pageStatus === "pending" && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="grid size-16 place-items-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <Clock className="size-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {lang === "om" ? "Eeyyama Eegachaa Jirta" : "Waiting for Approval"}
              </h1>
              <p className="mt-2 text-muted-foreground">
                {lang === "om"
                  ? "Galmeen keessan milkaa'eera. Amma eeyyama bulchiinsa Oromia Academy eegaa jirtu."
                  : "Your account has been created successfully. Please wait while an Oromia Academy administrator reviews your registration."}
              </p>
            </div>
            <div className="w-full rounded-xl bg-muted/50 px-4 py-3 text-left text-sm">
              <p className="font-medium text-muted-foreground">
                {lang === "om" ? "Imeelii:" : "Email:"}
              </p>
              <p className="mt-1 font-semibold">{profile?.email}</p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm dark:border-yellow-800 dark:bg-yellow-900/20">
              <Clock className="size-4 shrink-0 text-yellow-600 dark:text-yellow-400" />
              <span className="text-yellow-800 dark:text-yellow-300">
                {lang === "om" ? "🟡 Eeyyama Eegachaa" : "🟡 Pending Approval"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {lang === "om"
                ? "Bulchiinsi yoo isin mirkaneesse, fuula kuni ofumaan ni haaromfama."
                : "This page will automatically update when an administrator reviews your request."}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleManualRefresh()}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />
              {lang === "om" ? "Haaromsi" : "Refresh"}
            </Button>
          </div>
        )}

        {/* ───── APPROVED — code revealed ───── */}
        {pageStatus === "approved" && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="grid size-16 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 className="size-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {lang === "om" ? "🎉 Eeyyamame!" : "🎉 Your Account Is Approved!"}
              </h1>
              <p className="mt-2 text-muted-foreground">
                {lang === "om"
                  ? "Bulchiinsaan mirkanaameera. Koodii activation kee fayyadami herrega kee hojiirraa kaasuf."
                  : "The administrator has approved your registration. Use your unique activation code below to activate your account."}
              </p>
            </div>

            {/* Activation code display */}
            {fetchingCode ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                <span className="text-sm">
                  {lang === "om" ? "Koodii fe'aa jira..." : "Loading your code..."}
                </span>
              </div>
            ) : activationCode ? (
              <>
                <div className="w-full">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {lang === "om" ? "Koodii Activation Kee" : "Your Activation Code"}
                  </p>
                  <div className="relative flex items-center justify-center">
                    <div className="w-full rounded-2xl border-2 border-primary/30 bg-primary/5 px-6 py-5 font-mono text-3xl font-bold tracking-[0.25em] text-primary">
                      {activationCode}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => void handleCopy()}
                      title={lang === "om" ? "Garagalchi" : "Copy"}
                    >
                      {copied
                        ? <Check className="size-4 text-emerald-500" />
                        : <Copy className="size-4 text-muted-foreground" />}
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {lang === "om"
                      ? "Koodiin kun herrega kee qofaaf kan qophaaye. Nama biraatti hin qoodin."
                      : "This code is unique to your account. Do not share it with others."}
                  </p>
                </div>

                {activated ? (
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-5" />
                    <span className="font-semibold">
                      {lang === "om" ? "Milkaa'eera! Daashboordii banaa..." : "Activated! Opening dashboard..."}
                    </span>
                  </div>
                ) : (
                  <Button
                    className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    size="lg"
                    onClick={() => void handleActivate()}
                    disabled={activating}
                  >
                    {activating
                      ? <><Loader2 className="size-4 animate-spin" />{lang === "om" ? "Hojiirraa kaafamaa..." : "Activating..."}</>
                      : <><KeyRound className="size-4" />{lang === "om" ? "Herrega Hojiirraa Kaasi" : "Activate My Account"}</>
                    }
                  </Button>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  {lang === "om" ? "Koodiin argamuu dadhabde." : "Could not load your code."}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void fetchCode()}
                  className="gap-2"
                >
                  <RefreshCw className="size-3.5" />
                  {lang === "om" ? "Irra Deebi'i Yaalii" : "Try Again"}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ───── REJECTED ───── */}
        {pageStatus === "rejected" && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="grid size-16 place-items-center rounded-full bg-red-100 dark:bg-red-900/30">
              <XCircle className="size-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {lang === "om" ? "Eeyyamni Didan" : "Registration Not Approved"}
              </h1>
              <p className="mt-2 text-muted-foreground">
                {lang === "om"
                  ? "Gaaffiin galmee keessan eeyyamame miti."
                  : "Your registration request was not approved."}
              </p>
            </div>
            {rejectionReason && (
              <div className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm dark:border-red-800 dark:bg-red-900/20">
                <p className="font-semibold text-red-800 dark:text-red-300">
                  {lang === "om" ? "Sababa:" : "Reason:"}
                </p>
                <p className="mt-1 text-red-700 dark:text-red-400">{rejectionReason}</p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              {lang === "om"
                ? "Odeeffannoo dabalataaf Oromia Academy bulchiinsa qunnami."
                : "Please contact Oromia Academy administration for more information."}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleManualRefresh()}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />
              {lang === "om" ? "Haala Haaromsi" : "Refresh Status"}
            </Button>
          </div>
        )}

        {/* ───── SUSPENDED ───── */}
        {pageStatus === "suspended" && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="grid size-16 place-items-center rounded-full bg-orange-100 dark:bg-orange-900/30">
              <ShieldOff className="size-8 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {lang === "om" ? "Herregni Kee Dhaabbateera" : "Account Suspended"}
              </h1>
              <p className="mt-2 text-muted-foreground">
                {lang === "om"
                  ? "Herregni kee dhaabbateera. Oromia Academy bulchiinsa qunnami."
                  : "Your account has been suspended. Please contact Oromia Academy administration."}
              </p>
            </div>
          </div>
        )}

        {/* ───── ACTIVE (fallback, should redirect) ───── */}
        {pageStatus === "active" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle2 className="size-12 text-emerald-500" />
            <p className="font-semibold">
              {lang === "om" ? "Daashboordii banaa..." : "Redirecting to dashboard..."}
            </p>
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        © 2026 Oromia Academy
      </p>
    </div>
  );
}
