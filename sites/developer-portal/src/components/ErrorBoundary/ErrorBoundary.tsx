import { CpslAlert, CpslButton, CpslCard, CpslText } from '@usecapsule/react-components';
import styled from 'styled-components';
import { AUTH_APP_BAR_HEIGHT } from '../../components/AppBar/AuthAppBar';
import { CenteredText, ClickableText } from '../../components/common';
import { useLocation, useNavigate, useRouteError } from 'react-router-dom';
import { SUPPORT_URL } from '../../utils/constants';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useLogout } from '../../hooks/useLogout';
import { useEffect, useRef } from 'react';
import { captureException } from '@sentry/react';

interface ErrorBoundaryProps {
  containerType: 'authenticated' | 'unauthenticated' | 'fullScreen';
  variant: 'notFound' | 'error';
  errorWithNav?: boolean;
  captureSentryError?: boolean;
  errorMessage?: string;
  onResetError?: () => void;
}

export const ErrorBoundary = ({
  containerType,
  variant,
  errorWithNav,
  captureSentryError,
  errorMessage,
  onResetError,
}: ErrorBoundaryProps) => {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useLogout();
  const error = useRouteError() as Error;
  const errorLocation = useRef(pathname);

  useEffect(() => {
    if (pathname !== errorLocation.current) {
      onResetError?.();
    }
  }, [pathname]);

  useEffect(() => {
    if (captureSentryError) {
      captureException(error);
    }
  }, [captureSentryError, error]);

  const isError = variant === 'error';

  const handleRecoverClick = async () => {
    if (!isError || errorWithNav) {
      navigate('/', { replace: true });
      return;
    }

    try {
      await logout();
    } catch (e) {
      localStorage.clear();
      sessionStorage.clear();
      navigate('/', { replace: true });
    }
  };

  return (
    <Container
      $paddingOffset={
        containerType === 'fullScreen' ? -AUTH_APP_BAR_HEIGHT : containerType === 'authenticated' ? 32 : isMobile ? 0 : 24
      }
    >
      <InnerContainer>
        <div>
          <StyledAlert filled noIcon>
            <CpslText variant="headingXL" weight="medium">
              {isError ? 'Error' : '404'}
            </CpslText>
          </StyledAlert>
        </div>
        <SmallGapContainer>
          <CenteredText variant="headingS" weight="medium">
            {isError ? 'Something went wrong' : 'Looks like something is missing'}
          </CenteredText>
          {isError ? (
            <>{(errorMessage || error?.message) && <CpslCard>Error: {errorMessage ?? error.message}</CpslCard>}</>
          ) : (
            <CenteredText variant="bodyL" weight="medium" color="secondary">
              The page you are looking for doesn’t exist or another error occurred.
            </CenteredText>
          )}
        </SmallGapContainer>
        <SmallGapContainer>
          <CpslButton onClick={handleRecoverClick}>
            {!isError || errorWithNav ? 'Back To Home' : 'Log Out and Try Again'}
          </CpslButton>
          <CpslButton variant="ghost" as="a" href={SUPPORT_URL}>
            <ClickableText color="secondary">Support</ClickableText>
          </CpslButton>
        </SmallGapContainer>
      </InnerContainer>
    </Container>
  );
};

const Container = styled.div<{ $paddingOffset: number }>`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;

  min-height: calc(100vh - ${AUTH_APP_BAR_HEIGHT}px - ${({ $paddingOffset }) => $paddingOffset}px);
`;

const StyledAlert = styled(CpslAlert)`
  --container-padding-top: 24px;
  --container-padding-bottom: 24px;
  --container-padding-start: 40px;
  --container-padding-end: 40px;
`;

const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 24px;
`;

const SmallGapContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
`;
