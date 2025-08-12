import { CpslAvatar, CpslIcon, CpslText, IconType } from '@getpara/react-components';
import { CoreAuthInfo, displayPhoneNumber, truncateAddress } from '@getpara/web-sdk';
import { getExternalWalletDisplayName, getExternalWalletIcon, safeStyled } from '../utils/index.js';

export function getAuthDisplay(
  authInfo: CoreAuthInfo,
  { withAddress = false }: { withAddress?: boolean } = {},
): { name: string | null; icon?: IconType; src?: string } {
  const { authType, displayName, identifier, pfpUrl, externalWallet } = authInfo;

  switch (authType) {
    case 'email':
      return { name: identifier.toLowerCase(), icon: 'mail' };
    case 'phone':
      return { name: displayPhoneNumber(identifier), icon: 'phone' };
    case 'farcaster':
      return { name: displayName ?? `@${identifier}`, ...(pfpUrl ? { src: pfpUrl } : { icon: 'farcasterBrand' }) };
    case 'telegram':
      return {
        name: displayName ?? `Telegram User @${identifier}`,
        ...(pfpUrl ? { src: pfpUrl } : { icon: 'telegramBrand' }),
      };
    case 'externalWallet':
      return {
        name: externalWallet
          ? getExternalWalletDisplayName(externalWallet, { withAddress })
          : truncateAddress(identifier, 'EVM'),
        icon: getExternalWalletIcon(externalWallet?.providerId) ?? 'wallet02',
      };
    default:
      return { name: null, icon: null };
  }
}

export const UserIdentifier = ({ authInfo }: { authInfo?: CoreAuthInfo }) => {
  if (!authInfo) {
    return null;
  }

  const { authType } = authInfo;

  const { name, icon, src } = getAuthDisplay(authInfo, { withAddress: true });

  return (
    <Container>
      <IconContainer>
        {src ? (
          <Avatar src={src} size="20px" variant="round" />
        ) : (
          <Icon icon={icon} size={authType === 'telegram' ? '20px' : '13px'} />
        )}
      </IconContainer>
      <IdentifierText variant="bodyS" weight="medium">
        {name}
      </IdentifierText>
    </Container>
  );
};

const Container = safeStyled.div`
  padding: 8px 12px 8px 8px;
  border-radius: 1000px;
  background-color: var(--cpsl-color-background-4);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
`;

const IdentifierText = safeStyled(CpslText)`
  --color-override: var(--cpsl-color-background-96);
`;

const IconContainer = safeStyled.div`
  display: flex;
  background: var(--cpsl-color-background-0);
  align-items: center;
  justify-content: center;
  border-radius: 1000px;
  width: 20px;
  height: 20px;
`;

const Icon = safeStyled(CpslIcon)`
  --icon-color: var(--cpsl-color-text-primary);
`;

const Avatar = safeStyled(CpslAvatar)`
  --container-border-width: 0;
  --container-padding: 0;
`;
