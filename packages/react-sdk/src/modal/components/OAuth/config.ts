import { IconType } from '@usecapsule/core-components';
import { Theme } from '../../types/theme';
import { OAuthMethod } from '@usecapsule/web-sdk';

// For icon compatibility with dark mode
// ref https://www.figma.com/file/9ACi9SCFaEiVKoKoEXxCju/Capsule-Modal-v2?node-id=584%3A34197&mode=dev
export const oAuthLogos: {
  [key in Theme]: { [key in OAuthMethod]: IconType };
} = {
  light: {
    GOOGLE: 'googleBrand',
    TWITTER: 'twitterBrand',
    APPLE: 'appleBrand',
    DISCORD: 'discordBrand',
    FACEBOOK: 'facebookBrand',
  },
  dark: {
    GOOGLE: 'googleBrand',
    TWITTER: 'twitter',
    APPLE: 'apple',
    DISCORD: 'discordBrand',
    FACEBOOK: 'facebookBrand',
  },
};
