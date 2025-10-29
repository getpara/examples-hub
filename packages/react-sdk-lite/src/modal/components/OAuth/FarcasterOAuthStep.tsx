import { CpslSpinner } from '@getpara/react-components';
import { useFarcasterLogin } from '../../hooks/useFarcasterLogin.js';
import { safeStyled } from '@getpara/react-common';
import { useEffect, useState } from 'react';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';
import { validatePortalOrigin } from '../../utils/validatePortalOrigin.js';

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

      if (!validatePortalOrigin(event, para.ctx)) {
        return; // Ignore messages from untrusted origins
      }

      if (event.data) {
        if (event.data.type === 'HEIGHT') {
          setHeight(event.data.height);
        }
      }
    };
    typeof window !== 'undefined' && window.addEventListener('message', handleMessage);
    return () => {
      typeof window !== 'undefined' && window.removeEventListener('message', handleMessage);
    };
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
