import { CpslButton, CpslInput, CpslText } from '@getpara/react-components';
import styled from 'styled-components';

export const SpinnerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const CenteredColumnContainer = styled.div`
  width: 100%;
  height: 100%;
  align-self: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

export const FilledDisabledInput: typeof CpslInput = styled(CpslInput)`
  --container-border-color: var(--cpsl-color-input-border-placeholder);
  --container-background-color: var(--cpsl-color-background-0);
  --input-background-color: transparent;
  --input-font-weight: 500;
  --input-color: var(--cpsl-color-text-secondary) !important;
`;

export const FullWidthFilledDisabledInput: typeof CpslInput = styled(FilledDisabledInput)`
  width: 100%;
`;

export const CenteredText: typeof CpslText = styled(CpslText)`
  width: 100%;
  text-align: center;
`;

export const HeaderButton = styled(CpslButton)`
  flex: 0;
  --button-padding-top: 2px;
  --button-padding-bottom: 2px;
  --button-padding-start: 2px;
  --button-padding-end: 2px;
  --button-border-radius: 1000px;
  --button-background-color: var(--cpsl-color-background-4);

  cpsl-icon {
    --height: 20px;
    --width: 20px;
  }
`;
