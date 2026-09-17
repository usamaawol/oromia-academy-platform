/**
 * Turns an error thrown by the server-fn bridge into something a page can
 * toast. Known error codes are translated; unknown codes and short informative
 * server messages (e.g. missing server configuration) are passed through.
 */
import type { TranslationKey } from "@/i18n/translations";

const CODE_KEYS: Record<string, TranslationKey> = {
  "auth/required": "error.auth.required",
  "auth/invalid-session": "error.auth.required",
  "auth/forbidden": "error.auth.forbidden",
  "auth/suspended": "error.auth.suspended",
};

type Translator = (key: TranslationKey, vars?: Record<string, string | number>) => string;

function messageOf(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (
    e &&
    typeof e === "object" &&
    "message" in e &&
    typeof (e as { message: unknown }).message === "string"
  ) {
    return (e as { message: string }).message;
  }
  return "";
}

export function serverErrorMessage(e: unknown, t: Translator): string {
  const msg = messageOf(e).trim();
  if (!msg) return t("common.error");

  const key = CODE_KEYS[msg];
  if (key) return t(key);

  // Unknown server error code (e.g. "exam/not-open") — keep it visible.
  if (/^[a-z][a-z0-9]*\/[a-z0-9-]+$/.test(msg)) {
    return t("error.unknown", { code: msg });
  }

  // Short informative server message (env misconfiguration, validation, etc.)
  if (msg.length <= 220) return msg;

  return t("common.error");
}
