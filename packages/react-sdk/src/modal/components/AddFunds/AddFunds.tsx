import { EnabledFlow } from '@usecapsule/web-sdk';
import { CpslTabsCustomEvent, TabsChangedEventDetail } from '@usecapsule/core-components';
import { CenteredText, FilledDisabledInput, Heading, InnerStepContainer, QRContainer, StepContainer } from '../common.js';
import {
  CpslAlert,
  CpslButton,
  CpslDivider,
  CpslIcon,
  CpslQrCode,
  CpslSpinner,
  CpslTab,
  CpslTabs,
  CpslText,
} from '@usecapsule/react-components';
import { useModalStore, useThemeStore } from '../../stores/index.js';
import { ReactNode, useEffect, useState } from 'react';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard.js';
import { OnRampConfigError, validateOnRampConfig } from '../../utils/validateOnRampConfig.js';
import { formatNetworkList } from '../../utils/stringFormatters.js';
import { OnRampProviderButton } from '../OnRampComponents/OnRampProviderButton.js';
import { useWallet } from '../../providers/WalletContext.js';
import { isMobile } from '@usecapsule/web-sdk';

export type Tab = EnabledFlow;

const TABS: [Tab, ReactNode][] = [
  [EnabledFlow.BUY, 'Buy'],
  [EnabledFlow.RECEIVE, 'Receive'],
];

interface AddFundsProps {
  hasFinishedAnimation: boolean;
}

export const AddFunds = ({ hasFinishedAnimation }: AddFundsProps) => {
  const [isCopied, copy] = useCopyToClipboard();
  const appName = useThemeStore(state => state.appName);
  const onRampConfig = useModalStore(state => state.onRampConfig);
  const networks = useModalStore(state => state.networks);

  const isAccount = useModalStore(state => state.isAccount());
  const accountAddFundTab = useModalStore(state => state.accountAddFundTab);
  const { wallet } = useWallet();

  const isAllFlows = !onRampConfig.enabledFlows;
  const tabs = TABS.filter(([tab]) => isAllFlows || onRampConfig.enabledFlows.some(prop => tab === EnabledFlow[prop]));
  const isMultiFlow = isAllFlows || tabs.length > 1;
  const defaultTab: Tab = tabs[0][0];

  const [_tab, setTab] = useState<Tab>(defaultTab);
  const [configError, setConfigError] = useState<OnRampConfigError | undefined>();

  const tab = isAccount ? accountAddFundTab : _tab;

  const onSetTab = (event: CpslTabsCustomEvent<TabsChangedEventDetail>) => {
    setTab(event.detail.tab as Tab);
  };
  const onCopy = () => {
    copy(wallet?.address);
  };

  useEffect(() => {
    try {
      validateOnRampConfig(onRampConfig);
      setConfigError(undefined);
    } catch (e) {
      setConfigError(e as OnRampConfigError);
    }
  }, [onRampConfig]);

  return (
    <StepContainer>
      {!isAccount && isMultiFlow && (
        <InnerStepContainer>
          <CpslTabs selectedTab={hasFinishedAnimation ? tab : ''} onCpslTabsChanged={onSetTab}>
            {Object.entries(tabs).map(([tab, title]) => (
              <CpslTab key={tab} tab={tab}>
                <CpslIcon slot="start" icon={tab === 'buy' ? 'creditCard' : 'qrCode'} />
                {title}
              </CpslTab>
            ))}
          </CpslTabs>
        </InnerStepContainer>
      )}
      <>
        {tab === EnabledFlow.BUY ? (
          <>
            {configError ? (
              <CpslAlert>
                <CpslText variant="bodyS">
                  There was an on-ramp configuration error when instantiating this Capsule Modal:
                  <br />
                  <br />
                  <span style={{ fontFamily: 'monospace' }}>{configError.toString().split(': ').pop()}</span>
                  <br />
                  <br />
                  If you are a user of {appName}, please contact support.
                </CpslText>
              </CpslAlert>
            ) : (
              <>
                <Heading variant="headingS" weight="bold">
                  Choose Provider
                </Heading>
                <InnerStepContainer>
                  {onRampConfig.providers.map((provider, index) => {
                    return <OnRampProviderButton config={onRampConfig} index={index} key={provider.id} />;
                  })}
                </InnerStepContainer>
              </>
            )}
          </>
        ) : (
          <>
            <InnerStepContainer>
              <CpslText weight="semiBold" color="secondary">
                Copy wallet address
              </CpslText>
              <FilledDisabledInput disabled value={wallet?.address} noAutoDisable>
                <CpslButton slot="end" variant="ghost" onClick={onCopy}>
                  <CpslIcon icon={isCopied ? 'check' : 'copy'} />
                </CpslButton>
              </FilledDisabledInput>
            </InnerStepContainer>
            {!isMobile() && (
              <>
                <CpslDivider>or</CpslDivider>
                <InnerStepContainer>
                  <CpslText weight="semiBold" color="secondary">
                    Scan with your crypto wallet
                  </CpslText>
                  <QRContainer>
                    {!wallet?.address ? <CpslSpinner size={100} /> : <CpslQrCode url={wallet?.address} />}
                  </QRContainer>
                </InnerStepContainer>
              </>
            )}
            <InnerStepContainer>
              <CenteredText weight="semiBold">{appName ?? 'This App'} Only Supports:</CenteredText>
              <CenteredText weight="medium" color="secondary">
                {formatNetworkList(networks)}
              </CenteredText>
            </InnerStepContainer>
          </>
        )}
      </>
    </StepContainer>
  );
};
