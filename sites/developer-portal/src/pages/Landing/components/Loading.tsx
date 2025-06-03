import { useSetSelectedOrganizationWithNavigation } from '../../../hooks/useSetSelectedOrganizationWithNavigation';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGetAllOrganizations } from '../../../hooks/api/queries/useOrganizations';
import { Loader } from '@getpara/react-component-library';

export const Loading = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: allOrgs, isLoading: isLoadingOrgs, isRefetching: isRefetchingOrgs } = useGetAllOrganizations(false);
  const { setSelectedOrganization } = useSetSelectedOrganizationWithNavigation(false);

  useEffect(() => {
    if (!isLoadingOrgs && !isRefetchingOrgs) {
      const inviteId = searchParams.get('invite');
      if (inviteId) {
        const route = !allOrgs?.length ? '/onboarding/invite' : '/invite';
        navigate({ pathname: route, search: searchParams.toString() }, { replace: true });
      } else {
        setSelectedOrganization();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingOrgs, isRefetchingOrgs]);

  return <Loader className="para:size-14" />;
};
