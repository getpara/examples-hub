import { CpslButton, CpslIcon } from '@usecapsule/react-components';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { EditKeyModal } from './EditKeyModal';
import { Environment } from '../../../types/environment';
import { useGetOrganizationKey } from '../../../hooks/api/queries/useOrganizationKeys';

export const Header = () => {
  const navigate = useNavigate();
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleBackClick = () => {
    navigate(`/project/${projectId}`);
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
  };

  return (
    <Container>
      <BackButton variant="ghost" onClick={handleBackClick}>
        <ArrowIcon slot="start" icon="arrowNarrow" />
        Back
      </BackButton>
      <CpslButton variant="secondary" size="small" onClick={handleEditClick} disabled={apiKeyData?.archived}>
        Edit Key
      </CpslButton>
      <EditKeyModal name={apiKeyData?.displayName} open={isEditModalOpen} onClose={handleEditModalClose} />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ArrowIcon = styled(CpslIcon)`
  transform: rotate(180deg);
`;

const BackButton = styled(CpslButton)`
  --button-gap: 4px;
`;
