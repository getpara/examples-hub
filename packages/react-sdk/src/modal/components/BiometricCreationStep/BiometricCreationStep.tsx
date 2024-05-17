import { CpslButton, CpslIcon, CpslQrCode, CpslSpinner, CpslTab, CpslTabs } from '@usecapsule/react-components';
import { useEffect, useState } from 'react';
import { useCapsuleStore, useModalStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import {
  Heading,
  SecondaryText,
  MainContainer,
  QRContainer,
  ButtonWithIconContainer,
  Hero,
  CreationStepSubheading,
  FilledDisabledInput,
} from '../common.js';
import { openPopup } from '../../utils/openPopup.js';
import { CpslTabsCustomEvent, TabsChangedEventDetail } from '@usecapsule/core-components';
import { styled } from 'styled-components';
import { isMobileBrowser } from '../../utils/isMobile.js';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard.js';

const SHORTENING_AVAILABLE = true;

export const BiometricCreationStep = ({ hasFinishedAnimation }: { hasFinishedAnimation: boolean }) => {
  const webAuthURLForCreate = useModalStore((state) => state.webAuthURLForCreate);
  const currentStep = useModalStore((state) => state.step);
  const setStep = useModalStore((state) => state.setStep);
  const capsule = useCapsuleStore((state) => state.capsule);
  const [copied, copy] = useCopyToClipboard();

  const [tab, setTab] = useState<'desktop' | 'phone'>('desktop');
  const [shortLoginLink, setShortLoginLink] = useState<string>();

  const isMobile = isMobileBrowser();

  useEffect(() => {
    if (currentStep !== ModalStep.BIOMETRIC_LOGIN) {
      setShortLoginLink(null);
    }
    if (!webAuthURLForCreate) {
      return;
    }

    async function shortenUrl() {
      const shortUrl = await capsule.shortenLoginLink(webAuthURLForCreate);
      setShortLoginLink(shortUrl);
    }
    if (SHORTENING_AVAILABLE) {
      shortenUrl();
    } else {
      setShortLoginLink(webAuthURLForCreate);
    }
  }, [webAuthURLForCreate]);

  const handlePasskeyClick = () => {
    openPopup(shortLoginLink, 'CapsulePasskey', 'CREATE_PASSKEY');
    setStep(ModalStep.AWAITING_BIOMETRIC_CREATION);
  };

  const handleTabChanged = (event: CpslTabsCustomEvent<TabsChangedEventDetail>) => {
    setTab(event.detail.tab as 'desktop' | 'phone');
  };

  const handleCopy = () => {
    copy(shortLoginLink);
  };

  return (
    <>
      <Hero icon="heroPasskey" />
      <MainContainer>
        <Heading>
          <span>Create Passkey</span>
        </Heading>
        <CreationStepSubheading>
          <span>
            {isMobile
              ? 'A Passkey will be created and stored on this device.'
              : 'You can create a Passkey on this device or your phone.'}
          </span>
        </CreationStepSubheading>
      </MainContainer>
      {!isMobile && (
        <TabsContainer>
          <CpslTabs selectedTab={hasFinishedAnimation ? tab : ''} onCpslTabsChanged={handleTabChanged} fullWidth>
            <CpslTab tab="desktop">Desktop</CpslTab>
            <CpslTab tab="phone">Phone</CpslTab>
          </CpslTabs>
        </TabsContainer>
      )}
      {tab === 'desktop' || isMobile ? (
        <CpslButton onClick={handlePasskeyClick}>
          <ButtonWithIconContainer>
            Add Passkey On This Device
            <CpslIcon icon="key" />
          </ButtonWithIconContainer>
        </CpslButton>
      ) : (
        <>
          <QRContainer>{!shortLoginLink ? <CpslSpinner /> : <CpslQrCode url={shortLoginLink} />}</QRContainer>
          <SecondaryText>
            <span>Scan with your phone’s camera</span>
          </SecondaryText>
        </>
      )}
      {isMobile && (
        <>
          <MobileSubHeading>
            <span>Or copy this link to a new device to set up a Passkey there.</span>
          </MobileSubHeading>
          <FilledDisabledInput disabled value={shortLoginLink} noAutoDisable>
            <CpslButton slot="end" variant="icon" onClick={handleCopy}>
              <CpslIcon icon={copied ? 'check' : 'copy'} />
            </CpslButton>
          </FilledDisabledInput>
        </>
      )}
    </>
  );
};

const TabsContainer = styled.div`
  align-self: center;
  width: 218px;
  max-width: 218px;
`;

const MobileSubHeading = styled(SecondaryText)`
  align-self: center;
  width: 220px;
`;
