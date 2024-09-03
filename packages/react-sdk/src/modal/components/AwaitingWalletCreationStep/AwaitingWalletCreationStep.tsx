import { CpslIcon, CpslInfoBox, CpslText } from '@usecapsule/react-components';
import { InfoBoxContent, InfoBoxHeader, StepContainer } from '../common.js';
import { useEffect, useRef, useState } from 'react';
import { Waiting } from '../Waiting/Waiting.js';

export const AwaitingWalletCreationStep = () => {
  const [showInfoBox, setShowInfoBox] = useState(false);
  const showInfoBoxTimeout = useRef<number>();

  useEffect(() => {
    showInfoBoxTimeout.current = window.setTimeout(() => {
      setShowInfoBox(true);
    }, 4000);

    return () => clearTimeout(showInfoBoxTimeout.current);
  }, []);

  return (
    <StepContainer $wide>
      <Waiting heading="Creating Your Wallet" subheading="This should only take a couple of seconds." />
      {showInfoBox && (
        <CpslInfoBox>
          <InfoBoxContent>
            <InfoBoxHeader>
              <CpslIcon icon="clock" />
              <CpslText weight="medium">Hang on</CpslText>
            </InfoBoxHeader>
            <CpslText variant="bodyS" weight="medium" color="secondary">
              Creating your wallet is taking a little longer than expected, but we’re working on it!
            </CpslText>
          </InfoBoxContent>
        </CpslInfoBox>
      )}
    </StepContainer>
  );
};
