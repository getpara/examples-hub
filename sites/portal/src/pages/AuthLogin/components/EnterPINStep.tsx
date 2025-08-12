import { styled } from 'styled-components';
import { CpslButton, CpslCodeInput, CpslIcon, CpslText } from '@getpara/react-components';
import { useEffect, useRef, useState } from 'react';
import { usePara } from '../../../components/ParaContext';
import { CodeChangeEventDetail, CpslCodeInputCustomEvent } from '@getpara/core-components';
import { UserIdentifier } from '@getpara/react-common';
import { useLogin } from './LoginProvider';
import { AuthLoginStep } from '../../../constants';
import { ModalLoading } from '../../../components';

interface EnterPasswordStepProps {
  error: string | undefined;
  onLoginClick: (password: string, isPIN?: boolean) => void;
  isEmbedded?: boolean;
  setStep: (step: AuthLoginStep) => void;
}

export const EnterPINStep = ({ error, onLoginClick, isEmbedded, setStep }: EnterPasswordStepProps) => {
  const inputRef = useRef<HTMLCpslCodeInputElement>(null);

  const { params } = useLogin();
  const para = usePara();
  const [pin, setPin] = useState<string>('');
  const authInfo = para.authInfo;

  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingAuthVerified, setIsLoadingAuthVerified] = useState(true);

  useEffect(() => {
    const loadAuthVerified = async () => {
      setIsLoadingAuthVerified(true);
      const { authVerified } = await para.ctx.client.sessionAuthVerified(params.sessionId!);

      if (!authVerified) {
        setStep(AuthLoginStep.AUTH_VERIFICATION);
      }

      setIsLoadingAuthVerified(false);
    };

    loadAuthVerified();
  }, [authInfo]);

  useEffect(() => {
    // Using a small timeout here to ensure the input is mounted before attempting focus
    setTimeout(() => {
      inputRef.current?.shadowRoot?.querySelectorAll('input')?.[0]?.focus();
    }, 60);
  }, []);

  const handlePINInput = (e: CpslCodeInputCustomEvent<CodeChangeEventDetail>) => {
    setPin(e.detail.value.trim());
  };

  const onSubmit = async () => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);
    try {
      await onLoginClick(pin, true);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!!error) {
      setPin('');
    }
  }, [error]);

  if (isLoadingAuthVerified) {
    return <ModalLoading noText />;
  }

  return (
    <Container
      $isEmbedded={isEmbedded}
      onSubmit={e => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <CpslText variant="bodyL" weight="semiBold">
        {isEmbedded ? 'Welcome back,' : 'Enter Pin'}
      </CpslText>
      <UserIdentifier authInfo={authInfo} />
      <ButtonContainer>
        <InputContainer>
          <CpslText variant="bodyS" color="secondary" weight="medium">
            Enter your PIN
          </CpslText>
          <StyledCodeInput
            ref={inputRef}
            length={4}
            type="number"
            code={pin}
            onCpslInput={handlePINInput}
            onKeyDown={async e => e.key === 'Enter' && (await onSubmit())}
          />
          {error && (
            <ErrorContainer>
              <ErrorIcon icon="alertCircle" />
              <CpslText variant="bodyXS" color="error">
                {error}
              </CpslText>
            </ErrorContainer>
          )}
        </InputContainer>
        <CpslButton fullWidth disabled={isProcessing || pin === ''} onClick={onSubmit}>
          {isEmbedded ? 'Login' : 'Continue'}
        </CpslButton>
      </ButtonContainer>
    </Container>
  );
};

const StyledCodeInput = styled(CpslCodeInput)`
  align-self: center;
`;

const ErrorContainer = styled.div`
  width: 100%;
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  padding-top: 16px;
`;

const ErrorIcon = styled(CpslIcon)`
  --height: 16px;
  --width: 16px;
  --icon-color: var(--cpsl-color-text-error);
`;

const Container = styled.form<{ $isEmbedded?: boolean }>`
  flex: 1;
  padding-left: ${({ $isEmbedded }) => ($isEmbedded ? '0px' : '83px')};
  padding-right: ${({ $isEmbedded }) => ($isEmbedded ? '0px' : '83px')};
  padding-top: ${({ $isEmbedded }) => ($isEmbedded ? '0px' : '24px')};
  box-sizing: border-box;
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: ${({ $isEmbedded }) => ($isEmbedded ? '8px' : '24px')};
`;
