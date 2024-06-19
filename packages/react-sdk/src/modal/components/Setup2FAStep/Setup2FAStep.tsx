import { CpslButton, CpslCodeInput, CpslIcon, CpslQrCode, CpslSpinner } from '@usecapsule/react-components';
import { useEffect, useRef, useState } from 'react';
import { useCapsuleStore, useModalStore } from '../../stores/index.js';
import {
  Heading,
  SecondaryText,
  MainContainer,
  QRContainer,
  ButtonWithIconContainer,
  FilledDisabledInput,
} from '../common.js';
import { ModalStep } from '../../utils/steps.js';
import { CodeChangeEventDetail, CpslCodeInputCustomEvent } from '@usecapsule/core-components';
import { styled } from 'styled-components';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard.js';

interface Setup2FAStepProps {
  onClose: () => void;
}

export const Setup2FAStep = ({ onClose }: Setup2FAStepProps) => {
  const isLogin = useModalStore((state) => state.isLogin());
  const setStep = useModalStore((state) => state.setStep);
  const capsule = useCapsuleStore((state) => state.capsule);
  const isVerifying = useModalStore((state) => state.step === ModalStep.VERIFY_2FA);
  const [copied, copy] = useCopyToClipboard();

  const inputRef = useRef<HTMLCpslCodeInputElement>(null);

  const [qrCodeValue, setQrCodeValue] = useState(null);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');

  const params = qrCodeValue ? new URL(qrCodeValue).searchParams : undefined;
  const secret = params?.get('secret');

  useEffect(() => {
    async function fetchOtpAuthUrl() {
      try {
        const { uri } = await capsule.setup2FA();
        setQrCodeValue(uri);
      } catch (error) {
        console.error('Error fetching OTPAuth URL:', error);
      }
    }

    fetchOtpAuthUrl();
  }, []);

  useEffect(() => {
    // Using a small timeout here to ensure the input is mounted before attempting focus
    setTimeout(() => {
      inputRef?.current?.shadowRoot.querySelectorAll('input')?.[0]?.focus();
    }, 10);
  }, [isVerifying]);

  useEffect(() => {
    if (code.length === 6) {
      handleSubmitCode();
    }
  }, [code]);

  const handleNext = () => {
    setStep(ModalStep.VERIFY_2FA);
  };

  const handleSkip = () => {
    if (isLogin) {
      setStep(ModalStep.LOGIN_DONE);
    } else {
      onClose();
    }
  };

  const handleCodeInput = (e: CpslCodeInputCustomEvent<CodeChangeEventDetail>) => {
    if (codeError) {
      setCodeError('');
    }
    setCode(e.detail.value);
  };

  const handleSubmitCode = async () => {
    if (code.length === 6 && /^\d+$/.test(code)) {
      try {
        await capsule.enable2FA(code);
        setStep(ModalStep.TWO_FACTOR_DONE);
      } catch (e) {
        setCodeError('Incorrect Code');
      }
    } else {
      setCodeError('Incorrect Code');
    }
  };

  const handleCopy = () => {
    copy(secret);
  };

  return (
    <>
      <MainContainer>
        <Heading>
          <span>Turn on Two-Factor Authentication</span>
        </Heading>
        <SecondaryText>
          <span>
            {isVerifying
              ? 'Enter the 6-digit code from your authentication app.'
              : 'Scan the QR Code with your preferred authentication app.'}
          </span>
        </SecondaryText>
      </MainContainer>
      <>
        {isVerifying ? (
          <StyledCodeInput ref={inputRef} code={code} onCpslInput={handleCodeInput} errorText={codeError} length={6} />
        ) : (
          <>
            <QRContainer>{!qrCodeValue ? <CpslSpinner /> : <CpslQrCode url={qrCodeValue} />}</QRContainer>
            <SecondaryText>
              <span>Or input the code manually</span>
            </SecondaryText>
            <FilledDisabledInput disabled value={secret} noAutoDisable>
              <CpslButton slot="end" variant="ghost" onClick={handleCopy}>
                <CpslIcon icon={copied ? 'check' : 'copy'} />
              </CpslButton>
            </FilledDisabledInput>
            <CpslButton fullWidth onClick={handleNext}>
              <ButtonWithIconContainer>
                Continue
                <CpslIcon icon="arrowNarrow" />
              </ButtonWithIconContainer>
            </CpslButton>
            <CpslButton fullWidth onClick={handleSkip} variant="secondary">
              Setup 2FA Later
            </CpslButton>
          </>
        )}
      </>
    </>
  );
};

const StyledCodeInput = styled(CpslCodeInput)`
  align-self: center;
`;
