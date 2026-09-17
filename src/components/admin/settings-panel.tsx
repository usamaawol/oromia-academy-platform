import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useAdminData } from "@/components/admin/context";
import { Field, PanelHeader } from "@/components/admin/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/i18n";
import { saveSettings } from "@/lib/data";
import type { AcademySettings } from "@/lib/types";

export function SettingsPanel() {
  const { t } = useI18n();
  const { settings, reload, record } = useAdminData();
  const [draft, setDraft] = useState<AcademySettings>(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => setDraft(settings), [settings]);

  async function save() {
    setSaving(true);
    try {
      await saveSettings(draft);
      await record("settings.save");
      await reload();
      toast.success(t("common.success"));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setSaving(false);
    }
  }

  function set<K extends keyof AcademySettings>(key: K, value: AcademySettings[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  return (
    <div className="space-y-5">
      <PanelHeader title={t("admin.settings")} subtitle={t("admin.settingsSubtitle")}>
        <Button disabled={saving} onClick={() => void save()}>
          {saving ? t("common.saving") : t("common.save")}
        </Button>
      </PanelHeader>

      <div className="grid gap-4 rounded-lg border bg-card p-5 sm:grid-cols-2">
        <Field label={t("admin.telegramHandle")}>
          <Input
            value={draft.telegramHandle}
            onChange={(e) => set("telegramHandle", e.target.value)}
          />
        </Field>
        <Field label={t("admin.telegramUrl")}>
          <Input value={draft.telegramUrl} onChange={(e) => set("telegramUrl", e.target.value)} />
        </Field>
        <Field label={`${t("admin.heroTitle")} (OM)`}>
          <Input value={draft.heroTitleOm} onChange={(e) => set("heroTitleOm", e.target.value)} />
        </Field>
        <Field label={`${t("admin.heroTitle")} (EN)`}>
          <Input value={draft.heroTitleEn} onChange={(e) => set("heroTitleEn", e.target.value)} />
        </Field>
        <Field label={`${t("admin.heroSubtitle")} (OM)`}>
          <Textarea
            value={draft.heroSubtitleOm}
            onChange={(e) => set("heroSubtitleOm", e.target.value)}
          />
        </Field>
        <Field label={`${t("admin.heroSubtitle")} (EN)`}>
          <Textarea
            value={draft.heroSubtitleEn}
            onChange={(e) => set("heroSubtitleEn", e.target.value)}
          />
        </Field>
        <Field label={`${t("admin.announcement")} (OM)`} hint={t("admin.announcementHint")}>
          <Textarea
            value={draft.announcementOm}
            onChange={(e) => set("announcementOm", e.target.value)}
          />
        </Field>
        <Field label={`${t("admin.announcement")} (EN)`}>
          <Textarea
            value={draft.announcementEn}
            onChange={(e) => set("announcementEn", e.target.value)}
          />
        </Field>
        <Field label={t("common.email")}>
          <Input
            type="email"
            value={draft.contactEmail}
            onChange={(e) => set("contactEmail", e.target.value)}
          />
        </Field>
        <Field label={t("common.phone")}>
          <Input value={draft.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} />
        </Field>
      </div>
    </div>
  );
}
