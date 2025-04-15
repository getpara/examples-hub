import { CpslIcon, CpslInput, CpslSelect, CpslSelectItem, CpslText, CpslTileButton } from '@getpara/react-components';
import { styled } from 'styled-components';
import { MOBILE_SIZE, NETWORKS, ON_RAMP_ASSETS } from '../constants/constants.js';
import { Network, OnRampAsset } from '@getpara/web-sdk';
import { useStore } from '../../provider/stores/useStore.js';

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

export const HeaderSelect = styled(CpslSelect)<{ $width: number; $top?: number }>`
  --container-height: 26px;
  --container-border-width: 0px;
  --container-padding-end: 0px;
  --container-padding-start: 0px;
  --container-background-color: transparent;
  --container-box-shadow: none;
  --container-gap: 2px;
  --icon-width: 16px;
  --icon-height: 16px;
  position: relative;

  &::part(selected-text) {
    white-space: nowrap;
  }

  &::part(dropdown) {
    min-width: ${({ $width }) => `${$width - 2}px`};
  }

  &::part(popover) {
    /* Have to adjust the top of the popover here since we're using a transform on the modal which causes fixed position items to not be relative to the viewport */
    @media (max-width: ${MOBILE_SIZE}px) {
      top: ${({ $top }) => ($top ? `${$top}px` : '0px')};
      bottom: 16px;
    }
    cpsl-auth-modal.force-mobile-media & {
      top: ${({ $top }) => ($top ? `${$top}px` : '0px')};
      bottom: 16px;
    }
  }

  &::part(icon) {
    --icon-color: var(--cpsl-color-contrast);
  }
`;

export const HeaderSelectItem = styled(CpslSelectItem)`
  --outer-container-padding-start: 4px;
  --outer-container-padding-end: 4px;
  --outer-container-padding-top: 4px;
  --outer-container-padding-bottom: 4px;
`;

export const HeaderSelectContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 1000px;
  background-color: var(--cpsl-color-background-8);
  padding: 4px;
`;

const StyledIcon = styled(CpslIcon)`
  background: var(--cpsl-color-background-0);
  border-radius: 100%;
`;

export function AssetIcon({ asset, size }: { asset: OnRampAsset; size?: string }) {
  const isDark = useStore(state => state.modalConfig?.theme?.mode === 'dark');
  const data = ON_RAMP_ASSETS[asset];

  return (
    <StyledIcon size={size} icon={data.icon} inset={data.isCircular ? undefined : '15%'} invert={isDark && data.isDark} />
  );
}

export function NetworkIcon({ network, size }: { network: Network; size?: string }) {
  const isDark = useStore(state => state.modalConfig?.theme?.mode === 'dark');
  const data = NETWORKS[network];

  return (
    <StyledIcon size={size} icon={data.icon} inset={data.isCircular ? undefined : '15%'} invert={isDark && data.isDark} />
  );
}
export const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

export const ErrorIcon = styled(CpslIcon)`
  --height: 16px;
  --width: 16px;
  --icon-color: var(--cpsl-color-text-error);
`;
