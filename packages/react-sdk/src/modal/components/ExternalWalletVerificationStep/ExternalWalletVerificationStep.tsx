import { CpslButton, CpslSpinner, CpslText } from '@getpara/react-components';
import { useEffect } from 'react';
import { styled } from 'styled-components';
import { useModalStore } from '../../stores/index.js';
import { ErrorContainer, ErrorIcon, Heading, InnerStepContainer, StepContainer } from '../common.js';
import { useExternalWallets } from '../../../provider/providers/ExternalWalletProvider.js';

export const ExternalWalletVerificationStep = () => {
  const { isExternalWalletVerifying, verifyWalletSignature } = useExternalWallets();
  const externalWalletError = useModalStore(state => state.externalWalletError);

  useEffect(() => {
    verifyWalletSignature();
  }, []);

  return (
    <StepContainer $wide>
      <InnerStepContainer>
        <Heading variant="headingS" weight="bold">
          Verify Your Wallet
        </Heading>
        <InlineText variant="bodyS" color="secondary">
          Sign the message with your wallet to complete sign up.
        </InlineText>
        {!!externalWalletError?.[0] && (
          <ErrorContainer>
            <ErrorIcon icon="alertCircle" />
            <CpslText weight="semiBold" color="error">
              {externalWalletError?.[0]}
            </CpslText>
          </ErrorContainer>
        )}
      </InnerStepContainer>
      <InnerStepContainer>
        {isExternalWalletVerifying ? <CpslSpinner /> : <CpslButton onClick={verifyWalletSignature}>Retry</CpslButton>}
      </InnerStepContainer>
    </StepContainer>
  );
};

const InlineText = styled(CpslText)`
  text-align: center;
  display: inline-block;
`;
