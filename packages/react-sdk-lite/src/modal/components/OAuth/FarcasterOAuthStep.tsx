import { CpslSpinner } from '@getpara/react-components';
import { useFarcasterLogin } from '../../hooks/useFarcasterLogin.js';
import { safeStyled } from '@getpara/react-common';
import { useEffect, useState } from 'react';
import { getPortalBaseURL } from '@getpara/web-sdk';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';

export function FarcasterOAuthStep() {
  const { url, isLoaded, setIsLoaded } = useFarcasterLogin({
    isActive: true,
  });
  const para = useInternalClient();
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!url) {
        return; // No iFrame URL to check against
      }

      const portalBase = getPortalBaseURL(para.ctx);

      if (!event.origin.startsWith(portalBase)) {
        return; // Ignore messages from untrusted origins
      }

      if (event.data) {
        if (event.data.type === 'HEIGHT') {
          setHeight(event.data.height);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [url]);

  return (
    <Container>
      {url && <IFrame style={{ display: isLoaded ? 'block' : 'none', height }} src={url} onLoad={() => setIsLoaded(true)} />}
      {(!url || !isLoaded) && <CpslSpinner />}
    </Container>
  );
}

const Container = safeStyled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const IFrame = safeStyled.iframe`
  width: 100%;
  border: none;
`;
