import { Button } from '@getpara/react-component-library';
import { Plus } from 'lucide-react';
import { useCanCreateProject } from '../../../hooks/subscriptionGating/useCanCreateProject';
import { useCreateProjectAndKey } from '../../../hooks/useCreateProjectAndKey';

export const CreateProjectButton = () => {
  const createProjectAndKey = useCreateProjectAndKey();
  const { canCreateProject } = useCanCreateProject();

  if (!canCreateProject) {
    return null;
  }

  return (
    <Button onClick={createProjectAndKey}>
      <Plus />
      Create Project
    </Button>
  );
};
