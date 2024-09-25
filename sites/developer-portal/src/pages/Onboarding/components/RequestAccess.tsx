import styled from 'styled-components';
import { CpslButton, CpslModalV2, CpslSpinner, CpslText } from '@usecapsule/react-components';
import { useGetOrganizationAccess } from '../../../hooks/api/queries/useOrganizations';
import { useLogout } from '../../../hooks/useLogout';
import { useRequestOrganizationAccess } from '../../../hooks/api/mutations/useReqestOrganizationAccess';
import { triggerToast } from '../../../utils/toasts';
import { useSetSelectedOrganizationWithNavigation } from '../../../hooks/useSetSelectedOrganizationWithNavigation';

interface RequestAccessProps {
  orgName: string;
}

export const RequestAccess = ({ orgName }: RequestAccessProps) => {
  const { logout } = useLogout();
  const { data: access } = useGetOrganizationAccess();
  const { mutate: requestAccess, isPending: isRequesting } = useRequestOrganizationAccess();
  const { setSelectedOrganization } = useSetSelectedOrganizationWithNavigation(true);

  const hasRequested = access?.requestedAccess;

  const handleReturnClick = async () => {
    await logout();
  };

  const handleRequestClick = () => {
    requestAccess(
      { organizationName: orgName },
      {
        onSuccess: async () => {
          await setSelectedOrganization();
          triggerToast({
            variant: 'success',
            title: 'Access Requested!',
            body: 'We will be in touch!',
          });
        },
        onError: () => {
          triggerToast({
            variant: 'error',
            title: 'Error Requesting Dev Portal Access',
            body: 'Please try again. If the problem persists, contact Capsule support.',
          });
        },
      },
    );
  };

  return (
    <OuterContainer>
      <CpslModalV2 open noOverlay elevated>
        <Container>
          <CpslText variant="headingXS" weight="semiBold">
            {hasRequested ? 'Thank you!' : 'Request Access'}
          </CpslText>
          <CpslText color="secondary">
            {hasRequested
              ? 'We will be in touch via email soon.'
              : 'You don’t currently have a Capsule plan. If you would like to get started using Capsule, please request access.'}
          </CpslText>
          <CpslButton disabled={hasRequested || isRequesting} fullWidth onClick={handleRequestClick}>
            {isRequesting ? <CpslSpinner size={20} /> : hasRequested ? 'Access Requested' : 'Request Access'}
          </CpslButton>
          <CpslButton variant="secondary" fullWidth onClick={handleReturnClick}>
            Return to Login
          </CpslButton>
        </Container>
      </CpslModalV2>
    </OuterContainer>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 325px;
`;

const OuterContainer = styled.div`
  margin-top: 77px;
`;
