import {
  CpslIcon,
  CpslInfoBox,
  CpslSpinner,
} from '@usecapsule/react-components';
import {
  Heading,
  CreationStepSubheading,
  MainContainer,
  SpinnerContainer,
  InfoBoxContent,
  InfoBoxHeader,
  InfoBoxHeading,
  InfoBoxText,
} from '../common.js';
import { useEffect, useRef, useState } from 'react';

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
    <>
      <SpinnerContainer>
        <CpslSpinner />
      </SpinnerContainer>
      <MainContainer>
        <Heading>
          <span>Creating Wallet...</span>
        </Heading>
        <CreationStepSubheading>
          <span>This typically only takes a second.</span>
        </CreationStepSubheading>
      </MainContainer>
      {showInfoBox && (
        <CpslInfoBox>
          <InfoBoxContent>
            <InfoBoxHeader>
              <CpslIcon icon="clock" />
              <InfoBoxHeading>
                <span>Hang on</span>
              </InfoBoxHeading>
            </InfoBoxHeader>
            <InfoBoxText>
              <span>
                Creating your wallet is taking a little longer than expected,
                but we’re working on it!
              </span>
            </InfoBoxText>
          </InfoBoxContent>
        </CpslInfoBox>
      )}
    </>
  );
};
