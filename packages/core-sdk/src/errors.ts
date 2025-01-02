export class TransactionReviewError extends Error {
  transactionReviewUrl: string;

  constructor(transactionReviewUrl: string) {
    super('transaction review error');
    this.name = 'TransactionReviewError';
    this.transactionReviewUrl = transactionReviewUrl;
  }
}

export class TransactionReviewDenied extends Error {
  constructor() {
    super('transaction review has been denied by the user');
    this.name = 'TransactionReviewDenied';
  }
}

export class TransactionReviewTimeout extends Error {
  pendingTransactionId: string;
  transactionReviewUrl: string;

  constructor(transactionReviewUrl: string, pendingTransactionId: string) {
    super('transaction review has timed out');
    this.name = 'TransactionReviewTimeout';
    this.transactionReviewUrl = transactionReviewUrl;
    this.pendingTransactionId = pendingTransactionId;
  }
}
