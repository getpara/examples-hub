import React, { ReactElement } from 'react';
import { Flex } from 'rebass';

import * as Styled from '../../styles/settings';
import useMobile from '@/hooks/MobileContext';
import SettingsLayout from '@/components/SettingsLayout';
import { BackButton } from '@/components/BackButton/BackButton';
import { BaseContainer as BaseButton } from '@/components/base/Button/styles';
import { useSelectedWallet } from '@/hooks/useSelectedWallet';
import { useClient } from '@getpara/react-sdk';

const BackupKit = () => {
  const { wallet } = useSelectedWallet();
  const isMobile = useMobile();
  const para = useClient();

  const handleDownload = async () => {
    if (!para) return;

    const userId = para.getUserId();
    if (userId && wallet?.id) {
      para.ctx.client.getBackupKit(userId, wallet.id).then(resp => {
        const url = window.URL.createObjectURL(resp.data);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'ParaBackupKit.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      });
    }
  };

  return (
    <Styled.SettingCard isMobile={isMobile}>
      <Flex alignItems="center" flexDirection="column" style={{ gap: 8 }} width="100%">
        <Flex justifyContent="space-between" alignItems="center" width="100%">
          <BackButton isMobile={isMobile} />
          <Styled.SettingOptionHeader>Your Backup Kit</Styled.SettingOptionHeader>
          <div style={{ visibility: 'hidden' }}>
            <BackButton isMobile={isMobile} />
          </div>
        </Flex>
        <Styled.SettingCardSubHeader>
          Your Para Backup Kit contains your Para Backup Key and <strong>it is not a private key.</strong> Your Para Backup
          Key can be used to gain access to your account in the unlikely event that Para&apos;s services are not available.
          {'\n\n'}
          Do not put this key into a wallet or any other application and do not share this key with anyone.
        </Styled.SettingCardSubHeader>
        <Styled.SettingsCardContentContainer>
          <BaseButton onClick={handleDownload}>Download Backup Kit</BaseButton>
        </Styled.SettingsCardContentContainer>
      </Flex>
    </Styled.SettingCard>
  );
};

BackupKit.getLayout = (page: ReactElement) => <SettingsLayout>{page}</SettingsLayout>;

export default BackupKit;
