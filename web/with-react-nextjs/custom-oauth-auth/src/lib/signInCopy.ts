import { formatErrorMessage } from "@/lib/format";

const POPUP_BLOCKED_TITLE = "Pop-up blocked";

export function describeSignInError(message: string | null) {
  const trimmed = message?.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith(`${POPUP_BLOCKED_TITLE}.`)) {
    return { title: POPUP_BLOCKED_TITLE, message: trimmed.slice(POPUP_BLOCKED_TITLE.length + 1).trim() };
  }

  return { title: "Sign in failed", message: formatErrorMessage(trimmed) };
}
