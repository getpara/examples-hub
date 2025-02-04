import { expect, describe, it } from 'vitest';

import { getMailtoLink } from '../../src/utils/emailUtils.js';

describe('emailUtils', () => {
  describe('getMailtoLink', () => {
    it('creates email link correctly', () => {
      const email = 'test@getpara.com';
      const recoveryShare = 'test-recovery-share';
      const emailBody = `Hello,%0D%0DBelow is your Para Recovery Secret. Keep this safe!%0D%0D${recoveryShare}%0D%0DPlease get in touch via support@getpara.com if you have any questions`;
      const emailLink = getMailtoLink(email, recoveryShare);

      expect(emailLink).toBe(`mailto:${email}?subject=Para%20Recovery%20Secret&body=${emailBody}`);
    });
  });
});
