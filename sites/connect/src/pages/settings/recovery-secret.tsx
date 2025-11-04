import React, { ReactElement } from 'react';
import { Flex } from 'rebass';

import * as Styled from '../../styles/settings';
import useMobile from '@/hooks/MobileContext';
import SettingsLayout from '@/components/SettingsLayout';
import { BackButton } from '@/components/BackButton/BackButton';
import { RecoverySecretContent } from '@/components/RecoverySecretContent/RecoverySecretContent';

const RecoverySecret = () => {
  const isMobile = useMobile();

  return (
    <Styled.SettingCard isMobile={isMobile}>
      <Flex alignItems="center" flexDirection="column" style={{ gap: 8 }} width="100%">
        <Flex justifyContent="space-between" alignItems="center" width="100%">
          <BackButton isMobile={isMobile} />
          <Styled.SettingOptionHeader>Replace Recovery Secret</Styled.SettingOptionHeader>
          <div style={{ visibility: 'hidden' }}>
            <BackButton isMobile={isMobile} />
          </div>
        </Flex>
        <Styled.SettingCardSubHeader>
          Para does not store your Recovery Secret and we cannot retrieve it for you, however you can generate a new Recovery
          Secret. Generating a new Recovery Secret will invalidate your old Recovery Secret.
        </Styled.SettingCardSubHeader>
        <Styled.SettingsCardContentContainer>
          <RecoverySecretContent />
        </Styled.SettingsCardContentContainer>
      </Flex>
    </Styled.SettingCard>
  );
};

RecoverySecret.getLayout = (page: ReactElement) => <SettingsLayout>{page}</SettingsLayout>;

export default RecoverySecret;
