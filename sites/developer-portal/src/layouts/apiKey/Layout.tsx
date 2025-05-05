import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useGetApiKeySetupStatus } from '../../hooks/api/queries/useApiKeySetupStatus';
import { Loader } from '@getpara/react-component-library';
import { useOnRampAllAssets } from '../../hooks/api/queries/useOnRampAssets';
import { useGetAllOrganizationKeys } from '../../hooks/api/queries/useOrganizationKeys';

const VALID_PAGES = ['setup', 'users', 'analytics', 'branding', 'security', 'on-off-ramps', 'permissions'];

export const Layout = () => {
  const { organizationId, projectId, apiKey, env, apiKeyPage } = useParams();
  const navigate = useNavigate();
  const { data: allKeys, isLoading: isLoadingKeys } = useGetAllOrganizationKeys(projectId ?? '');
  const { isLoading: isKeyStatusLoading } = useGetApiKeySetupStatus(projectId ?? '', apiKey ?? '', env ?? '');
  const { isLoading: isOnRampAssetsLoading } = useOnRampAllAssets();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!env || !apiKey) {
      return;
    }
    if (!apiKeyPage) {
      navigate(`${pathname}/setup`, { replace: true });
      return;
    }
    if (!VALID_PAGES.includes(apiKeyPage)) {
      navigate(`/${organizationId}/not-found`, { replace: true });
      return;
    }
  }, [apiKey, apiKeyPage, env, navigate, organizationId, pathname]);

  useEffect(() => {
    if (!isLoadingKeys) {
      const firstValidKey = allKeys?.find(key => !key.archived);
      if (!apiKey) {
        if (!allKeys?.length || !firstValidKey) {
          navigate(`/${organizationId}`, { replace: true });
          return;
        }
        navigate(`/${organizationId}/project/${projectId}/key/${firstValidKey.environment}/${firstValidKey.id}`, {
          replace: true,
        });
      }
    }
  }, [allKeys, apiKey, isLoadingKeys, navigate, organizationId, projectId]);

  if (isKeyStatusLoading || isOnRampAssetsLoading || isLoadingKeys) {
    return <Loader className="para:m-auto para:size-14" />;
  }

  return <Outlet />;
};
