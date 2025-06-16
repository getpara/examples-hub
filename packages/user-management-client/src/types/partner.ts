import { AuthMethod, SupportedAccountLinks } from './auth.js';
import { SupportedWalletTypes } from './wallet.js';
export interface PartnerEntity {
  id: string;
  displayName: string;
  apiKey?: string;
  logoUrl?: string;
  iconUrl?: string;
  portalHeaderLogoUrl?: string;
  policiesEnabled: boolean;
  backgroundColor?: string;
  foregroundColor?: string;
  accentColor?: string;
  font?: string;
  themeMode?: 'light' | 'dark';
  portalUrl?: string;
  supportedAuthMethods?: AuthMethod[];
  supportedWalletTypes?: SupportedWalletTypes;
  supportedAccountLinks?: SupportedAccountLinks;
  cosmosPrefix?: string;
}
