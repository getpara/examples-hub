export enum EmailTheme {
  LIGHT = 'light',
  DARK = 'dark',
}

export interface VerificationEmailProps {
  theme?: EmailTheme;
  homepageUrl?: string;
  xUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  supportUrl?: string;
  brandColor?: string;
}

export interface BackupKitEmailProps {
  theme?: EmailTheme;
  homepageUrl?: string;
  xUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  supportUrl?: string;
  brandColor?: string;
}
