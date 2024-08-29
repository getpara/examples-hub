import { Outlet, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { MOBILE_SIZE } from '../../utils/constants';
import { CapsuleBlack } from '../../components/Icons';
import { CpslText } from '@usecapsule/react-components';
import { useIsLoggedIn } from '../../hooks/useIsLoggedIn';
import { useGetOrganizationAccess } from '../../hooks/api/queries/useOrganizations';
import { Loader } from '../../components/Loader';
import { useEffect } from 'react';

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
    return <Loader />;
  }

  if (isLoggedIn && access?.hasAccess) {
    return null;
  }

  return (
    <Container>
      <LogoContainer>
        <CapsuleBlack />
      </LogoContainer>
      <TextContainer>
        <CenteredText variant="headingM" weight="medium">
          Developer Portal
        </CenteredText>
        <CenteredText color="secondary">Configure your Capsule integration, manage users, and more.</CenteredText>
      </TextContainer>
      <Main>
        <Outlet />
      </Main>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Main = styled.main`
  margin-top: 40px;
  overflow: visible;
  height: 100%;

  @media (max-width: ${MOBILE_SIZE}px) {
    padding: 0px;
  }
  @media (min-width: ${MOBILE_SIZE + 1}px) {
    padding: 0px 24px;
  }
`;

const LogoContainer = styled.div`
  margin-top: 68px;
  height: 48px;

  svg {
    height: 48px;
  }
`;

const TextContainer = styled.div`
  margin-top: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const CenteredText = styled(CpslText)`
  text-align: center;
`;
