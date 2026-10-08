const HANDLE_TYPES = ["TWITTER", "TELEGRAM"] as const;

export type HandleType = (typeof HANDLE_TYPES)[number];

export interface HandleEntry {
  handle: string;
  type: HandleType;
}

export type GenerateWalletRequestBody = HandleEntry;

export interface GenerateWalletResponse {
  success: boolean;
  handle?: string;
  wallet?: {
    address?: string;
  };
  error?: string;
}

export type WalletResultStatus = "pending" | "success" | "failed";

export interface WalletResult extends HandleEntry {
  walletAddress: string;
  status: WalletResultStatus;
  errorMessage?: string;
}

export const HANDLE_TYPE_LABELS: Record<HandleType, string> = {
  TWITTER: "X (Twitter)",
  TELEGRAM: "Telegram",
};

export const HANDLE_TYPE_OPTIONS = HANDLE_TYPES.map((type) => ({ value: type, label: HANDLE_TYPE_LABELS[type] }));

export function isHandleType(value: string): value is HandleType {
  return HANDLE_TYPES.some((type) => type === value);
}
