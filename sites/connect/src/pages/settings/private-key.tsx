import React, { ReactElement, useEffect, useState } from 'react';
import { Flex } from 'rebass';
import CircularProgress from '@mui/material/CircularProgress';

import * as Styled from '../../styles/settings';
import useMobile from '@/hooks/MobileContext';
import SettingsLayout from '@/components/SettingsLayout';
import { BackButton } from '@/components/BackButton/BackButton';
import Input from '@/components/base/Input';
import { BaseContainer as BaseButton } from '@/components/base/Button/styles';
import { useUserStore } from '@/store/useUserStore';
import { useClient } from '@getpara/react-sdk';

const PrivateKey = () => {
  const currentWalletId = useUserStore(state => state.currentWalletId);
  const [isLoading, setIsLoading] = useState(true);
  const [isHidden, setIsHidden] = useState(true);
  const [privateKey, setPrivateKey] = useState('');
  const [isSchemeError, setIsSchemeError] = useState(false);
  const [isUnknownError, setIsUnknownError] = useState(false);
  const isMobile = useMobile();
  const para = useClient();

  const loadPrivateKey = async () => {
    if (!para) return;

    try {
      setPrivateKey(await (para as any).getPrivateKey(currentWalletId));
      setIsLoading(false);
    } catch (err) {
      if ((err as any).message === 'invalid wallet scheme') {
        setIsSchemeError(true);
      } else {
        setIsUnknownError(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPrivateKey();
  }, []);

  const toggleVisibility = () => {
    setIsHidden(curr => !curr);
  };

  const handleSupportClick = () => {
    window.open('mailto:support@getpara.com', '_self');
  };

  const handleRetryClick = () => {
    setIsLoading(true);
    setIsUnknownError(false);
    setIsSchemeError(false);
    loadPrivateKey();
  };

  return (
    <Styled.SettingCard isMobile={isMobile}>
      <Flex alignItems="center" flexDirection="column" style={{ gap: 8 }} width="100%">
        <Flex justifyContent="space-between" alignItems="center" width="100%">
          <BackButton isMobile={isMobile} />
          <Styled.SettingOptionHeader>Export Private Key</Styled.SettingOptionHeader>
          <div style={{ visibility: 'hidden' }}>
            <BackButton isMobile={isMobile} />
          </div>
        </Flex>
        {isLoading ? (
          <CircularProgress color="inherit" />
        ) : (
          <>
            {isSchemeError ? (
              <>
                <Styled.SettingCardSubHeader>
                  You are using an older, legacy version of Para Wallet. This version is no longer supported and we are
                  unable to export the Private Key.
                </Styled.SettingCardSubHeader>
                <Styled.SettingsCardContentContainer>
                  <BaseButton onClick={handleSupportClick}>Contact Support</BaseButton>
                </Styled.SettingsCardContentContainer>
              </>
            ) : isUnknownError ? (
              <>
                <Styled.SettingCardSubHeader>
                  An error occurred while retrieving your private key, please try again. If the problem persists, reach out
                  to <a href="mailto:support@getpara.com">support</a>
                </Styled.SettingCardSubHeader>
                <Styled.SettingsCardContentContainer>
                  <BaseButton onClick={handleRetryClick}>Retry</BaseButton>
                </Styled.SettingsCardContentContainer>
              </>
            ) : (
              <>
                <Styled.SettingCardSubHeader>
                  Your private key allows anyone to have complete, unrevocable access to all your assets.{' '}
                  <strong>Do not allow anyone to see or access your private key.</strong>
                </Styled.SettingCardSubHeader>
                <Styled.SettingsCardContentContainer>
                  <Styled.FullWidthInputWrapper>
                    <Input
                      fullAddress={privateKey}
                      walletAddress={privateKey}
                      disabled
                      truncateAddress={false}
                      showVisibility
                      isAddressHidden={isHidden}
                      copiedText="Key Copied!"
                      onVisibilityClick={toggleVisibility}
                    />
                  </Styled.FullWidthInputWrapper>
                </Styled.SettingsCardContentContainer>
              </>
            )}
          </>
        )}
      </Flex>
    </Styled.SettingCard>
  );
};

PrivateKey.getLayout = (page: ReactElement) => <SettingsLayout>{page}</SettingsLayout>;

export default PrivateKey;
