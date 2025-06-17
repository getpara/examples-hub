import { Outlet } from 'react-router-dom';
import { AuthenticatedWrapper } from '../../components/AuthenticatedWrapper/AuthenticatedWrapper';
import { ErrorBoundary as SentryErrorBoundary } from '@sentry/react';
import { ErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary';
import { SidebarProvider } from '@getpara/react-component-library';
import { AppSidebar } from './components/AppSidebar';
import { AuthAppBar } from '../../components/AppBar/AuthAppBar/AuthAppBar';
import { useScrollToAnchor } from '../../hooks/useScrollToAnchor';

export const Layout = () => {
  useScrollToAnchor();

  return (
    <AuthenticatedWrapper requireOrgs>
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
        <SidebarProvider className="para:min-h-0">
          <AuthAppBar />
          <AppSidebar />
          <main className="para:relative para:md:p-8 para:p-4 para:overflow-auto para:flex-1 para:mt-[var(--appbar-height-mobile)] para:lg:mt-[var(--appbar-height)]">
            <div className="para:flex para:flex-1 para:justify-center">
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
            </div>
          </main>
        </SidebarProvider>
      </SentryErrorBoundary>
    </AuthenticatedWrapper>
  );
};
