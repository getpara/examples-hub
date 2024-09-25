import { useParams } from 'react-router-dom';
import { useGetApiKeySetupStatus } from '../../../hooks/api/queries/useApiKeySetupStatus';
import { Loader } from '../../../components/Loader';
import { ProjectStatusCard } from './ProjectStatusCard';
import { triggerToast } from '../../../utils/toasts';
import { useGetProject } from '../../../hooks/api/queries/useProjects';
import { InstallProjectCard } from './InstallProjectCard';
import { useState } from 'react';
import { Framework } from '../../../types/framework';
import { PackageManager } from '../../../types/packageManager';
import { RunProjectCard } from './RunProjectCard';
import { CreateUserCard } from './CreateUserCard';

export const SetupTab = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: project, isLoading: isProjectLoading, error: projectError } = useGetProject(projectId ?? '');
  const { isLoading: isStatusLoading, error: statusError } = useGetApiKeySetupStatus(
    projectId ?? '',
    apiKey ?? '',
    env ?? '',
  );

  const [framework, setFramework] = useState<Framework>(project?.framework as Framework);
  const [packageManager, setPackageManager] = useState<PackageManager>(project?.packageManager as PackageManager);

  if (isStatusLoading || isProjectLoading) {
    return <Loader />;
  }

  if (!isProjectLoading && projectError) {
    triggerToast({
      variant: 'error',
      title: 'Failed to Load Project',
    });
    return null;
  }

  if (!isStatusLoading && statusError) {
    triggerToast({
      variant: 'error',
      title: 'Failed to Load Project Status',
    });
    return null;
  }

  return (
    <>
      <ProjectStatusCard />
      <InstallProjectCard
        framework={framework ?? project?.framework ?? Framework.REACT}
        packageManager={packageManager ?? project?.packageManager ?? PackageManager.NPM}
        setFramework={setFramework}
        setPackageManager={setPackageManager}
      />
      <RunProjectCard framework={framework ?? project?.framework ?? Framework.REACT} />
      <CreateUserCard />
    </>
  );
};
