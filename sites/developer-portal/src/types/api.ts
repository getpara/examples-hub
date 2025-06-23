import { Network, OnRampAsset, OnRampAssetInfo, OnRampProvider } from '@getpara/react-sdk';
import { Environment } from './environment';
import { SupportedWalletTypes } from '@getpara/user-management-client';

type Nullable<T> = { [K in keyof T]: T[K] | null };

export type User = {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  walletAddress: string;
  method: string;
  messagesSigned: number;
};

export type LoginAnalytic = {
  label: string;
  value: number;
};

// *********************
// Organizations
// *********************
export type Organization = {
  id: string;
  name: string;
  activePlanSlug: string;
  planPrice: number;
  requestedEarlyAccessSlugs: string[];
  grantedEarlyAccessSlugs: string[];
  hasDevPortalAccess: boolean;
  requestedDevPortalAccess: boolean;
  logoUrl?: string;
  archived?: boolean;
  suspended?: boolean;
  suspendedReason?: string | null;
  hasRequestedUpgrade?: boolean;
  hasRequestedDowngrade?: boolean;
  hasRequestedCancel?: boolean;
  enterpriseStripePriceId?: string | null;
  homepageUrl?: string | null;
  onboardingAnswersRaw?: object | null;
  bypassBetaUserLimit?: boolean;
  createdAt: Date;
  updatedAt: Date;
};
export type OrganizationInvite = Organization & { members: OrganizationMember[] };

export type OrganizationResponse = { organization: Organization };
export type OrganizationsResponse = { organizations: Organization[] };
export type OrganizationsInviteResponse = { organizations: OrganizationInvite[] };
export type UpdateOrganizationBody = Pick<Organization, 'name' | 'logoUrl' | 'homepageUrl'>;
export type CreateOrganizationBody = {
  organizationName: string;
  homepageUrl?: string;
  onboardingAnswersRaw?: object;
};
export type LogoUploadUrlResponse = {
  url: string;
  fields: Record<string, string>;
};
export type CreateCheckoutSessionResponse = {
  sessionUrl?: string;
};
export type CreateCustomerPortalSessionResponse = {
  sessionUrl?: string;
};

