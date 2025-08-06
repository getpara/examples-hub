import { CpslIcon, CpslInput, CpslSelect, CpslSelectItem, CpslText, CpslTileButton } from '@getpara/react-components';
import { safeStyled } from '@getpara/react-common';
import { MOBILE_SIZE, NETWORKS, ON_RAMP_ASSETS, WALLET_TYPES_METADATA } from '../constants/constants.js';
import { Network, OnRampAsset, TExternalWallet, TLinkedAccountType, TWalletType } from '@getpara/web-sdk';
import { useStore } from '../../provider/stores/useStore.js';
import { ACCOUNT_TYPES } from '../constants/oAuthLogos.js';
import { ComponentProps, PropsWithChildren, useEffect, useRef, useState } from 'react';

export const SpinnerContainer = safeStyled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const QRContainer = safeStyled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 286px;
  height: 286px;
`;

export const InfoBoxContent = safeStyled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const InfoBoxHeader = safeStyled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  cpsl-icon {
    --height: 20px;
    --width: 20px;
  }
`;

export const FilledDisabledInput: typeof CpslInput = safeStyled(CpslInput)`
  --container-border-color: var(--cpsl-color-input-border-placeholder);
  --container-background-color: var(--cpsl-color-background-0);
  --input-background-color: transparent;
  --input-font-weight: 500;
  --input-color: var(--cpsl-color-text-secondary);
`;

export const FullWidthFilledDisabledInput: typeof CpslInput = safeStyled(FilledDisabledInput)`
  width: 100%;
`;

export const CenteredText: typeof CpslText = safeStyled(CpslText)`
  width: 100%;
  text-align: center;
`;

export const InnerStepContainer = safeStyled.div`
  width: 100%;
  height: 100%;
  align-self: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

export const StepContainer = safeStyled(InnerStepContainer)<{ $wide?: boolean }>`
  gap: ${({ $wide }) => ($wide ? '32px' : '24px')};
`;

export const Heading = ({ children, ...props }: PropsWithChildren & ComponentProps<typeof CpslText>) => {
  return (
    <CpslText variant="bodyL" weight="semiBold" {...props} style={{ ...props.style, textAlign: 'center', width: '100%' }}>
      {children}
    </CpslText>
  );
};

export const StyledCpslTileButton: typeof CpslTileButton = safeStyled(CpslTileButton)`
  --button-width: 100%;
  --button-height: 87px;
  --button-icon-height: 32px;
  --button-icon-width: 32px;
`;

export const HeroIcon = safeStyled(CpslIcon)`
  --height: 80px;
  --width: 80px;
  --icon-color: var(--cpsl-color-text-primary);
`;

export const HeaderSelect = safeStyled(CpslSelect)<{ $width: number; $top?: number }>`
  --container-height: 26px;
  --container-border-width: 0px;
  --container-padding-end: 4px;
  --container-padding-start: 0px;
  --container-box-shadow: none;
  --container-gap: 2px;
  --icon-width: 16px;
  --icon-height: 16px;
  --dropdown-inner-padding: 16px;
  --dropdown-inner-gap: 10px;
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

export const HeaderSelectItem = safeStyled(CpslSelectItem)`
  --outer-container-padding-start: 0px;
  --outer-container-padding-end: 0px;
  --outer-container-padding-top: 0px;
  --outer-container-padding-bottom: 0px;
  --container-padding-start: 0px;
  --container-padding-end: 0px;
  --container-padding-top: 0px;
  --container-padding-bottom: 0px;
  width: 236px;
`;

export const HeaderSelectContainer = safeStyled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: var(--cpsl-border-radius-tile-button);
  background-color: var(--cpsl-color-background-8);
`;

const StyledIcon = safeStyled(CpslIcon)`
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

export function WalletTypeIcon({
  className,
  walletType,
  externalWallet,
  ...props
}: {
  className?: string;
  walletType: TWalletType;
  externalWallet?: TExternalWallet | string;
} & Parameters<typeof CpslIcon>[0]) {
  const isDark = useStore(state => state.modalConfig?.theme?.mode === 'dark');
  const data = (externalWallet ? ACCOUNT_TYPES[externalWallet] : WALLET_TYPES_METADATA[walletType]) || {
    icon: 'wallet02',
    isDark: true,
  };

  props.size;

  return (
    <CpslIcon
      className={className}
      icon={data.icon}
      invert={isDark && data.isDark}
      {...props}
      inset={props.inset ?? '10%'}
    />
  );
}

