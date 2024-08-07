import { Network, NetworkProp, OnRampConfig } from '@usecapsule/web-sdk';
import { CpslTabsCustomEvent, TabsChangedEventDetail } from '@usecapsule/core-components';
import { FilledDisabledInput, FlexColumn, Heading, QRContainer, SecondaryText } from '../common.js';
import styled from 'styled-components';
import { CpslAlert, CpslButton, CpslIcon, CpslQrCode, CpslSpinner, CpslTab, CpslTabs } from '@usecapsule/react-components';
import { useCapsuleStore, useModalStore, useThemeStore } from '../../stores/index.js';
import { NETWORKS, ON_RAMP_PROVIDERS } from '../../constants/constants.js';
import { ReactNode, useEffect, useState } from 'react';
import { ModalStep } from '../../utils/steps.js';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard.js';
import { OnRampConfigError, validateOnRampConfig } from '../../utils/validateOnRampConfig.js';

interface OnRampButtonProps {
  config: OnRampConfig;
  index: number;
  isLoading?: boolean;
}

type TabType = 'buy' | 'receive';

const TABS: Record<TabType, ReactNode> = {
  buy: 'Buy',
  receive: 'Receive',
};

function list(networks: Network[]) {
  return networks.length === 1
    ? NETWORKS[networks[0]]
    : `${networks
        .map(id => NETWORKS[id])
        .slice(0, -1)
        .join(', ')}${networks.length > 2 ? ',' : ''} and ${NETWORKS[networks[networks.length - 1]]}`;
}

const OnRamp = ({ config, index }: OnRampButtonProps) => {
  const capsule = useCapsuleStore(state => state.capsule);
  const setStep = useModalStore(state => state.setStep);
  const setOnRampPurchase = useModalStore(state => state.setOnRampPurchase);

  const [isLoading, setIsLoading] = useState(false);

  const provider = config.providers[index];
  const { feeLower, feeUpper, methods, name, icon } = ON_RAMP_PROVIDERS[provider.id];

  const onClick = async () => {
    setIsLoading(true);

    const newOnRampPurchase = await capsule.createOnRampPurchase(provider.id, config.network, config.asset, config.testMode);
    setOnRampPurchase(newOnRampPurchase);

    setStep(ModalStep.ADD_FUNDS_AWAITING);
  };

  useEffect(() => {
    setOnRampPurchase(undefined);
  }, []);

  return (
    <OnRampButton fullWidth variant="secondary" onClick={onClick}>
      <OnRampButtonContainer>
        <OnRampButtonUpper>
          <OnRampName>
            {icon}
            {name}
          </OnRampName>
          {isLoading ? <CpslSpinner size={24} /> : <RightArrowIcon icon="arrow" />}
        </OnRampButtonUpper>
        <OnRampButtonLower>
          <OnRampStat>
            Fee: {feeUpper !== undefined ? `${feeLower.toFixed(2)}-${feeUpper.toFixed(2)}%` : `${feeLower.toFixed(2)}%`}
          </OnRampStat>
          <OnRampStat>{methods.map(m => m.toString()).join(', ')}</OnRampStat>
          <OnRampStat>
            <CpslIcon icon="lightning" />
            Instant
          </OnRampStat>
        </OnRampButtonLower>
      </OnRampButtonContainer>
    </OnRampButton>
  );
};

