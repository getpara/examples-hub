import { openAuthSessionAsync } from 'expo-web-browser';
import { APP_SCHEME } from './constants';

export async function openAuthUrl(url: string): Promise<{ success: boolean }> {
  const authUrl = new URL(url);
  authUrl.searchParams.set('nativeCallbackUrl', APP_SCHEME);
  const result = await openAuthSessionAsync(authUrl.toString(), APP_SCHEME);
  return { success: result.type === 'success' };
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
}

export function truncateAddress(address: string, chars = 6): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
