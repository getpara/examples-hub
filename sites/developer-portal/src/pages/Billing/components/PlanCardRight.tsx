import styled from 'styled-components';
import { PlanIncludes } from '../../../types/plan';
import { CpslIcon, CpslText } from '@usecapsule/react-components';
import { BRAND_COLORS } from '../../../utils/constants';

type PlanCardRightProps = PlanIncludes;

export const PlanCardRight = ({ title, subtitle, includes, comingSoon }: PlanCardRightProps) => {
  return (
    <Container>
      <CpslText variant="bodyS" weight="semiBold">
        {title}
      </CpslText>
      {subtitle && (
        <CpslText variant="bodyS" color="secondary">
          {subtitle}
        </CpslText>
      )}
      {includes.map(item => (
        <IncludesContainer key={item}>
          <CheckIcon icon="check" />
          <CpslText variant="bodyS" color="secondary">
            {item}
          </CpslText>
        </IncludesContainer>
      ))}
      {!!comingSoon?.length && (
        <>
          <ComingSoonText variant="bodyS" weight="semiBold">
            Coming Soon
          </ComingSoonText>
          {comingSoon.map(item => (
            <CpslText key={item} variant="bodyS" color="tertiary">
              {item}
            </CpslText>
          ))}
        </>
      )}
    </Container>
  );
};

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const IncludesContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ComingSoonText = styled(CpslText)`
  color: ${BRAND_COLORS.primary};
`;

const CheckIcon = styled(CpslIcon)`
  --height: 16px;
  --width: 16px;
`;
