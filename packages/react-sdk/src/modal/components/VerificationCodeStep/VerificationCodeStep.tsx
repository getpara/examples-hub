import { CpslCodeInput } from '@usecapsule/react-components';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { ModalStep } from '../../utils/steps.js';
import {
  CodeChangeEventDetail,
  CpslCodeInputCustomEvent,
} from '@usecapsule/core-components';
import {
  useCapsuleStore,
  useModalStore,
  useUserInfoStore,
} from '../../stores/index.js';
import {
  ClickableText,
  Heading,
  Hero,
  Text,
  SecondaryText,
  MainContainer,
} from '../common.js';

export const VerificationCodeStep = () => {
  const email = useUserInfoStore((state) => state.email);
  const setStep = useModalStore((state) => state.setStep);
  const setWebAuthURLForCreate = useModalStore(
    (state) => state.setWebAuthURLForCreate,
  );
  const capsule = useCapsuleStore((state) => state.capsule);

  const inputRef = useRef<HTMLCpslCodeInputElement>(null);

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [resendStatus, setResendStatus] = useState('Resend.');
  const [resendDisabled, setResendDisabled] = useState(false);

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
      await capsule.resendVerificationCode();

      setTimeout(() => {
        setResendStatus('Resend.');
        setResendDisabled(false);
      }, 3000);
    }
  };

  const handleCodeInput = (
    e: CpslCodeInputCustomEvent<CodeChangeEventDetail>,
  ) => {
    if (codeError) {
      setCodeError('');
    }
    setCode(e.detail.value);
  };

  const handleSubmitCode = async () => {
    if (code.length === 6 && /^\d+$/.test(code)) {
      try {
        const url = await capsule.verifyEmail(code);
        setWebAuthURLForCreate(url);
        setStep(ModalStep.BIOMETRIC_CREATION);
      } catch (e) {
        if (e.message.includes('429')) {
          setCodeError(
            'Too many incorrect attempts. Please try again in 10 minutes.',
          );
        } else {
          setCodeError('Incorrect code.');
        }
      }
    } else {
      setCodeError('Incorrect code.');
    }
  };

  return (
    <>
      <Hero icon="heroEmail" />
      <StyledMainContainer>
        <Heading>
          <span>Verify Email</span>
        </Heading>
        <SecondaryText>
          <span>
            Please enter the code we sent to{'\n'}
            <Text>
              <span>{email}</span>
            </Text>
          </span>
        </SecondaryText>
      </StyledMainContainer>
      <StyledCodeInput
        ref={inputRef}
        length={6}
        type="number"
        code={code}
        onCpslInput={handleCodeInput}
        errorText={codeError}
      />
      <SecondaryText>
        <span>
          Didn’t receive a code?{' '}
          <Text>
            <ClickableText
              style={{ cursor: resendDisabled ? 'default' : 'pointer' }}
              onClick={handleResendClick}
            >
              {resendStatus}
            </ClickableText>
          </Text>
        </span>
      </SecondaryText>
    </>
  );
};

const StyledCodeInput = styled(CpslCodeInput)`
  align-self: center;
`;

const StyledMainContainer = styled(MainContainer)`
  padding-bottom: 8px;
`;
