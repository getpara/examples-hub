import { CpslButton, CpslSpinner, CpslText } from '@getpara/react-components';
import { useEffect, useState } from 'react';
import { styled } from 'styled-components';
import { ModalStep } from '../../utils/steps.js';
import { useModalStore } from '../../stores/index.js';
import { ErrorContainer, ErrorIcon, Heading, InnerStepContainer, StepContainer } from '../common.js';
import { AuthMethod } from '@getpara/core-sdk';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';
import { useStore } from '../../../provider/stores/useStore.js';
import { useExternalWallets } from '../../../provider/providers/ExternalWalletProvider.js';

export const ExternalWalletVerificationStep = () => {
  const theme = useStore(state => state.modalConfig?.theme);
  const setStep = useModalStore(state => state.setStep);
  const setWebAuthURLForCreate = useModalStore(state => state.setWebAuthURLForCreate);
  const isIFrameReady = useModalStore(state => state.isIFrameReady);
  const setIsIFrameReady = useModalStore(state => state.setIsIFrameReady);
  const setIFrameUrl = useModalStore(state => state.setIFrameUrl);
  const externalWalletError = useModalStore(state => state.externalWalletError);
  const setExternalWalletError = useModalStore(state => state.setExternalWalletError);
  const para = useInternalClient();
  const authInfo = para.authInfo;
  const { verifyWalletSignature } = useExternalWallets();

  const [shouldRouteToStep, setShouldRouteToStep] = useState<ModalStep>();

  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    handleVerifyWallet();
  }, []);

  useEffect(() => {
    if (!!shouldRouteToStep && isIFrameReady) {
      // Using a small timeout here to fully ensure the iframe is loaded before triggering any animation
      setTimeout(() => {
        setStep(shouldRouteToStep);
        setIsVerifying(false);
      }, 200);
    }
  }, [shouldRouteToStep, isIFrameReady]);

  const handleVerifyWallet = async () => {
    setIsVerifying(true);
    try {
      setIsIFrameReady(false);
      const supportedCreateAuthMethods = await para.getSupportedCreateAuthMethods();
      const walletSignature = await verifyWalletSignature();

      if (!walletSignature?.signature || !walletSignature?.address) {
        console.error('No signature or address found on the verifyWalletSignature response.');
        setIsVerifying(false);
        return;
      }

      const url = await para.verifyExternalWallet({
        address: walletSignature.address,
        signedMessage: walletSignature.signature,
        cosmosPublicKeyHex: walletSignature.cosmosPublicKeyHex,
        cosmosSigner: walletSignature.cosmosSigner,
      });

      if (supportedCreateAuthMethods.has(AuthMethod.PASSWORD) && supportedCreateAuthMethods.has(AuthMethod.PASSKEY)) {
        const passwordAuthUrl = await para.getSetupPasswordURL({ authType: authInfo?.authType, theme });
        setWebAuthURLForCreate(await para.shortenLoginLink(url));
        setIFrameUrl(await para.shortenLoginLink(passwordAuthUrl));
        setShouldRouteToStep(ModalStep.BIOMETRIC_CREATION);
        return;
      } else if (supportedCreateAuthMethods.has(AuthMethod.PASSWORD)) {
        const url = await para.getSetupPasswordURL({ authType: authInfo?.authType, theme });
        setIFrameUrl(await para.shortenLoginLink(url));
        setShouldRouteToStep(ModalStep.PASSWORD_CREATION);
        return;
      } else {
        setWebAuthURLForCreate(await para.shortenLoginLink(url));
        setStep(ModalStep.BIOMETRIC_CREATION);
      }
    } catch (e) {
      console.error('Error verifying signature:', e);
      setExternalWalletError(['Signature verification failed.']);
      setIsVerifying(false);
    }
  };

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
        {isVerifying ? <CpslSpinner /> : <CpslButton onClick={handleVerifyWallet}>Retry</CpslButton>}
      </InnerStepContainer>
    </StepContainer>
  );
};

const InlineText = styled(CpslText)`
  text-align: center;
  display: inline-block;
`;