export const ErrorContainer = safeStyled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

export const ErrorIcon = safeStyled(CpslIcon)`
  --height: 16px;
  --width: 16px;
  --icon-color: var(--cpsl-color-text-error);
`;

export function AccountTypeIcon({
  accountType,
  size,
  inset,
  src,
}: {
  accountType?: TLinkedAccountType | string;
  size?: string;
  inset?: string;
  src?: string;
}) {
  const isDark = useStore(state => state.modalConfig?.theme?.mode === 'dark');
  const data = accountType ? ACCOUNT_TYPES[accountType] : null;

  return data || src ? (
    <CpslIcon
      size={size}
      inset={inset}
      icon={data?.iconBranded ?? data?.icon}
      color={data?.isPlain ? 'var(--cpsl-color-text-contrast)' : undefined}
      src={src}
      invert={isDark && data?.isDark}
    />
  ) : null;
}

export function HeroAccountTypeIcon({ accountType, src }: { accountType?: TLinkedAccountType | string; src?: string }) {
  if (accountType === 'EMAIL' || accountType === 'PHONE') {
    return <HeroGenericIcon accountType={accountType} />;
  }

  return <AccountTypeIcon accountType={accountType} size="60px" src={src} />;
}

export function HeroSuccessIcon() {
  return <CpslIcon icon="checkCircleFilled" size="80px" style={{ ['--icon-color']: 'var(--cpsl-color-utility-green' }} />;
}

export function GradientScroll({ height, gap, children }: PropsWithChildren<{ gap?: string; height?: string }>) {
  const [isNotAtBottom, setIsNotAtBottom] = useState(false);
  const [isNotAtTop, setIsNotAtTop] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const onScroll = () => {
    if (ref.current) {
      const { scrollTop, scrollHeight, clientHeight } = ref.current;
      if (height && scrollHeight <= parseInt(height)) {
        setIsNotAtTop(false);
        setIsNotAtBottom(false);
      } else {
        setIsNotAtTop(scrollTop > 30);
        setIsNotAtBottom(scrollTop + clientHeight < scrollHeight - 30);
      }
    }
  };

  useEffect(() => {
    onScroll();
  }, []);

  return (
    <GradientScrollContainer
      ref={ref}
      $height={height}
      $gap={gap}
      $isNotAtBottom={isNotAtBottom}
      $isNotAtTop={isNotAtTop}
      onScroll={onScroll}
    >
      <div>{children}</div>
    </GradientScrollContainer>
  );
}

export const HeroGenericIcon = ({ accountType }: { accountType: 'EMAIL' | 'PHONE' }) => {
  return (
    <Avatar>
      <AccountTypeIcon accountType={accountType} size="24px" />
    </Avatar>
  );
};

const GradientScrollContainer = safeStyled.div<{
  $height?: string;
  $gap?: string;
  $isNotAtBottom: boolean;
  $isNotAtTop: boolean;
}>`
  max-height: ${({ $height }) => $height || '100%'};
  width: 100%;
  overflow-y: auto;
  mask-image: ${({ $isNotAtBottom, $isNotAtTop }) =>
    $isNotAtBottom && $isNotAtTop
      ? 'linear-gradient(to bottom, transparent 0%, black 24px, black calc(100% - 24px), transparent 100%)'
      : $isNotAtBottom
        ? 'linear-gradient(to bottom, black calc(100% - 24px), transparent 100%)'
        : $isNotAtTop
          ? 'linear-gradient(to top, black calc(100% - 24px), transparent 100%)'
          : 'none'};

  & > div {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: ${({ $gap }) => $gap || '8px'};
  }
`;

const Avatar = safeStyled.div`
  width: 80px;
  height: 80px;
  border-radius: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--cpsl-color-background-8);
`;
