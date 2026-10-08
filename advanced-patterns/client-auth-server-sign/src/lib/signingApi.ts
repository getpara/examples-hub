export const SIGNING_ROUTE = "/api/signing";

export interface SigningRequestBody {
  session: string;
  transaction: string;
}

export interface SigningResponse {
  signedTransaction?: string;
  transactionHash?: string;
  error?: string;
  details?: string;
}

export interface ServerSignedTransaction {
  signedTransaction: string;
  transactionHash: string;
}

export async function requestServerSignature(body: SigningRequestBody): Promise<ServerSignedTransaction> {
  const response = await fetch(SIGNING_ROUTE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data: SigningResponse = await response.json();

  if (!response.ok || !data.transactionHash || !data.signedTransaction) {
    throw new Error(data.details ?? data.error ?? "Failed to sign and broadcast the transaction");
  }

  return { signedTransaction: data.signedTransaction, transactionHash: data.transactionHash };
}
