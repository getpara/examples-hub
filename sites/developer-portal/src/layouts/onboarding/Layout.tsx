import { Outlet } from 'react-router-dom';
import { UnAuthAppBar } from '../../components/AppBar/UnAuthAppBar';
import { AuthenticatedWrapper } from '../../components/AuthenticatedWrapper/AuthenticatedWrapper';
import { UnAuthMain } from '../unauthenticated/Layout';
import { ErrorBoundary as SentryErrorBoundary } from '@sentry/react';
import { ErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary';

export const Layout = () => {
  return (
    <AuthenticatedWrapper>
      <UnAuthAppBar />
      <UnAuthMain>
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
      </UnAuthMain>
    </AuthenticatedWrapper>
  );
};
