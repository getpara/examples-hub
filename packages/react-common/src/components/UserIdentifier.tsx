import { CpslAvatar, CpslIcon, CpslText, IconType } from '@getpara/react-components';
import styled from 'styled-components';
import { CoreAuthInfo, displayPhoneNumber } from '@getpara/web-sdk';
import { getExternalWalletDisplayName } from '../utils/index.js';

function defaultDisplay(authInfo: CoreAuthInfo): { defaultName: string | null; defaultIcon: IconType | null } {
  const { authType, identifier, externalWallet } = authInfo;

  switch (authType) {
    case 'email':
      return { defaultName: identifier.toLowerCase(), defaultIcon: 'mail' };
    case 'phone':
      return { defaultName: displayPhoneNumber(identifier), defaultIcon: 'phone' };
    case 'farcaster':
      return { defaultName: `@${identifier}`, defaultIcon: 'farcasterBrand' };
    case 'telegram':
      return { defaultName: `Telegram User @${identifier}`, defaultIcon: 'telegramBrand' };
    case 'externalWallet':
      return { defaultName: getExternalWalletDisplayName(externalWallet), defaultIcon: 'wallet' };
    default:
      return { defaultName: null, defaultIcon: null };
  }
}

export const UserIdentifier = ({ authInfo }: { authInfo?: CoreAuthInfo }) => {
  if (!authInfo) {
    return null;
  }

  const { authType, displayName, pfpUrl } = authInfo;

  const { defaultName, defaultIcon } = defaultDisplay(authInfo);

  return (
    <Container>
      <IconContainer>
        {pfpUrl ? (
          <Avatar src={pfpUrl} size="20px" variant="round" />
        ) : (
          <Icon icon={defaultIcon} size={authType === 'telegram' ? '20px' : '13px'} />
        )}
      </IconContainer>
      <IdentifierText variant="bodyS" weight="medium">
        {displayName || defaultName}
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
