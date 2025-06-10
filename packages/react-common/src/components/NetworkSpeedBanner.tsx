import { useEffect, useState } from 'react';
import { CpslIcon } from '@getpara/react-components';
import { safeStyled } from '../utils/index.js';

interface NetworkInformation extends EventTarget {
  readonly downlink?: number;
  readonly effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  readonly type?: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown';
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void;
}

const BannerContainerWrapper = safeStyled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  background-color: transparent;
`;

const BannerContainer = safeStyled.div<{ $maxWidth?: string }>`
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: ${({ $maxWidth }) => $maxWidth || '100%'};
  box-sizing: border-box;
  padding: 6px;
  border-radius: 12px;
  background-color: transparent;
  position: relative;
  z-index: 10;
  display: inline-flex;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const WarningIcon = safeStyled(CpslIcon)<{ $size?: string }>`
  --icon-color: #fbbc04;
  --width: ${({ $size }) => $size || '24px'};
  --height: ${({ $size }) => $size || '24px'};
  margin-right: 6px;
  flex-shrink: 0;
`;

const BannerText = safeStyled.span<{ $fontSize?: string }>`
  font-family: var(--cpsl-default-font);
  font-weight: 500;
  font-size: ${({ $fontSize }) => $fontSize || '14px'};
  color: var(--cpsl-color-black);
  flex: 1;
`;

export const NetworkSpeedBanner = ({
  fontSize,
  iconSize,
  maxWidth,
}: {
  fontSize?: string;
  iconSize?: string;
  maxWidth?: string;
}) => {
  const [isSlowNetwork, setIsSlowNetwork] = useState(false);

  useEffect(() => {
    const connection = (navigator as any)?.connection as NetworkInformation | undefined;

    const checkNetworkSpeed = () => {
      if (connection) {
        const isSlow =
          connection.effectiveType === '2g' ||
          connection.effectiveType === 'slow-2g' ||
          (connection.downlink && connection.downlink < 0.5);
        setIsSlowNetwork(isSlow);
      } else {
        setIsSlowNetwork(false);
      }
    };
    checkNetworkSpeed();

    connection?.addEventListener?.('change', checkNetworkSpeed);
    const intervalId = setInterval(checkNetworkSpeed, 15000);

    return () => {
      clearInterval(intervalId);
      connection?.removeEventListener?.('change', checkNetworkSpeed);
    };
  }, []);

  if (!isSlowNetwork) {
    return null;
  }

  return (
    <BannerContainerWrapper>
      <BannerContainer $maxWidth={maxWidth}>
        <WarningIcon $size={iconSize} icon="alertTriangle" />
        <BannerText $fontSize={fontSize}>Your network is slow. This may impact your experience.</BannerText>
      </BannerContainer>
    </BannerContainerWrapper>
  );
};
