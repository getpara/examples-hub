import { useGetSelectedOrganizationIsValid } from '../api/queries/useOrganizations';
import { useGetOrganizationSubscriptionPlan } from '../api/queries/useOrganizationSubscription';
import { useGetAllActiveProjects } from '../api/queries/useProjects';

export const useCanCreateProject = () => {
  const { data: orgValid } = useGetSelectedOrganizationIsValid();
  const { data: plan } = useGetOrganizationSubscriptionPlan();
  const { data: projects } = useGetAllActiveProjects();

  const canCreateProject = orgValid && !!plan && !!projects && projects.length < plan.maxProjects;

  return { canCreateProject };
};
