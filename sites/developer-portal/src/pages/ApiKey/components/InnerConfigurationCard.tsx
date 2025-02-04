import { CpslRadio } from '@getpara/react-components';
import { PropsWithChildren } from 'react';
import styled from 'styled-components';
import { SplitCard, SplitCardInnerContainer } from '../../../components/SplitCard/SplitCard';

interface ConfigurationContentCardProps extends PropsWithChildren {
  isSelectable?: boolean;
  isSelected?: boolean;
  wideGap?: boolean;
  onSelect?: () => void;
}

export const InnerConfigurationCard = ({
  isSelectable,
  isSelected,
  wideGap,
  onSelect,
  children,
}: ConfigurationContentCardProps) => {
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
      RightContent={<StyledSplitCardInnerContainer $wideGap={wideGap}>{children}</StyledSplitCardInnerContainer>}
    />
  );
};

const StyledSplitCardInnerContainer = styled(SplitCardInnerContainer)<{ $wideGap?: boolean }>`
  gap: ${({ $wideGap }) => ($wideGap ? '16px' : '8px')};
`;

const RadioContainer = styled(SplitCardInnerContainer)`
  flex: 0;
`;
