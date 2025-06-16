import { describe, expect, it } from 'vitest';
import { validateInput } from '../../../src/modal/utils/authInputHelpers';

describe('authInputHelpers', () => {
  it('authInputHelpers', async () => {
    expect(validateInput('test@test.com', undefined, 'email')).toStrictEqual({ email: 'test@test.com' });
    await expect(async () => await validateInput('test', undefined, 'email')).rejects.toThrowError(
      'Please enter a valid email address!',
    );
    expect(validateInput('5555555555', '+1', 'phone')).toStrictEqual({ phone: '+15555555555' });
    await expect(async () => await validateInput('123456', '+1', 'phone')).rejects.toThrowError(
      'Please enter a valid phone number!',
    );
    await expect(async () => await validateInput('', undefined, undefined)).rejects.toThrowError(
      'Please enter a valid email or phone number!',
    );
  });
});
