import { Outlet } from 'react-router-dom';
import { UNAUTH_APP_BAR_HEIGHT, UnAuthAppBar } from '../../components/AppBar/UnAuthAppBar';
import { AuthenticatedWrapper } from '../../components/AuthenticatedWrapper/AuthenticatedWrapper';
import { ErrorBoundary as SentryErrorBoundary } from '@sentry/react';
import { ErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary';
import { styled } from 'styled-components';

export const Layout = () => {
  return (
    <AuthenticatedWrapper>
      <UnAuthAppBar />
      <OnboardingMain>
        <SentryErrorBoundary
          fallback={({ error, resetError }) => (
            <ErrorBoundary
              onResetError={resetError}
              variant="error"
              containerType="unauthenticated"
              errorMessage={(error as Error)?.message}
            />
          )}
        >
          <Outlet />
        </SentryErrorBoundary>
      </OnboardingMain>
    </AuthenticatedWrapper>
  );
};

export const OnboardingMain = styled.main`
  overflow: auto;

  display: flex;
  justify-content: center;
  background-color: var(--cpsl-color-background-0);
  min-height: calc(100vh - ${UNAUTH_APP_BAR_HEIGHT}px);
  box-sizing: border-box;
  padding: 34px 24px 24px 24px;
`;
