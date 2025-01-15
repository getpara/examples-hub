import styled from 'styled-components';
import { GradientCTAButton } from '../../../components/GradientCTAButton/GradientCTAButton';
import { CpslIcon, CpslText } from '@usecapsule/react-components';
import { ON_RAMP_DOCS_LINK } from '../../../utils/constants';

export const CTA = () => {
  return (
    <a style={{ width: '100%' }} href={ON_RAMP_DOCS_LINK} target="_blank">
      <GradientCTAButton fullWidth icon="stars01Filled" iconSize={16} gap={4}>
        <ButtonInnerContainer>
          <CpslText variant="bodyS" weight="semiBold" color="inverted">
            Now with On and Off Ramps
          </CpslText>
          <LearnMoreContainer>
            <CpslText variant="bodyS" weight="semiBold" color="inverted">
              Learn More
            </CpslText>
            <StyledIcon icon="chevronRight" />
          </LearnMoreContainer>
        </ButtonInnerContainer>
      </GradientCTAButton>
    </a>
  );
};

const ButtonInnerContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: space-between;
  align-items: center;
`;

const LearnMoreContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StyledIcon = styled(CpslIcon)`
  --icon-color: var(--cpsl-color-text-inverted);
  --height: 20px;
  --width: 20px;
`;
