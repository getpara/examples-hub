import { useNavigate, useParams } from 'react-router-dom';
import { Header } from './components/Header';
import { KeyData } from './components/KeyData';
import { MainContent } from './components/MainContent';
import { Environment } from '../../types/environment';
import { useGetOrganizationKey } from '../../hooks/api/queries/useOrganizationKeys';
import { Loader } from '../../components/Loader';
import { triggerToast } from '../../utils/toasts';
import { useGetApiKeySetupStatus } from '../../hooks/api/queries/useApiKeySetupStatus';

export const ApiKey = () => {
  const navigate = useNavigate();
  const { organizationId, projectId, apiKey, env } = useParams();
  const { data: apiKeyData, isLoading: isApiKeyDataLoading } = useGetOrganizationKey(
    projectId ?? '',
    apiKey ?? '',
    env as Environment,
  );
  const { isLoading: isStatusLoading } = useGetApiKeySetupStatus(projectId ?? '', apiKey ?? '', env ?? '');

  if (!apiKey || !env) {
    navigate(`/${organizationId}/project/${projectId}`);
  }

  if (!isApiKeyDataLoading && !apiKeyData) {
    navigate(`/${organizationId}/project/${projectId}`);
    triggerToast({
      variant: 'error',
      title: 'Failed to Load Key',
    });
    return null;
  }

  if (isApiKeyDataLoading || isStatusLoading) {
    return <Loader />;
  }

  return (
    <>
      <Header />
      <KeyData />
      <MainContent />
    </>
  );
};
