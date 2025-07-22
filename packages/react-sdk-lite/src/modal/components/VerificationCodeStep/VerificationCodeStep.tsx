import { CpslCodeInput, CpslSpinner, CpslText } from '@getpara/react-components';
import { useEffect, useRef, useState } from 'react';
import { safeStyled } from '@getpara/react-common';
import { CodeChangeEventDetail, CpslCodeInputCustomEvent } from '@getpara/core-components';
import { Heading, InnerStepContainer, StepContainer } from '../common.js';
import { displayPhoneNumber } from '@getpara/core-sdk';
import { useAuthActions } from '../../../provider/providers/AuthProvider.js';
import { useResendVerificationCode } from '../../../provider/index.js';
import { AuthInfo } from '@getpara/user-management-client';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';
import { MutationStatus } from '@tanstack/react-query';

type Props = {
  authInfo: AuthInfo<'email' | 'phone'>;
  onSubmit: (_: string) => void;
  onResend: () => void;
  status: MutationStatus;
  error?: Error | string | null;
};

export const VerificationCode = ({ authInfo, onResend, onSubmit, status, error }: Props) => {
  const inputRef = useRef<HTMLCpslCodeInputElement>(null);

  const [code, setCode] = useState('');
  const [isPending, setIsPending] = useState(status === 'pending');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [resendDisabled, setResendDisabled] = useState(false);

  const isEmail = authInfo?.authType === 'email';

  useEffect(() => {
    // Using a small timeout here to ensure the input is mounted before attempting focus
    setTimeout(() => {
      inputRef.current?.shadowRoot?.querySelectorAll('input')?.[0]?.focus();
    }, 10);
  }, []);

  useEffect(() => {
    setCodeError(null);

    if (code.length === 6) {
      handleSubmitCode();
    }
  }, [code]);

  useEffect(() => {
    if (status === 'pending') {
      setIsPending(true);
    }
  }, [status]);

  const handleResendClick = async () => {
    if (!resendDisabled) {
      setResendDisabled(true);

      try {
        onResend();
      } finally {
        setTimeout(() => {
          setResendDisabled(false);
        }, 3000);
      }
    }
  };

  const handleCodeInput = (e: CpslCodeInputCustomEvent<CodeChangeEventDetail>) => {
    setCode(e.detail.value.trim());
  };

  const handleSubmitCode = async () => {
    if (code.length === 6 && /^\d+$/.test(code)) {
      onSubmit(code);
    } else {
      setCodeError('Incorrect code.');
    }
  };

  useEffect(() => {
    if (!!error) {
      setIsPending(false);
      const status = (error as unknown as { status: number }).status;

      switch (status) {
        case 429:
          setCodeError('Too many incorrect attempts. Please try again in 10 minutes.');
          break;
        default:
          setCodeError('Incorrect code.');
          break;
      }
    }
  }, [error]);

  return (
    <>
      <InnerStepContainer>
        <Heading variant="headingS" weight="bold">
          Verify {isEmail ? 'Email' : 'Phone Number'}
        </Heading>
        <InlineText variant="bodyS" color="secondary">
          Please enter the code we sent to{' '}
          <InlineText variant="bodyS">
            {authInfo?.authType === 'phone' ? displayPhoneNumber(authInfo.identifier) : authInfo!.identifier}
          </InlineText>
        </InlineText>
      </InnerStepContainer>
      <InnerStepContainer>
        {isPending ? (
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
                errorText={codeError || ''}
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
                {resendDisabled ? 'Resent!' : 'Resend.'}
              </ClickableText>
            </InlineText>
          </>
        )}
      </InnerStepContainer>
    </>
  );
};

export const VerificationCodeStep = () => {
  const { verifyNewAccount, verifyNewAccountStatus, verifyNewAccountError } = useAuthActions();
  const { resendVerificationCodeAsync } = useResendVerificationCode();

  const para = useInternalClient();

  if (!para.authInfo) {
    return null;
  }

  return (
    <StepContainer $wide>
      <VerificationCode
        authInfo={para.authInfo as AuthInfo<'email' | 'phone'>}
        onSubmit={verifyNewAccount}
        onResend={() => {
          resendVerificationCodeAsync({ type: 'SIGNUP' });
        }}
        status={verifyNewAccountStatus}
        error={verifyNewAccountError}
      />
    </StepContainer>
  );
};

const StyledCodeInput = safeStyled(CpslCodeInput)`
  align-self: center;
`;

const InlineText = safeStyled(CpslText)`
  text-align: center;
  display: inline-block;
`;

const ClickableText = safeStyled(InlineText)`
  cursor: pointer;
  display: inline-block;
`;