// *********************
// Projects
// *********************
export type Project = {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  framework?: string;
  packageManager?: string;
  archived?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectResponse = { project: Project };
export type ProjectsResponse = { projects: Project[] };
export type ProjectTotalUsersResponse = { totalUsers: number };
export type UpdateProjectBody = Nullable<Partial<Omit<Project, 'id' | 'archived'>>>;

// *********************
// Organization Members
// *********************
export enum MemberRole {
  ORG_OWNER = 'ORG_OWNER',
  ORG_MEMBER = 'ORG_MEMBER',
  PROJECT_MEMBER = 'PROJECT_MEMBER',
}
export type MemberRoleType = `${MemberRole}`;

export type MemberCapabilities = {
  canCreateProjects: boolean;
  canViewProjects: boolean;
  canUpdateProjects: boolean;
  canDeleteProjects: boolean;
  canInviteMembers: boolean;
  canViewMembers: boolean;
  canUpdateMembers: boolean;
  canDeleteMembers: boolean;
  canViewOrganization: boolean;
  canUpdateOrganization: boolean;
  canViewOrganizationAnalytics: boolean;
  canViewOrganizationBilling: boolean;
  canUpdateOrganizationBilling: boolean;
  canUpdateOrganizationPlan: boolean;
  assignableRoles: MemberRole[];
};

export type OrganizationMember = {
  id: string;
  pendingEmail?: string;
  invitedBy?: string;
  joinedAt?: Date;
  owner: boolean;
  permissions: string[];
  user: OrganizationMemberUser;
  role: MemberRoleType;
  projects?: Project[];
};

export type OrganizationMemberUser = {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  name?: string;
};

export type OrganizationMemberResponse = { member: OrganizationMember; capabilities: MemberCapabilities };
export type OrganizationMembersResponse = { members: OrganizationMember[] };
export type UpdateOrganizationMemberBody = Pick<OrganizationMember, 'owner' | 'permissions' | 'role'> & {
  projectIds?: string[];
};

// *********************
// API Keys
// *********************

export type OnRampAssets = Partial<Record<Network, true | OnRampAsset[]>>;
export enum ThemeMode {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
}

export type ApiKeyOnboarding = {
  isSkipped?: boolean;
  isComplete?: boolean;
  step?: number;
  version?: number;
  framework?: string;
};

export type ApiKey = {
  id: string;
  projectId: string;
  organizationId: string;
  apiKey: string;
  secretApiKey: string;
  name: string;
  displayName: string;
  environment: Environment;
  createdAt: Date;
  updatedAt: Date;
  verifyUrl: string | null;
  portalUrl: string | null;
  logoUrl: string | null;
  iconUrl: string | null;
  emailImageUrl: string | null;
  emailImageLink: string | null;
  emailBackupKit: boolean;
  emailWelcome: boolean;
  backgroundColor: string | null;
  foregroundColor: string | null;
  font: string | null;
  twitterUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  homepageUrl: string | null;
  archived?: boolean;
  isBuyEnabled: boolean;
  isReceiveEnabled: boolean;
  isWithdrawEnabled: boolean;
  onRampProviders: OnRampProvider[];
  onRampAssets?: OnRampAssets;
  rampApiKey?: string;
  defaultOnRampAsset?: OnRampAsset;
  defaultOnRampNetwork?: Network;
  defaultBuyAmount?: string;
  isUsed: boolean;
  isInstalled: boolean;
  teamId: string | null;
  bundleIdentifier: string | null;
  accentColor: string | null;
  themeMode: ThemeMode | null;
  transactionPopupsEnabled: boolean;
  forceTransactionPopups?: boolean;
  origins?: string[] | null;
  supportedWalletTypes: SupportedWalletTypes;
  cosmosPrefix: string;
  androidSha256CertFingerprints: string[] | null;
  androidPackageName: string | null;
  supportedAuthMethods?: string[] | null;
  sessionMaxAge?: string | null;
  onboarding: ApiKeyOnboarding | null;
};

export type ApiKeyResponse = { key: ApiKey };
export type ApiKeySetupStatusResponse = {
  isUsed: boolean;
  isInstalled: boolean;
  firstUser?: {
    id: string;
    userId: string;
    user?: {
      id: string;
      email?: string;
      phone?: { number: string; countryCode: string };
      externalWallets?: { address: string }[];
    };
  };
};
export type ApiKeysResponse = { keys: ApiKey[] };
export type UpdateApiKeyBody = Nullable<
  Partial<
    Pick<
      ApiKey,
      | 'name'
      | 'displayName'
      | 'verifyUrl'
      | 'portalUrl'
      | 'logoUrl'
      | 'iconUrl'
      | 'emailImageUrl'
      | 'emailImageLink'
      | 'emailBackupKit'
      | 'emailWelcome'
      | 'backgroundColor'
      | 'foregroundColor'
      | 'font'
      | 'twitterUrl'
      | 'linkedinUrl'
      | 'githubUrl'
      | 'homepageUrl'
      | 'isBuyEnabled'
      | 'isReceiveEnabled'
      | 'isWithdrawEnabled'
      | 'onRampProviders'
      | 'onRampAssets'
      | 'rampApiKey'
      | 'defaultOnRampAsset'
      | 'defaultOnRampNetwork'
      | 'defaultBuyAmount'
      | 'archived'
      | 'isInstalled'
      | 'teamId'
      | 'bundleIdentifier'
      | 'accentColor'
      | 'themeMode'
      | 'transactionPopupsEnabled'
      | 'forceTransactionPopups'
      | 'origins'
      | 'supportedWalletTypes'
      | 'cosmosPrefix'
      | 'androidSha256CertFingerprints'
      | 'androidPackageName'
      | 'supportedAuthMethods'
      | 'sessionMaxAge'
      | 'onboarding'
    >
  >
>;
// Overriding string[] types here to allow for textfield inputs in the forms. Data will be formatted back before submit.
export type UpdateApiKeyFormData = Partial<
  Omit<UpdateApiKeyBody, 'origins' | 'androidSha256CertFingerprints' | 'sessionMaxAge'>
> & {
  androidSha256CertFingerprints?: string | null;
  origins?: string | null;
  sessionMaxAge?: number | null;
};

export enum PartnerAssetType {
  LOGOS = 'LOGOS',
  ICONS = 'ICONS',
}

// *********************
// Users
// *********************
export type UsersTableData = {
  id: string;
  userId: string | null;
  pregenWalletId: string | null;
  email: string | null;
  farcasterUsername: string | null;
  phoneNumber: string | null;
  firstCreated: Date;
  lastSeen: Date;
  totalLogins: number;
  walletAddresses: string[] | null;
  externalWalletAddress: string | null;
  pregenIdentifier: string | null;
  lastMethod: string;
  totalRecords: number;
};

export type UsersTableDataResponse = {
  tableData: UsersTableData[];
  totalRows: number;
};

// *********************
// API Key Users Login Metrics
// *********************
export type ApiKeyUsersLoginMetricsResponse = {
  percentLoginsByMethod: { [k: string]: number };
};

// *********************
// Organization User Metrics
// *********************
export type OrganizationUserMetricsResponse = {
  userMetrics: {
    totalUsers: number;
    usersInTimeFrame: number;
  };
};

export type OnRampAllAssetsResponse = OnRampAssetInfo;

// *********************
// Organization Analytics
// *********************
export type OrganizationTotalUsersTSResponse = {
  data: {
    date: number;
    newUsers: number;
  }[];
};

export type OrganizationMonthlyActiveUsersTSResponse = {
  data: {
    date: number;
    activeUsers: number;
    previousMonthActiveUsers: number;
    changeFromPreviousMonth: number;
  }[];
};

export type OrganizationLoginMethodsTotalResponse = {
  data: {
    method: string;
    percent: number;
    count: number;
    userCount: number;
  }[];
};

export type OrganizationLoginPlatformsTotalResponse = {
  data: {
    platform: string;
    percent: number;
    count: number;
  }[];
};

export type OrganizationTotalUserCountResponse = {
  count: number;
  lowerEnvCount: number;
};

export type OrganizationTotalUserCountByProjectResponse = {
  projectCounts: {
    projectId: string;
    projectName: string;
    count: number;
    lowerEnvCount?: number;
  }[];
};

// *********************
// API Key Analytics
// *********************
export type ApiKeyLoginMethodsTotalResponse = {
  data: {
    method: string;
    percent: number;
    count: number;
    userCount: number;
  }[];
};

export type ApiKeyLoginPlatformsTotalResponse = {
  data: {
    platform: string;
    percent: number;
    count: number;
  }[];
};

export type ApiKeyTotalUserCountResponse = {
  count: number;
  lowerEnvCount: number;
};

export type ApiKeyTotalUsersTSResponse = {
  data: {
    date: number;
    newUsers: number;
  }[];
};

export type ApiKeyMonthlyActiveUsersTSResponse = {
  data: {
    date: number;
    activeUsers: number;
    previousMonthActiveUsers: number;
    changeFromPreviousMonth: number;
  }[];
};
// *********************
// Organization Enterprise Price
// *********************
export type OrganizationEnterprisePriceResponse = {
  price: number;
};

// *********************
// Organization Subscription
// *********************

export type SubscriptionStatus =
  | 'incomplete'
  | 'incompleteExpired'
  | 'trialing'
  | 'active'
  | 'pastDue'
  | 'canceled'
  | 'unpaid'
  | 'paused';

export type Subscription = {
  // Not including price on the plan since it's included in the subscription
  plan: Omit<Plan, 'price'>;
  periodStart?: number;
  periodEnd?: number;
  price?: number;
  isTieredPrice?: boolean;
  tiers?: { flatPrice?: number; unitPrice?: number; upTo?: number }[];
  billingPeriodStart?: number | null;
  billingPeriodEnd?: number | null;
  trialStart?: number | null;
  trialEnd?: number | null;
  cancelAtPeriodEnd?: boolean;
  status: SubscriptionStatus;
  billing?: {
    address?: {
      city: string | null;
      country: string | null;
      line1: string | null;
      line2: string | null;
      postalCode: string | null;
      state: string | null;
    };
    email: string | null;
    name: string | null;
    phone: string | null;
    type: string;
    card?: {
      brand: string;
      expMonth: number;
      expYear: number;
      last4: string;
    };
    bank?: {
      name: string | null;
      last4: string | null;
    };
  };
};

export type OrganizationSubscriptionResponse = {
  subscription: Subscription;
};

// *********************
// Organization Premium Features
// *********************
type PremiumFeatures = {
  isUsingPhoneAuth: boolean;
  isUsingPregen: boolean;
  isUsingNativePasskeys: boolean;
};
export type OrganizationPremiumFeaturesResponse = {
  prodFeatures: PremiumFeatures;
  betaFeatures: PremiumFeatures;
};

// *********************
// Plan
// *********************
export type Plan = {
  slug: string;
  price: number;
  isTieredPrice: boolean;
  tiers?: { flatPrice?: number; unitPrice?: number; upTo?: number }[];
  maxProjects: number;
  maxProdMAUs: number;
  maxBetaUsers: number;
  canCreateProdKeys: boolean;
  canPregen: boolean;
  canUseNativePasskeys: boolean;
};

export type PlansResponse = { plans: Plan[] };
