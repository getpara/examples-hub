import { CpslButton, CpslIcon, CpslNavButtonGroup, CpslText } from '@usecapsule/react-components';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { NavRoute } from '../../../types/navigation';
import { BRAND_COLORS } from '../../../utils/constants';

const NAV_ROUTES: NavRoute[] = [
  {
    path: '/',
    label: 'Home',
    icon: 'home',
  },
  {
    path: '/modal-designer',
    label: 'Modal Designer',
    icon: 'brush',
    comingSoon: true,
  },
  {
    path: '/early-access',
    label: 'Early Access',
    icon: 'lightning',
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: 'settings',
  },
];

interface NavigationProps {
  closeNav: () => void;
}

export const Navigation = ({ closeNav }: NavigationProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleButtonClick = (path: string) => () => {
    navigate(path);
    closeNav();
  };

  const getSelectedId = () => {
    if (pathname.includes('/key')) {
      return '/';
    }
    return pathname;
  };

  return (
    <Container>
      <CpslNavButtonGroup selectedId={getSelectedId()}>
        {NAV_ROUTES.map(route => (
          <CpslButton key={route.path} id={route.path} onClick={handleButtonClick(route.path)} disabled={route.comingSoon}>
            <CpslIcon icon={route.icon} slot="start"></CpslIcon>
            {route.label}
            {route.comingSoon && (
              <ComingSoonContainer>
                <CpslText color="inverted" variant="body2XS" weight="medium">
                  COMING SOON
                </CpslText>
              </ComingSoonContainer>
            )}
          </CpslButton>
        ))}
      </CpslNavButtonGroup>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  flex: 1;
`;

const ComingSoonContainer = styled.span`
  padding: 4px;
  background: linear-gradient(90deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.secondary} 100%);
  border-radius: 4px;
`;
