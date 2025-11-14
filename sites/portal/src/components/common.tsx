import { CpslIcon, CpslInput, CpslText, CpslCard } from '@getpara/react-components';
import { styled } from 'styled-components';
import { isIFramed } from '../utils/isIFramed';

export const Heading: typeof CpslText = styled(CpslText)`
  text-align: center;
  font-size: 32px;
  line-height: 40px;
  font-weight: 500;
  letter-spacing: 0.96px;
`;

export const Text: typeof CpslText = styled(CpslText)`
  text-align: center;
  font-size: 16px;
  line-height: 24px;
  white-space: pre-line;
  &::part(text-element) {
    color: var(--cpsl-color-text-secondary);
  }
`;

export const Link = styled.a`
  color: var(--cpsl-color-text-secondary);
`;

export const Subheading: typeof CpslText = styled(Text)`
  width: 306px;
`;

export const StyledStrong = styled.strong`
  font-weight: 600;
`;

export const ButtonIcon: typeof CpslIcon = styled(CpslIcon)`
  display: flex;
  align-items: center;
  --height: 20px;
  --width: 20px;
`;

export const HeroIcon: typeof CpslIcon = styled(CpslIcon)`
  --height: 80px;
  --width: 80px;
  --icon-color: var(--cpsl-color-text-primary);
`;

export const Card = styled(CpslCard)`
  width: 100%;
  height: 100%;
  overflow: auto;

  &::part(card-container) {
    --card-padding-start: ${() => (!isIFramed ? '16px' : '0px')};
    --card-padding-end: ${() => (!isIFramed ? '16px' : '0px')};
    height: 100%;
    border-radius: 0px;
    padding-bottom: 0px;
    padding-top: ${() => (!isIFramed ? '24px' : '0px')};
    border: none;
  }
`;

export const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const FilledDisabledInput: typeof CpslInput = styled(CpslInput)`
  --container-border-color: var(--cpsl-color-input-border-placeholder);
  width: 334px;
`;

export const paraBrandBorder = (width = '1px', radius = '16px') => `
  border: ${width} solid transparent;
  border-radius: ${radius};
  background-image: linear-gradient(var(--cpsl-color-background-0), var(--cpsl-color-background-8)),
    linear-gradient(to right, #fe5330, #9400db);
  background-origin: border-box;
  background-clip: padding-box, border-box;
`;

export const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
`;

export const FlexStartInnerContainer = styled(InnerContainer)`
  margin-top: 24px;
  justify-content: flex-start;
  height: 100%;
  max-width: 382px;
  width: 100%;
`;
