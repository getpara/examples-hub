import React, { useCallback } from 'react';
import styled from 'styled-components';
import { ParaModal } from '@getpara/react-sdk';
import '@getpara/react-sdk/styles.css';
import { PlaceHolderLogo } from '../../assets';

import iPhoneImage from '../../assets/iphone.png';
import { useAtom } from 'jotai';
import { paraAtom, checkLoginStatusAtom, isLoggedInAtom, modalConfigAtom, viewAtom } from '../../atoms';
import { calculateBrightness } from '../../utils';

interface ModalPreviewDisplayProps {}

export const ModalPreviewDisplay: React.FC<ModalPreviewDisplayProps> = () => {
  const [modalConfig] = useAtom(modalConfigAtom);
  const [para] = useAtom(paraAtom);
  const [view] = useAtom(viewAtom);
  const [, checkLoginStatus] = useAtom(checkLoginStatusAtom);
  const [isLoggedIn] = useAtom(isLoggedInAtom);

  const handleClose = useCallback(() => {
    checkLoginStatus(null);
  }, [checkLoginStatus]);

  return (
    <IPhoneOuterContainer $isMobile={view === 'mobile'}>
      <ModalContainer $isMobile={view === 'mobile'}>
        <ParaModal
          key={`modal-${view}-${isLoggedIn}`}
          bareModal
          para={para}
          isOpen
          onClose={() => handleClose()}
          logo={modalConfig.appearance.logo || PlaceHolderLogo}
          theme={{
            ...modalConfig.appearance.theme,
            mode: calculateBrightness(modalConfig.appearance.theme.backgroundColor || '#ffffff') > 0.5 ? 'light' : 'dark',
            font: modalConfig.appearance.theme.font ?? 'Inter',
          }}
          oAuthMethods={modalConfig.authentication.oAuthMethods}
          disableEmailLogin={modalConfig.authentication.disableEmailLogin}
          disablePhoneLogin={modalConfig.authentication.disablePhoneLogin}
          authLayout={modalConfig.authentication.authLayout}
          externalWallets={modalConfig.authentication.externalWallets}
          twoFactorAuthEnabled={modalConfig.security.twoFactorAuthEnabled}
          recoverySecretStepEnabled={modalConfig.security.recoverySecretStepEnabled}
          hideWallets={modalConfig.wallets.hideWallets}
          onRampTestMode={modalConfig.onRamps.onRampTestMode}
          className={view === 'mobile' ? 'force-mobile-media include-mobile-styling' : ''}
        />
      </ModalContainer>
      <StyledIPhoneImage $isMobile={view === 'mobile'} src={iPhoneImage} alt="iPhone" />
    </IPhoneOuterContainer>
  );
};

const IPhoneOuterContainer = styled.div<{ $isMobile: boolean }>`
  ${({ $isMobile }) =>
    $isMobile
      ? `
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    width: 100%;
    height: 100%;
  `
      : `
      scrollbar-color: rgba(0, 0, 0, 0.2);
    width: 100%;
    display: flex;
        align-items: center;

    flex-direction: column;
      overflow-y: scroll;
      padding: 0 0 4rem;

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 0.25rem;
  }
      `}
`;

const StyledIPhoneImage = styled.img<{ $isMobile?: boolean }>`
  ${({ $isMobile }) =>
    $isMobile
      ? `
      display: block;
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2;
    `
      : `
      display: none;
      `}
`;

const ModalContainer = styled.div<{ $isMobile?: boolean }>`
  ${({ $isMobile }) =>
    $isMobile
      ? `
    position: absolute;
    width: 393px;
    bottom: 15px;
    left: 50%;
    transform: translateX(-50%);
    overflow: hidden;
    z-index: 3;
    cpsl-auth-modal {
      --container-width: 100%;
    }
    cpsl-auth-modal::part(modal-body-card) {
      --card-border-radius-bl: 3.3125rem;
      --card-border-radius-br: 3.3125rem;
    }
  `
      : `
      padding: 0 0 2rem;
      `}
`;
