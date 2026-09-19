import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { useAuth } from "@/lib/auth";
import { claimOwner, getOwnerStatus } from "@/lib/server-fns";
import { useServerFn } from "@/hooks/use-server-fn";

// Structural shape of a TanStack Start server fn, as consumed by useServerFn.
type ServerFnLike = {
  (opts: { data?: unknown }): Promise<unknown>;
  url: string;
  method?: string;
};

/**
 * One-time bootstrap: lets the first signed-in account on a fresh database
 * claim the `owner` role so the admin panel can be reached. Only shows while
 * no owner exists and the current account is still a student.
 */
export function ClaimOwnerBanner() {
  const { t } = useI18n();
  const { profile, refreshProfile } = useAuth();
  const call = useServerFn();
  const navigate = useNavigate();
  const [hasOwner, setHasOwner] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void call(getOwnerStatus as unknown as ServerFnLike, undefined)
      .then((r) => setHasOwner(Boolean((r as { hasOwner?: boolean } | undefined)?.hasOwner)))
      .catch(() => setHasOwner(true)); // if the check fails, don't nag the user
  }, [call]);

  if (hasOwner === null || hasOwner) return null;
  if (profile?.role !== "student") return null;

  const handleClaim = async () => {
    setBusy(true);
    try {
      await call(claimOwner as unknown as ServerFnLike, undefined);
      await refreshProfile();
      toast.success(t("auth.ownerClaimed"));
      // Navigate to the admin panel now that the role is elevated.
      void navigate({ to: "/admin" });
    } catch (err) {
      console.error("Failed to claim owner:", err);
      toast.error(t("auth.ownerExists"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Alert className="mb-6 border-primary/40 bg-primary/5">
      <ShieldCheck className="size-4 text-primary" />
      <AlertTitle>{t("auth.ownerSetupTitle")}</AlertTitle>
      <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>{t("auth.ownerSetupBody")}</span>
        <Button size="sm" onClick={() => void handleClaim()} disabled={busy}>
          {busy ? t("common.loading") : t("auth.claimOwner")}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
