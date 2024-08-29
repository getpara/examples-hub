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
