import { IResult, UAParser } from 'ua-parser-js';

export function useUserAgent(): IResult {
  const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : undefined;

  return UAParser(userAgent);
}
