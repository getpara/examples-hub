import { CpslCodeInput, CpslSpinner, CpslText } from '@getpara/react-components';
import { useEffect, useRef, useState } from 'react';
import { styled } from 'styled-components';
import { ModalStep } from '../../utils/steps.js';
import { CodeChangeEventDetail, CpslCodeInputCustomEvent } from '@getpara/core-components';
import { useModalStore, useThemeStore, useUserInfoStore } from '../../stores/index.js';
import { Heading, InnerStepContainer, StepContainer } from '../common.js';
import { AuthMethod } from '@getpara/core-sdk';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';

export const VerificationCodeStep = () => {
  const theme = useThemeStore(state => state.theme);
  const authInfo = useUserInfoStore(state => state.getAuthInfo());
  const setStep = useModalStore(state => state.setStep);
  const setWebAuthURLForCreate = useModalStore(state => state.setWebAuthURLForCreate);
  const setIFrameUrl = useModalStore(state => state.setIFrameUrl);
  const setIsIFrameReady = useModalStore(state => state.setIsIFrameReady);
  const isIFrameReady = useModalStore(state => state.isIFrameReady);
  const para = useInternalClient();

  const inputRef = useRef<HTMLCpslCodeInputElement>(null);

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [resendStatus, setResendStatus] = useState('Resend.');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [shouldRouteToStep, setShouldRouteToStep] = useState<ModalStep>();

  const isEmail = authInfo?.authType === 'email';

  useEffect(() => {
    // Using a small timeout here to ensure the input is mounted before attempting focus
    setTimeout(() => {
      inputRef.current.shadowRoot.querySelectorAll('input')?.[0]?.focus();
    }, 10);
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

  useEffect(() => {
    if (code.length === 6) {
      handleSubmitCode();
    }
  }, [code]);

  const handleResendClick = async () => {
    if (!resendDisabled) {
      setResendStatus('Resent!');
      setResendDisabled(true);
      isEmail ? await para.resendVerificationCode() : await para.resendVerificationCodeByPhone();

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
        const supportedCreateAuthMethods = await para.getSupportedCreateAuthMethods();

        if (supportedCreateAuthMethods.has(AuthMethod.PASSWORD) && supportedCreateAuthMethods.has(AuthMethod.PASSKEY)) {
          setIsIFrameReady(false);
          const webAuthUrl = isEmail
            ? await para.verifyEmail({ verificationCode: code })
            : await para.verifyPhone({ verificationCode: code });
          const passwordAuthUrl = await para.getSetupPasswordURL({ authType: authInfo?.authType, theme });
          setWebAuthURLForCreate(await para.shortenLoginLink(webAuthUrl));
          setIFrameUrl(await para.shortenLoginLink(passwordAuthUrl));
          setShouldRouteToStep(ModalStep.BIOMETRIC_CREATION);
          return;
        } else if ((await para.getSupportedCreateAuthMethods()).has(AuthMethod.PASSWORD)) {
          setIsIFrameReady(false);
          isEmail ? await para.verifyEmail({ verificationCode: code }) : await para.verifyPhone({ verificationCode: code });
          const url = await para.getSetupPasswordURL({ authType: authInfo?.authType, theme });
          setIFrameUrl(await para.shortenLoginLink(url));
          setShouldRouteToStep(ModalStep.PASSWORD_CREATION);
          return;
        } else {
          const url = isEmail
            ? await para.verifyEmail({ verificationCode: code })
            : await para.verifyPhone({ verificationCode: code });
          setWebAuthURLForCreate(await para.shortenLoginLink(url));
          setStep(ModalStep.BIOMETRIC_CREATION);
        }
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
          Please enter the code we sent to <InlineText variant="bodyS">{authInfo!.identifier}</InlineText>
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
