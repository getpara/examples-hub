export class TransactionReviewError extends Error {
  transactionReviewUrl: string;

  constructor(transactionReviewUrl: string) {
    super('transaction review error');
    this.name = 'TransactionReviewError';
    this.transactionReviewUrl = transactionReviewUrl;
  }
}
