import { forwardRef, useEffect, useImperativeHandle } from 'react';
import { EnabledFlow, OnRampConfig } from '@getpara/web-sdk';
import { useModalStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { Body } from '../Body/Body.js';
import { Footer } from '../Footer/Footer.js';
import { ParaModalProps } from '../../types/modalProps.js';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';
import { useExternalWallets } from '../../../provider/providers/ExternalWalletProvider.js';

type ModalContentProps = Omit<
  ParaModalProps,
  'para' | 'isOpen' | 'theme' | 'branding' | 'onModalStepChange' | 'onExpandModalChange'
>;

export type ModalContentHandle = {
  /**
   * Trigger the modal close handler
   */
  handleModalClose: () => void;
};

export const ModalContent = forwardRef<ModalContentHandle, ModalContentProps>(
  (
    {
      twoFactorAuthEnabled = false,
      oAuthMethods,
      disableEmailLogin,
      disablePhoneLogin,
      isGuestModeEnabled = false,
      onClose,
      onRampTestMode,
    },
    ref,
  ) => {
    const para = useInternalClient();
    const refs = useModalStore(state => state.refs);
    const onRampConfig = useModalStore(state => state.onRampConfig);
    const setOnRampConfig = useModalStore(state => state.setOnRampConfig);
    const accountAddFundTab = useModalStore(state => state.accountAddFundTab);
    const setAccountAddFundTab = useModalStore(state => state.setAccountAddFundTab);
    const { disconnectExternalWallet } = useExternalWallets();

    useImperativeHandle(ref, () => {
      return {
        handleModalClose() {
          handleClose();
        },
      };
    }, []);

    const handleClose = () => {
      onClose?.();
      if (refs.currentStep.current === ModalStep.EXTERNAL_WALLET_VERIFICATION && para.isExternalWalletAuth) {
        disconnectExternalWallet();
      }
    };

    useEffect(() => {
      if (!onRampConfig) {
        para.ctx.client
          .getOnRampConfig()
          .then(res => {
            let newOnRampConfig: OnRampConfig & { testMode?: boolean };

            newOnRampConfig = { ...res, testMode: onRampTestMode };

            setOnRampConfig(newOnRampConfig);

            if (!accountAddFundTab) {
              setAccountAddFundTab(
                newOnRampConfig.isBuyEnabled
                  ? EnabledFlow.BUY
                  : newOnRampConfig.isReceiveEnabled
                    ? EnabledFlow.RECEIVE
                    : newOnRampConfig.isWithdrawEnabled
                      ? EnabledFlow.WITHDRAW
                      : undefined,
              );
            }
          })
          .catch();
      }
    }, []);

    useEffect(() => {
      if (!!onRampConfig) {
        setOnRampConfig({ ...onRampConfig, testMode: onRampTestMode });
      }
    }, [onRampTestMode]);

    useEffect(() => {
      const init = async () => {
        if (!(await para.isFullyLoggedIn())) {
          // Disconnect external wallets if the user is no longer logged in
          await disconnectExternalWallet();
        }
      };

      init();
      return () => {
        window.clearTimeout(refs.poll.current?.timeout);
      };
    }, []);

    return (
      <>
        <Body
          oAuthMethods={oAuthMethods}
          twoFactorAuthEnabled={twoFactorAuthEnabled}
          disableEmailLogin={!!disableEmailLogin}
          disablePhoneLogin={!!disablePhoneLogin}
          isGuestModeEnabled={isGuestModeEnabled}
          onClose={handleClose}
        />
        <Footer />
      </>
    );
  },
);
