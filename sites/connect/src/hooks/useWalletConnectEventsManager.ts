import { WalletKitTypes } from '@reown/walletkit';
import { EIP155_SIGNING_METHODS } from '@/data/EIP155Data';
import ModalStore from '@/store/ModalStore';
import SettingsStore from '@/store/SettingsStore';
import { walletKit } from '@/utils/WalletConnectUtil';
import { SignClientTypes } from '@walletconnect/types';
import { useCallback, useEffect } from 'react';
import { COSMOS_SIGNING_METHODS } from '@/data/COSMOSData';
import { useQueryClient } from '@tanstack/react-query';
import { ACTIVE_SESSIONS_BASE_QUERY_KEY } from './useActiveSessions';
import { styledToast } from '../utils/HelperUtil';

export default function useWalletConnectEventsManager(initialized: boolean) {
  const queryClient = useQueryClient();

  /******************************************************************************
   * 1. Open session proposal modal for confirmation / rejection
   *****************************************************************************/
  const onSessionProposal = useCallback((proposal: SignClientTypes.EventArguments['session_proposal']) => {
    // set the verify context so it can be displayed in the modal
    SettingsStore.setCurrentRequestVerifyContext(proposal.verifyContext);
    ModalStore.open('SessionProposalModal', { proposal });
  }, []);

  /******************************************************************************
   * 2. Open Auth modal for confirmation / rejection
   *****************************************************************************/
  const onSessionAuthenticate = useCallback((payload: WalletKitTypes.SessionAuthenticate) => {
    ModalStore.open('AuthRequestModal', { sessionAuthenticatePayload: payload });
  }, []);

  /******************************************************************************
   * 3. Open request handling modal based on method that was used
   *****************************************************************************/
  const onSessionRequest = useCallback(async (requestEvent: SignClientTypes.EventArguments['session_request']) => {
    const { topic, params, verifyContext } = requestEvent;
    const { request } = params;
    const requestSession = walletKit.engine.signClient.session.get(topic);
    // set the verify context so it can be displayed in the modal
    SettingsStore.setCurrentRequestVerifyContext(verifyContext);

    const { capsuleAddress } = SettingsStore.state;
    if (!capsuleAddress) {
      return;
    }

    switch (request.method) {
      case EIP155_SIGNING_METHODS.ETH_SIGN:
      case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
        return ModalStore.open('SessionSignModal', {
          requestEvent,
          requestSession,
        });

      case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
      case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
      case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
        return ModalStore.open('SessionSignTypedDataModal', {
          requestEvent,
          requestSession,
        });

      case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
      case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
        return ModalStore.open('SessionSendTransactionModal', {
          requestEvent,
          requestSession,
        });
      case EIP155_SIGNING_METHODS.WALLET_SWITCH_ETHEREUM_CHAIN:
        return ModalStore.open('SwitchChainModal', {
          requestEvent,
          requestSession,
        });
      case COSMOS_SIGNING_METHODS.COSMOS_SIGN_DIRECT:
      case COSMOS_SIGNING_METHODS.COSMOS_SIGN_AMINO:
        return ModalStore.open('SessionSignCosmosModal', {
          requestEvent,
          requestSession,
        });
      default:
        return ModalStore.open('SessionUnsupportedMethodModal', {
          requestEvent,
          requestSession,
        });
    }
  }, []);

  /******************************************************************************
   * Set up WalletConnect event listeners
   *****************************************************************************/
  useEffect(() => {
    if (initialized) {
      //sign
      walletKit.on('session_proposal', onSessionProposal);
      walletKit.on('session_request', onSessionRequest);
      // auth
      walletKit.on('session_authenticate', onSessionAuthenticate);
      // clean ups
      walletKit.on('session_delete', () => {
        queryClient.invalidateQueries({ queryKey: [ACTIVE_SESSIONS_BASE_QUERY_KEY], exact: false });
      });
      walletKit.on('proposal_expire', event => {
        if (ModalStore.state.data?.proposal?.id === event.id) {
          ModalStore.close();
          styledToast('Session proposal has expired, please try again', 'error');
        }
      });
      walletKit.on('session_request_expire', event => {
        if (ModalStore.state.data?.requestEvent?.id === event.id) {
          ModalStore.close();
          styledToast('Request has expired, please try again', 'error');
        }
      });
    }
  }, [initialized, onSessionProposal, onSessionRequest]);
}
