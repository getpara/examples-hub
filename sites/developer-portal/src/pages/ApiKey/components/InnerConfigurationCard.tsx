import { CpslRadio } from '@usecapsule/react-components';
import { PropsWithChildren } from 'react';
import styled from 'styled-components';
import { SplitCard, SplitCardInnerContainer } from '../../../components/SplitCard/SplitCard';

interface ConfigurationContentCardProps extends PropsWithChildren {
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const InnerConfigurationCard = ({ isSelectable, isSelected, onSelect, children }: ConfigurationContentCardProps) => {
  return (
    <SplitCard
      isSelected={isSelected}
      flexRow
      onClick={onSelect}
      LeftContent={
        isSelectable ? (
          <RadioContainer>
            <CpslRadio checked={isSelected} />
          </RadioContainer>
        ) : undefined
      }
      RightContent={<SplitCardInnerContainer>{children}</SplitCardInnerContainer>}
    />
  );
};

const RadioContainer = styled(SplitCardInnerContainer)`
  flex: 0;
`;