export const AddFunds = ({ hasFinishedAnimation }: { hasFinishedAnimation: boolean; networks: NetworkProp[] }) => {
  const [isCopied, copy] = useCopyToClipboard();
  const appName = useThemeStore(state => state.appName);
  const capsule = useCapsuleStore(state => state.capsule);
  const onRampConfig = useModalStore(state => state.onRampConfig);
  const networks = useModalStore(state => state.networks);
  const isOnRampConfigured = onRampConfig?.providers.length > 0;

  const [tab, setTab] = useState<'buy' | 'receive'>(isOnRampConfigured ? 'buy' : 'receive');
  const [configError, setConfigError] = useState<OnRampConfigError | undefined>();

  const wallet = Object.values(capsule.getWallets())[0];

  const onSetTab = (event: CpslTabsCustomEvent<TabsChangedEventDetail>) => {
    setTab(event.detail.tab as TabType);
  };
  const onCopy = () => {
    copy(wallet.address);
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
    <>
      <FlexColumn style={{ width: '100%' }}>
        <Heading style={{ marginBottom: '12px' }}>
          <span>Fund Your Wallet</span>
        </Heading>
        {isOnRampConfigured && (
          <TabsContainer>
            <CpslTabs selectedTab={hasFinishedAnimation ? tab : ''} onCpslTabsChanged={onSetTab} fullWidth>
              {Object.entries(TABS).map(([tab, title]) => (
                <Tab key={tab} tab={tab}>
                  {title}
                </Tab>
              ))}
            </CpslTabs>
          </TabsContainer>
        )}
      </FlexColumn>
      <LowerContainer>
        {tab === 'buy' ? (
          configError ? (
            <CpslAlert>
              <div>
                There was an on-ramp configuration error when instantiating this Capsule Modal:
                <br />
                <br />
                <span style={{ fontFamily: 'monospace' }}>{configError.toString().split(': ').pop()}</span>
                <br />
                <br />
                If you are a user of {appName}, please contact support.
              </div>
            </CpslAlert>
          ) : (
            <OnRampContainer>
              <SecondaryText>
                <span>Choose a provider to fund your wallet.</span>
              </SecondaryText>
              {onRampConfig.providers.map((provider, index) => {
                return <OnRamp config={onRampConfig} index={index} key={provider.id} />;
              })}
            </OnRampContainer>
          )
        ) : (
          <>
            <SecondaryText>
              <span>Scan with your phone's camera</span>
            </SecondaryText>
            <QRContainer>
              <CpslQrCode url={wallet.address} />
            </QRContainer>
            <SecondaryText>
              <span>Or copy your wallet address</span>
            </SecondaryText>
            <AddressDisplay disabled value={wallet.address} noAutoDisable>
              <CpslButton slot="end" variant="ghost" onClick={onCopy}>
                <CpslIcon icon={isCopied ? 'check' : 'copy'} />
              </CpslButton>
            </AddressDisplay>
            <NetworkAlert>
              <NetworkAlertTitle>
                <NetworkAlertIcon icon="alertCircle" />
                <span>Supported Networks</span>
              </NetworkAlertTitle>
              <NetworkAlertText>
                Only assets on {list(networks)} are supported by {appName}.
              </NetworkAlertText>
            </NetworkAlert>
          </>
        )}
      </LowerContainer>
    </>
  );
};

const TabsContainer = styled.div`
  align-self: center;
  width: 100%;
`;

const LowerContainer = styled(FlexColumn)`
  width: 100%;

  & > * {
    width: 100%;
  }
`;

const Tab = styled(CpslTab)`
  width: 50%;
`;

const OnRampContainer = styled(FlexColumn)`
  gap: 12px;
`;

const OnRampButton = styled(CpslButton)`
  --button-padding-top: 16px;
  --button-padding-left: 16px;
  --button-padding-right: 16px;
  --button-padding-bottom: 16px;
  --button-box-shadow: none;
  --cpsl-color-secondary-button-border-default: var(--cpsl-color-background-16);
  --cpsl-color-secondary-button-surface-hover: var(--cpsl-color-foreground-96);
`;

const OnRampButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const OnRampButtonUpper = styled.div`
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const RightArrowIcon = styled(CpslIcon)`
  --icon-color: var(--);
`;

const OnRampButtonLower = styled.div`
  display: flex;
  justify-content: space-between;
`;

const OnRampName = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Inter', sans-serif;
`;

const OnRampStat = styled.div`
  display: flex;
  gap: 2px;
  align-items: center;
  font-size: 12px;

  cpsl-icon {
    --height: 12px;
    --width: 12px;
  }
`;

const AddressDisplay = styled(FilledDisabledInput)`
  --container-background-color: var(--cpsl-color-background-0);
  --input-background-color: transparent;
`;

const NetworkAlert = styled.div`
  color: var(--cpsl-color-foreground-0) !important;
  background-color: var(--cpsl-color-foreground-96);
  border-color: var(--cpsl-color-background-16) !important;
  border-radius: var(--cpsl-border-radius-alert);
  border: 1px solid;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const NetworkAlertTitle = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: flex-start;
  font-weight: 500;
`;

const NetworkAlertText = styled.div`
  font-size: 14px;
`;

const NetworkAlertIcon = styled(CpslIcon)`
  --width: 20px;
  --height: 20px;
`;
