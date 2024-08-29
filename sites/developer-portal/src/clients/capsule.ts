import CapsuleWeb, { Environment } from '@usecapsule/react-sdk';
import { ENV_VARS, LINKEDIN_URL, SUPPORT_URL, TWITTER_URL } from '../utils/constants';

export const capsule = new CapsuleWeb(ENV_VARS.environment as Environment, ENV_VARS.capsuleApiKey, {
  xUrl: TWITTER_URL,
  linkedinUrl: LINKEDIN_URL,
  supportUrl: SUPPORT_URL,
});
