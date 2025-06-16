import { CpslButton, CpslIcon, CpslQrCode, CpslSpinner, CpslText } from '@getpara/react-components';
import { CenteredText, Heading, InnerStepContainer, QRContainer, StepContainer } from '../common.js';
import { useModalStore } from '../../stores/index.js';
import { isMobile } from '@getpara/web-sdk';

export function FarcasterConnectQR() {
  const farcasterConnectUri = useModalStore(state => state.farcasterConnectUri);

  return (
    <>
      {isMobile() ? (
        <InnerStepContainer>
          <CpslText weight="medium" color="secondary">
            {`Don’t have Farcaster`}
          </CpslText>
          <CpslButton as="a" href={'https://link.warpcast.com/download-qr'} target="_blank" variant="secondary">
            <CpslIcon slot="start" icon="linkExternal" />
            {`Get Farcaster`}
          </CpslButton>
        </InnerStepContainer>
      ) : (
        <>
          <Heading variant="headingS" weight="bold">
            Sign in using Farcaster
          </Heading>
          <InnerStepContainer>
            <CenteredText variant="bodyS" color="secondary" weight="medium">
              Scan the QR code with your phone's camera to proceed.
            </CenteredText>
            <QRContainer>
              {!farcasterConnectUri ? <CpslSpinner size={100} /> : <CpslQrCode url={farcasterConnectUri} />}
            </QRContainer>
          </InnerStepContainer>
        </>
      )}
    </>
  );
}

const FarcasterOAuthStep = () => {
  return (
    <StepContainer $wide>
      <FarcasterConnectQR />
    </StepContainer>
  );
};

export default FarcasterOAuthStep;
