import { CpslAvatar, CpslIcon, CpslText, IconType } from '@getpara/react-components';
import styled from 'styled-components';
import { ModalAuthInfo } from '../types/index.js';
import { AuthType } from '@getpara/user-management-client';
import { formatPhoneNumber } from '../utils/formatPhoneNumber.js';

function defaultDisplayName(authType: AuthType, identifier: string) {
  switch (authType) {
    case 'email':
      return identifier.toLowerCase();
    case 'phone':
      return formatPhoneNumber(identifier);
    case 'farcaster':
      return `@${identifier}`;
    case 'telegram':
      return `Telegram User @${identifier}`;
    default:
      return null;
  }
}

export const UserIdentifier = ({ identifier, authType, displayName, pfpUrl }: ModalAuthInfo) => {
  let icon: IconType;
  switch (authType) {
    case 'email':
      icon = 'mail';
      break;
    case 'phone':
      icon = 'phone';
      break;
    case 'farcaster':
      icon = 'farcasterBrand';
      break;
    case 'telegram':
      icon = 'telegramBrand';
      break;
  }

  return (
    <Container>
      <IconContainer>
        {pfpUrl ? (
          <Avatar src={pfpUrl} size="20px" />
        ) : (
          <Icon icon={icon} size={authType === 'telegram' ? '20px' : '13px'} />
        )}
      </IconContainer>
      <IdentifierText variant="bodyS" weight="medium">
        {displayName || defaultDisplayName(authType, identifier)}
      </IdentifierText>
    </Container>
  );
};

const Container = styled.div`
  padding: 8px 12px 8px 8px;
  border-radius: 1000px;
  background-color: var(--cpsl-color-background-4);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
`;

const IdentifierText = styled(CpslText)`
  --color-override: var(--cpsl-color-background-96);
`;

const IconContainer = styled.div`
  display: flex;
  background: var(--cpsl-color-background-0);
  align-items: center;
  justify-content: center;
  border-radius: 1000px;
  width: 20px;
  height: 20px;
`;

const Icon = styled(CpslIcon)`
  --icon-color: var(--cpsl-color-text-primary);
`;

const Avatar = styled(CpslAvatar)`
  --container-border-width: 0;
  --container-padding: 0;
`;
