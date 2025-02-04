import ParaWeb, { Environment } from '@getpara/react-sdk';
import { ENV_VARS, LINKEDIN_URL, SUPPORT_URL, TWITTER_URL } from '../utils/constants';

export const para = new ParaWeb(ENV_VARS.environment as Environment, ENV_VARS.paraApiKey, {
  xUrl: TWITTER_URL,
  linkedinUrl: LINKEDIN_URL,
  supportUrl: SUPPORT_URL,
});
