import { startOfDay } from 'date-fns';
import { Environment } from '../types/environment';
import { Framework } from '../types/framework';
import { PackageManager } from '../types/packageManager';

export const ENV_VARS = {
  environment: import.meta.env.VITE_ENVIRONMENT as string,
  paraApiKey: import.meta.env.VITE_CAPSULE_API_KEY,
  statsigClientKey: import.meta.env.VITE_STATSIG_CLIENT_KEY,
  statsigEnv:
    import.meta.env.VITE_ENVIRONMENT === Environment.DEV
      ? 'development'
      : import.meta.env.VITE_ENVIRONMENT === Environment.SANDBOX
        ? 'staging'
        : 'production',
};

export const DOCS_LINK = 'https://docs.getpara.com/alpha/introduction/welcome';
export const ON_RAMP_DOCS_LINK =
  'https://docs.getpara.com/alpha/web/guides/customization/fiat-onramps#fiat-on-and-off-ramps';
export const REACT_DOCS_LINK = 'https://docs.getpara.com/alpha/web/setup/react/overview';
export const WEB_DOCS_LINK = 'https://docs.getpara.com/alpha/web/overview';
export const NODE_DOCS_LINK = 'https://docs.getpara.com/alpha/server/overview';
export const REACT_NATIVE_DOCS_LINK = 'https://docs.getpara.com/alpha/react-native/setup/react-native';
export const EXPO_DOCS_LINK = 'https://docs.getpara.com/alpha/react-native/setup/expo';
export const FLUTTER_DOCS_LINK = 'https://docs.getpara.com/alpha/flutter/overview';
export const SWIFT_DOCS_LINK = 'https://docs.getpara.com/alpha/swift/overview';
export const ADVANCED_MODAL_THEME_DOCS_LINK =
  'https://docs.getpara.com/alpha/web/guides/customization/modal#advanced-theme-customization';
export const TX_POPUPS_DOCS_LINK = 'https://docs.getpara.com/alpha/web/guides/permissions';
export const MODAL_CUSTOMIZATION_DOCS_LINK = 'https://docs.getpara.com/alpha/web/guides/customization/modal';

export const NEXT_EXTRA_DOCS_LINK = 'https://docs.getpara.com/alpha/web/troubleshooting/nextjs';
export const VITE_EXTRA_DOCS_LINK = 'https://docs.getpara.com/alpha/web/troubleshooting/react-vite';
export const SVELTE_EXTRA_DOCS_LINK = 'https://docs.getpara.com/alpha/web/troubleshooting/svelte';

export const MOBILE_SIZE = 767;

export const IS_PROD = ENV_VARS.environment === Environment.PROD;
export const IS_BETA = ENV_VARS.environment === Environment.BETA;
export const IS_DEV = ENV_VARS.environment === Environment.DEV;

export const EMAIL_FONTS = [
  'Arial',
  'Courier New',
  'Georgia',
  'Helvetica',
  'Lucida Sans',
  'Tahoma',
  'Times New Roman',
  'Trebuchet MS',
];

export const THEME_MODES = ['Light', 'Dark'];

export const TWITTER_URL = 'https://twitter.com/get_para';
export const LINKEDIN_URL = 'https://www.linkedin.com/company/parahq';
export const SUPPORT_URL = 'mailto:support@getpara.com';
export const SCHEDULE_MEETING_LINK = 'https://getpara.com/talk-to-us';
export const MODAL_DESIGNER_LINK = 'https://demo.getpara.com';
export const EXAMPLES_HUB_LINK = 'https://github.com/getpara/examples-hub';
export const CALENDLY_LINK = 'https://calendly.com/d/ynr-2s7-g5f/capsule-partner-call';

export const FRAMEWORK_OPTIONS: Framework[] = [
  Framework.REACT,
  Framework.NEXT,
  Framework.VITE,
  Framework.VUE,
  Framework.SVELTE,
  Framework.REACT_NATIVE,
  Framework.EXPO,
  Framework.FLUTTER,
  Framework.SWIFT,
  Framework.NODE,
  Framework.DENO,
  Framework.BUN,
];

