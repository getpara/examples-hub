import { describe, expect, it } from 'vitest';
import { validateAuth } from '../../../src/modal/utils/authInputHelpers';

describe('authInputHelpers', () => {
  it('authInputHelpers', async () => {
    expect(validateAuth('test@test.com', undefined, 'email')).toStrictEqual({ email: 'test@test.com' });
    await expect(async () => await validateAuth('test', undefined, 'email')).rejects.toThrowError(
      'Please enter a valid email!',
    );
    expect(validateAuth('5555555555', '+1', 'phone')).toStrictEqual({ phone: '+15555555555' });
    await expect(async () => await validateAuth('123456', '+1', 'phone')).rejects.toThrowError(
      'Please enter a valid phone number!',
    );
    await expect(async () => await validateAuth('', undefined, undefined)).rejects.toThrowError(
      'Please enter a valid email or phone number!',
    );
  });
});
