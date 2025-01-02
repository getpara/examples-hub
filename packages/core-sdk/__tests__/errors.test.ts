import { describe, expect, it } from 'vitest';
import { TransactionReviewError, TransactionReviewDenied, TransactionReviewTimeout } from '../src/errors.js';

describe('errors', () => {
  describe('TransactionReviewError', () => {
    it('constructor', () => {
      const error = new TransactionReviewError('test');

      expect(error.message).toBe('transaction review error');
      expect(error.name).toBe('TransactionReviewError');
      expect(error.transactionReviewUrl).toBe('test');
    });
  });
  describe('TransactionReviewDenied', () => {
    it('constructor', () => {
      const error = new TransactionReviewDenied();

      expect(error.message).toBe('transaction review has been denied by the user');
      expect(error.name).toBe('TransactionReviewDenied');
    });
  });
  describe('TransactionReviewTimeout', () => {
    it('constructor', () => {
      const error = new TransactionReviewTimeout('test', 'testId');

      expect(error.message).toBe('transaction review has timed out');
      expect(error.name).toBe('TransactionReviewTimeout');
      expect(error.transactionReviewUrl).toBe('test');
      expect(error.pendingTransactionId).toBe('testId');
    });
  });
});
