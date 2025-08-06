import { safeStyled } from '@getpara/react-common';
import { Heading, InnerStepContainer } from '../common.js';
import { CpslText } from '@getpara/react-components';
import { useAddFunds } from './AddFundsContext.js';
import { useModalStore } from '../../stores/index.js';
import { useStore } from '../../../provider/stores/useStore.js';
import { motion, AnimatePresence } from 'framer-motion';
import { OnRampProviderButton } from '../OnRampComponents/OnRampProviderButton.js';
import { useWallet } from '../../../provider/index.js';
import { EnabledFlow, OnRampPurchaseType } from '@getpara/web-sdk';
import { contentMotionProps } from './common.js';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';

export function AddFundsProvider() {
  const para = useInternalClient();
  const hideWallets = useStore(state => state.modalConfig?.hideWallets);
  const onRampConfig = useModalStore(state => state.onRampConfig);
  const setOnRampPurchase = useModalStore(state => state.setOnRampPurchase);
  const { asset, network, fiatQuantity, isProviderAllowed, tab } = useAddFunds();
  const { data: activeWallet } = useWallet();

  return (
    <Container {...contentMotionProps}>
      <Heading>Choose Provider</Heading>
      <$InnerStepContainer>
        <NoProviders isHidden={Object.values(isProviderAllowed).some(v => !!v)} variant="bodyM">
          No providers are available for this {hideWallets ? 'account' : 'wallet'}
        </NoProviders>
        <AnimatePresence>
          {onRampConfig
            ? onRampConfig.providers.map((id, index) => {
                return isProviderAllowed[id] ? (
                  <motion.div
                    key={id}
                    style={{ width: '100%' }}
                    layout
                    initial={{ opacity: 0, transform: 'translateX(25px)' }}
                    animate={{ opacity: 1, transform: 'none' }}
                    exit={{ opacity: 0, transform: 'translateX(-25px)' }}
                    transition={{ duration: 0.2 }}
                  >
                    <OnRampProviderButton
                      config={onRampConfig}
                      index={index}
                      key={id}
                      onClick={async () => {
                        if (!activeWallet?.type) return;

                        const { onRampPurchase: newOnRampPurchase } = await para.initiateOnRampTransaction({
                          walletId: activeWallet.isExternal ? undefined : activeWallet.id,
                          externalWalletAddress: activeWallet.isExternal ? activeWallet.id : undefined,
                          shouldOpenPopup: true,
                          params: {
                            type: tab === EnabledFlow.BUY ? OnRampPurchaseType.BUY : OnRampPurchaseType.SELL,
                            walletType: activeWallet.type,
                            provider: id,
                            network,
                            asset,
                            fiatQuantity,
                            testMode: onRampConfig?.testMode,
                          },
                        });

                        setOnRampPurchase({ ...newOnRampPurchase, fiat: 'USD' });
                      }}
                    />
                  </motion.div>
                ) : null;
              })
            : null}
        </AnimatePresence>
      </$InnerStepContainer>
    </Container>
  );
}

const Container = safeStyled(motion.div)`
  width: 100%;
  height: 100%;
  align-self: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 320px;
`;

const $InnerStepContainer = safeStyled(InnerStepContainer)`
  position: relative;
`;

const NoProviders = safeStyled(CpslText)<{ isHidden?: boolean }>`
  width: 100%;
  text-align: center;
  visibility: ${({ isHidden }) => (isHidden ? 'hidden' : 'visible')};
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  transition: visibility 0.2s;
`;
