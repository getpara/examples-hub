import { getPlanPermissions } from '../../utils/getPlanPermissions';
import { useGetSelectedOrganization } from '../api/queries/useOrganizations';
import { useGetAllProjects } from '../api/queries/useProjects';

export const useCanCreateProdKeys = () => {
  const { data: organization } = useGetSelectedOrganization();
  const { data: projects } = useGetAllProjects();

  const canCreateProdKeys =
    !!organization && !!projects && getPlanPermissions(organization.activePlanSlug).canCreateProdKeys;

  return { canCreateProdKeys };
};
