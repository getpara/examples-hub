import { useGetKeyIsValid } from './api/queries/useOrganizationKeys';
import { useGetOrganizationIsValid } from './api/queries/useOrganizations';
import { useGetProject } from './api/queries/useProjects';

export const useIsValidOrg = (organizationId?: string) => {
  const { data: isValidOrg, isLoading: isLoadingValidOrg } = useGetOrganizationIsValid(organizationId);

  return !!organizationId && !isLoadingValidOrg && !!isValidOrg;
};

export const useIsValidProject = (projectId?: string, excludeArchived?: boolean) => {
  const { data: project, isLoading: isLoadingValidProject } = useGetProject(projectId ?? '');

  return !!projectId && !isLoadingValidProject && !!project && (excludeArchived ? !project.archived : true);
};

export const useIsValidKey = (projectId?: string, keyId?: string, excludeArchived?: boolean) => {
  const { data: key, isLoading: isLoadingValidKey } = useGetKeyIsValid(projectId, keyId);

  return !!keyId && !isLoadingValidKey && !!key && (excludeArchived ? !key.archived : true);
};
