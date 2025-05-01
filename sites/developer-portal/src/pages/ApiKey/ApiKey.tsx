import { useParams } from 'react-router-dom';
import { ApiKeyAnalytics, ApiKeyBranding, ApiKeyOnOffRamps, ApiKeySecurity, ApiKeySetup, ApiKeyUsers } from './pages';
import { Typography } from '@getpara/react-component-library';

export const ApiKey = () => {
  const { apiKeyPage } = useParams();

  switch (apiKeyPage) {
    case 'setup':
      return <ApiKeySetup />;
    case 'branding':
      return <ApiKeyBranding />;
    case 'security':
      return <ApiKeySecurity />;
    case 'on-off-ramps':
      return <ApiKeyOnOffRamps />;
    case 'users':
      return <ApiKeyUsers />;
    case 'analytics':
      return <ApiKeyAnalytics />;
    default:
      return <Typography>Not Implemented</Typography>;
  }
};
