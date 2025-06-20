import { parse } from 'expo-linking';

export function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}): string | undefined {
  if (initial) return undefined;

  try {
    const { hostname, queryParams } = parse(path);
    if (
      hostname === 'para' &&
      queryParams?.method === 'login' &&
      queryParams?.email
    ) {
      const emailValue = Array.isArray(queryParams.email)
        ? queryParams.email[0]
        : queryParams.email;
      if (typeof emailValue === 'string') {
        return `/auth?method=login&email=${encodeURIComponent(emailValue)}`;
      }
    }
  } catch (error) {
    console.error('Error parsing URL:', error);
  }
  return undefined;
}
