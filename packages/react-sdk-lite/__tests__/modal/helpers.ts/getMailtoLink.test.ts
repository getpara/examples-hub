import { describe, expect, it } from 'vitest';
import { getMailtoLink } from '../../../src/modal/utils/getMailtoLink';

describe('getMailtoLink', () => {
  it('getMailtoLink', () => {
    expect(getMailtoLink('test@test.com', '123')).toBe(
      'mailto:test@test.com?subject=Para%20Recovery%20Secret&body=Hello,%0D%0DBelow is your Para Recovery Secret. Keep this safe!%0D%0D123%0D%0DPlease get in touch via support@getpara.com if you have any questions',
    );
  });
});
