import { useNavigate, useParams } from 'react-router-dom';
import { Header } from './components/Header';
import { KeyData } from './components/KeyData';
import { MainContent } from './components/MainContent';
import { Environment } from '../../types/environment';
import { useGetOrganizationKey } from '../../hooks/api/queries/useOrganizationKeys';
import { Loader } from '../../components/Loader';
import { triggerToast } from '../../utils/toasts';
import { NonProdWarning } from './components/NonProdWarning';

export const ApiKey = () => {
  const navigate = useNavigate();
  const { projectId, apiKey, env } = useParams();
  const { data: apiKeyData, isLoading: isApiKeyDataLoading } = useGetOrganizationKey(
    projectId ?? '',
    apiKey ?? '',
    env as Environment,
  );

  if (!apiKey || !env) {
    navigate(`/project/${projectId}`);
  }

  if (!isApiKeyDataLoading && !apiKeyData) {
    navigate(`/project/${projectId}`);
    triggerToast({
      variant: 'error',
      title: 'Failed to Load Key',
    });
    return null;
  }

  if (isApiKeyDataLoading) {
    return <Loader />;
  }

  return (
    <>
      <Header />
      <NonProdWarning />
      <KeyData />
      <MainContent />
    </>
  );
};
