import styled from 'styled-components';
import { OrganizationInvite } from '../../../types/api';
import { CpslAvatar, CpslButton, CpslCard, CpslText } from '@usecapsule/react-components';
import { useAcceptInvite } from '../../../hooks/api/mutations/useAcceptInvite';
import { triggerToast } from '../../../utils/toasts';
import { useLogout } from '../../../hooks/useLogout';
import { useSetSelectedOrganizationWithNavigation } from '../../../hooks/useSetSelectedOrganizationWithNavigation';

interface OrgCardProps {
  organization: OrganizationInvite;
}

export const OrgCard = ({ organization }: OrgCardProps) => {
  const { logout } = useLogout();
  const { mutateAsync: acceptInvite, isPending } = useAcceptInvite();
  const { setSelectedOrganization } = useSetSelectedOrganizationWithNavigation(true);

  const handleJoinOrg = async () => {
    try {
      await acceptInvite({ organizationId: organization.id });
      await setSelectedOrganization();
    } catch (e) {
      triggerToast({
        variant: 'error',
        title: 'Error Accepting Invitation',
        body: 'Please try to login again. If the problem persists, contact Capsule support.',
      });
      await logout();
      return;
    }
  };

  return (
    <StyledCard>
      <Container>
        <TopContainer>
          {organization?.logoUrl && <Avatar src={organization.logoUrl} />}
          <NameContainer>
            <CpslText weight="semiBold">{organization.name}</CpslText>
            <CpslText variant="bodyXS" weight="medium" color="secondary">
              {organization.homepageUrl}
            </CpslText>
          </NameContainer>
        </TopContainer>
        <CpslButton fullWidth size="xSmall" onClick={handleJoinOrg} disabled={isPending}>
          Join Organization
        </CpslButton>
      </Container>
    </StyledCard>
  );
};

const StyledCard = styled(CpslCard)`
  width: 342px;

  --card-padding-top: 8px;
  --card-padding-bottom: 8px;
  --card-padding-start: 8px;
  --card-padding-end: 8px;
  --card-border-radius-tl: 12px;
  --card-border-radius-bl: 12px;
  --card-border-radius-tr: 12px;
  --card-border-radius-br: 12px;
  --card-border-color: var(--cpsl-color-background-8);
  --card-background-color: var(--cpsl-color-background-4);
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TopContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const NameContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Avatar = styled(CpslAvatar)`
  flex: 0;
  --container-height: 32px;
  --container-width: 32px;
  --container-background-color: var(--cpsl-color-background-4);
  --container-border-color: var(--cpsl-color-background-8);
  --container-border-radius: 8px;
`;
