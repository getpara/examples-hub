import { CpslButton, CpslIcon, CpslQrCode, CpslSpinner, CpslText, IconType } from '@usecapsule/react-components';
import styled from 'styled-components';
import { useCopyToClipboard } from '../hooks';

interface QRCodeProps {
  link?: string;
  icon?: IconType;
  imageSrc?: string;
  qrSize?: number;
  spinnerSize?: number;
}

export const QRCode = ({ link, imageSrc, icon, qrSize = 202, spinnerSize = 80 }: QRCodeProps) => {
  const [isCopied, copy] = useCopyToClipboard();

  const handleCopy = () => {
    copy(link);
  };

  return (
    <QRContainer>
      {!link ? (
        <CpslSpinner size={spinnerSize} />
      ) : (
        <StyledQRCode url={link} size={qrSize} icon={icon} imageSrc={imageSrc} />
      )}
      <CopyButton size="small" onClick={handleCopy}>
        <CopyIcon slot="start" icon={isCopied ? 'check' : 'copy'} />
        <CpslText variant="body2XS">{isCopied ? 'Copied' : 'Copy Link Instead'}</CpslText>
      </CopyButton>
    </QRContainer>
  );
};

const QRContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
  align-items: center;
  border: 1px solid;
  border-color: var(--cpsl-color-background-16);
  border-radius: 16px;
  background-color: white;
  overflow: hidden;
  padding-bottom: 16px;
`;

const StyledQRCode = styled(CpslQrCode)`
  --qr-box-shadow: none;
  --qr-border-radius: 0px;
`;

const CopyButton = styled(CpslButton)`
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

const CopyIcon = styled(CpslIcon)`
  --width: 16px;
  --height: 16px;
  --icon-color: var(--cpsl-color-text-contrast);
`;
