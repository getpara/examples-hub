import { useParams } from 'react-router-dom';
import { useGetAllProjects, useGetProject } from '../../../../hooks/api/queries/useProjects';
import { NavDropdown } from './NavDropdown';
import { NavSeparator } from './NavSeparator';
import { Button, DropdownMenuSeparator } from '@getpara/react-component-library';
import { useCanCreateProject } from '../../../../hooks/subscriptionGating/useCanCreateProject';
import { useState } from 'react';
import { CreateProjectModal } from '../../../CreateProjectModal/CreateProjectModal';
import { Plus } from 'lucide-react';

export const ProjectDropdown = () => {
  const { organizationId, projectId } = useParams();
  const { data: projects } = useGetAllProjects();
  const { data: project } = useGetProject(projectId ?? '');
  const { canCreateProject } = useCanCreateProject();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  if (!project || !projects?.length) {
    return null;
  }

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setIsNavOpen(false);
  };

  return (
    <>
      <NavSeparator />
      <NavDropdown
        selected={{
          id: project.id,
          name: project.name,
          iconUrl: project.iconUrl,
          badge: project?.archived ? 'Archived' : undefined,
        }}
        options={projects.map(project => ({
          id: project.id,
          name: project.name,
          iconUrl: project.iconUrl,
          badge: project?.archived ? 'Archived' : undefined,
        }))}
        pathPrefix={`/${organizationId}/project/`}
        isOpen={isNavOpen}
        setIsOpen={setIsNavOpen}
      >
        {canCreateProject && (
          <>
            <DropdownMenuSeparator />
            <div className="para:p-1">
              <Button variant="outline" size="sm" className="para:w-full" onClick={handleOpenModal}>
                <Plus className="para:size-4 para:stroke-foreground" />
                Create Project
              </Button>
            </div>
          </>
        )}
      </NavDropdown>
      <CreateProjectModal open={isModalOpen} setIsOpen={setIsModalOpen} />
    </>
  );
};
