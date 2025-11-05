import { OrganizationInvite } from '../../../types/api';
import { useAcceptInvite } from '../../../hooks/api/mutations/useAcceptInvite';
import { useLogout } from '../../../hooks/useLogout';
import { useSetSelectedOrganizationWithNavigation } from '../../../hooks/useSetSelectedOrganizationWithNavigation';
import { Avatar, AvatarImage, Button, Card, CardContent, toast, Typography } from '@getpara/react-component-library';

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
    } catch {
      toast.error('Error Accepting Invitations', {
        description: 'Please try again. If the problem persists, contact Para support.',
      });

      await logout();
      return;
    }
  };

  return (
    <Card className="para:rounded-[12px] para:py-2 para:w-[324px] para:border-border para:shadow-none">
      <CardContent className="para:flex para:flex-col para:gap-2 para:px-2">
        <div className="para:flex para:gap-2 para:items-center">
          {organization?.logoUrl && (
            <Avatar className="para:size-10 para:border-border para:border para:rounded-md para:p-1">
              <AvatarImage src={organization.logoUrl} alt="@shadcn" />
            </Avatar>
          )}
          <div className="para:flex para:flex-col">
            <Typography className="para:font-semibold para:text-foreground">{organization.name}</Typography>
            <Typography color="secondary" className="para:font-medium para:text-xs">
              {organization.homepageUrl}
            </Typography>
          </div>
        </div>
        <Button size="sm" variant="neutral" onClick={handleJoinOrg} disabled={isPending}>
          Join Organization
        </Button>
      </CardContent>
    </Card>
  );
};
