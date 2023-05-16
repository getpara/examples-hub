export interface SuccessfulSignatureRes {
  signature: string;
}

export interface DeniedSignatureRes {
  pendingTransactionId: string;
}

export interface DeniedSignatureResWithUrl extends DeniedSignatureRes {
  transactionReviewUrl: string;
}

export type SignatureRes = SuccessfulSignatureRes | DeniedSignatureRes;
export type FullSignatureRes = SuccessfulSignatureRes | DeniedSignatureResWithUrl;
