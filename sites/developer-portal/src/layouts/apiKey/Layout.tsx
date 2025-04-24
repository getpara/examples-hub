import { useEffect } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { useGetOrganizationKey } from '../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../types/environment';
import { useGetProject } from '../../hooks/api/queries/useProjects';
import { useGetApiKeySetupStatus } from '../../hooks/api/queries/useApiKeySetupStatus';
import { Loader } from '@getpara/react-component-library';
import { useOnRampAllAssets } from '../../hooks/api/queries/useOnRampAssets';

const VALID_PAGES = ['setup', 'users', 'analytics', 'branding', 'security', 'on-off-ramps', 'permissions'];

export const Layout = () => {
  const { organizationId, projectId, apiKey, env, apiKeyPage } = useParams();
  const navigate = useNavigate();
  const { isLoading: isKeyLoading } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);
  const { isLoading: isProjectLoading } = useGetProject(projectId ?? '');
  const { isLoading: isKeyStatusLoading } = useGetApiKeySetupStatus(projectId ?? '', apiKey ?? '', env ?? '');
  const { isLoading: isOnRampAssetsLoading } = useOnRampAllAssets();

  useEffect(() => {
    if (!apiKeyPage || !VALID_PAGES.includes(apiKeyPage)) {
      navigate(`/${organizationId}/not-found`, { replace: true });
    }
  }, [apiKeyPage, navigate, organizationId]);

  if (isKeyLoading || isProjectLoading || isKeyStatusLoading || isOnRampAssetsLoading) {
    return <Loader className="para:m-auto para:size-14" />;
  }

  return <Outlet />;
};
