import styled from 'styled-components';
import { HeroIcon, InnerContainer } from './common';
import { CenteredText } from '@usecapsule/react-common';

interface ModalSuccessProps {
  heading: string;
  subHeading: string;
}

export const ModalSuccess = ({ heading, subHeading }: ModalSuccessProps) => {
  return (
    <InnerContainer>
      <HeroIcon icon="checkCircleFilled" />
      <TextContainer>
        <CenteredText weight="bold" variant="headingS">
          {heading}
        </CenteredText>
        <CenteredText weight="medium" variant="bodyS" color="secondary">
          {subHeading}
        </CenteredText>
      </TextContainer>
    </InnerContainer>
  );
};

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
`;
