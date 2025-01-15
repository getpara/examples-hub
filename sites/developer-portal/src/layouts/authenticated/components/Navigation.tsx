import { CpslIcon, CpslNavButton, CpslNavButtonGroup, CpslText } from '@usecapsule/react-components';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { NavRoute } from '../../../types/navigation';
import { BRAND_COLORS, MODAL_DESIGNER_LINK } from '../../../utils/constants';
import { useEarlyAccess } from '../../../hooks/configs/useEarlyAccess';
import { useGetAllProjects } from '../../../hooks/api/queries/useProjects';
import { CpslNavButtonCustomEvent } from '@usecapsule/core-components';
import { useIsOwner } from '../../../hooks/api/queries/useOrganizationMember';

const NAV_ROUTES: NavRoute[] = [
  {
    path: '/dashboard',
    label: 'Home',
    icon: 'home',
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
  },
  {
    path: '/early-access',
    label: 'Early Access',
    icon: 'lightning',
  },
  {
    path: '/team',
    label: 'Team',
    icon: 'user',
  },
  {
    path: '/billing',
    label: 'Billing',
    icon: 'creditCard02',
  },
];

interface NavigationProps {
  closeNav: () => void;
}

export const Navigation = ({ closeNav }: NavigationProps) => {
  const { organizationId } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { earlyAccessItems } = useEarlyAccess();
  const { data: projects } = useGetAllProjects();
  const { data: isOwner } = useIsOwner();

  let filteredNavRoutes = !earlyAccessItems?.length
    ? NAV_ROUTES.filter(route => route.path !== '/early-access')
    : NAV_ROUTES;
  filteredNavRoutes = !isOwner ? filteredNavRoutes.filter(r => r.path !== '/billing') : filteredNavRoutes;

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
    let pathStr = `/${organizationId}${path}`;

    if (path === '/modal-designer') {
      window.open(MODAL_DESIGNER_LINK, '_blank');
      return;
    }

    if (path === '/project') {
      if (projects?.length) {
        pathStr = `${pathStr}/${projects?.[0]?.id}`;
      } else {
        pathStr = `/${organizationId}/dashboard`;
      }
    }

    navigate(pathStr);
    closeNav();
  };

  const handleSubRouteClick = (event: CpslNavButtonCustomEvent<string>) => {
    navigate(`/${organizationId}${event.detail}`);
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
