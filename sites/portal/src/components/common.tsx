import { CpslIcon, CpslInput, CpslText, CpslCard } from '@usecapsule/react-components';
import { styled } from 'styled-components';

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
  box-sizing: content-box;
  align-self: center;
  --height: 64px;
  --width: 64px;

  padding: 8px 0px;
  margin: 16px 0px;

  @media (max-width: 550px) {
    margin-top: 0px;
    padding-top: 0px;
  }
`;

export const Card = styled(CpslCard)`
  width: 100%;
  height: 100%;
  overflow: auto;

  &::part(card-container) {
    height: 100%;
    border-radius: 0px;
    padding-bottom: 0px;
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

export const capsuleBrandBorder = (width = '1px', radius = '16px') => `
  border: ${width} solid transparent;
  border-radius: ${radius};
  background-image: linear-gradient(var(--cpsl-color-background-0), var(--cpsl-color-background-8)),
    linear-gradient(to right, #fe5330, #9400db);
  background-origin: border-box;
  background-clip: padding-box, border-box;
`;
