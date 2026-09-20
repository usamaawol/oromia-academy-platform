/**
 * Admin — Academy Settings
 */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, Trophy, Eye, EyeOff } from "lucide-react";
import { useI18n } from "@/i18n";
import { adminDiagnostics, adminGetSettings, adminSaveSettings } from "@/lib/server-fns";
import { serverErrorMessage } from "@/lib/server-error";
import { useServerFn } from "@/hooks/use-server-fn";
import type { AcademySettings } from "@/lib/schema";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/admin/settings")({
  component: SettingsPage,
});

const DEFAULT: AcademySettings = {
  telegramHandle: "",
  telegramUrl: "",
  announcementOm: "",
  announcementEn: "",
  contactEmail: "",
  contactPhone: "",
  rankingsPublished: false,
};

type SystemDiagnostics = {
  serviceAccountSet: boolean;
  serviceAccountValid: boolean;
  projectId: string | null;
  apiKeySet: boolean;
  /** @see fb-admin.server.ts for definitions */
  tokenMode: "service-account" | "user-token" | "none";
  /** @deprecated Use tokenMode instead — kept for backwards compat. */
  tokenAcquired?: boolean;
  firestoreReachable: boolean;
};

function SettingsPage() {
  const { t } = useI18n();
  const call = useServerFn();
  const [settings, setSettings] = useState<AcademySettings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [diag, setDiag] = useState<SystemDiagnostics | null>(null);

  useEffect(() => {
    void call(adminGetSettings, undefined)
      .then((s) => setSettings(s as AcademySettings))
      .catch((e) => toast.error(serverErrorMessage(e, t)))
      .finally(() => setLoading(false));
    void call(adminDiagnostics, undefined)
      .then((d) => setDiag(d as SystemDiagnostics))
      .catch(() => {
        /* non-fatal */
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = <K extends keyof AcademySettings>(k: K, v: AcademySettings[K]) =>
    setSettings((p) => ({ ...p, [k]: v }));

  async function save() {
    setSaving(true);
    try {
      await call(adminSaveSettings, { settings });
      toast.success(t("common.success"));
    } catch (e) {
      toast.error(serverErrorMessage(e, t));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const diagRows: { label: string; ok: boolean; hint?: string }[] = diag
    ? [
        {
          label: "Service account (FIREBASE_SERVICE_ACCOUNT_JSON)",
          ok: diag.serviceAccountSet && diag.serviceAccountValid,
          hint:
            diag.serviceAccountSet && !diag.serviceAccountValid
              ? "Present but invalid JSON / missing required fields"
              : undefined,
        },
        { label: "Firebase API key (server)", ok: diag.apiKeySet },
        {
          label: "Firestore auth mode",
          ok: diag.tokenMode !== "none",
          hint:
            diag.tokenMode === "service-account"
              ? "Service-account OAuth (privileged / Pro)"
              : diag.tokenMode === "user-token"
                ? "Caller x-id-token proxy (Vercel Hobby — no Pro required)"
                : "Could not resolve any Firestore token",
        },
        { label: "Firestore reachable", ok: diag.firestoreReachable },
      ]
    : [];

  function reloadDiag() {
    void call(adminDiagnostics, undefined)
      .then((d) => setDiag(d as SystemDiagnostics))
      .catch((e) => toast.error(serverErrorMessage(e, t)));
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">{t("common.settings")}</h1>

      <div className="space-y-6">
        {diag && (
          <Card className="border-border">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Server status</CardTitle>
              <Button variant="ghost" size="sm" onClick={reloadDiag}>
                <RefreshCw className="size-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {diagRows.map((r) => (
                <div key={r.label} className="flex items-start justify-between gap-4 text-sm">
                  <div className="min-w-0">
                    <span className="text-muted-foreground">{r.label}</span>
                    {r.hint && (
                      <p className="text-[11px] leading-tight text-muted-foreground/90 mt-0.5">
                        {r.hint}
                      </p>
                    )}
                  </div>
                  <span
                    className={cn(
                      "shrink-0 font-medium",
                      r.ok
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400",
                    )}
                  >
                    {r.ok ? "Ready" : "Missing / broken"}
                  </span>
                </div>
              ))}
              {diag.projectId && (
                <p className="pt-1 text-xs text-muted-foreground">Project: {diag.projectId}</p>
              )}
              {diag.tokenMode === "user-token" && (
                <p className="pt-1 text-sm text-green-600 dark:text-green-400">
                  ✅ Running in <b>user-token proxy mode</b> — no Vercel Pro / service account
                  required. Firestore rules enforce role-based access for all admin operations.
                </p>
              )}
              {diag.tokenMode !== "service-account" && diag.tokenMode !== "user-token" && (
                <p className="pt-1 text-sm text-amber-600 dark:text-amber-400">
                  For full privileged server access (optional Pro upgrade), set{" "}
                  <code className="font-mono text-xs">FIREBASE_SERVICE_ACCOUNT_JSON</code> in env
                  vars, then press refresh. The app works fine without it using the signed-in user's
                  own token.
                </p>
              )}
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Telegram</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t("admin.telegramHandle")}</Label>
              <Input
                value={settings.telegramHandle}
                onChange={(e) => set("telegramHandle", e.target.value)}
                placeholder="@handle"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Telegram URL</Label>
              <Input
                value={settings.telegramUrl}
                onChange={(e) => set("telegramUrl", e.target.value)}
                placeholder="https://t.me/..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Announcement (Afaan Oromoo)</Label>
              <Textarea
                value={settings.announcementOm}
                onChange={(e) => set("announcementOm", e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Announcement (English)</Label>
              <Textarea
                value={settings.announcementEn}
                onChange={(e) => set("announcementEn", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t("common.email")}</Label>
              <Input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => set("contactEmail", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("common.phone")}</Label>
              <Input
                value={settings.contactPhone}
                onChange={(e) => set("contactPhone", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          settings.rankingsPublished
            ? "border-green-500/40 bg-green-500/5 dark:bg-green-900/10"
            : "border-border"
        )}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="size-5 text-primary" />
              Leaderboard & Rankings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-start justify-between gap-4 rounded-lg bg-muted/50 p-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="rankings-publish"
                    className="text-base font-semibold cursor-pointer"
                  >
                    Publish student rankings
                  </Label>
                  {settings.rankingsPublished ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-400">
                      <Eye className="size-3" /> LIVE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      <EyeOff className="size-3" /> DRAFT
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  When enabled, students can view the full leaderboard anonymously.
                  Each student sees their nickname instead of their real name for privacy.
                  Students always see their own rank even when unpublished.
                </p>
              </div>
              <Switch
                id="rankings-publish"
                checked={settings.rankingsPublished}
                onCheckedChange={(v) => set("rankingsPublished", v)}
              />
            </div>
            <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground space-y-2">
              <p className="font-medium text-foreground/80">💡 Privacy note</p>
              <ul className="list-disc list-inside space-y-1 text-[13px]">
                <li>
                  <b>Published:</b> All students see the leaderboard with nicknames.
                  Real names and emails are never shown to other students.
                </li>
                <li>
                  <b>Unpublished:</b> Students only see their own personal rank.
                  Nobody else can see their position.
                </li>
                <li>
                  <b>Admins &amp; Owners:</b> Always see the full leaderboard with real names
                  and contact info, regardless of this setting.
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Button className="w-full" onClick={() => void save()} disabled={saving}>
          {saving ? t("common.saving") : t("common.save")}
        </Button>
      </div>
    </div>
  );
}
