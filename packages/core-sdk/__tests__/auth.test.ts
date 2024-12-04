import { describe, expect, it } from 'vitest';
import { extractAuth, extractAuthInfo } from '@usecapsule/user-management-client';
import { USER_COUNTRY_CODE, USER_EMAIL, USER_FARCASTER_USERNAME, USER_PHONE } from './constants';

describe('extractAuth', () => {
  it('extracts email auth', () => {
    expect(extractAuthInfo({ email: USER_EMAIL, foo: 'bar' })).toMatchObject({
      auth: { email: USER_EMAIL },
      authType: 'email',
      identifier: USER_EMAIL,
    });

    expect(extractAuth({ email: USER_EMAIL, foo: 'bar' })).toEqual({ email: USER_EMAIL });
  });

  it('extracts phone auth', () => {
    expect(extractAuthInfo({ phone: USER_PHONE, countryCode: USER_COUNTRY_CODE, foo: 'bar' })).toEqual({
      auth: { phone: USER_PHONE, countryCode: USER_COUNTRY_CODE },
      authType: 'phone',
      identifier: `${USER_COUNTRY_CODE}${USER_PHONE}`,
    });

    expect(extractAuth({ phone: USER_PHONE, countryCode: USER_COUNTRY_CODE, foo: 'bar' })).toEqual({
      phone: USER_PHONE,
      countryCode: USER_COUNTRY_CODE,
    });

    expect(() => extractAuthInfo({ phone: USER_PHONE, foo: 'bar' })).toThrow('invalid auth object');
  });

  it('extracts farcaster auth', () => {
    expect(extractAuthInfo({ farcasterUsername: USER_FARCASTER_USERNAME, foo: 'bar' })).toMatchObject({
      auth: { farcasterUsername: USER_FARCASTER_USERNAME },
      authType: 'farcasterUsername',
      identifier: USER_FARCASTER_USERNAME,
    });

    expect(extractAuth({ farcasterUsername: USER_FARCASTER_USERNAME, foo: 'bar' })).toMatchObject({
      farcasterUsername: USER_FARCASTER_USERNAME,
    });
  });

  it('rejects multiple fields', () => {
    expect(() => extractAuthInfo({ email: USER_EMAIL, phone: USER_PHONE, foo: 'bar' })).toThrow('invalid auth object');
  });
});
