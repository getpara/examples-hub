import { IconType } from '@usecapsule/core-components';
import { OAuthMethod } from '@usecapsule/web-sdk';

// For icon compatibility with dark mode
// ref https://www.figma.com/file/9ACi9SCFaEiVKoKoEXxCju/Capsule-Modal-v2?node-id=584%3A34197&mode=dev
export const oAuthLogos: { [key in OAuthMethod]: IconType } = {
  GOOGLE: 'google',
  TWITTER: 'twitter',
  APPLE: 'apple',
  DISCORD: 'discord',
  FACEBOOK: 'facebook',
};
