import React, { ReactElement } from 'react';
import { Flex } from 'rebass';

import * as Styled from '../../styles/settings';
import InfoPanel from '@/components/base/InfoPanel';
import MyWallet from '@/components/MyWallet';
import { useRouter } from 'next/router';
import SettingsLayout from '@/components/SettingsLayout';
import { useLogout } from '@getpara/react-sdk';

const Settings = () => {
  const { logoutAsync } = useLogout();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAsync();
    router.replace('/');
  };

  return (
    <InfoPanel>
      <Flex alignItems="center" flexDirection="column" style={{ gap: 8 }} width="100%">
        <MyWallet logout={handleLogout} />
        <Styled.SettingOption
          style={{ marginTop: 32 }}
          onClick={() => {
            router.push('/settings/private-key');
          }}
        >
          <Styled.SettingOptionHeader>Export Private Key</Styled.SettingOptionHeader>
          <Styled.SettingOptionSubHeader>
            Trying to migrate your wallet to another app? <strong>Advanced Users Only.</strong>
          </Styled.SettingOptionSubHeader>
        </Styled.SettingOption>
        <Styled.SettingOption
          onClick={() => {
            router.push('/settings/recovery-secret');
          }}
        >
          <Styled.SettingOptionHeader>Replace Recovery Secret</Styled.SettingOptionHeader>
          <Styled.SettingOptionSubHeader>
            Have you lost your previous Recovery Secret or believe it has been compromised?
          </Styled.SettingOptionSubHeader>
        </Styled.SettingOption>
        <Styled.SettingOption
          onClick={() => {
            router.push('/settings/backup-kit');
          }}
        >
          <Styled.SettingOptionHeader>Backup Kit</Styled.SettingOptionHeader>
          <Styled.SettingOptionSubHeader>Download and learn more about your Para Backup Kit.</Styled.SettingOptionSubHeader>
        </Styled.SettingOption>
      </Flex>
    </InfoPanel>
  );
};

Settings.getLayout = (page: ReactElement) => <SettingsLayout>{page}</SettingsLayout>;

export default Settings;
