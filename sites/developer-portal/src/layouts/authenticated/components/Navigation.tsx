import { CpslIcon, CpslNavButton, CpslNavButtonGroup, CpslText } from '@usecapsule/react-components';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { NavRoute } from '../../../types/navigation';
import { BRAND_COLORS } from '../../../utils/constants';
import { useEarlyAccess } from '../../../hooks/configs/useEarlyAccess';
import { useGetAllProjects } from '../../../hooks/api/queries/useProjects';
import { CpslNavButtonCustomEvent } from '@usecapsule/core-components';

const NAV_ROUTES: NavRoute[] = [
  {
    path: '/',
    label: 'Home',
    icon: 'home',
    exactMainRouteMatch: true,
  },
  {
    path: '/project',
    label: 'Projects',
    icon: 'folder',
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
  const { earlyAccessItems } = useEarlyAccess();
  const { data: projects } = useGetAllProjects();

  const filteredNavRoutes = !earlyAccessItems?.length
    ? NAV_ROUTES.filter(route => route.path !== '/early-access')
    : NAV_ROUTES;

  const completeNavRoutes = filteredNavRoutes.map(route =>
    route.path === '/project'
      ? {
          ...route,
          subRoutes: projects?.map(p => ({
            value: p.id,
            label: p.name,
          })),
        }
      : route,
  );

  const handleButtonClick = (event: CpslNavButtonCustomEvent<string>) => {
    const path = event.detail;
    let pathStr = path;
    if (path === '/project') {
      if (projects?.length) {
        pathStr = `${pathStr}/${projects?.[0]?.id}`;
      } else {
        pathStr = '/';
      }
    }

    navigate(pathStr);
    closeNav();
  };

  const handleSubRouteClick = (event: CpslNavButtonCustomEvent<string>) => {
    navigate(event.detail);
    closeNav();
  };

  return (
    <Container>
      <CpslNavButtonGroup>
        {completeNavRoutes.map(route => (
          <CpslNavButton
            key={route.path}
            route={route.path}
            path={pathname}
            onCpslNavButtonClick={handleButtonClick}
            onCpslNavButtonSubRouteClick={handleSubRouteClick}
            exactMainRouteMatch={route.exactMainRouteMatch}
            subRoutes={route.subRoutes}
            disabled={route.comingSoon}
          >
            <CpslIcon icon={route.icon} slot="start"></CpslIcon>
            {route.label}
            {route.comingSoon && (
              <ComingSoonContainer>
                <CpslText color="inverted" variant="body2XS" weight="medium">
                  COMING SOON
                </CpslText>
              </ComingSoonContainer>
            )}
            {!!route.subRoutes?.length && (
              <ExpandIcon $isExpanded={pathname.includes(route.path)} slot="end" icon="chevronUp" />
            )}
          </CpslNavButton>
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

const ExpandIcon = styled(CpslIcon)<{ $isExpanded: boolean }>`
  margin-left: auto;

  transform: rotate(${({ $isExpanded }) => ($isExpanded ? '180deg' : '0deg')});
  transition: all 0.25s;
`;
