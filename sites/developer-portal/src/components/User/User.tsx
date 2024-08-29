import { CpslAvatar, CpslText } from '@usecapsule/react-components';
import styled from 'styled-components';
import { useGetSelectedOrganization } from '../../hooks/api/queries/useOrganizations';
import { useOrganizationMember } from '../../hooks/api/queries/useOrganizationMember';

export const User = () => {
  const { data: org } = useGetSelectedOrganization();
  const { data: orgMember } = useOrganizationMember();

  const userName = orgMember?.user?.name ?? orgMember?.user?.email ?? '';

  return (
    <Container>
      {org?.logoUrl && <Avatar src={org.logoUrl} />}
      <NameContainer>
        <NameText weight="semiBold">{userName}</NameText>
        <CpslText color="tertiary" variant="bodyXS" weight="medium">
          {org?.name}
        </CpslText>
      </NameContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Avatar = styled(CpslAvatar)`
  flex: 0;
`;

const NameContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const NameText = styled(CpslText)`
  overflow-wrap: anywhere;
`;
