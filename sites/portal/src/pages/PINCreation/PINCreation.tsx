import styled from 'styled-components';
import { Card, CardContent } from '../../components/common';
import { CpslButton, CpslCodeInput, CpslText } from '@getpara/react-components';
import { useEffect, useRef, useState } from 'react';
import { CodeChangeEventDetail, CpslCodeInputCustomEvent } from '@getpara/core-components';
import { passwordCreation } from '../../utils/passwordCreation';
import { ModalSuccess } from '../../components/ModalSuccess';
import { useModalOutletContext } from '../../hooks/useModalOutletContext';
import { usePara } from '../../components';
import { useExtractedParams } from '../../hooks/useExtractedParams';
import { validateCallbackUrl } from '../../utils/validateCallbackUrl';
import { useCloseWindow } from '../../hooks/useCloseWindow';
import { useSearchParams } from 'react-router-dom';
import { isIFramed } from '../../utils/isIFramed';

export const PINCreation = () => {
  const inputRef = useRef<HTMLCpslCodeInputElement>(null);
  const para = usePara();
  const { partnerId, userId, passwordId } = useExtractedParams<{
    userId: string;
    partnerId: string;
    passwordId: string;
  }>();
  const closeWindow = useCloseWindow();
  const [searchParams] = useSearchParams();

  const [pin, setPin] = useState<string>();
  const [pinVerification, setPinVerification] = useState<string>();
  const [isOnVerificationStep, setIsOnVerificationStep] = useState<boolean>();
  const [pinCreated, setPinCreated] = useState<boolean>();
  const [isProcessing, setIsProcessing] = useState<boolean>();

  const handlePINInput = (ev: CpslCodeInputCustomEvent<CodeChangeEventDetail>) => {
    (isOnVerificationStep ? setPinVerification : setPin)(ev.detail.value);
  };

  const pinMatches = pin === pinVerification;
  const pinLength = pin?.length === 4;
  const pinHasNoSpaces = !/\s/.test(pin);

  const pinValid = pinLength && pinHasNoSpaces;

  useEffect(() => {
    document.body.style.backgroundColor = 'transparent';
    // Using a small timeout here to ensure the input is mounted before attempting focus
    setTimeout(() => {
      inputRef.current?.shadowRoot?.querySelectorAll('input')?.[0]?.focus();
    }, 10);
  }, []);

  function pinHelperText() {
    if (!pinLength && !pinHasNoSpaces) {
      return 'PIN must be exactly 4 numbers long and contain no spaces.';
    }

    if (!pinLength) {
      return 'PIN must be exactly 4 numbers long.';
    }

    if (!pinHasNoSpaces) {
      return 'PIN must contain no spaces.';
    }

    if (isOnVerificationStep && pinVerification?.length === 4 && !pinMatches) {
      return 'PINs do not match.';
    }

    return null;
  }

  const onSubmit = async () => {
    if (!pinValid) {
      return;
    }

    if (!isOnVerificationStep) {
      setIsOnVerificationStep(true);
      // Using a small timeout here to ensure the input is mounted before attempting focus
      setTimeout(() => {
        inputRef.current?.shadowRoot?.querySelectorAll('input')?.[0]?.focus();
      }, 10);
      return;
    }

    if (!pinMatches) {
      return;
    }

    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      await passwordCreation(para, {
        partnerId,
        userId,
        password: pin,
        passwordId,
        isPIN: true,
        isForNewDevice: searchParams.get('isForNewDevice') === 'true',
      });

      setPinCreated(true);

      // Check for native callback URL
      const urlParams = new URLSearchParams(window.location.search);
      const nativeCallbackUrl = urlParams.get('nativeCallbackUrl');

      if (nativeCallbackUrl && validateCallbackUrl(nativeCallbackUrl)) {
        // Redirect to the native callback URL if it exists and is valid
        window.location.href = nativeCallbackUrl;
      } else {
        // Otherwise, close the window after a delay
        closeWindow(true);
      }
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
    }
  };

  const { partner } = useModalOutletContext();

  return (
    <StyledCard>
      <CardContent>
        <Container slot="body">
          {pinCreated ? (
            <ModalSuccess
              heading="PIN Created!"
              subHeading={`You can now close this window and return to ${partner.displayName}.`}
            />
          ) : (
            <>
              <InnerContainer>
                <CpslText variant="bodyL" weight="semiBold">
                  {isOnVerificationStep ? 'Confirm PIN' : 'Set PIN'}
                </CpslText>
                <CpslText variant="bodyS" color="secondary" weight="medium" style={{ textAlign: 'center' }}>
                  {isOnVerificationStep
                    ? 'Enter your PIN again to confirm it was set correctly.'
                    : ' Write down or store your PIN safely, it cannot be recovered.'}
                </CpslText>
              </InnerContainer>
              <InnerContainer>
                <StyledCodeInput
                  ref={inputRef}
                  length={4}
                  type="number"
                  code={isOnVerificationStep ? pinVerification : pin}
                  onCpslInput={handlePINInput}
                  onKeyDown={async e => e.key === 'Enter' && (await onSubmit())}
                />
                {pinHelperText() && (
                  <CpslText variant="bodyXS" color="secondary" style={{ width: '100%', textAlign: 'center' }}>
                    {pinHelperText()}
                  </CpslText>
                )}
              </InnerContainer>
              <CpslButton
                fullWidth
                disabled={(!isOnVerificationStep && !pinValid) || (isOnVerificationStep && !pinMatches) || isProcessing}
                onClick={onSubmit}
              >
                {isOnVerificationStep ? 'Set PIN' : 'Continue'}
              </CpslButton>
            </>
          )}
        </Container>
      </CardContent>
    </StyledCard>
  );
};

const StyledCard = styled(Card)`
  &::part(card-container) {
    padding-top: 0px;
  }
`;

const Container = styled.div`
  padding-left: ${isIFramed ? '0px' : '83px'};
  padding-right: ${isIFramed ? '0px' : '83px'};
  padding-top: ${isIFramed ? '0px' : '24px'};
  flex: 1;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 32px;
`;

const innerContainer = `
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const InnerContainer = styled.div`
  ${innerContainer}
`;

const StyledCodeInput = styled(CpslCodeInput)`
  align-self: center;
`;
