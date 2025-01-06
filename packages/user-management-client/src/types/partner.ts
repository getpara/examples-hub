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
}
