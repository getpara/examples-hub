import styled from 'styled-components';
import { useGetAllProjects } from '../../../hooks/api/queries/useProjects';
import { triggerToast } from '../../../utils/toasts';
import { ProjectCard } from './ProjectCard';
import { Loader } from '../../../components/Loader';
import { AddProjectCard } from './AddProjectCard';
import { useState } from 'react';
import { CreateProjectModal } from './CreateProjectModal';

export const ProjectsTab = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: projects, isLoading: isLoadingProjects, error: projectsError } = useGetAllProjects();

  if (projectsError) {
    triggerToast({
      variant: 'error',
      title: 'Error Loading Projects',
      body: 'Please try to login again. If the problem persists, contact Capsule support.',
    });
  }

  const handleCreateClick = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  if (isLoadingProjects) {
    return <Loader />;
  }

  return (
    <Container>
      {projects?.map(project => <ProjectCard key={project.id} project={project} />)}
      <AddProjectCard isFirstProject={!projects?.length} onClick={handleCreateClick} />
      <CreateProjectModal open={modalOpen} onClose={handleCloseModal} />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;
