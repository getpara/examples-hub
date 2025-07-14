import { Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import { useGetAllOrganizations } from '../../hooks/api/queries/useOrganizations';
import { useEffect } from 'react';
import { ErrorBoundary as SentryErrorBoundary } from '@sentry/react';
import { ErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary';
import { LandingAppBar } from '../../components/AppBar/LandingAppBar';
import { useSetSelectedOrganizationWithNavigation } from '../../hooks/useSetSelectedOrganizationWithNavigation';
import { useAccount } from '@getpara/react-sdk';

export const Layout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isConnected } = useAccount();
  const isLoggedIn = isConnected;
  const { data: allOrgs, isLoading: isLoadingOrgs, isRefetching: isRefetchingOrgs } = useGetAllOrganizations();
  const { setSelectedOrganization } = useSetSelectedOrganizationWithNavigation(false);

  useEffect(() => {
    if (isLoggedIn && !isLoadingOrgs && !isRefetchingOrgs) {
      const inviteId = searchParams.get('invite');
      if (inviteId) {
        const route = !allOrgs?.length ? '/onboarding/invite' : '/invite';
        navigate({ pathname: route, search: searchParams.toString() }, { replace: true });
      } else {
        setSelectedOrganization();
      }
    }
  }, [isLoggedIn, isLoadingOrgs, navigate, setSelectedOrganization, allOrgs?.length, isRefetchingOrgs, searchParams]);

  if (isLoggedIn) {
    return null;
  }

  return (
    <div className="para:min-h-dvh para:flex para:flex-col para:bg-muted">
      <LandingAppBar />
      <main className="para:flex para:flex-1 para:justify-center para:box-border para:overflow-auto para:px-6 para:pb-6 para:pt-[34px]">
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
    </div>
  );
};
