import { styled } from 'styled-components';
import { Text, Link } from '../../../components/common';
import { CpslButton, CpslIcon, CpslInput, CpslText } from '@getpara/react-components';
import { useEffect, useRef, useState } from 'react';
import { usePara } from '../../../components/ParaContext';
import { CpslInputCustomEvent, InputInputEventDetail } from '@getpara/core-components';
import { UserIdentifier } from '@getpara/react-common';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AuthMethod } from '@getpara/user-management-client';
import { ModalLoading } from '../../../components';
import { supportedLoginAuthMethods } from '../../../utils/supportedLoginAuthMethods';

interface EnterPasswordStepProps {
  error: string | undefined;
  onLoginClick: (password: string) => void;
  isEmbedded?: boolean;
}

export const EnterPasswordStep = ({ error, onLoginClick, isEmbedded }: EnterPasswordStepProps) => {
  const inputRef = useRef<HTMLCpslInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const isV1 = !params.version || params.version === 'v1';

  const para = usePara();
  const [recoveryUrl, setRecoveryUrl] = useState<string | undefined>();
  const [password, setPassword] = useState<string>('');
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [isLoadingAuthMethods, setIsLoadingAuthMethods] = useState<boolean>(isV1);

  const authInfo = para.authInfo;

  const [isProcessing, setIsProcessing] = useState(false);

  const handlePasswordInput = (ev: CpslInputCustomEvent<InputInputEventDetail>) => {
    setPassword(ev.detail.value);
  };

  const getPortalUrl = async () => {
    setRecoveryUrl(await para?.getPortalURL());
  };

  const onSubmit = async () => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);
    try {
      await onLoginClick(password);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const loadAuthMethods = async () => {
      if (authInfo.auth) {
        setIsLoadingAuthMethods(true);
        const supportedAuthMethods = await supportedLoginAuthMethods(para);
        if (supportedAuthMethods.has(AuthMethod.PIN) && !supportedAuthMethods.has(AuthMethod.PASSWORD)) {
          navigate(`/web/pin/login${location.search}`, { replace: true });
        }
        setIsLoadingAuthMethods(false);
      }
    };

    if (isV1) {
      loadAuthMethods();
    }
  }, [isV1, authInfo.auth]);

  useEffect(() => {
    getPortalUrl();
  }, [para]);

  useEffect(() => {
    if (!!error) {
      setPassword('');
    }
  }, [error]);

  useEffect(() => {
    // Using a small timeout here to ensure the input is mounted before attempting focus
    setTimeout(() => {
      inputRef.current?.shadowRoot?.querySelectorAll('input')?.[0]?.focus();
    }, 60);
  }, [isLoadingAuthMethods]);

  if (isLoadingAuthMethods) {
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
        {isEmbedded ? 'Welcome back,' : 'Login'}
      </CpslText>
      <UserIdentifier authInfo={authInfo} />
      <ButtonContainer>
        <CpslInput
          placeholder="Enter password"
          type={passwordVisible ? 'text' : 'password'}
          onCpslInput={handlePasswordInput}
          onKeyDown={async e => e.key === 'Enter' && onSubmit()}
          value={password}
          style={{ width: '100%', paddingTop: isEmbedded ? '24px' : '0px' }}
          ref={inputRef}
        >
          <ClickableIcon
            onClick={() => setPasswordVisible(!passwordVisible)}
            slot="end"
            icon={passwordVisible ? 'eye' : 'eyeOff'}
          />
        </CpslInput>
        {error && (
          <ErrorContainer>
            <ErrorIcon icon="alertCircle" />
            <CpslText variant="bodyXS" color="error" style={{ width: '100%' }}>
              {error}
            </CpslText>
          </ErrorContainer>
        )}
        <CpslButton fullWidth disabled={isProcessing || password === ''} onClick={onSubmit}>
          {isEmbedded ? 'Login' : 'Continue'}
        </CpslButton>
        <Link href={recoveryUrl} target={isEmbedded ? '_blank' : undefined}>
          <LinkText>{isEmbedded ? 'I’m having trouble logging in' : 'I’m having trouble logging into my wallet'}</LinkText>
        </Link>
      </ButtonContainer>
    </Container>
  );
};

const LinkText = styled(Text)`
  font-size: 14px;
`;

const ErrorContainer = styled.div`
  width: 100%;
  display: flex;
  gap: 4px;
  align-items: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const ErrorIcon = styled(CpslIcon)`
  --height: 16px;
  --width: 16px;
  --icon-color: var(--cpsl-color-text-error);
`;

const ClickableIcon = styled(CpslIcon)`
  cursor: pointer;
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
  gap: ${({ $isEmbedded }) => ($isEmbedded ? '4px' : '24px')};
`;
