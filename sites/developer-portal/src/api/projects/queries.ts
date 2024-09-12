import { axiosClient } from '../../clients/axios';
import { ProjectsResponse, ProjectTotalUsersResponse } from '../../types/api';

export const getProjects = async (organizationId: string) => {
  const endpoint = `/organizations/${organizationId}/projects`;

  return axiosClient.get<ProjectsResponse>(endpoint);
};

export const getProjectTotalUsers = async (organizationId: string, projectId: string) => {
  const endpoint = `/organizations/${organizationId}/projects/${projectId}/total-users`;

  return axiosClient.get<ProjectTotalUsersResponse>(endpoint);
};
