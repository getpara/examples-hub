import { EnabledFlow } from '@usecapsule/web-sdk';
import { CpslTabsCustomEvent, TabsChangedEventDetail } from '@usecapsule/core-components';
import { CenteredText, FilledDisabledInput, Heading, InnerStepContainer, QRContainer, StepContainer } from '../common.js';
import {
  CpslAlert,
  CpslButton,
  CpslDivider,
  CpslIcon,
  CpslIdenticon,
  CpslQrCode,
  CpslSpinner,
  CpslTab,
  CpslTabs,
  CpslText,
} from '@usecapsule/react-components';
import { useCapsuleStore, useModalStore, useThemeStore } from '../../stores/index.js';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard.js';
import { OnRampConfigError, validateOnRampConfig } from '../../utils/validateOnRampConfig.js';
import { formatNetworkList } from '../../utils/stringFormatters.js';
import { OnRampProviderButton } from '../OnRampComponents/OnRampProviderButton.js';
import { isMobile } from '@usecapsule/web-sdk';
import { useActiveWallet } from '../../hooks/useActiveWallet.js';

interface AddFundsProps {
  hasFinishedAnimation: boolean;
}

export type Tab = EnabledFlow;

const TABS: [Tab, ReactNode][] = [
  [EnabledFlow.BUY, 'Buy'],
  [EnabledFlow.RECEIVE, 'Receive'],
];

export const AddFunds = ({ hasFinishedAnimation }: AddFundsProps) => {
  const [isCopied, copy] = useCopyToClipboard();
  const capsule = useCapsuleStore(state => state.capsule);
  const appName = useThemeStore(state => state.appName);
  const onRampConfig = useModalStore(state => state.onRampConfig);
  const accountAddFundTab = useModalStore(state => state.accountAddFundTab);
  const networks = useModalStore(state => state.networks);

  const activeWallet = useActiveWallet();

  const isAllFlows = !onRampConfig?.enabledFlows;
  const tabs = TABS.filter(([tab]) => isAllFlows || onRampConfig?.enabledFlows.some(prop => tab === EnabledFlow[prop]));
  const isMultiFlow = isAllFlows || tabs.length > 1;

  const [tab, setTab] = useState<Tab>(accountAddFundTab);
  const [configError, setConfigError] = useState<OnRampConfigError | undefined>();

  const address = useMemo(
    () => capsule.getDisplayAddress(activeWallet.id, { addressType: activeWallet.type }),
    [capsule, activeWallet?.id, activeWallet?.type],
  );

  const onSetTab = (event: CpslTabsCustomEvent<TabsChangedEventDetail>) => {
    setTab(event.detail.tab as Tab);
  };
  const onCopy = () => {
    copy(address);
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
      {isMultiFlow && (
        <InnerStepContainer>
          <CpslTabs selectedTab={hasFinishedAnimation ? tab : ''} onCpslTabsChanged={onSetTab}>
            {TABS.map(([tab, title]) => (
              <CpslTab key={tab} tab={tab}>
                <CpslIcon slot="start" icon={tab === EnabledFlow.BUY ? 'creditCard' : 'qrCode'} />
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
              <FilledDisabledInput key={address} readonly value={address}>
                <CpslIdenticon
                  slot="start"
                  variant="avatar"
                  size="32px"
                  hash={capsule.getIdenticonHash(activeWallet.id, activeWallet.type)}
                />
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
                    {!address ? <CpslSpinner size={100} /> : <CpslQrCode key={address} url={address} />}
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