export const WEB_PACKAGE_MANAGER_OPTIONS: PackageManager[] = [PackageManager.NPM, PackageManager.YARN, PackageManager.PNPM];

export enum PlanSlug {
  FREE = 'FREE',
  STARTER = 'STARTER',
  GROWTH = 'GROWTH',
  SCALE = 'SCALE',
  ENTERPRISE = 'ENTERPRISE',
}

export const PLAN_PERMISSIONS: Record<
  PlanSlug,
  { canCreateProdKeys: boolean; maxProjects: number; maxMonthlyUsers?: number; maxUsers?: number }
> = {
  [PlanSlug.FREE]: {
    canCreateProdKeys: false,
    maxProjects: 1,
    maxUsers: 50,
  },
  [PlanSlug.STARTER]: {
    canCreateProdKeys: true,
    maxProjects: 1,
    maxMonthlyUsers: 2500,
  },
  [PlanSlug.GROWTH]: {
    canCreateProdKeys: true,
    maxProjects: 3,
    maxMonthlyUsers: 10000,
  },
  [PlanSlug.SCALE]: {
    canCreateProdKeys: true,
    maxProjects: 5,
    maxMonthlyUsers: 25000,
  },
  [PlanSlug.ENTERPRISE]: {
    canCreateProdKeys: true,
    maxProjects: Infinity,
    maxMonthlyUsers: Infinity,
  },
};
export const TODAY = startOfDay(new Date());

export const LOGIN_METHOD_CONFIG: Record<string, { label: string; color: string }> = {
  EMAIL: { label: 'Email', color: 'var(--para-color-slate-500)' },
  PHONE: { label: 'Phone', color: 'var(--para-color-shadowstone-500)' },
  EXTERNAL_WALLET: { label: 'Ext Wallet', color: 'var(--para-color-sundrop-500)' },
  GOOGLE: { label: 'Google', color: 'var(--para-color-magnetica-500)' },
  DISCORD: { label: 'Discord', color: 'var(--para-color-periwave-500)' },
  APPLE: { label: 'Apple', color: 'var(--para-color-mist-500)' },
  FACEBOOK: { label: 'Facebook', color: 'var(--para-color-red-500)' },
  TWITTER: { label: 'X(Twitter)', color: 'var(--para-color-pink-500)' },
  FARCASTER: { label: 'Farcaster', color: 'var(--para-color-lime-500)' },
  PREGEN: { label: 'Pregen', color: 'var(--para-color-blue-500)' },
  GUEST_MODE: { label: 'Guest Mode', color: 'var(--para-color-cyan-500)' },
  OTHER: { label: 'Other', color: 'var(--para-color-fuchsia-500)' },
  TELEGRAM: { label: 'Telegram', color: 'var(--para-color-violet-500)' },
};
export const MOST_POPULAR_PLAN_SLUG = PlanSlug.GROWTH;
export const ENTERPRISE_PLAN_SLUG = PlanSlug.ENTERPRISE;
export const FREE_PLAN_SLUG = PlanSlug.FREE;

export const LANDING_HEADER_LINKS = [
  { label: 'Pricing', url: 'https://www.getpara.com/pricing' },
  { label: 'Docs', url: 'https://docs.getpara.com/' },
  { label: 'Modal Designer', url: 'https://demo.getpara.com/' },
  { label: 'Blog', url: 'https://blog.getpara.com/' },
];

export const PRIVACY_POLICY = 'https://www.getpara.com/privacy-policy';
export const TOS = 'https://www.getpara.com/terms-of-service';

export const ZAPIER_WEBHOOK_URL = IS_PROD
  ? 'https://hooks.zapier.com/hooks/catch/20717871/2ib0ip3/'
  : 'https://hooks.zapier.com/hooks/catch/20717871/2ibwxti/';

export const AUTH_METHODS = [
  {
    label: 'Passkeys',
    value: 'PASSKEY',
  },
  {
    label: 'Passwords',
    value: 'PASSWORD',
  },
];

export const MAX_ORGS = 3;
