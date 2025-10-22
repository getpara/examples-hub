import { Outlet } from 'react-router-dom';
import { AuthMinAppBar } from '../../components/AppBar/AuthMinAppBar';
import { ErrorBoundary as SentryErrorBoundary } from '@sentry/react';
import { ErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary';
import { AuthenticatedWrapper } from '../../components/AuthenticatedWrapper/AuthenticatedWrapper';

export const Layout = () => {
  return (
    <AuthenticatedWrapper flow="INVITE">
      <AuthMinAppBar />
      <main className="para:flex para:justify-center para:box-border para:overflow-auto para:px-6 para:pb-6 para:pt-10">
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
      </main>
    </AuthenticatedWrapper>
  );
};
