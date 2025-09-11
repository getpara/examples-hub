import { CpslCodeInput, CpslSpinner, CpslText } from '@getpara/react-components';
import { useEffect, useRef, useState } from 'react';
import { CodeChangeEventDetail, CpslCodeInputCustomEvent } from '@getpara/core-components';
import { displayPhoneNumber } from '@getpara/core-sdk';
import { AuthInfo } from '@getpara/user-management-client';
import { styled } from 'styled-components';
import { usePara } from '../../../components/ParaContext.js';
import { useSearchParams } from 'react-router-dom';
import { useCloseWindow } from '../../../hooks/useCloseWindow.js';
import { isIFramed } from '../../../utils/isIFramed.js';

type Props = {
  authInfo: AuthInfo<'email' | 'phone'>;
  onSubmit: (_: string) => void;
  onResend: () => void;
  isPending?: boolean;
  error?: Error | string | null;
};

export const VerificationCode = ({ authInfo, onResend, onSubmit, isPending, error }: Props) => {
  const inputRef = useRef<HTMLCpslCodeInputElement>(null);

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [resendDisabled, setResendDisabled] = useState(false);

  const isEmail = authInfo?.authType === 'email';

  useEffect(() => {
    // Using a small timeout here to ensure the input is mounted before attempting focus
    setTimeout(() => {
      inputRef.current?.shadowRoot?.querySelectorAll('input')?.[0]?.focus();
    }, 60);
  }, []);

  useEffect(() => {
    setCodeError(null);

    if (code.length === 6) {
      handleSubmitCode();
    }
  }, [code]);

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
      <>
        <CpslText variant="bodyL" weight="semiBold">
          Verify {isEmail ? 'Email' : 'Phone Number'}
        </CpslText>
        <InlineText variant="bodyS" color="secondary" weight="medium">
          Please enter the code we sent to{' '}
          <InlineText variant="bodyS" weight="medium">
            {authInfo?.authType === 'phone' ? displayPhoneNumber(authInfo.identifier) : authInfo!.identifier}
          </InlineText>
        </InlineText>
      </>
      <>
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
      </>
    </>
  );
};

interface OTPStepProps {
  onLogin: () => Promise<void>;
}

export const OTP = ({ onLogin }: OTPStepProps) => {
  const [searchParams] = useSearchParams();
  const para = usePara();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState();
  const closeWindow = useCloseWindow();

  useEffect(() => {
    const setup = async () => {
      try {
        await para.sendLoginCode();
      } catch (e) {
        setError(e);
      }
    };

    setup();
  }, []);

  if (!para.authInfo) {
    return null;
  }

  const resendCode = async () => {
    await para.resendVerificationCode({ type: 'LOGIN' });
  };

  const verifyAccount = async (verificationCode: string) => {
    setIsPending(true);

    try {
      const sessionId = searchParams.get('sessionId') || undefined;

      const serverAuthState = await para.ctx.client.verifyAccount(para.userId, {
        verificationCode,
        sessionLookupId: sessionId,
      });

      if (serverAuthState.stage !== 'done') {
        throw new Error('Invalid auth stage.');
      }
    } catch (e) {
      setError(e);
      setIsPending(false);
      return;
    }

    try {
      await onLogin();
    } catch (error) {
      console.error('Error:', error);
      closeWindow();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Container $isEmbedded={isIFramed}>
      <VerificationCode
        authInfo={para.authInfo as AuthInfo<'email' | 'phone'>}
        onSubmit={verifyAccount}
        onResend={resendCode}
        isPending={isPending}
        error={error}
      />
    </Container>
  );
};

const Container = styled.form<{ $isEmbedded?: boolean }>`
  flex: 1;
  padding-left: ${({ $isEmbedded }) => ($isEmbedded ? '0px' : '83px')};
  padding-right: ${({ $isEmbedded }) => ($isEmbedded ? '0px' : '83px')};
  padding-top: ${({ $isEmbedded }) => ($isEmbedded ? '0px' : '24px')};
  box-sizing: border-box;
  width: 100%;
  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: ${({ $isEmbedded }) => ($isEmbedded ? '24px' : '24px')};
`;

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
