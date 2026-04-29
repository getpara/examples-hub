export interface GenerateWalletRequestBody {
  email: string;
}

export interface GenerateWalletResponse {
  success: boolean;
  email?: string;
  customId?: string;
  wallet?: {
    id?: string;
    address?: string;
  };
  error?: string;
}

export interface GetWalletShareResponse {
  success: boolean;
  userShare?: string | null;
  walletId?: string;
  customId?: string;
  error?: string;
}
