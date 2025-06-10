import { CpslButton, CpslIcon, CpslQrCode, CpslSpinner, CpslText, IconType } from '@getpara/react-components';
import { useCopyToClipboard } from '../hooks/index.js';
import { isMobile } from '@getpara/web-sdk';
import { safeStyled } from '../utils/index.js';

interface QRCodeProps {
  link?: string;
  icon?: IconType;
  imageSrc?: string;
  qrSize?: number;
  spinnerSize?: number;
}

export const QRCode = ({ link, imageSrc, icon, qrSize = 202, spinnerSize = 60 }: QRCodeProps) => {
  const [isCopied, copy] = useCopyToClipboard();

  const isMobileScreen = isMobile();

  const handleCopy = () => {
    copy(link);
  };

  return (
    <QRContainer $isMobile={isMobileScreen}>
      {isMobileScreen && (
        <MobileCopyButton fullWidth onClick={handleCopy}>
          <CopyIcon slot="start" icon={isCopied ? 'check' : 'copy'} />
          <CpslText variant="bodyS">{isCopied ? 'Copied' : 'Copy Link Instead'}</CpslText>
        </MobileCopyButton>
      )}
      {!link ? (
        <LoadingContainer $size={qrSize}>
          <CpslSpinner size={spinnerSize} />
        </LoadingContainer>
      ) : (
        <StyledQRCode url={link} size={qrSize} icon={icon} imageSrc={imageSrc} />
      )}
      {!isMobileScreen && (
        <CopyButton size="small" onClick={handleCopy}>
          <CopyIcon slot="start" icon={isCopied ? 'check' : 'copy'} />
          <CpslText variant="body2XS">{isCopied ? 'Copied' : 'Copy Link Instead'}</CpslText>
        </CopyButton>
      )}
    </QRContainer>
  );
};

const QRContainer = safeStyled.div<{ $isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px solid;
  border-color: var(--cpsl-color-background-16);
  border-radius: 16px;
  background-color: white;
  overflow: hidden;
  padding-bottom: ${({ $isMobile }) => ($isMobile ? '0px' : '16px')};
  padding-top: ${({ $isMobile }) => ($isMobile ? '16px' : '0px')};
`;

const StyledQRCode = safeStyled(CpslQrCode)`
  --qr-box-shadow: none;
  --qr-border-radius: 0px;
`;

const CopyButton = safeStyled(CpslButton)`
  --button-primary-color: var(--cpsl-color-text-contrast);
  --button-primary-background-color: var(--cpsl-color-background-4);

  --button-primary-hover-color: var(--cpsl-color-text-contrast);
  --button-primary-hover-background-color: var(--cpsl-color-background-16);

  --button-primary-active-color: var(--cpsl-color-text-contrast);
  --button-primary-active-background-color: var(--cpsl-color-background-4);

  --button-padding-start: 8px;
  --button-padding-end: 8px;
  --button-padding-top: 2px;
  --button-padding-bottom: 2px;

  --button-border-radius: 1000px;
`;

const MobileCopyButton = safeStyled(CopyButton)`
  --button-padding-top: 4px;
  --button-padding-bottom: 4px;

  padding: 0px 12px;
`;

const CopyIcon = safeStyled(CpslIcon)`
  --width: 16px;
  --height: 16px;
  --icon-color: var(--cpsl-color-text-contrast);
`;

const LoadingContainer = safeStyled.div<{ $size: number }>`
  display: flex;
  justify-content: center;
  align-items: center;
  height: ${({ $size }) => `${$size}px`};
  width: ${({ $size }) => `${$size}px`};
`;
