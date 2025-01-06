import { describe, expect, it } from 'vitest';
import { TransactionReviewError } from '../src/errors.js';

describe('errors', () => {
  describe('TransactionReviewError', () => {
    it('constructor', () => {
      const error = new TransactionReviewError('test');

      expect(error.message).toBe('transaction review error');
      expect(error.name).toBe('TransactionReviewError');
      expect(error.transactionReviewUrl).toBe('test');
    });
  });
});
