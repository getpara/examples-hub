import { Outlet } from 'react-router-dom';
import { AuthenticatedWrapper } from '../../components/AuthenticatedWrapper/AuthenticatedWrapper';
import { ErrorBoundary as SentryErrorBoundary } from '@sentry/react';
import { ErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary';
import { SidebarProvider } from '@getpara/react-component-library';
import { AppSidebar } from './components/AppSidebar';
import { AuthAppBar } from '../../components/AppBar/AuthAppBar/AuthAppBar';

export const Layout = () => {
  return (
    <AuthenticatedWrapper requireOrgs>
      <AuthAppBar />
      <SidebarProvider className="para:h-[calc(100svh-57px)] para:min-h-0">
        <SentryErrorBoundary
          fallback={({ error, resetError }) => (
            <ErrorBoundary
              onResetError={resetError}
              variant="error"
              containerType="authenticated"
              errorMessage={(error as Error)?.message}
            />
          )}
        >
          <AppSidebar />
          <main className="para:md:p-6 para:overflow-auto para:flex-1">
            <SentryErrorBoundary
              fallback={({ error, resetError }) => (
                <ErrorBoundary
                  onResetError={resetError}
                  variant="error"
                  errorWithNav
                  containerType="authenticated"
                  errorMessage={(error as Error)?.message}
                />
              )}
            >
              <Outlet />
            </SentryErrorBoundary>
          </main>
        </SentryErrorBoundary>
      </SidebarProvider>
    </AuthenticatedWrapper>
  );
};
