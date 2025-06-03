import { MAX_ORGS } from '../../utils/constants';
import { useGetAllOrganizations } from '../api/queries/useOrganizations';

export const useCanCreateOrganization = () => {
  const { data: orgs, isLoading: isOrgsLoading } = useGetAllOrganizations();

  const canCreateOrg = !isOrgsLoading && (orgs?.length ?? 0) < MAX_ORGS;

  return { canCreateOrg };
};
