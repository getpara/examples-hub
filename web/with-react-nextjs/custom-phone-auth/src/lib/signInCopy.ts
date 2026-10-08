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

export function getVerifyTitle(channel: "email" | "phone", hasFrame: boolean, hasPasskey: boolean) {
  if (hasPasskey && !hasFrame) {
    return "Verify your passkey";
  }

  if (hasFrame && !hasPasskey) {
    return channel === "email" ? "Check your email" : "Check your phone";
  }

  return "Finish signing in";
}

export function getVerifyDescription(destination: string, hasFrame: boolean, hasPasskey: boolean) {
  if (hasPasskey && !hasFrame) {
    return "Create or use your passkey to finish signing in.";
  }

  if (hasFrame && !hasPasskey) {
    return `Enter the code sent to ${destination}.`;
  }

  return "Finish the Para verification below.";
}
