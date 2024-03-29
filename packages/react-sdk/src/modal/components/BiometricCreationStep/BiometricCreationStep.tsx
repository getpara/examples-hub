import {
  CpslButton,
  CpslIcon,
  CpslQrCode,
  CpslSpinner,
  CpslTab,
  CpslTabs,
} from '@usecapsule/react-components';
import { useEffect, useState } from 'react';
import { useCapsuleStore, useModalStore } from '../../stores';
import { ModalStep } from '../../utils/steps';
import {
  Heading,
  SecondaryText,
  MainContainer,
  QRContainer,
  ButtonWithIconContainer,
  Hero,
  CreationStepSubheading,
} from '../common';
import { openPopup } from '../../utils/openPopup';
import {
  CpslTabsCustomEvent,
  TabsChangedEventDetail,
} from '@usecapsule/core-components';
import styled from 'styled-components';

const SHORTENING_AVAILABLE = true;

export const BiometricCreationStep = ({
  hasFinishedAnimation,
}: {
  hasFinishedAnimation: boolean;
}) => {
  const webAuthURLForCreate = useModalStore(
    (state) => state.webAuthURLForCreate,
  );
  const currentStep = useModalStore((state) => state.step);
  const setStep = useModalStore((state) => state.setStep);
  const capsule = useCapsuleStore((state) => state.capsule);

  const [tab, setTab] = useState<'desktop' | 'phone'>('desktop');
  const [shortLoginLink, setShortLoginLink] = useState<string>();

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
    openPopup(shortLoginLink, 'CapsulePasskey');
    setStep(ModalStep.AWAITING_BIOMETRIC_CREATION);
  };

  const handleTabChanged = (
    event: CpslTabsCustomEvent<TabsChangedEventDetail>,
  ) => {
    setTab(event.detail.tab as 'desktop' | 'phone');
  };

  return (
    <>
      <Hero icon="heroPasskey" />
      <MainContainer>
        <Heading>
          <span>Create Passkey</span>
        </Heading>
        <CreationStepSubheading>
          <span>You can create a Passkey on this device or your phone.</span>
        </CreationStepSubheading>
      </MainContainer>
      <TabsContainer>
        <CpslTabs
          selectedTab={hasFinishedAnimation ? tab : ''}
          onCpslTabsChanged={handleTabChanged}
          fullWidth
        >
          <CpslTab tab="desktop">Desktop</CpslTab>
          <CpslTab tab="phone">Phone</CpslTab>
        </CpslTabs>
      </TabsContainer>
      {tab === 'desktop' ? (
        <CpslButton onClick={handlePasskeyClick}>
          <ButtonWithIconContainer>
            Add Passkey On This Device
            <CpslIcon icon="key" />
          </ButtonWithIconContainer>
        </CpslButton>
      ) : (
        <>
          <QRContainer>
            {!shortLoginLink ? (
              <CpslSpinner />
            ) : (
              <CpslQrCode url={shortLoginLink} />
            )}
          </QRContainer>
          <SecondaryText>
            <span>Scan with your phone’s camera</span>
          </SecondaryText>
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
