import { CpslButton, CpslIcon } from '@usecapsule/react-components';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { EditKeyModal } from './EditKeyModal';
import { CopyTo } from './CopyTo';
import { useKeyDataForm } from '../hooks/useKeyFormData';
import { FormProvider } from 'react-hook-form';
import { useGetAvailableKeyEnvs } from '../../../hooks/api/queries/useOrganizationKeys';
import { IS_PROD } from '../../../utils/constants';
import { Environment } from '../../../types/environment';
import { CreateProductionKeyButton } from './CreateProductionKeyButton';
import { CreateProductionKeyModal } from './CreateProductionKeyModal';
import { NonProdWarning } from './NonProdWarning';
import { useGetSelectedOrganizationIsValid } from '../../../hooks/api/queries/useOrganizations';

export const Header = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const form = useKeyDataForm();
  const { data: availableKeyEnvs } = useGetAvailableKeyEnvs(projectId ?? '');
  const { data: orgValid } = useGetSelectedOrganizationIsValid();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateProdKeyModalOpen, setIsCreateProdKeyModalOpen] = useState(false);

  const handleBackClick = () => {
    navigate(`/project/${projectId}`);
  };

  const handleEditClick = () => {
    if (orgValid) {
      setIsEditModalOpen(true);
    }
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
  };

  const handleCreateProdKeyClick = () => {
    if (orgValid) {
      setIsCreateProdKeyModalOpen(true);
    }
  };

  const handleCreateProdKeyModalClose = () => {
    setIsCreateProdKeyModalOpen(false);
  };

  // If the user can't create a prod/beta key that means they have a prod/beta key available to copy configs to
  const showCopyTo = availableKeyEnvs?.includes(IS_PROD ? Environment.PROD : Environment.BETA);

  return (
    <FormProvider {...form}>
      <Container>
        <BackButton variant="ghost" onClick={handleBackClick}>
          <ArrowIcon slot="start" icon="arrowNarrow" />
          Back
        </BackButton>
        <ActionContainer>
          <CpslButton variant="secondary" size="small" onClick={handleEditClick} disabled={!orgValid}>
            Edit Key
          </CpslButton>
          {!showCopyTo ? <CopyTo isInHeader /> : <CreateProductionKeyButton onClick={handleCreateProdKeyClick} />}
        </ActionContainer>
        <EditKeyModal open={isEditModalOpen} onClose={handleEditModalClose} />
        <CreateProductionKeyModal open={isCreateProdKeyModalOpen} onClose={handleCreateProdKeyModalClose} />
      </Container>
      <NonProdWarning onCreateProdKeyClick={handleCreateProdKeyClick} />
    </FormProvider>
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

const ActionContainer = styled.div`
  display: flex;
  gap: 8px;
`;
