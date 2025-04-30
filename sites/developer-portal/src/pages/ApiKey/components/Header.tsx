import { Typography } from '@getpara/react-component-library';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { SettingsHeaderAction } from './SettingsHeaderAction';
import { UsersHeaderAction } from './UsersHeaderAction';

const PAGE_TITLES: Record<string, string> = {
  'setup': 'Setup',
  'users': 'Users',
  'analytics': 'Analytics',
  'branding': 'Branding',
  'security': 'Security',
  'on-off-ramps': 'On & Off Ramps',
  'permissions': 'Permissions',
};

const PAGE_SUBTITLES: Record<string, string> = {
  'setup': '',
  'users': '',
  'analytics': '',
  'branding':
    'These settings will be applied to Capsule Portal and Emails only. Customizing your Capsule Modal is done with the Capsule SDK.',
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
      case 'setup':
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

  return (
    <div className="para:flex para:flex-col">
      <div className="para:flex para:justify-between para:items-center">
        <Typography className="para:text-2xl para:font-semibold">{title}</Typography>
        {ActionComponent}
      </div>
      {subtitle && (
        <Typography color="secondary" className="para:text-sm para:font-medium para:mt-2">
          {subtitle}
        </Typography>
      )}
    </div>
  );
};
