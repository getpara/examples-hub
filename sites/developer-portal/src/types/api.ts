import { Network, OnRampAsset, OnRampAssetInfo, OnRampProvider } from '@usecapsule/react-sdk';
import { Environment } from './environment';

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
  hasRequestedUpgrade?: boolean;
  hasRequestedDowngrade?: boolean;
  hasRequestedCancel?: boolean;
};

export type OrganizationResponse = { organization: Organization };
export type OrganizationsResponse = { organizations: Organization[] };
export type UpdateOrganizationBody = Pick<Organization, 'name' | 'logoUrl'>;
export type LogoUploadUrlResponse = {
  url: string;
  fields: Record<string, string>;
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
};

export type ProjectResponse = { project: Project };
export type ProjectsResponse = { projects: Project[] };
export type ProjectTotalUsersResponse = { totalUsers: number };
export type UpdateProjectBody = Omit<Project, 'id' | 'archived'>;

// *********************
// Organization Members
// *********************
export type OrganizationMember = {
  id: string;
  pendingEmail?: string;
  joinedAt?: Date;
  owner: boolean;
  permissions: string[];
  user: OrganizationMemberUser;
};

export type OrganizationMemberUser = {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  name?: string;
};

export type OrganizationMemberResponse = { member: OrganizationMember };
export type OrganizationMembersResponse = { members: OrganizationMember[] };
export type UpdateOrganizationMemberBody = Pick<OrganizationMember, 'owner' | 'permissions'>;

// *********************
// API Keys
// *********************
export type ApiKey = {
  id: string;
  apiKey: string;
  name: string;
  displayName: string;
  environment: Environment;
  createdAt: Date;
  verifyUrl: string;
  portalUrl: string;
  logoUrl: string;
  iconUrl: string;
  emailImageUrl: string;
  emailImageLink: string;
  emailBackupKit: boolean;
  emailWelcome: boolean;
  backgroundColor: string;
  foregroundColor: string;
  font: string;
  twitterUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  homepageUrl: string;
  archived?: boolean;
  isBuyEnabled: boolean;
  isReceiveEnabled: boolean;
  isWithdrawEnabled: boolean;
  onRampProviders: OnRampProvider[];
  onRampAssets?: Partial<Record<Network, true | OnRampAsset[]>>;
  rampApiKey?: string;
};

export type ApiKeyResponse = { key: ApiKey };
export type ApiKeysResponse = { keys: ApiKey[] };
export type UpdateApiKeyBody = Nullable<
  Partial<
    Pick<
      ApiKey,
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
    >
  >
>;

export enum PartnerAssetType {
  LOGOS = 'LOGOS',
  ICONS = 'ICONS',
}

// *********************
// API Key Users
// *********************
export type ApiKeyUsersTableData = {
  userId: string;
  email: string | null;
  farcasterUsername: string | null;
  phoneNumber: string | null;
  firstCreated: Date;
  lastSeen: Date;
  totalLogins: number;
  walletAddresses: string[];
  lastMethod: string;
  totalRecords: number;
};

export type ApiKeyUsersTableDataResponse = {
  tableData: ApiKeyUsersTableData[];
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
