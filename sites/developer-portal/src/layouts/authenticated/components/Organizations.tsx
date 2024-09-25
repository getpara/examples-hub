import { CpslAvatar, CpslSelect, CpslSelectItem, CpslText } from '@usecapsule/react-components';
import styled from 'styled-components';
import { useGetAllOrganizationsWithAccess, useGetSelectedOrganization } from '../../../hooks/api/queries/useOrganizations';
import { CpslSelectCustomEvent } from '@usecapsule/core-components';
import { useAppStore } from '../../../stores/app/useAppStore';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useLogout } from '../../../hooks/useLogout';
import { triggerToast } from '../../../utils/toasts';

export const Organizations = () => {
  const navigate = useNavigate();
  const { logout } = useLogout();
  const { data: org } = useGetSelectedOrganization();
  const { data: orgs } = useGetAllOrganizationsWithAccess();
  const setSelectedOrganization = useAppStore(state => state.setSelectedOrganization);
  const [selectedOrgId, setSelectedOrgId] = useState(org?.id ?? '');

  useEffect(() => {
    const resetState = async () => {
      const firstOrgWithAccess = orgs?.[0];

      if (!firstOrgWithAccess) {
        await logout();
        triggerToast({
          variant: 'error',
          title: 'None of your organizations have access',
          body: 'If you believe this is an error, contact Capsule support.',
        });
      } else {
        handleOrgSelect({ detail: firstOrgWithAccess.id } as CpslSelectCustomEvent<string>);
      }
    };

    // If the selected org doesn't have access, switch to one that does or logout
    if (orgs && org && !orgs.find(o => o.id === org.id)) {
      resetState();
    }
  }, [orgs, org, logout]);

  const handleOrgSelect = (e: CpslSelectCustomEvent<string>) => {
    if (e.detail !== org?.id) {
      navigate('/');
      setSelectedOrgId(e.detail);

      // Using a small timeout here to allow routing to complete before setting the org at the app state level.
      // Without this some inadvertent errors are shown on project screens.
      setTimeout(() => {
        setSelectedOrganization(e.detail);
      }, 100);
    }
  };

  return (
    <Container>
      {org?.logoUrl && <Avatar src={org.logoUrl} />}
      <StyledSelect
        onCpslSelectValueChange={handleOrgSelect}
        selectedValue={selectedOrgId}
        showFormattedSelectedItem
        noIconAnimation
        icon="chevronSelectorVertical"
      >
        {org && (
          <SelectedItem slot="selected-item" weight="semiBold">
            {org.name}
          </SelectedItem>
        )}
        {orgs?.map(org => (
          <CpslSelectItem key={org.id} value={org.id} slot="items">
            <CpslText>{org.name}</CpslText>
          </CpslSelectItem>
        ))}
      </StyledSelect>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  width: 100%;
`;

const Avatar = styled(CpslAvatar)`
  flex: 0;
`;

const StyledSelect = styled(CpslSelect)`
  overflow: hidden;
  width: 100%;

  --container-border-width: 0px;
  --container-background-color: transparent;
  --container-box-shadow: none;

  &::part(icon) {
    --icon-color: var(--cpsl-color-text-secondary);
  }

  &::part(select-container) {
    padding: 0px;
  }
`;

const SelectedItem = styled(CpslText)`
  overflow: hidden;

  &::part(text-element) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;
