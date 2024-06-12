import { IconType } from '@usecapsule/core-components';
import { OAuthMethod } from '@usecapsule/web-sdk';

export const brandedOAuthLogos: { [key in OAuthMethod]: IconType } = {
  GOOGLE: 'googleBrand',
  TWITTER: 'twitter',
  APPLE: 'apple',
  DISCORD: 'discordBrand',
  FACEBOOK: 'facebookBrand',
  FARCASTER: 'farcasterBrand',
};

export const oAuthLogos: { [key in OAuthMethod]: IconType } = {
  GOOGLE: 'google',
  TWITTER: 'twitter',
  APPLE: 'apple',
  DISCORD: 'discord',
  FACEBOOK: 'facebook',
  FARCASTER: 'farcaster',
};
