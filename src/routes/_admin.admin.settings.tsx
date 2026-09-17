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
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw } from "lucide-react";
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
};

type SystemDiagnostics = {
  serviceAccountSet: boolean;
  serviceAccountValid: boolean;
  projectId: string | null;
  apiKeySet: boolean;
  tokenAcquired: boolean;
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

  const diagRows: { label: string; ok: boolean }[] = diag
    ? [
        {
          label: "Service account (FIREBASE_SERVICE_ACCOUNT_JSON)",
          ok: diag.serviceAccountSet && diag.serviceAccountValid,
        },
        { label: "Firebase API key (server)", ok: diag.apiKeySet },
        { label: "Firestore token", ok: diag.tokenAcquired },
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
                <div key={r.label} className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">{r.label}</span>
                  <span
                    className={cn(
                      "font-medium",
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
              {!diag.serviceAccountValid && (
                <p className="pt-1 text-sm text-amber-600 dark:text-amber-400">
                  Working in session-token mode using your signed-in account (no service account
                  set). Reads/writes depend on your Firestore security rules. For full authority,
                  set{" "}
                  <code className="font-mono text-xs">FIREBASE_SERVICE_ACCOUNT_JSON</code> in{" "}
                  <code className="font-mono text-xs">.env</code>, then press refresh.
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

        <Button className="w-full" onClick={() => void save()} disabled={saving}>
          {saving ? t("common.saving") : t("common.save")}
        </Button>
      </div>
    </div>
  );
}
