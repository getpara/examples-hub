import { IconType } from '@getpara/react-components';
import { TOAuthMethod } from '@getpara/web-sdk';

export const brandedOAuthLogos: { [key in TOAuthMethod]: IconType } = {
  GOOGLE: 'googleBrand',
  TWITTER: 'twitter',
  APPLE: 'apple',
  DISCORD: 'discordBrand',
  FACEBOOK: 'facebookBrand',
  FARCASTER: 'farcasterBrand',
  TELEGRAM: 'telegramBrand',
};

export const oAuthLogos: { [key in TOAuthMethod]: IconType } = {
  GOOGLE: 'google',
  TWITTER: 'twitter',
  APPLE: 'apple',
  DISCORD: 'discord',
  FACEBOOK: 'facebook',
  FARCASTER: 'farcaster',
  TELEGRAM: 'telegram',
};
