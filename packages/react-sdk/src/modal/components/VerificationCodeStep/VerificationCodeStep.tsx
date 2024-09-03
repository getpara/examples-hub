import { CpslCodeInput, CpslSpinner, CpslText } from '@usecapsule/react-components';
import { useEffect, useRef, useState } from 'react';
import { styled } from 'styled-components';
import { ModalStep } from '../../utils/steps.js';
import { CodeChangeEventDetail, CpslCodeInputCustomEvent } from '@usecapsule/core-components';
import { useCapsuleStore, useModalStore, useUserInfoStore } from '../../stores/index.js';
import { Heading, InnerStepContainer, StepContainer } from '../common.js';

export const VerificationCodeStep = () => {
  const identifierType = useUserInfoStore(state => state.identifierType);
  const username = useUserInfoStore(state => state.getUsername());
  const setStep = useModalStore(state => state.setStep);
  const setWebAuthURLForCreate = useModalStore(state => state.setWebAuthURLForCreate);
  const capsule = useCapsuleStore(state => state.capsule);

  const inputRef = useRef<HTMLCpslCodeInputElement>(null);

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [resendStatus, setResendStatus] = useState('Resend.');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const isEmail = identifierType === 'email';

  useEffect(() => {
    // Using a small timeout here to ensure the input is mounted before attempting focus
    setTimeout(() => {
      inputRef.current.shadowRoot.querySelectorAll('input')?.[0]?.focus();
    }, 10);
  }, []);

  useEffect(() => {
    if (code.length === 6) {
      handleSubmitCode();
    }
  }, [code]);

  const handleResendClick = async () => {
    if (!resendDisabled) {
      setResendStatus('Resent!');
      setResendDisabled(true);
      isEmail ? await capsule.resendVerificationCode() : await capsule.resendVerificationCodeByPhone();

      setTimeout(() => {
        setResendStatus('Resend.');
        setResendDisabled(false);
      }, 3000);
    }
  };

  const handleCodeInput = (e: CpslCodeInputCustomEvent<CodeChangeEventDetail>) => {
    if (codeError) {
      setCodeError('');
    }
    setCode(e.detail.value.trim());
  };

  const handleSubmitCode = async () => {
    setIsVerifying(true);
    if (code.length === 6 && /^\d+$/.test(code)) {
      try {
        const url = isEmail ? await capsule.verifyEmail(code) : await capsule.verifyPhone(code);
        setWebAuthURLForCreate(url);
        setStep(ModalStep.BIOMETRIC_CREATION);
      } catch (e) {
        if (e.message.includes('429')) {
          setCodeError('Too many incorrect attempts. Please try again in 10 minutes.');
        } else {
          setCodeError('Incorrect code.');
        }
      }
    } else {
      setCodeError('Incorrect code.');
    }
    setIsVerifying(false);
  };

  return (
    <StepContainer $wide>
      <InnerStepContainer>
        <Heading variant="headingS" weight="bold">
          Verify {isEmail ? 'Email' : 'Phone Number'}
        </Heading>
        <InlineText variant="bodyS" color="secondary">
          Please enter the code we sent to <InlineText variant="bodyS">{username}</InlineText>
        </InlineText>
      </InnerStepContainer>
      <InnerStepContainer>
        {isVerifying ? (
          <CpslSpinner />
        ) : (
          <>
            <form
              onSubmit={async e => {
                e.preventDefault();
                await handleSubmitCode();
              }}
            >
              <StyledCodeInput
                ref={inputRef}
                length={6}
                type="number"
                code={code}
                onCpslInput={handleCodeInput}
                errorText={codeError}
                onKeyDown={async e => e.key === 'Enter' && (await handleSubmitCode())}
              />
            </form>
            <InlineText variant="bodyS" color="secondary">
              Didn’t receive a code?{' '}
              <ClickableText
                variant="bodyS"
                style={{ cursor: resendDisabled ? 'default' : 'pointer' }}
                onClick={handleResendClick}
              >
                {resendStatus}
              </ClickableText>
            </InlineText>
          </>
        )}
      </InnerStepContainer>
    </StepContainer>
  );
};

const StyledCodeInput = styled(CpslCodeInput)`
  align-self: center;
`;

const InlineText = styled(CpslText)`
  text-align: center;
  display: inline-block;
`;

const ClickableText = styled(InlineText)`
  cursor: pointer;
  display: inline-block;
`;
