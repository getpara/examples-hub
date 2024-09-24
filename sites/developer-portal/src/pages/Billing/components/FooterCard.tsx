import styled from 'styled-components';
import { BaseCard } from '../../../components/common';
import { CpslButton, CpslText } from '@usecapsule/react-components';
import { useState } from 'react';
import { RequestCancelModal } from './RequestCancelModal';
import { useGetSelectedOrganization } from '../../../hooks/api/queries/useOrganizations';
import { SUPPORT_URL } from '../../../utils/constants';

export const FooterCard = () => {
  const { data: org } = useGetSelectedOrganization();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const handleCancelClick = () => {
    setIsCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    setIsCancelModalOpen(false);
  };

  return (
    <>
      <Container>
        <BaseCard>
          <InnerContainer>
            <Text variant="bodyS" weight="medium">
              Not finding the features or plan you are looking for? We’d love to hear about what you need!
            </Text>
            <ButtonContainer>
              <CpslButton size="small" as="a" href={SUPPORT_URL}>
                Get In Touch
              </CpslButton>
              <CpslButton disabled={org?.hasRequestedCancel} variant="destructive" size="small" onClick={handleCancelClick}>
                Cancel Plan
              </CpslButton>
            </ButtonContainer>
          </InnerContainer>
        </BaseCard>
      </Container>
      <RequestCancelModal open={isCancelModalOpen} onClose={handleCloseCancelModal} />
    </>
  );
};

const Container = styled.div`
  max-width: 840px;
`;

const InnerContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Text = styled(CpslText)`
  flex-basis: 450px;
`;
