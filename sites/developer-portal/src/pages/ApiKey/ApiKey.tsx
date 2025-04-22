import { useParams } from 'react-router-dom';
import { ApiKeySetup } from './pages';
import { Typography } from '@getpara/react-component-library';
import { ApiKeyBranding } from './pages/ApiKeyBranding/ApiKeyBranding';

export const ApiKey = () => {
  const { apiKeyPage } = useParams();

  switch (apiKeyPage) {
    case 'setup':
      return <ApiKeySetup />;
    case 'branding':
      return <ApiKeyBranding />;
    default:
      return <Typography>Not Implemented</Typography>;
  }
};
