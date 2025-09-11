import { CpslButton, CpslIcon, CpslQrCode, CpslSpinner, CpslText } from '@getpara/react-components';
import { useEffect, useState } from 'react';
import { styled } from 'styled-components';
import { usePara } from '../../../components/ParaContext.js';
import { useSearchParams } from 'react-router-dom';
import { isIFramed } from '../../../utils/isIFramed.js';
import { isMobile } from '@getpara/web-sdk';
import { FlexStartInnerContainer } from '../../../components/common.js';

const isMobileDevice = isMobile();

interface FarcasterStepProps {
  onLogin: () => Promise<void>;
}

export const Farcaster = ({ onLogin }: FarcasterStepProps) => {
  const para = usePara();
  const [searchParams] = useSearchParams();
  const [farcasterConnectUri, setFarcasterConnectUri] = useState<string>();

  useEffect(() => {
    const setup = async () => {
      if (isMobileDevice) {
        return;
      }

      const uri = await para.getFarcasterConnectUri({ appScheme: searchParams.get('appScheme') || undefined });
      setFarcasterConnectUri(uri);

      return new Promise((resolve, reject) => {
        (async () => {
          while (true) {
            try {
              await new Promise(_resolve => setTimeout(_resolve, 2000));

              const serverAuthState = await para.ctx.client.getFarcasterAuthStatus({
                sessionLookupId: searchParams.get('sessionId') || undefined,
              });

              if (Object.keys(serverAuthState).length !== 0) {
                if (serverAuthState.stage === 'done') {
                  await onLogin();
                }
                window?.parent?.postMessage({ type: 'FARCASTER_SUCCESS', payload: serverAuthState }, '*');

                return resolve(serverAuthState);
              }
            } catch (err) {
              window?.parent?.postMessage({ type: 'FARCASTER_FAILED' }, '*');
              return reject(err.message);
            }
          }
        })();
      });
    };

    setup();
  }, []);

  return (
    <Container $isEmbedded={isIFramed}>
      {isMobileDevice ? (
        <FlexStartInnerContainer>
          <CpslText weight="medium" color="secondary">
            {`Don’t have Farcaster`}
          </CpslText>
          <CpslButton as="a" href={'https://link.warpcast.com/download-qr'} target="_blank" variant="secondary">
            <CpslIcon slot="start" icon="linkExternal" />
            {`Get Farcaster`}
          </CpslButton>
        </FlexStartInnerContainer>
      ) : (
        <FlexStartInnerContainer>
          <CpslText variant="bodyL" weight="semiBold">
            Sign in using Farcaster
          </CpslText>
          <CpslText variant="bodyS" color="secondary" weight="medium" style={{ textAlign: 'center' }}>
            Scan the QR code with your phone's camera to proceed.
          </CpslText>
          <QRContainer>
            {!farcasterConnectUri ? <CpslSpinner size={100} /> : <CpslQrCode url={farcasterConnectUri} />}
          </QRContainer>
        </FlexStartInnerContainer>
      )}
    </Container>
  );
};

const Container = styled.form<{ $isEmbedded?: boolean }>`
  flex: 1;
  padding-left: ${({ $isEmbedded }) => ($isEmbedded ? '0px' : '83px')};
  padding-right: ${({ $isEmbedded }) => ($isEmbedded ? '0px' : '83px')};
  padding-top: ${({ $isEmbedded }) => ($isEmbedded ? '0px' : '24px')};
  box-sizing: border-box;
  width: 100%;
  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: ${({ $isEmbedded }) => ($isEmbedded ? '24px' : '24px')};
`;

const QRContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 286px;
  height: 286px;
`;
