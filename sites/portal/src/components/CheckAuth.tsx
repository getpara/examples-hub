import { PropsWithChildren, useEffect, useState } from 'react';
import { usePara } from './ParaContext';
import { useNavigateWithCurrentParams } from '../hooks/useNavigateWithCurrentParams';
import { AuthMethod, TOAuthMethod } from '@getpara/user-management-client';
import { useSearchParams } from 'react-router-dom';
import { CpslButton, CpslDivider, CpslIcon, CpslText } from '@getpara/react-components';
import { styled } from 'styled-components';
import { Card } from './common';

type BaseAdditionalAuthParams = {
  // The current session ID for the portal session
  sessionId: string;
  // The original client session ID from the client application (originally passed in as the sessionId when the portal is opened)
  clientSessionId: string;
  // The route to navigate to after login is complete
  loginCallbackRoute: string;
};

type AddCredentialParams = {
  addNewCredentialPasskeyId?: string | undefined;
  addNewCredentialPasswordId?: string | undefined;
  isForNewDevice?: string;
};

type AdditionalAuthParams = BaseAdditionalAuthParams & AddCredentialParams;

type CheckAuthType = 'ADD_CREDENTIAL';

type CheckAuthProps = { type: CheckAuthType } & PropsWithChildren;

export const CheckAuth = ({ type, children }: CheckAuthProps) => {
  const para = usePara();
  const navigate = useNavigateWithCurrentParams();
  const [isSetup, setIsSetup] = useState(false);
  const [error, setError] = useState<string>();
  const [searchParams] = useSearchParams();
  const [additionalAuthParams, setAdditionalAuthParams] = useState<AdditionalAuthParams>({} as AdditionalAuthParams);
  const [authMethods, setAuthMethods] = useState<Set<AuthMethod>>();

  const clientSessionId = searchParams.get('clientSessionId') || searchParams.get('sessionId');

  useEffect(() => {
    const setup = async () => {
      setError(undefined);
      setAuthMethods(undefined);
      const supportedAuthMethods = await para.supportedUserAuthMethods();
      const { isAuthenticated, userId } = await para.touchSession();
      if (!isAuthenticated) {
        // If not authed, regenerate the portal session here
        const { sessionLookupId } = await para.touchSession(true);
        let additionalParams: AdditionalAuthParams;

        switch (type) {
          case 'ADD_CREDENTIAL':
            additionalParams = {
              sessionId: sessionLookupId,
              clientSessionId,
              loginCallbackRoute: '/auth/add-new-credential',
              isForNewDevice: 'true',
              addNewCredentialPasskeyId: searchParams.get('addNewCredentialPasskeyId') || undefined,
              addNewCredentialPasswordId: searchParams.get('addNewCredentialPasswordId') || undefined,
            };
            break;
          default:
            throw new Error(`Unhandled type: ${type}`);
        }

        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
          setError('Invalid URL, please close the window and try again.');
          throw new Error('No sessionId found in URL parameters');
        }

        // If the user is a basic login user we need to go through the auth flow
        if (supportedAuthMethods.has(AuthMethod.BASIC_LOGIN)) {
          const { loginMethod } = await para.ctx.client.sessionLoginMethod(sessionId);

          // Due to how we handle sessions on login, we may not have a loginMethod set in some cases, handle that here
          if (!loginMethod) {
            switch (para.authInfo.authType) {
              case 'email':
              case 'phone': {
                navigate('/auth/otp', additionalParams);
              }
              case 'telegram':
                navigate('/auth/telegram/verify', additionalParams);
                break;
              case 'farcaster':
                navigate('/auth/farcaster', additionalParams);
                break;
              default:
                setError('Your authentication method is not supported for this flow.');
                throw new Error(`${para.authInfo.authType} not supported`);
            }
            return;
          }

          switch (loginMethod) {
            case 'EMAIL':
            case 'PHONE':
              navigate('/auth/otp', additionalParams);
              break;
            case 'TELEGRAM':
              navigate('/auth/telegram/verify', additionalParams);
              break;
            case 'FARCASTER':
              navigate('/auth/farcaster', additionalParams);
              break;
            // Will handle this case in a later update
            case 'EXTERNAL_WALLET':
              setError('Your authentication method is not supported for this flow.');
              throw new Error(`${loginMethod} not supported`);
            // All other login methods will be handled via oAuth
            default:
              const oAuthUrl = await para.getOAuthUrl({
                method: loginMethod as Exclude<TOAuthMethod, 'TELEGRAM' | 'FARCASTER'>,
                sessionLookupId,
                portalCallbackParams: additionalParams,
              });
              if (oAuthUrl) {
                window.location.href = oAuthUrl;
              }
              break;
          }

          return;
        }

        // If we have only one supported auth method, navigate directly to that auth method
        if (supportedAuthMethods.size === 1) {
          switch (supportedAuthMethods.values().next().value) {
            case AuthMethod.PASSKEY:
              navigate('/web/biometrics/login', additionalAuthParams);
              break;
            case AuthMethod.PIN:
              navigate('/web/pin/login', additionalAuthParams);
              break;
            case AuthMethod.PASSWORD:
              navigate('/web/passwords/login', additionalAuthParams);
              break;
          }
        } else {
          setAdditionalAuthParams(additionalParams);
          setAuthMethods(supportedAuthMethods);
        }

        return;
      }

      const { userId: clientUserId } = await para.ctx.client.sessionAuth(clientSessionId);

      // We need to ensure the user that's authenticated here matched the user from the client session
      if (userId !== clientUserId) {
        setError(
          "The selected user doesn't match the user that's currently logged in, please close the window and try again.",
        );
        throw new Error('User ID mismatch between portal and client session');
      }

      setIsSetup(true);
    };

    setup();
  }, [para]);

  const handlePasskeyLogin = () => {
    navigate('/web/biometrics/login', additionalAuthParams);
  };

  const handlePasswordLogin = () => {
    navigate('/web/passwords/login', additionalAuthParams);
  };

  const handlePINLogin = () => {
    navigate('/web/pin/login', additionalAuthParams);
  };

  if (authMethods || error) {
    return (
      <StyledCard>
        <Container>
          <InnerContainer>
            <Header>
              <CpslText variant="bodyL" weight="semiBold">
                Verify your account
              </CpslText>
            </Header>
            {authMethods.has(AuthMethod.PASSKEY) && (
              <>
                <CpslButton fullWidth onClick={handlePasskeyLogin}>
                  <CpslIcon slot="start" icon="key" />
                  Verify with passkey
                </CpslButton>
                {authMethods.has(AuthMethod.PIN) || authMethods.has(AuthMethod.PASSWORD) ? (
                  <CpslDivider>or</CpslDivider>
                ) : null}
              </>
            )}
            {authMethods.has(AuthMethod.PIN) && (
              <>
                <CpslButton fullWidth onClick={handlePINLogin}>
                  <CpslIcon slot="start" icon="passcode" />
                  Verify with PIN
                </CpslButton>
                {authMethods.has(AuthMethod.PASSWORD) ? <CpslDivider>or</CpslDivider> : null}
              </>
            )}
            {authMethods.has(AuthMethod.PASSWORD) && (
              <CpslButton fullWidth onClick={handlePasswordLogin}>
                <CpslIcon slot="start" icon="passcode" />
                Verify with password
              </CpslButton>
            )}
          </InnerContainer>
          <Text color="error">{error}</Text>
        </Container>
      </StyledCard>
    );
  }

  if (!isSetup) {
    return null;
  }

  return <>{children}</>;
};

const StyledCard = styled(Card)`
  &::part(card-container) {
    padding-top: 0px;
  }
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  padding: 16px;
`;

const InnerContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  max-width: 300px;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  margin-bottom: 16px;
`;

const Text = styled(CpslText)`
  text-align: center;
`;
