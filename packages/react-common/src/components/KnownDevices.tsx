import { CpslButton, CpslIcon, CpslText } from '@getpara/react-components';
import styled from 'styled-components';
import { CenteredColumnContainer, FullWidthFilledDisabledInput, CenteredText } from './common.js';
import { QRCode } from './QRCode.js';
import { BiometricHints, getDeviceLogo, getDeviceModelName } from '../utils/index.js';
import { useCopyToClipboard } from '../hooks/index.js';

interface KnownDevicesProps {
  hints: BiometricHints;
  link?: string;
  showCurrentDevice?: boolean;
}

export const KnownDevices = ({ hints, link, showCurrentDevice }: KnownDevicesProps) => {
  const [isCopied, copy] = useCopyToClipboard();

  const handleCopy = () => {
    copy(link);
  };

  return (
    <Container>
      <CenteredText weight="semiBold">Continue with one of your other known devices</CenteredText>
      {!!hints.formattedHints.length && (
        <DevicesContainer>
          {hints.formattedHints.map(
            hint =>
              ((showCurrentDevice && hint.isKnownDevice) || !hint.isKnownDevice) && (
                <DeviceListItem key={hint.key}>
                  <DeviceLogo icon={getDeviceLogo(hint.device.vendor, hint.isMobile)} />
                  <CpslText weight="medium" color="contrast">
                    {getDeviceModelName(hint.device.model) ?? hint.device.vendor ?? hint.os.name}
                  </CpslText>
                  {(hint.browser || hint.passwordManager) && (
                    <>
                      <CpslText weight="medium" color="secondary">
                        using
                      </CpslText>
                      <CpslText weight="medium" color="contrast">
                        {hint.passwordManager ?? hint.browser.name}
                      </CpslText>
                    </>
                  )}
                </DeviceListItem>
              ),
          )}
        </DevicesContainer>
      )}
      {hints.hasMobileDevice ? (
        <QRCode link={link} icon="paraIconQr" />
      ) : (
        <CenteredColumnContainer>
          <FullWidthFilledDisabledInput noAutoDisable readonly disabled value={link}>
            <CpslButton slot="end" variant="ghost" onClick={handleCopy}>
              <CpslIcon icon={isCopied ? 'check' : 'copy'} />
            </CpslButton>
          </FullWidthFilledDisabledInput>
          <CenteredText color="secondary" variant="bodyS" weight="medium">
            Navigate to this link using your other device
          </CenteredText>
        </CenteredColumnContainer>
      )}
    </Container>
  );
};

const Container = styled(CenteredColumnContainer)`
  gap: 16px;
`;

const DevicesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--cpsl-color-background-4);
  padding: 16px;
  width: 100%;
  border-radius: 16px;
`;

const DeviceListItem = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const DeviceLogo = styled(CpslIcon)`
  --icon-color: var(--cpsl-color-text-contrast);
  --height: 16px;
  --width: 16px;
`;
