import { Verify } from '@walletconnect/types';
import { proxy } from 'valtio';

/**
 * Types
 */
interface State {
  testNets: boolean;
  account: number;
  eip155Address: string;
  capsuleAddress: string;
  cosmosAddress: string;
  relayerRegionURL: string;
  activeChainId: string;
  currentRequestVerifyContext?: Verify.Context;
}

/**
 * State
 */
const state = proxy<State>({
  testNets: typeof localStorage !== 'undefined' ? Boolean(localStorage.getItem('TEST_NETS')) : true,
  account: 0,
  activeChainId: '1',
  eip155Address: '',
  capsuleAddress: '',
  cosmosAddress: '',
  relayerRegionURL: '',
});

/**
 * Store / Actions
 */
const SettingsStore = {
  state,

  setAccount(value: number) {
    state.account = value;
  },

  setEIP155Address(eip155Address: string) {
    state.eip155Address = eip155Address;
  },
  setRelayerRegionURL(relayerRegionURL: string) {
    state.relayerRegionURL = relayerRegionURL;
  },

  setCapsuleAddress(capsuleAddress: string) {
    state.capsuleAddress = capsuleAddress;
  },

  setCosmosAddress(cosmosAddress: string) {
    state.cosmosAddress = cosmosAddress;
  },

  setActiveChainId(value: string) {
    state.activeChainId = value;
  },

  setCurrentRequestVerifyContext(context: Verify.Context) {
    state.currentRequestVerifyContext = context;
  },

  toggleTestNets() {
    state.testNets = !state.testNets;
    if (state.testNets) {
      localStorage.setItem('TEST_NETS', 'YES');
    } else {
      localStorage.removeItem('TEST_NETS');
    }
  },
};

export default SettingsStore;
