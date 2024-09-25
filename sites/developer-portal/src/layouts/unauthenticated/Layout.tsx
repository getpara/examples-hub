import { Outlet, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { MOBILE_SIZE } from '../../utils/constants';
import { useIsLoggedIn } from '../../hooks/useIsLoggedIn';
import { useGetOrganizationAccess } from '../../hooks/api/queries/useOrganizations';
import { useEffect } from 'react';
import { UNAUTH_APP_BAR_HEIGHT, UnAuthAppBar } from '../../components/AppBar/UnAuthAppBar';
import { MainLoader } from '../../components/MainLoader';

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
    return <MainLoader />;
  }

  if (isLoggedIn && access?.hasAccess) {
    return null;
  }

  return (
    <>
      <UnAuthAppBar />
      <UnAuthMain>
        <Outlet />
      </UnAuthMain>
    </>
  );
};

export const UnAuthMain = styled.main`
  overflow: auto;

  display: flex;
  background-color: #fff;

  @media (max-width: ${MOBILE_SIZE}px) {
    padding: 0px;
    min-height: calc(100% - ${UNAUTH_APP_BAR_HEIGHT}px);
  }
  @media (min-width: ${MOBILE_SIZE + 1}px) {
    padding: 0px 24px;
    padding-bottom: 24px;
    min-height: calc(100% - ${UNAUTH_APP_BAR_HEIGHT}px - 24px);
  }
`;
