import { useGetKeyIsValid } from './api/queries/useOrganizationKeys';
import { useGetOrganizationIsValid } from './api/queries/useOrganizations';
import { useGetProjectIsValid } from './api/queries/useProjects';

export const useIsValidOrg = (organizationId?: string) => {
  const { data: isValidOrg, isLoading: isLoadingValidOrg } = useGetOrganizationIsValid(organizationId);

  return !!organizationId && !isLoadingValidOrg && !!isValidOrg;
};

export const useIsValidProject = (projectId?: string) => {
  const { data: isValidProject, isLoading: isLoadingValidProject } = useGetProjectIsValid(projectId);

  return !!projectId && !isLoadingValidProject && !!isValidProject;
};

export const useIsValidKey = (projectId?: string, keyId?: string) => {
  const { data: isValidKey, isLoading: isLoadingValidKey } = useGetKeyIsValid(projectId, keyId);

  return !!keyId && !isLoadingValidKey && !!isValidKey;
};
