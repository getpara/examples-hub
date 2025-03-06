import { describe, expect, it } from 'vitest';
import { formatPhoneNumber } from '../src/utils';

describe('utils', () => {
  it('formatPhoneNumber', () => {
    expect(formatPhoneNumber('+19495551234')).toEqual('+1 949 555 1234');

    expect(formatPhoneNumber('19495551234')).toEqual('+1 949 555 1234');

    expect(formatPhoneNumber('9495551234', '1')).toEqual('+1 949 555 1234');

    expect(formatPhoneNumber('9495551234', '+1')).toEqual('+1 949 555 1234');

    expect(formatPhoneNumber('+46726411300')).toEqual('+46 72 641 13 00');

    expect(formatPhoneNumber('46726411300')).toEqual('+46 72 641 13 00');

    expect(formatPhoneNumber('0726411300', '+46')).toEqual('+46 72 641 13 00');

    expect(formatPhoneNumber('0726411300', '46')).toEqual('+46 72 641 13 00');

    expect(formatPhoneNumber('+460')).toBeNull();

    expect(formatPhoneNumber('+15555555555')).toBeNull();

    expect(formatPhoneNumber('5555555', '1')).toBeNull();
  });
});
