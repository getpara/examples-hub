export type Token = {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  value: number;
  icon: string;
  address: string;
  decimals: number;
};

export interface TokenApiResponse {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string | null;
  tags: (string | null)[];
  created_at: string;
  extensions: Record<string, unknown>;
  daily_volume?: number | null;
  freeze_authority?: string | null;
  mint_authority?: string | null;
  minted_at?: string | null;
  permanent_delegate?: string | null;
}

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string | null;
  tags: (string | null)[];
  created_at: string;
  extensions: Record<string, unknown>;
  daily_volume?: number | null;
  freeze_authority?: string | null;
  mint_authority?: string | null;
  minted_at?: string | null;
  permanent_delegate?: string | null;
}

export interface JupiterQuoteResponse {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  priceImpactPct: string;
  routePlan: Array<{
    swapInfo: {
      ammKey: string;
      label?: string;
      inputMint: string;
      outputMint: string;
      inAmount: string;
      outAmount: string;
      feeAmount: string;
      feeMint: string;
    };
    percent: number;
  }>;
}
