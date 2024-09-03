import {
  CpslButton,
  CpslCodeInput,
  CpslDivider,
  CpslIcon,
  CpslQrCode,
  CpslSpinner,
  CpslText,
} from '@usecapsule/react-components';
import { useEffect, useRef, useState } from 'react';
import { useCapsuleStore, useModalStore } from '../../stores/index.js';
import { Heading, QRContainer, FilledDisabledInput, StepContainer, InnerStepContainer } from '../common.js';
import { ModalStep } from '../../utils/steps.js';
import { CodeChangeEventDetail, CpslCodeInputCustomEvent } from '@usecapsule/core-components';
import { styled } from 'styled-components';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard.js';

interface Setup2FAStepProps {
  onClose: () => void;
}

export const Setup2FAStep = ({ onClose }: Setup2FAStepProps) => {
  const isLogin = useModalStore(state => state.isLogin());
  const setStep = useModalStore(state => state.setStep);
  const capsule = useCapsuleStore(state => state.capsule);
  const isVerifying = useModalStore(state => state.step === ModalStep.VERIFY_2FA);
  const [copied, copy] = useCopyToClipboard();

  const inputRef = useRef<HTMLCpslCodeInputElement>(null);

  const [qrCodeValue, setQrCodeValue] = useState(null);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

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
    setCode(e.detail.value.trim());
  };

  const handleSubmitCode = async () => {
    setIsVerifyingCode(true);
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
    setIsVerifyingCode(false);
  };

  const handleCopy = () => {
    copy(secret);
  };

  return (
    <StepContainer>
      <InnerStepContainer>
        <Heading variant="headingS" weight="bold">
          Turn on Two-Factor authentication
        </Heading>
        {isVerifying && (
          <CpslText variant="bodyS" color="secondary" weight="medium">
            Please enter the code from your authenticator app.
          </CpslText>
        )}
      </InnerStepContainer>
      <InnerStepContainer>
        {isVerifying ? (
          <>
            {isVerifyingCode ? (
              <CpslSpinner />
            ) : (
              <form
                onSubmit={async e => {
                  e.preventDefault();
                  await handleSubmitCode();
                }}
              >
                <StyledCodeInput
                  ref={inputRef}
                  code={code}
                  onCpslInput={handleCodeInput}
                  errorText={codeError}
                  length={6}
                  onKeyDown={async e => e.key === 'Enter' && (await handleSubmitCode())}
                />
              </form>
            )}
          </>
        ) : (
          <>
            <CpslText variant="bodyS" color="secondary" weight="medium">
              Scan with your preferred authenticator app.
            </CpslText>
            <QRContainer>{!qrCodeValue ? <CpslSpinner size={100} /> : <CpslQrCode url={qrCodeValue} />}</QRContainer>
          </>
        )}
      </InnerStepContainer>
      {!isVerifying && (
        <>
          <InnerStepContainer>
            <CpslDivider>or enter the code manually</CpslDivider>
          </InnerStepContainer>
          <InnerStepContainer>
            <FilledDisabledInput disabled value={secret} noAutoDisable>
              <CpslButton slot="end" variant="ghost" onClick={handleCopy}>
                <CpslIcon icon={copied ? 'check' : 'copy'} />
              </CpslButton>
            </FilledDisabledInput>
          </InnerStepContainer>
          <InnerStepContainer>
            <CpslButton fullWidth onClick={handleNext}>
              Continue
            </CpslButton>
            <SkipButton variant="ghost" onClick={handleSkip}>
              Skip
            </SkipButton>
          </InnerStepContainer>
        </>
      )}
    </StepContainer>
  );
};

const StyledCodeInput = styled(CpslCodeInput)`
  align-self: center;
`;

const SkipButton = styled(CpslButton)`
  margin-top: 8px;
  text-decoration: underline;
`;
