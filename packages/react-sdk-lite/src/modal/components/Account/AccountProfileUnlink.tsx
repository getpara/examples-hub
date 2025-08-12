import { CpslButton, CpslText } from '@getpara/react-components';
import { useEffect, useState } from 'react';
import { AccountTypeIcon } from '../common.js';
import { useAccountLinking } from '../../../provider/providers/AccountLinkProvider.js';
import { getAccountTypeName, safeStyled } from '@getpara/react-common';

export function AccountProfileUnlink() {
  const { unlinkingAccount, unlinkAccountConfirm, isUnlinkAccountPending } = useAccountLinking(),
    [accountType, setAccountType] = useState(unlinkingAccount?.externalWallet?.providerId ?? unlinkingAccount?.type),
    [isUnlinkingExternalWallet, setIsUnlinkingExternalWallet] = useState(false);

  useEffect(() => {
    if (unlinkingAccount) {
      setAccountType(unlinkingAccount?.externalWallet?.provider ?? unlinkingAccount?.type);
      setIsUnlinkingExternalWallet(!!unlinkingAccount?.externalWallet);
    }
  }, [unlinkingAccount]);

  return (
    <Content>
      <Upper>
        <AccountTypeIcon accountType={accountType} size="80px" inset="5px" />
        <Message variant="bodyM" weight="semiBold" color="contrast">
          Are you sure you want to unlink your{' '}
          {isUnlinkingExternalWallet ? accountType : getAccountTypeName(accountType, { inline: true })}?
        </Message>
      </Upper>
      <CpslButton variant="destructive" fullWidth onClick={unlinkAccountConfirm} disabled={isUnlinkAccountPending}>
        Confirm
      </CpslButton>
    </Content>
  );
}

const Content = safeStyled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 32px;
`;

const Upper = safeStyled(Content)`
  gap: 8px;
`;

const Message = safeStyled(CpslText)`
  text-align: center;
  max-width: 342px;
`;
