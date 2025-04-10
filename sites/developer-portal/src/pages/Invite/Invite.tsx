import { VerticalCenteredContainer } from '../../components/common';
import { MainLoader } from '../../components/MainLoader';
import { AUTH_MIN_APP_BAR_HEIGHT } from '../../components/AppBar/AuthMinAppBar';
import { useGetInvite } from '../../hooks/api/queries/useUserInvite';
import { OrgCard } from './components/OrgCard';
import { OnboardingStep, useOnboardingStore } from '../../stores/onboarding/useOnboardingStore';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAccount } from '@getpara/react-sdk';
import { Button, Typography } from '@getpara/react-component-library';

interface InviteProps {
  isOnboarding?: boolean;
}

export const Invite = ({ isOnboarding }: InviteProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteId = searchParams.get('invite');
  const { data: account } = useAccount();
  const userId = account?.userId;
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
    <VerticalCenteredContainer className="para:gap-8">
      <VerticalCenteredContainer className="para:gap-2">
        <Typography className="para:text-3xl para:font-semibold para:text-center">You have an invitation</Typography>
        <Typography color="secondary" className="para:text-sm para:font-medium para:text-center">
          Join the organization below or create a new organization.
        </Typography>
      </VerticalCenteredContainer>
      <VerticalCenteredContainer className="para:gap-2">
        <VerticalCenteredContainer className="para:gap-2">
          {member.invitedBy && (
            <Typography color="secondary" className="para:text-xs para:font-medium para:text-center">
              Invited by: {member.invitedBy}
            </Typography>
          )}
          <OrgCard organization={invite} />
        </VerticalCenteredContainer>
        {isOnboarding && (
          <Button asChild className="para:cursor-pointer" variant="link" onClick={handleCreateOrgClick}>
            <Typography color="primary" className="para:text-xs para:font-medium">
              Create New Organization
            </Typography>
          </Button>
        )}
      </VerticalCenteredContainer>
    </VerticalCenteredContainer>
  );
};
