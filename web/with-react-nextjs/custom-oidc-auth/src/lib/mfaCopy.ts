import { formatErrorMessage } from "@/lib/format";

interface MfaErrorInput {
  isCodeRejected: boolean;
  attemptsRemaining: number | null;
  errorMessage: string | null;
}

export function formatAttemptsRemaining(count: number) {
  return `${count} attempt${count === 1 ? "" : "s"} remaining.`;
}

export function describeMfaError({ isCodeRejected, attemptsRemaining, errorMessage }: MfaErrorInput) {
  if (isCodeRejected) {
    return {
      title: "Incorrect code",
      message: attemptsRemaining === null ? "Try again." : formatAttemptsRemaining(attemptsRemaining),
    };
  }

  if (errorMessage) {
    return { title: "Two-factor failed", message: formatErrorMessage(errorMessage) };
  }

  return null;
}

export function readOtpSecret(uri: string) {
  return new URLSearchParams(uri.split("?")[1] ?? "").get("secret");
}
