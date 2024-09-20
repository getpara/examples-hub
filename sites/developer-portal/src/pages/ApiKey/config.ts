import { EnabledFlow } from '@usecapsule/react-sdk';
import { EmailOption } from './utils/emailConfiguration';

export const EMAIL_OPTIONS: {
  value: EmailOption;
  title: string;
  subtitle: string;
}[] = [
  {
    value: EmailOption.WELCOME,
    title: 'Welcome Email Only',
    subtitle: 'For a preview of how this image will be used, please visit the docs.',
  },
  {
    value: EmailOption.WELCOME_AND_BACKUP,
    title: 'Welcome Email + Backup Kit',
    subtitle: 'For a preview of how this image will be used, please visit the docs.',
  },
  {
    value: EmailOption.BACKUP,
    title: 'Backup Kit Only',
    subtitle: 'To learn more about Backup Kit, please visit the docs.',
  },
  {
    value: EmailOption.NONE,
    title: 'No Email',
    subtitle: 'The user will not receive the Welcome email or Backup Kit',
  },
];

export const ENABLED_FLOW_OPTIONS: {
  value: EnabledFlow;
  title: string;
  subtitle: string;
}[] = [
  {
    value: EnabledFlow.RECEIVE,
    title: 'Receive',
    subtitle: "Display your users' wallet addresses and a QR code for receiving funds.",
  },
  {
    value: EnabledFlow.BUY,
    title: 'Buy Crypto',
    subtitle: 'Enable your users to purchase crypto and send it to their Capsule wallets.',
  },
  {
    value: EnabledFlow.WITHDRAW,
    title: 'Withdraw',
    subtitle: 'Enable your users to sell crypto for fiat currency.',
  },
];
