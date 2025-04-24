import { useParams } from 'react-router-dom';
import { ApiKeyBranding, ApiKeyOnOffRamps, ApiKeySecurity, ApiKeySetup } from './pages';
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
    default:
      return <Typography>Not Implemented</Typography>;
  }
};
