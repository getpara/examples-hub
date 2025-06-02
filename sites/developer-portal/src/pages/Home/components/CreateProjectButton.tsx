import { Button } from '@getpara/react-component-library';
import { Plus } from 'lucide-react';
import { useCanCreateProject } from '../../../hooks/subscriptionGating/useCanCreateProject';
import { useCreateProjectAndKey } from '../../../hooks/useCreateProjectAndKey';
import { useOrganizationMemberCapabilities } from '../../../hooks/api/queries/useOrganizationMember';

export const CreateProjectButton = () => {
  const createProjectAndKey = useCreateProjectAndKey();
  const { canCreateProject } = useCanCreateProject();
  const { data: capabilities } = useOrganizationMemberCapabilities();

  if (canCreateProject || !capabilities?.canCreateProjects) {
    return null;
  }

  return (
    <Button onClick={createProjectAndKey}>
      <Plus />
      Create Project
    </Button>
  );
};
