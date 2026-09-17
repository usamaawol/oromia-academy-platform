import { DownloadCloud, RefreshCw, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const useIsStandalone = () => {
  const [standalone, setStandalone] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as unknown as { standalone?: boolean }).standalone === true
      : false,
  );
  useEffect(() => {
    const onAppInstalled = () => setStandalone(true);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => window.removeEventListener("appinstalled", onAppInstalled);
  }, []);
  return standalone;
};

/**
 * PWA shell handling: install prompt, offline-ready toast and update banner.
 * All browser APIs run in effects so this is safe under SSR.
 */
export function PwaInstaller() {
  const { t } = useI18n();
  const standalone = useIsStandalone();
  const [installEvt, setInstallEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);

  useEffect(() => {
    let disposed = false;
    let unregister: (() => Promise<void>) | undefined;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      if (!disposed) setInstallEvt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    void import("virtual:pwa-register")
      .then(({ registerSW }) => {
        if (disposed) return;
        unregister = registerSW({
          immediate: true,
          onOfflineReady: () => {
            if (!disposed) setOfflineReady(true);
          },
          onNeedRefresh: () => {
            if (!disposed) setNeedRefresh(true);
          },
        });
      })
      .catch(() => {
        /* SW registration unavailable (dev / unsupported browser) — ignore */
      });

    return () => {
      disposed = true;
      window.removeEventListener("beforeinstallprompt", onPrompt);
      void unregister?.();
    };
  }, []);

  useEffect(() => {
    if (!offlineReady) return;
    const id = window.setTimeout(() => setOfflineReady(false), 3600);
    return () => window.clearTimeout(id);
  }, [offlineReady]);

  const handleInstall = async () => {
    if (!installEvt) return;
    await installEvt.prompt();
    await installEvt.userChoice;
    setInstallEvt(null);
  };

  return (
    <>
      {needRefresh && (
        <div className="fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4">
          <div className="flex w-full max-w-sm items-center gap-3 rounded-xl border border-primary/40 bg-card p-3 shadow-lg">
            <RefreshCw className="size-5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{t("pwa.updateReady")}</p>
              <p className="text-xs text-muted-foreground">{t("pwa.updateBody")}</p>
            </div>
            <a href="/" onClick={() => window.location.reload()}>
              <Button size="sm" onClick={() => window.location.reload()}>
                {t("pwa.reload")}
              </Button>
            </a>
          </div>
        </div>
      )}

      {!standalone && installEvt && !dismissed && (
        <div className="fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4">
          <div className="flex w-full max-w-sm items-center gap-3 rounded-xl border bg-card p-3 shadow-lg">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <DownloadCloud className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{t("pwa.install")}</p>
              <p className="text-xs text-muted-foreground">{t("pwa.installBody")}</p>
            </div>
            <Button size="sm" onClick={() => void handleInstall()}>
              {t("pwa.installCta")}
            </Button>
            <button
              type="button"
              aria-label={t("common.close")}
              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setDismissed(true)}
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
