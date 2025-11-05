import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, ModalLoading, usePara } from '../../components';
import { CpslAlert } from '@getpara/react-components';
import { useParams } from 'react-router-dom';
import { ModalLayoutInner } from '../../components/ModalLayoutInner';
import { PrivateKey } from './components/PrivateKey';
import { RETRIEVED_WALLETS_KEY } from '../../constants';

export const ExportPrivateKey = () => {
  const para = usePara();
  const { walletId } = useParams();
  const [privateKey, setPrivateKey] = useState<string>();
  const [isError, setIsError] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>(
    'Error retrieving private key. Please close this window and try again.',
  );

  useEffect(() => {
    const setup = async () => {
      if (para && para.isReady && !isReady) {
        try {
          const privateKey = await para.getPrivateKey(walletId);
          setPrivateKey(privateKey);
        } catch (e) {
          console.error(e);
          setErrorMessage('Sorry, we are unable to export your private key in this browser.');
          setIsError(true);
        } finally {
          sessionStorage.removeItem(RETRIEVED_WALLETS_KEY);
          setIsReady(true);
        }
      }
    };
    setup();
  }, [para?.isReady]);

  const content = useMemo(() => {
    if (!para?.isReady || !isReady) {
      return <ModalLoading noText />;
    }

    if (isError) {
      return (
        <CpslAlert variant="error" filled>
          {errorMessage}
        </CpslAlert>
      );
    }

    return <PrivateKey value={privateKey} walletId={walletId} />;
  }, [para?.isReady, isReady, privateKey, isError, errorMessage]);

  return (
    <Card>
      <CardContent>
        <ModalLayoutInner withFooter>{content}</ModalLayoutInner>
      </CardContent>
    </Card>
  );
};
