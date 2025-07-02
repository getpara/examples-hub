import { ReactNode, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { SettingsHeaderAction } from './SettingsHeaderAction';
import { UsersHeaderAction } from './UsersHeaderAction';
import { PageHeader } from '../../../components/PageHeader';

const PAGE_TITLES: Record<string, string> = {
  'setup': 'Setup',
  'users': 'Users',
  'analytics': 'Analytics',
  'branding': 'Branding',
  'security': 'Security',
  'on-off-ramps': 'On & Off Ramps',
  'permissions': 'Permissions',
};

const PAGE_SUBTITLES: Record<string, ReactNode | undefined> = {
  'setup': '',
  'users': '',
  'analytics': '',
  'branding': (
    <span>
      These settings will be applied to <strong>Para Portal and Emails only</strong>. Customizing your Para Modal is done
      with the Para SDK.
    </span>
  ),
  'security':
    'These settings determine the level of security your users will have. These settings only apply to users whose accounts your app originates and not to users who have created their account somewhere else.',
  'on-off-ramps': 'Configure how users add and withdraw funds from their account.',
  'permissions': '',
};

export const Header = () => {
  const { apiKeyPage } = useParams();

  const title = PAGE_TITLES[apiKeyPage ?? ''];
  const subtitle = PAGE_SUBTITLES[apiKeyPage ?? ''];

  const ActionComponent = useMemo(() => {
    switch (apiKeyPage) {
      case 'setup': {
        return <SettingsHeaderAction isSetup />;
      }
      case 'branding':
      case 'security':
      case 'on-off-ramps':
      case 'permissions': {
        return <SettingsHeaderAction />;
      }
      case 'users': {
        return <UsersHeaderAction />;
      }
      default:
        return null;
    }
  }, [apiKeyPage]);

  return <PageHeader title={title} subtitle={subtitle} ActionComponent={ActionComponent} />;
};
