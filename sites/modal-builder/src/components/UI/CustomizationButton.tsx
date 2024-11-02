import React from 'react';
import styled from 'styled-components';
import { Text } from './StyledText';

interface CustomizationLinkProps {}

export const CustomizationLink: React.FC<CustomizationLinkProps> = () => {
  return (
    <ContainerLink>
      <GradientText variant="bodyM" weight="semiBold">
        Need More Customization?
      </GradientText>
      <Text variant="bodyS" weight="regular" color="secondary">
        You can use Capsule's SDK with your own UI components.{' '}
        <a
          href="https://docs.usecapsule.com/customize-capsule/required-customization"
          target="_blank"
          rel="noreferrer"
          style={{ color: 'black' }}
        >
          View Docs
        </a>
      </Text>
    </ContainerLink>
  );
};

const ContainerLink = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  gap: 0.25rem;
`;

const GradientText = styled(Text)`
  background: linear-gradient(90deg, #ff754a 0%, #9c1eff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
`;
