import { CpslButton, CpslCard, CpslText } from '@usecapsule/react-components';
import styled from 'styled-components';
import { BRAND_COLORS, MOBILE_SIZE } from '../utils/constants';
import { Environment } from '../types/environment';
import { getKeyColor } from '../utils/apiKey';

export const LINEAR_GRADIENT = `linear-gradient(
  90deg,
  ${BRAND_COLORS.primary} 0%,
  ${BRAND_COLORS.secondary} 100%
)`;

export const HOVER_LINEAR_GRADIENT = `linear-gradient(
  0deg,
  rgba(255, 255, 255, 0.2) 0%,
  rgba(255, 255, 255, 0.2) 100%
),${LINEAR_GRADIENT}`;

export const PageContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: auto;

  @media (max-width: ${MOBILE_SIZE}px) {
    padding: 0px;
  }
  @media (min-width: ${MOBILE_SIZE + 1}px) {
    padding: 16px 24px;
  }
`;

export const PageInnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;
  gap: 24px;
  max-width: 1000px;
`;

export const GradientButton = styled(CpslButton)`
  --button-primary-background-color: ${LINEAR_GRADIENT};

  --button-primary-hover-background-color: ${HOVER_LINEAR_GRADIENT};

  --button-primary-active-background-color: ${HOVER_LINEAR_GRADIENT};
`;

export const GradientText = styled(CpslText)`
  background: ${LINEAR_GRADIENT};
  background-clip: text;
  &::part(text-element) {
    color: transparent;
  }
`;

export const EnvIcon = styled.span<{ $environment: Environment }>`
  width: 10px;
  height: 10px;
  border-radius: 10px;

  background-color: ${({ $environment }) => getKeyColor($environment)};
`;

export const BaseCard = styled(CpslCard)`
  @media (max-width: ${MOBILE_SIZE}px) {
    --card-padding-start: 16px;
    --card-padding-end: 16px;
    --card-padding-top: 16px;
    --card-padding-bottom: 16px;
  }
`;

export const InlineText = styled(CpslText)`
  display: inline-block;
`;

export const CapitalizedText = styled(CpslText)`
  text-transform: capitalize;
`;

export const CenteredText = styled(CpslText)`
  text-align: center;
`;
