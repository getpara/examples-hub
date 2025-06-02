export const HEX_COLOR_REGEX = /^#[a-f\d]{3}(?:[a-f\d]?|(?:[a-f\d]{3}(?:[a-f\d]{2})?)?)\b/i;

export const TWITTER_URL_REGEX = /^https:\/\/(www.)?(twitter|x)\.com\/.+/i;
export const LINKEDIN_URL_REGEX = /^https:\/\/(www.)?linkedin\.com\/company\/.+/i;
export const GITHUB_URL_REGEX = /^https:\/\/(www.)?github\.com\/.+/i;

export const HTTPS_URL_REGEX = /^(https:\/\/)([\da-z.-]+\.[a-z.]{2,63}|[\d.]+)([/:?=&#]{1}[\da-z.-]+)*[/?]?$/gim;

export const EMAIL_REGEX = /([\w.\-_]+)?\w+@[\w-_]+(\.\w+){1,}/gim;

export const APPLE_BUNDLE_IDENTIFIER_REGEX = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/;
export const ANDROID_PACKAGE_NAME_REGEX = /^(?:[a-zA-Z]+(?:\d*[a-zA-Z_]*)*)(?:\.[a-zA-Z]+(?:\d*[a-zA-Z_]*)*)+$/;
export const SHA256_FINGERPRINT_REGEX = /^(?:[a-fA-F0-9]{2}:){31}[a-fA-F0-9]{2}$/;
