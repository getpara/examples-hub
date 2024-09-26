import { CpslButton, CpslIcon, CpslText } from '@usecapsule/react-components';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useGetProject } from '../../../hooks/api/queries/useProjects';
import { useState } from 'react';
import { EditProjectModal } from './EditProjectModal';

export const Header = () => {
  const { projectId } = useParams();
  const { data: project } = useGetProject(projectId ?? '');
  const [modalOpen, setModalOpen] = useState(false);

  const handleEditClick = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <Container>
        <CpslText variant="headingS" weight="semiBold">
          {project?.name}
        </CpslText>
        <CpslButton variant="secondary" size="small" onClick={handleEditClick}>
          <CpslIcon slot="start" icon="edit02" />
          Edit Project
        </CpslButton>
      </Container>
      {!!project && <EditProjectModal open={modalOpen} onClose={handleCloseModal} />}
    </>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;
