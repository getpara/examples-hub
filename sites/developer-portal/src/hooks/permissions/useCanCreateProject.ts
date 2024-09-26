import { getPlanPermissions } from '../../utils/getPlanPermissions';
import { useGetSelectedOrganization } from '../api/queries/useOrganizations';
import { useGetAllProjects } from '../api/queries/useProjects';

export const useCanCreateProject = () => {
  const { data: organization } = useGetSelectedOrganization();
  const { data: projects } = useGetAllProjects();

  const canCreateProject =
    !!organization && !!projects && getPlanPermissions(organization.activePlanSlug).maxProjects > projects.length;

  return { canCreateProject };
};
