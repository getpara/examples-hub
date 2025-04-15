import { EnabledFlow } from '@getpara/web-sdk';
import { CpslTabsCustomEvent, TabsChangedEventDetail } from '@getpara/core-components';
import { InnerStepContainer, StepContainer } from '../common.js';
import { CpslIcon, CpslSpinner, CpslTab, CpslTabs } from '@getpara/react-components';
import { OnRampStep } from '../../stores/index.js';
import { useModalStore } from '../../stores/modal/useModalStore.js';
import { useEffect, useMemo } from 'react';
import { getAddFundsStep } from '../../utils/steps.js';
import styled from 'styled-components';
import { useWallet } from '../../../provider/index.js';
import { AddFundsProvider } from './AddFundsProvider.js';
import { AddFundsReceive } from './AddFundsReceive.js';
import { AddFundsContextProvider, Tab, TABS } from './AddFundsContext.js';
import { AnimatePresence } from 'framer-motion';
import { AddFundsSettings } from './AddFundsSettings.js';

export const AddFunds = () => {
  const onRampConfig = useModalStore(state => state.onRampConfig);
  const onRampStep = useModalStore(state => state.onRampStep);
  const storedTab = useModalStore(state => state.accountAddFundTab);
  const setModalStep = useModalStore(state => state.setStep);
  const setOnRampPurchase = useModalStore(state => state.setOnRampPurchase);

  const { data: activeWallet } = useWallet();

  const tabs = TABS.filter(([, key]) => !!onRampConfig?.[key]);
  const tab = storedTab ?? tabs[0][0];
  const isMultiFlow = tabs.length > 1;

  const onSetTab = (event: CpslTabsCustomEvent<TabsChangedEventDetail>) => {
    setModalStep(getAddFundsStep(event.detail.tab as Tab));
  };

  const Content = useMemo(() => {
    switch (tab) {
      case EnabledFlow.BUY:
      case EnabledFlow.WITHDRAW: {
        switch (onRampStep) {
          case OnRampStep.SETTINGS:
            return <AddFundsSettings />;
          case OnRampStep.PROVIDER:
            return <AddFundsProvider />;
        }
      }
      default:
        return <AddFundsReceive />;
    }
  }, [onRampStep, tab]);

  useEffect(() => {
    setOnRampPurchase(undefined);
  }, []);

  if (!onRampConfig || !activeWallet) {
    return (
      <SpinnerContainer>
        <CpslSpinner />
      </SpinnerContainer>
    );
  }

  return (
    <StepContainer>
      {isMultiFlow && (
        <InnerStepContainer>
          <CpslTabs selectedTab={tab} onCpslTabsChanged={onSetTab}>
            {TABS.map(([tab, _, icon, title]) => (
              <CpslTab key={tab} tab={tab}>
                <CpslIcon slot="start" icon={icon} />
                {title}
              </CpslTab>
            ))}
          </CpslTabs>
        </InnerStepContainer>
      )}
      <AnimatePresence mode="wait">
        <AddFundsContextProvider data-testid="add-funds" tab={tab}>
          {Content}
        </AddFundsContextProvider>
      </AnimatePresence>
    </StepContainer>
  );
};

const SpinnerContainer = styled(StepContainer)`
  margin: 50% 0;
`;
