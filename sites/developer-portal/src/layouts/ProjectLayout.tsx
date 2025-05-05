import { useEffect } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { Loader } from '@getpara/react-component-library';
import { useGetAllProjects } from '../hooks/api/queries/useProjects';

export const ProjectLayout = () => {
  const { organizationId, projectId } = useParams();
  const navigate = useNavigate();
  const { data: allProjects, isLoading: isLoadingProjects } = useGetAllProjects();

  useEffect(() => {
    if (!isLoadingProjects) {
      const firstValidProject = allProjects?.find(project => !project.archived);
      if (!projectId) {
        if (!allProjects?.length || !firstValidProject) {
          navigate(`/${organizationId}`, { replace: true });
          return;
        }
        navigate(`/${organizationId}/project/${firstValidProject.id}/key`, { replace: true });
      }
    }
  }, [projectId, navigate, organizationId, isLoadingProjects, allProjects]);

  if (isLoadingProjects) {
    return <Loader className="para:m-auto para:size-14" />;
  }

  return <Outlet />;
};
