import { CenteredText, LinkText, VerticalCenteredContainer } from '../../components/common';
import { MainLoader } from '../../components/MainLoader';
import { AUTH_MIN_APP_BAR_HEIGHT } from '../../components/AppBar/AuthMinAppBar';
import { useGetInvite } from '../../hooks/api/queries/useUserInvite';
import { OrgCard } from './components/OrgCard';
import { OnboardingStep, useOnboardingStore } from '../../stores/onboarding/useOnboardingStore';
import { para } from '../../clients/para';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface InviteProps {
  isOnboarding?: boolean;
}

export const Invite = ({ isOnboarding }: InviteProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteId = searchParams.get('invite');
  const userId = para.getUserId();
  const [inviteOrgId, inviteMemberId] = inviteId?.split('|') ?? [];
  const setStep = useOnboardingStore(state => state.setStep);

  const { data: invite, isLoading: isLoadingInvite } = useGetInvite(inviteOrgId, inviteMemberId);

  if (isLoadingInvite) {
    return <MainLoader headerHeight={AUTH_MIN_APP_BAR_HEIGHT} />;
  }

  if (!invite) {
    return null;
  }

  const handleCreateOrgClick = () => {
    if (userId) {
      setStep(userId, OnboardingStep.ABOUT_YOU);
      navigate({ pathname: '/onboarding', search: searchParams.toString() });
    }
  };

  const member = invite.members[0];

  return (
    <VerticalCenteredContainer $gap={32}>
      <VerticalCenteredContainer $gap={8}>
        <CenteredText variant="headingS" weight="semiBold">
          You have an invitation
        </CenteredText>
        <CenteredText variant="bodyS" weight="medium" color="tertiary">
          Join the organization below or create a new organization.
        </CenteredText>
      </VerticalCenteredContainer>
      <VerticalCenteredContainer $gap={16}>
        <VerticalCenteredContainer $gap={8}>
          {member.invitedBy && (
            <CenteredText variant="bodyXS" weight="medium">
              Invited by: {member.invitedBy}
            </CenteredText>
          )}
          <OrgCard organization={invite} />
        </VerticalCenteredContainer>
        {isOnboarding && (
          <LinkText $centered variant="bodyS" weight="medium" onClick={handleCreateOrgClick}>
            Create New Organization
          </LinkText>
        )}
      </VerticalCenteredContainer>
    </VerticalCenteredContainer>
  );
};
