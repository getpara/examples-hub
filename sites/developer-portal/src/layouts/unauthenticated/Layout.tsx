import { Outlet, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useIsLoggedIn } from '../../hooks/useIsLoggedIn';
import { useGetOrganizationAccess } from '../../hooks/api/queries/useOrganizations';
import { useEffect } from 'react';
import { MainLoader } from '../../components/MainLoader';
import { ErrorBoundary as SentryErrorBoundary } from '@sentry/react';
import { ErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary';
import { LANDING_APP_BAR_HEIGHT, LandingAppBar } from '../../components/AppBar/LandingAppBar';

export const Layout = () => {
  const navigate = useNavigate();
  const { isLoggedIn, isLoading: isLoadingLoggedIn } = useIsLoggedIn();
  const { data: access, isLoading: isLoadingOrgs } = useGetOrganizationAccess();

  useEffect(() => {
    if (isLoggedIn && access?.hasAccess) {
      navigate('/', { replace: true });
    }
  }, [access?.hasAccess, isLoggedIn, navigate]);

  if (isLoadingLoggedIn || isLoadingOrgs) {
    return <MainLoader headerHeight={LANDING_APP_BAR_HEIGHT} />;
  }

  if (isLoggedIn && access?.hasAccess) {
    return null;
  }

  return (
    <>
      <LandingAppBar />
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
    </>
  );
};

export const UnAuthMain = styled.main`
  overflow: auto;

  display: flex;
  justify-content: center;
  background-color: var(--cpsl-color-background-4);
  min-height: 100vh;
  box-sizing: border-box;
  padding: calc(${LANDING_APP_BAR_HEIGHT}px + 34px) 24px 24px 24px;
`;
