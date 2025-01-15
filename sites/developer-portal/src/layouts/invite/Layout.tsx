import { Outlet } from 'react-router-dom';
import { AuthMinAppBar } from '../../components/AppBar/AuthMinAppBar';
import { ErrorBoundary as SentryErrorBoundary } from '@sentry/react';
import { ErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary';
import { AuthenticatedWrapper } from '../../components/AuthenticatedWrapper/AuthenticatedWrapper';
import { styled } from 'styled-components';

export const Layout = () => {
  return (
    <AuthenticatedWrapper>
      <AuthMinAppBar />
      <InviteMain>
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
      </InviteMain>
    </AuthenticatedWrapper>
  );
};

const InviteMain = styled.main`
  overflow: auto;

  display: flex;
  justify-content: center;
  background-color: var(--cpsl-color-background-0);
  box-sizing: border-box;
  padding: 40px 24px 24px 24px;
`;
