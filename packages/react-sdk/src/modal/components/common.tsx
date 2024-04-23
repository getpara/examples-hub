import { CpslIcon, CpslInput, CpslText } from '@usecapsule/react-components';
import styled from 'styled-components';

export const SpinnerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  padding: 16px 0px;
  margin: 4px 0px;
`;

export const Hero: typeof CpslIcon = styled(CpslIcon)`
  box-sizing: content-box;
  align-self: center;
  --height: 64px;
  --width: 64px;
  --icon-fill-color: var(--cpsl-color-foreground-0);

  padding: 16px 0px;
  margin: 4px 0px;
`;

export const HeroNoSpacing: typeof CpslIcon = styled(Hero)`
  padding: 0px;
  margin: 0px;
`;

export const Heading: typeof CpslText = styled(CpslText)`
  text-align: center;
  font-size: 24px;
  line-height: 28px;
  font-weight: 500;
  letter-spacing: 0.72px;
`;

export const Text: typeof CpslText = styled(CpslText)`
  text-align: center;
  font-size: 14px;
  line-height: 20px;
  white-space: pre-line;
`;

export const SecondaryText: typeof CpslText = styled(Text)`
  color: var(--cpsl-color-text-secondary);
`;

export const CreationStepSubheading: typeof CpslText = styled(SecondaryText)`
  max-width: 214px;
`;

export const ClickableText: typeof CpslText = styled(Text)`
  cursor: pointer;
`;

export const MainContainer = styled.div`
  align-self: center;
  padding: 0px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

export const QRContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 252px;
`;

export const ButtonWithIconContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  height: 18px;

  cpsl-icon {
    --icon-color: var(--cpsl-color-text-inverted);
  }
`;

export const InfoBoxContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const InfoBoxHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  cpsl-icon {
    --height: 20px;
    --width: 20px;
  }
`;

export const InfoBoxHeading: typeof CpslText = styled(CpslText)`
  font-size: 16px;
  line-height: 18px;
  font-weight: 500;
`;

export const InfoBoxText: typeof CpslText = styled(SecondaryText)`
  text-align: left;
  font-weight: 500;
`;

export const FilledDisabledInput: typeof CpslInput = styled(CpslInput)`
  --container-border-color: var(--cpsl-color-input-border-placeholder);
`;
