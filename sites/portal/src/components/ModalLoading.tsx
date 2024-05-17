import { styled } from 'styled-components';
import { Heading, Subheading } from './common';
import { CpslSpinner } from '@usecapsule/react-components';

interface ModalLoadingProps {
  heading: string;
}

export const ModalLoading = ({ heading }: ModalLoadingProps) => {
  return (
    <>
      <SpinnerContainer>
        <CpslSpinner />
      </SpinnerContainer>
      <Heading>
        <span>{heading}</span>
      </Heading>
      <Subheading>
        <span>Follow the prompts presented by your browser.</span>
      </Subheading>
    </>
  );
};

const SpinnerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px 0px;
  padding: 8px 0px;

  @media (max-width: 550px) {
    margin-top: 0px;
    padding-top: 0px;
  }
`;
