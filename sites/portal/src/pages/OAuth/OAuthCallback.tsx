import { useEffect } from 'react';
import { ModalLoading, usePara } from '../../components';
import { useSearchParams } from 'react-router-dom';
import { useCloseWindow } from '../../hooks/useCloseWindow';
import { styled } from 'styled-components';
import * as utils from '../../utils/authLogin';
import { CurrentWalletIds } from '@getpara/core-sdk';

export const OAuthCallback = () => {
  const para = usePara();
  const [searchParams] = useSearchParams();
  const closeWindow = useCloseWindow();

  const checkForSLOAndRoute = async () => {
    try {
      const sessionId = searchParams.get('sessionId');
      const encryptionKey = searchParams.get('encryptionKey');
      para.isEnclaveUser = true;

      if (!sessionId) {
        closeWindow();
        return;
      }

      const auth = await para.ctx.client.sessionAuth(sessionId);
      if (auth.isNewUser) {
        closeWindow();
        return;
      }
      await para.setUserId(auth.userId);

      const enclaveShares = await para.ctx.enclaveClient.retrieveSharesWithRetry([{ userId: auth.userId }]);
      console.log('enclaveShares', enclaveShares);
      const currentWalletIds: CurrentWalletIds = {};
      for (const share of enclaveShares) {
        const { walletId } = share;
        // TODO: have actual wallet selection logic routed to instead of this so exact wallet type is used
        //   and currentWalletIds is respected
        const walletType = share.walletScheme === 'DKLS' ? 'EVM' : 'SOLANA';
        const currentIdsForType = currentWalletIds[walletType] || [];
        currentWalletIds[walletType] = [...currentIdsForType, walletId];
      }
      await para.setCurrentWalletIds(currentWalletIds, { sessionLookupId: sessionId });

      await utils.authUpdateKeyShares(para, {
        sessionId,
        userId: auth.userId,
        encryptionKey,
        enclaveShares,
      });

      closeWindow();

      // // TODO: additional check if user is using SLO & route
      // para.setAuth(auth.auth, { userId: auth.userId });

      // searchParams.set('authInfo', JSON.stringify(para.authInfo));

      // const searchParamsString = searchParams.toString();
      // const queryString = searchParamsString ? `?${searchParamsString}` : '';

      // let newPasswordId: string = '';

      // if (auth.isNewUser) {
      //   ({
      //     data: { id: newPasswordId },
      //   } = await para.ctx.client.addSessionPasswordPublicKey(auth.userId, {
      //     status: PasswordStatus.PENDING,
      //   }));
      // }

      // // TODO: this needs to change for SLO, only using now to test flow
      // const nextPath = auth.isNewUser ? `/web/users/${auth.userId}/pin/${newPasswordId}` : '/web/pin/login';

      // navigate(`${nextPath}${queryString}`);
    } catch (error) {
      console.error('Error:', error);
      // closeWindow();
    }
  };

  useEffect(() => {
    checkForSLOAndRoute();
  }, [searchParams]);

  return (
    <Container>
      <ModalLoading noText />
    </Container>
  );
};

const Container = styled.div`
  background-color: transparent !important;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
