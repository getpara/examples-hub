import { ParaModal, useAccount } from '@getpara/react-sdk';
import styled from 'styled-components';
import { Footer } from './components/Footer';
import { Heading } from './components/Heading';
import { CTA } from './components/CTA';
import { useState } from 'react';
import { Loading } from './components/Loading';

export const Landing = () => {
  const { data: account } = useAccount();

  const [isLoading, setIsLoading] = useState(false);

  const handleModalClose = () => {
    if (account?.isConnected) {
      setIsLoading(true);
    }
  };

  return (
    <Container>
      <Heading />
      <CTA />
      {isLoading ? <Loading /> : <StyledModal onClose={handleModalClose} />}
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

const StyledModal = styled(ParaModal)`
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
