import { useSnapshot } from 'valtio';
import ModalStore from '../../../store/ModalStore';
import { Header } from './Header';
import { Footer } from './Footer';
import { useSelectedWallet } from '../../../hooks/useSelectedWallet';
import { WalletKitTypes } from '@reown/walletkit';
import { Chains } from './Chains';
import { buildAuthObject, getSdkError, populateAuthPayload } from '@walletconnect/utils';
import SettingsStore from '../../../store/SettingsStore';
import { EIP155_CHAINS, EIP155_SIGNING_METHODS } from '../../../data/EIP155Data';
import { walletKit } from '../../../utils/WalletConnectUtil';
import { Message } from './Message';
import { useMemo } from 'react';
import { approveAuthRequest } from '../../../utils/CapsuleRequestHandlerUtil';
import { styledToast } from '../../../utils/HelperUtil';
import { ACTIVE_SESSIONS_BASE_QUERY_KEY } from '../../../hooks/useActiveSessions';
import { useQueryClient } from '@tanstack/react-query';

export const SessionAuthenticate = () => {
  const { capsuleAddress } = useSnapshot(SettingsStore.state);
  const { data } = useSnapshot(ModalStore.state);
  const { wallet } = useSelectedWallet();
  const queryClient = useQueryClient();

  const payload = data?.sessionAuthenticatePayload as WalletKitTypes.SessionAuthenticate;

  const { message, authPayload, iss } = useMemo(() => {
    if (!payload || !capsuleAddress) return { message: '', authPayload: null, iss: '' };

    // Populate the authentication payload with the supported chains and methods
    const authPayload = populateAuthPayload({
      authPayload: payload.params.authPayload,
      chains: Object.keys(EIP155_CHAINS),
      methods: Object.values(EIP155_SIGNING_METHODS),
    });

    const address = capsuleAddress;
    const iss = `${authPayload.chains[0]}:${address}`;

    return { message: walletKit.formatAuthMessage({ request: authPayload, iss }), authPayload, iss };
  }, [capsuleAddress, payload?.params.authPayload]);

  if (!payload || !wallet) return null;

  const handleApprove = async () => {
    if (!message || !authPayload || !iss) return;

    try {
      const signature = await approveAuthRequest(message, wallet?.id);

      // Build the authentication object(s)
      const auth = buildAuthObject(
        authPayload,
        {
          t: 'eip191',
          s: signature,
        },
        iss,
      );

      // Approve
      await walletKit.approveSessionAuthenticate({
        id: payload.id,
        auths: [auth],
      });
    } catch (error) {
      styledToast((error as Error).message, 'error');
    } finally {
      queryClient.invalidateQueries({ queryKey: [ACTIVE_SESSIONS_BASE_QUERY_KEY], exact: false });
      ModalStore.close();
    }
  };

  const handleReject = async () => {
    if (!payload) return;

    try {
      await walletKit.rejectSession({
        id: payload.id,
        reason: getSdkError('USER_REJECTED_METHODS'),
      });
    } catch (e) {
      styledToast((e as Error).message, 'error');
    } finally {
      ModalStore.close();
    }
  };

  return (
    <>
      <Header metadata={payload.params.requester.metadata} intention="sign in" verifyContext={payload.verifyContext} />
      <Message message={message} />
      <Chains chainIds={payload.params.authPayload.chains} />
      <Footer onApprove={handleApprove} onReject={handleReject} />
    </>
  );
};
