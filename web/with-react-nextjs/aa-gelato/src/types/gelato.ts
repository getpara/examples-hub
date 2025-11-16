// Types for Gelato smart wallet response events
export interface GelatoTransactionStatus {
  transactionHash?: string;
}

export interface GelatoTransactionError {
  message: string;
}