import { Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useGetAllOrganizations } from '../../hooks/api/queries/useOrganizations';
import { useEffect } from 'react';
import { MainLoader } from '../../components/MainLoader';
import { ErrorBoundary as SentryErrorBoundary } from '@sentry/react';
import { ErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary';
import { LANDING_APP_BAR_HEIGHT, LandingAppBar } from '../../components/AppBar/LandingAppBar';
import { useSetSelectedOrganizationWithNavigation } from '../../hooks/useSetSelectedOrganizationWithNavigation';
import { useAccount } from '@getpara/react-sdk';

export const Layout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: account, isLoading: isLoadingLoggedIn } = useAccount();
  const isLoggedIn = account?.isConnected;
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

  if (isLoadingLoggedIn || isLoadingOrgs || isRefetchingOrgs) {
    return <MainLoader headerHeight={LANDING_APP_BAR_HEIGHT} />;
  }

  if (isLoggedIn) {
    return null;
  }

  return (
    <>
      <LandingAppBar />
      <LandingMain>
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
      </LandingMain>
    </>
  );
};

const LandingMain = styled.main`
  overflow: auto;

  display: flex;
  justify-content: center;
  background-color: var(--cpsl-color-background-4);
  min-height: 100vh;
  box-sizing: border-box;
  padding: calc(${LANDING_APP_BAR_HEIGHT}px + 34px) 24px 24px 24px;
`;
