import styled from 'styled-components';
import { CpslButton, CpslModalV2, CpslText } from '@usecapsule/react-components';
import { useIsLoggedIn } from '../../hooks/useIsLoggedIn';
import { useGetAllOrganizations, useGetOrganizationAccess } from '../../hooks/api/queries/useOrganizations';
import { useLogout } from '../../hooks/useLogout';
import { useRequestOrganizationAccess } from '../../hooks/api/mutations/useReqestOrganizationAccess';
import { Loader } from '../../components/Loader';
import { useEffect } from 'react';
import { useAppStore } from '../../stores/app/useAppStore';
import { useNavigate } from 'react-router-dom';
import { triggerToast } from '../../utils/toasts';

export const RequestAccess = () => {
  const navigate = useNavigate();
  const { logout } = useLogout();
  const { data: access, isLoading: isAccessLoading } = useGetOrganizationAccess();
  const { data: organizations } = useGetAllOrganizations();
  const { mutate: requestAccess } = useRequestOrganizationAccess();
  const { isLoggedIn, isLoading: isLoggedInLoading } = useIsLoggedIn();
  const selectedOrganization = useAppStore(state => state.getSelectedOrganization());

  useEffect(() => {
    if (organizations?.length && !selectedOrganization) {
      navigate('/login', { replace: true });
    }
  }, [navigate, selectedOrganization, organizations]);

  useEffect(() => {
    const handleLogout = async () => {
      await logout();
    };
    if (!isLoggedInLoading && !isLoggedIn) {
      handleLogout();
    }
  }, [isLoggedIn, isLoggedInLoading, logout]);

  const hasRequested = access?.requestedAccess;

  const handleReturnClick = async () => {
    await logout();
  };

  const handleRequestClick = () => {
    requestAccess(undefined, {
      onSuccess: () => {
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
    });
  };

  if (isAccessLoading || isLoggedInLoading) {
    return <Loader />;
  }

  return (
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
        <CpslButton disabled={hasRequested} fullWidth onClick={handleRequestClick}>
          {hasRequested ? 'Access Requested' : 'Request Access'}
        </CpslButton>
        <CpslButton variant="secondary" fullWidth onClick={handleReturnClick}>
          Return to Login
        </CpslButton>
      </Container>
    </CpslModalV2>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 390px;
`;
