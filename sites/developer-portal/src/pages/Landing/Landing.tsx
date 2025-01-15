import { CapsuleModal, OAuthMethod } from '@usecapsule/react-sdk';
import { capsule } from '../../clients/capsule';
import styled from 'styled-components';
import { capsuleLogo } from '../../aasets/capsuleLogo';
import { Footer } from './components/Footer';
import { Heading } from './components/Heading';
import { CTA } from './components/CTA';
import { useState } from 'react';
import { Loading } from './components/Loading';
import { useQueryClient } from '@tanstack/react-query';
import { ORGANIZATIONS_QUERY_KEY } from '../../hooks/api/queries/useOrganizations';

export const Landing = () => {
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(false);

  const handleModalClose = async () => {
    const isFullyLoggedIn = await capsule.isFullyLoggedIn();
    if (!isFullyLoggedIn) {
      return;
    }

    setIsLoading(true);
    await queryClient.invalidateQueries({
      queryKey: [ORGANIZATIONS_QUERY_KEY],
    });
  };

  return (
    <Container>
      <Heading />
      <CTA />
      {isLoading ? (
        <Loading />
      ) : (
        <StyledModal
          capsule={capsule}
          isOpen
          onClose={handleModalClose}
          bareModal
          oAuthMethods={[OAuthMethod.GOOGLE]}
          disablePhoneLogin
          logo={capsuleLogo}
        />
      )}
      <Footer />
    </Container>
  );
};

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  max-width: 558px;
  width: 100%;
`;

const StyledModal = styled(CapsuleModal)`
  width: 100%;
  --card-box-shadow: 0px 1px 1px 0px rgba(0, 0, 0, 0.05), 0px 4px 6px 0px rgba(34, 42, 53, 0.04),
    0px 24px 68px 0px rgba(47, 48, 55, 0.05), 0px 2px 3px 0px rgba(0, 0, 0, 0.04);

  &::part(modal-container) {
    width: 100%;
    overflow: visible;
  }

  &::part(modal-body-card) {
    --card-border-width: 0px;
  }

  &::part(modal-mobile-footer) {
    display: none;
  }

  &::part(modal-footer) {
    display: none;
  }
`;
