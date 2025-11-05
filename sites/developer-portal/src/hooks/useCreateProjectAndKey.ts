import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { useGetAllProjects } from './api/queries/useProjects';
import { useGetSelectedOrganization } from './api/queries/useOrganizations';
import { useCreateApiKey } from './api/mutations/useCreateApiKey';
import { useCreateProject } from './api/mutations/useCreateProject';
import { useCanCreateProject } from './subscriptionGating/useCanCreateProject';
import { ENV_VARS, IS_BETA, IS_PROD } from '../utils/constants';
import { Environment } from '../types/environment';
import { toast } from '@getpara/react-component-library';

export const useCreateProjectAndKey = () => {
  const { canCreateProject } = useCanCreateProject();
  const { mutateAsync: createProject } = useCreateProject();
  const { mutateAsync: createApiKey } = useCreateApiKey();
  const { data: org } = useGetSelectedOrganization();
  const { data: projects } = useGetAllProjects();
  const navigate = useNavigate();

  const createProjectAndKey = async () => {
    if (org && canCreateProject) {
      const numProjects = projects?.length || 0;
      const nameSuffix = numProjects > 0 ? ` ${numProjects + 1}` : '';

      const defaultName = `${org.name} Project${nameSuffix}`;
      try {
        const newProject = await createProject(
          {
            data: { name: defaultName },
          },
          {
            onError: err => {
              let body = 'Please try again. If the problem persists, contact Para support.';

              if ((err as AxiosError).response?.data === 'max projects created for the current plan') {
                body =
                  "You've reached the max number of projects allowed on your current plan level. Upgrade to add more projects.";
              }

              toast.error('Failed to Create Project', {
                description: body,
              });
            },
          },
        );

        if (newProject) {
          const newKey = await createApiKey(
            {
              projectId: newProject.project.id,
              env: IS_PROD ? Environment.BETA : IS_BETA ? Environment.SANDBOX : (ENV_VARS.environment as Environment),
              data: { homepageUrl: org.homepageUrl },
            },
            {
              onError: () => {
                toast.error('Failed to Create Key', {
                  description: 'Please try again. If the problem persists, contact Para support.',
                });
              },
            },
          );

          navigate(
            `/${org.id}/project/${newProject.project.id}/key/${newKey.key.environment as Environment}/${newKey.key.id}`,
          );
        }
      } catch {
        // No error here, errors are handled in the onError callbacks
      }
    }
  };

  return createProjectAndKey;
};
