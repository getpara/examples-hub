import { styled } from 'styled-components';
import { FilledDisabledInput, Heading, Subheading, Text } from '../../../components/common';
import { CpslButton, CpslIcon, CpslQrCode, CpslSpinner } from '@usecapsule/react-components';
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard';

interface AddDeviceStepProps {
  addDeviceUrl?: string;
}

export const AddDeviceStep = ({ addDeviceUrl }: AddDeviceStepProps) => {
  const [copied, copy] = useCopyToClipboard();

  const handleCopy = () => {
    copy(addDeviceUrl);
  };

  return (
    <>
      <StyledHeading>
        <span>Add Passkey</span>
      </StyledHeading>
      <LgWidthSubheading>
        <span>
          To add a Passkey associated with this device, please scan this QR code from a device that already has a registered
          Passkey.
        </span>
      </LgWidthSubheading>
      <QRContainer>
        {addDeviceUrl ? (
          <>
            <CpslQrCode url={addDeviceUrl} />
            <HelperText>
              <span>Scan with your phone’s camera</span>
            </HelperText>
          </>
        ) : (
          <CpslSpinner />
        )}
      </QRContainer>
      {!!addDeviceUrl && (
        <>
          <SmWidthSubheading>
            <span>Or navigate to this link from the already registered device</span>
          </SmWidthSubheading>
          <FilledDisabledInput disabled value={addDeviceUrl} noAutoDisable>
            <CpslButton slot="end" variant="icon" onClick={handleCopy}>
              <CpslIcon icon={copied ? 'check' : 'copy'} />
            </CpslButton>
          </FilledDisabledInput>
        </>
      )}
    </>
  );
};

const StyledHeading = styled(Heading)`
  margin-top: 32px;
  padding-top: 8px;

  @media (max-width: 550px) {
    margin-top: 0px;
    padding-top: 0px;
  }
`;

const QRContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 16px 0px;
  padding-top: 8px;
  gap: 8px;
`;

const HelperText = styled(Text)`
  font-size: 12px;
`;

const LgWidthSubheading = styled(Subheading)`
  width: 366px;
`;

const SmWidthSubheading = styled(Subheading)`
  width: 276px;
`;
