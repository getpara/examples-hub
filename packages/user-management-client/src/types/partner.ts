import { AuthMethod } from './auth.js';
import { SupportedWalletTypes } from './wallet.js';
export interface PartnerEntity {
  id: string;
  displayName: string;
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
  cosmosPrefix?: string;
}
