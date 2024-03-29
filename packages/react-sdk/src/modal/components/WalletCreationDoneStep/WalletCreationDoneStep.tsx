import {
  CpslButton,
  CpslIcon,
  CpslInfoBox,
} from '@usecapsule/react-components';
import {
  Heading,
  MainContainer,
  InfoBoxContent,
  InfoBoxHeader,
  InfoBoxHeading,
  InfoBoxText,
  Hero,
  Text,
  ButtonWithIconContainer,
} from '../common';
import { useModalStore, useUserInfoStore } from '../../stores';
import { ModalStep } from '../../utils/steps';

export const WalletCreationDoneStep = () => {
  const setStep = useModalStore((state) => state.setStep);
  const email = useUserInfoStore((state) => state.email);

  const handleNext = () => {
    setStep(ModalStep.SECRET);
  };

  return (
    <>
      <Hero icon="heroWallet" />
      <MainContainer>
        <Heading>
          <span>Wallet Created!</span>
        </Heading>
      </MainContainer>
      <CpslInfoBox>
        <InfoBoxContent>
          <InfoBoxHeader>
            <CpslIcon icon="backupKit" />
            <InfoBoxHeading>
              <span>Backup Kit</span>
            </InfoBoxHeading>
          </InfoBoxHeader>
          <InfoBoxText>
            <span>
              We emailed your backup kit to{'\n'}
              <Text>
                <span>{email}</span>
              </Text>
            </span>
          </InfoBoxText>
        </InfoBoxContent>
      </CpslInfoBox>
      <CpslButton onClick={handleNext}>
        <ButtonWithIconContainer>
          Continue
          <CpslIcon icon="arrowNarrow" />
        </ButtonWithIconContainer>
      </CpslButton>
    </>
  );
};
