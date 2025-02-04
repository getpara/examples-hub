import { CpslIcon, CpslInput, CpslText, CpslTileButton } from '@getpara/react-components';
import { styled } from 'styled-components';

export const SpinnerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const QRContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 286px;
  height: 286px;
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

export const FilledDisabledInput: typeof CpslInput = styled(CpslInput)`
  --container-border-color: var(--cpsl-color-input-border-placeholder);
  --container-background-color: var(--cpsl-color-background-0);
  --input-background-color: transparent;
  --input-font-weight: 500;
  --input-color: var(--cpsl-color-text-secondary);
`;

export const FullWidthFilledDisabledInput: typeof CpslInput = styled(FilledDisabledInput)`
  width: 100%;
`;

export const CenteredText: typeof CpslText = styled(CpslText)`
  width: 100%;
  text-align: center;
`;

export const InnerStepContainer = styled.div`
  width: 100%;
  height: 100%;
  align-self: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

export const StepContainer = styled(InnerStepContainer)<{ $wide?: boolean }>`
  gap: ${({ $wide }) => ($wide ? '32px' : '24px')};
`;

export const Heading: typeof CpslText = styled(CenteredText)``;

export const StyledCpslTileButton: typeof CpslTileButton = styled(CpslTileButton)`
  --button-width: 100%;
  --button-height: 87px;
  --button-icon-height: 32px;
  --button-icon-width: 32px;
`;

export const HeroIcon = styled(CpslIcon)`
  --height: 80px;
  --width: 80px;
  --icon-color: var(--cpsl-color-text-primary);
`;
