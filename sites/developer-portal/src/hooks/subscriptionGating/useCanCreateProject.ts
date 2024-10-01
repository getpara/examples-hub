import { useGetSelectedOrganizationIsValid } from '../api/queries/useOrganizations';
import { useGetOrganizationSubscriptionPlan } from '../api/queries/useOrganizationSubscription';
import { useGetAllProjects } from '../api/queries/useProjects';

export const useCanCreateProject = () => {
  const { data: orgValid } = useGetSelectedOrganizationIsValid();
  const { data: plan } = useGetOrganizationSubscriptionPlan();
  const { data: projects } = useGetAllProjects();

  const canCreateProject = orgValid && !!plan && !!projects && projects.length < plan.maxProjects;

  return { canCreateProject };
};
