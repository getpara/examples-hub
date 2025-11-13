import { SessionTypes, SignClientTypes } from '@walletconnect/types';
import { WalletKitTypes } from '@reown/walletkit';
import { proxy } from 'valtio';

/**
 * Types
 */
interface ModalData {
  proposal?: SignClientTypes.EventArguments['session_proposal'];
  requestEvent?: SignClientTypes.EventArguments['session_request'];
  requestSession?: SessionTypes.Struct;
  sessionAuthenticatePayload?: WalletKitTypes.SessionAuthenticate;
}

interface State {
  open: boolean;
  view?:
    | 'SessionProposalModal'
    | 'SessionSignModal'
    | 'SessionSignTypedDataModal'
    | 'SessionSendTransactionModal'
    | 'SessionUnsupportedMethodModal'
    | 'SessionSignCosmosModal'
    | 'AuthRequestModal'
    | 'SwitchChainModal';
  data?: ModalData;
}

/**
 * State
 */
const state = proxy<State>({
  open: false,
  view: undefined,
  data: {},
});

/**
 * Store / Actions
 */
const ModalStore = {
  state,

  open(view: State['view'], data: State['data']) {
    state.view = view;
    state.data = data;
    state.open = true;
  },

  close() {
    state.open = false;
  },

  isScam() {
    return (
      state.data?.proposal?.verifyContext?.verified.isScam ||
      state.data?.sessionAuthenticatePayload?.verifyContext?.verified.isScam ||
      state.data?.requestEvent?.verifyContext?.verified.isScam ||
      false
    );
  },

  isDomainMismatch() {
    return (
      state.data?.proposal?.verifyContext?.verified.validation === 'INVALID' ||
      state.data?.sessionAuthenticatePayload?.verifyContext?.verified.validation === 'INVALID' ||
      state.data?.requestEvent?.verifyContext?.verified.validation === 'INVALID' ||
      false
    );
  },
};

export default ModalStore;
