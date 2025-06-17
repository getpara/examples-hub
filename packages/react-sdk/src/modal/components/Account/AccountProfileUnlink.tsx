import { CpslButton, CpslText } from '@getpara/react-components';
import { useEffect, useState } from 'react';
import { AccountTypeIcon } from '../common.js';
import { getAccountTypeName } from '../../constants/oAuthLogos.js';
import styled from 'styled-components';
import { useAccountLinking } from '../../../provider/providers/AccountLinkProvider.js';

export function AccountProfileUnlink() {
  const { unlinkingAccount, unlinkAccountConfirm, isUnlinkAccountPending } = useAccountLinking(),
    [accountType, setAccountType] = useState(unlinkingAccount?.externalWallet?.providerId ?? unlinkingAccount?.type);

  useEffect(() => {
    if (unlinkingAccount) {
      setAccountType(unlinkingAccount?.externalWallet?.providerId ?? unlinkingAccount?.type);
    }
  }, [unlinkingAccount]);

  return (
    <Content>
      <Upper>
        <AccountTypeIcon accountType={accountType} size="80px" inset="5px" />
        <Message variant="bodyM" weight="semiBold" color="contrast">
          Are you sure you want to unlink your {getAccountTypeName(accountType, { inline: true })}?
        </Message>
      </Upper>
      <CpslButton variant="destructive" fullWidth onClick={unlinkAccountConfirm} disabled={isUnlinkAccountPending}>
        Confirm
      </CpslButton>
    </Content>
  );
}

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 32px;
`;

const Upper = styled(Content)`
  gap: 8px;
`;

const Message = styled(CpslText)`
  text-align: center;
  max-width: 342px;
`;
