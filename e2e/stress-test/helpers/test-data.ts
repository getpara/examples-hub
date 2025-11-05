/**
 * Standard timeouts used across stress tests
 */
export const TIMEOUTS = {
  LONG: 15000,
} as const;

export function getRandomPhoneNumber() {
  const last4 = `${Math.floor(Math.random() * 10000)}`.padStart(4, '0');
  return `415555${last4}`;
}

export function getRandomEmail() {
  const randomString = Math.random().toString(36).substring(2, 12);
  return `teste2e+${randomString}@test.usecapsule.com`;
}
