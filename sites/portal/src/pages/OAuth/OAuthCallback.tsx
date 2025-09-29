import { useEffect } from 'react';
import { ModalLoading, usePara } from '../../components';
import { useSearchParams } from 'react-router-dom';
import { useCloseWindow } from '../../hooks/useCloseWindow';
import { styled } from 'styled-components';
import * as utils from '../../utils/authLogin';
import { CurrentWalletIds } from '@getpara/core-sdk';
import { validateCallbackUrl } from '../../utils/validateCallbackUrl';
import { NativeCallbackParams, NativeCallbackReason, NativeCallbackStatus } from '../../constants/nativeCallback';

const buildNativeCallbackUrl = (nativeCallbackUrl: string, params: NativeCallbackParams): string => {
  try {
    const url = new URL(nativeCallbackUrl);
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
    });
    return url.toString();
  } catch {
    const [withoutHash, hash] = nativeCallbackUrl.split('#', 2);
    const [path, query = ''] = withoutHash.split('?', 2);
    const searchParams = new URLSearchParams(query);
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined) {
        searchParams.delete(key);
      } else {
        searchParams.set(key, value);
      }
    });
    const nextQuery = searchParams.toString();
    return `${path}${nextQuery ? `?${nextQuery}` : ''}${hash ? `#${hash}` : ''}`;
  }
};

export const OAuthCallback = () => {
  const para = usePara();
  const [searchParams] = useSearchParams();
  const closeWindow = useCloseWindow();

  const checkForSLOAndRoute = async () => {
    try {
      const sessionId = searchParams.get('sessionId');
      const encryptionKey = searchParams.get('encryptionKey');
      const nativeCallbackUrl = searchParams.get('nativeCallbackUrl');
      para.isEnclaveUser = true;

      if (!sessionId) {
        // If we have a native callback URL, redirect to it instead of closing
        if (nativeCallbackUrl && validateCallbackUrl(nativeCallbackUrl)) {
          window.location.href = buildNativeCallbackUrl(nativeCallbackUrl, {
            status: NativeCallbackStatus.ERROR,
            reason: NativeCallbackReason.NO_SESSION,
          });
          return;
        }
        closeWindow();
        return;
      }

      const auth = await para.ctx.client.sessionAuth(sessionId);
      if (auth.isNewUser) {
        // For new users with native callback, redirect with new_user status
        if (nativeCallbackUrl && validateCallbackUrl(nativeCallbackUrl)) {
          window.location.href = buildNativeCallbackUrl(nativeCallbackUrl, {
            status: NativeCallbackStatus.NEW_USER,
          });
          return;
        }
        closeWindow();
        return;
      }

      await para.setUserId(auth.userId);

      const enclaveShares = await para.ctx.enclaveClient.retrieveSharesWithRetry([{ userId: auth.userId }]);
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

      // If we have a native callback URL, redirect to it with success status
      if (nativeCallbackUrl && validateCallbackUrl(nativeCallbackUrl)) {
        window.location.href = buildNativeCallbackUrl(nativeCallbackUrl, {
          status: NativeCallbackStatus.COMPLETE,
        });
        return;
      }

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
      const nativeCallbackUrl = searchParams.get('nativeCallbackUrl');
      if (nativeCallbackUrl && validateCallbackUrl(nativeCallbackUrl)) {
        window.location.href = buildNativeCallbackUrl(nativeCallbackUrl, {
          status: NativeCallbackStatus.ERROR,
          reason: NativeCallbackReason.PROCESSING_FAILED,
        });
        return;
      }
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
