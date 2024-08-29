export const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}){1,2}$/i;

export const TWITTER_URL_REGEX = /^https:\/\/(www.)?(twitter|x)\.com\/.+/i;
export const LINKEDIN_URL_REGEX = /^https:\/\/(www.)?linkedin\.com\/company\/.+/i;
export const GITHUB_URL_REGEX = /^https:\/\/(www.)?github\.com\/.+/i;

export const HTTPS_URL_REGEX = /^(https:\/\/)([\da-z.-]+\.[a-z.]{2,6}|[\d.]+)([/:?=&#]{1}[\da-z.-]+)*[/?]?$/gim;

export const EMAIL_REGEX = /([\w.\-_]+)?\w+@[\w-_]+(\.\w+){1,}/gim;
