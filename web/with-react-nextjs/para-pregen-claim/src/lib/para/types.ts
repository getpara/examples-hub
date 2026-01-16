// Request/Response types for pregen wallet API

export interface GenerateWalletRequestBody {
  email: string;
}

export interface GenerateWalletResponse {
  success: boolean;
  email?: string;
  wallet?: {
    address?: string;
  };
  error?: string;
}

export interface GetWalletShareResponse {
  success: boolean;
  userShare?: string | null;
  walletId?: string;
  error?: string;
}
