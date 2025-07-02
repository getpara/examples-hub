import { CpslButton, CpslSpinner, CpslText } from '@getpara/react-components';
import { safeStyled } from '@getpara/react-common';
import { useModalStore } from '../../stores/index.js';
import { ErrorContainer, ErrorIcon, Heading, InnerStepContainer, StepContainer } from '../common.js';
import { useExternalWallets } from '../../../provider/providers/ExternalWalletProvider.js';
import { useEffect, useRef } from 'react';

export const ExternalWalletVerificationStep = () => {
  const effectRan = useRef(false);
  const { verifyWalletSignature } = useExternalWallets();
  const externalWalletError = useModalStore(state => state.externalWalletError);

  useEffect(() => {
    const hasRun = effectRan.current;
    if (!hasRun) {
      verifyWalletSignature();
      effectRan.current = true;
    }
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
        {!externalWalletError || !effectRan.current ? (
          <CpslSpinner />
        ) : (
          <CpslButton onClick={verifyWalletSignature}>Retry</CpslButton>
        )}
      </InnerStepContainer>
    </StepContainer>
  );
};

const InlineText = safeStyled(CpslText)`
  text-align: center;
  display: inline-block;
`;
