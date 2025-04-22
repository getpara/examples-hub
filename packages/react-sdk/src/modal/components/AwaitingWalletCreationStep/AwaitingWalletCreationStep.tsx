import { CpslIcon, CpslInfoBox, CpslText } from '@getpara/react-components';
import { InfoBoxContent, InfoBoxHeader, StepContainer } from '../common.js';
import { useEffect, useRef, useState } from 'react';
import { Waiting } from '../Waiting/Waiting.js';
import { useStore } from '../../../provider/stores/useStore.js';
import { useAccount } from '../../../provider/index.js';

type Props = {
  isGuestMode?: boolean;
};

export const AwaitingWalletCreationStep = ({ isGuestMode = false }: Props) => {
  const hideWallets = useStore(state => state.modalConfig?.hideWallets);
  const [showInfoBox, setShowInfoBox] = useState(false);
  const showInfoBoxTimeout = useRef<number>();
  const { data: account } = useAccount();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      showInfoBoxTimeout.current = window.setTimeout(() => {
        setShowInfoBox(true);
      }, 4000);
    }

    return () => clearTimeout(showInfoBoxTimeout.current);
  }, []);

  return (
    <StepContainer $wide>
      <Waiting
        heading={
          isGuestMode
            ? 'Creating Guest Account'
            : account?.isGuestMode
              ? hideWallets
                ? 'Linking Guest Account'
                : 'Linking Guest Wallet'
              : hideWallets
                ? 'Creating Your Account'
                : 'Creating Your Wallet'
        }
        subheading="This should only take a couple of seconds."
      />
      {showInfoBox && (
        <CpslInfoBox>
          <InfoBoxContent>
            <InfoBoxHeader>
              <CpslIcon icon="clock" />
              <CpslText weight="medium">Hang on</CpslText>
            </InfoBoxHeader>
            <CpslText variant="bodyS" weight="medium" color="secondary">
              Creating your {hideWallets ? 'account' : 'wallet'} is taking a little longer than expected, but we're working
              on it!
            </CpslText>
          </InfoBoxContent>
        </CpslInfoBox>
      )}
    </StepContainer>
  );
};
