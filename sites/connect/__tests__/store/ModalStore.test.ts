import { describe, it, expect, beforeEach } from 'vitest';
import ModalStore from '../../src/store/ModalStore';

describe('ModalStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    ModalStore.close();
    ModalStore.state.view = undefined;
    ModalStore.state.data = undefined;
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      expect(ModalStore.state.open).toBe(false);
      expect(ModalStore.state.view).toBeUndefined();
      expect(ModalStore.state.data).toBeUndefined();
    });
  });

  describe('modal state management', () => {
    it('should open modal with view and data', () => {
      const testView = 'SessionProposalModal';
      const testData = {
        proposal: {
          id: 123,
          params: {
            id: 123456,
            expiryTimestamp: 0,
            pairingTopic: 'test-topic',
            proposer: {
              publicKey: '0xabc123',
              metadata: { name: 'Test App', description: 'A test DApp', url: 'https://example.com', icons: [] },
            },
            requiredNamespaces: {},
            optionalNamespaces: {},
            relays: [{ protocol: 'irn' }],
          },
          verifyContext: {
            verified: {
              validation: 'VALID' as const,
              origin: 'https://example.com',
              verifyUrl: 'https://example.com/verify',
            },
          },
        },
      };

      ModalStore.open(testView, testData);

      expect(ModalStore.state.open).toBe(true);
      expect(ModalStore.state.view).toBe(testView);
      expect(ModalStore.state.data).toEqual(testData);
    });

    it('should open modal with only view (no data)', () => {
      const testView = 'SessionUnsupportedMethodModal';

      ModalStore.open(testView, undefined);

      expect(ModalStore.state.open).toBe(true);
      expect(ModalStore.state.view).toBe(testView);
      expect(ModalStore.state.data).toBeUndefined();
    });

    it('should close modal and reset open state', () => {
      // First open the modal
      ModalStore.open('SessionSignModal', { requestEvent: {} as any });
      expect(ModalStore.state.open).toBe(true);

      // Then close it
      ModalStore.close();

      expect(ModalStore.state.open).toBe(false);
      // Note: view and data persist after closing (as per implementation)
      expect(ModalStore.state.view).toBe('SessionSignModal');
      expect(ModalStore.state.data).toBeDefined();
    });

    it('should update state when opening different views sequentially', () => {
      // Open first modal
      ModalStore.open('SessionSignModal', { requestEvent: { id: 1 } as any });
      expect(ModalStore.state.view).toBe('SessionSignModal');
      expect(ModalStore.state.data?.requestEvent?.id).toBe(1);

      // Open second modal (should replace first)
      ModalStore.open('AuthRequestModal', { sessionAuthenticatePayload: { id: 2 } as any });
      expect(ModalStore.state.view).toBe('AuthRequestModal');
      expect(ModalStore.state.data?.sessionAuthenticatePayload?.id).toBe(2);
      expect(ModalStore.state.data?.requestEvent).toBeUndefined();
    });
  });

  describe('modal views', () => {
    it('should support SessionProposalModal view', () => {
      ModalStore.open('SessionProposalModal', undefined);
      expect(ModalStore.state.view).toBe('SessionProposalModal');
    });

    it('should support SessionSignModal view', () => {
      ModalStore.open('SessionSignModal', undefined);
      expect(ModalStore.state.view).toBe('SessionSignModal');
    });

    it('should support SessionSignTypedDataModal view', () => {
      ModalStore.open('SessionSignTypedDataModal', undefined);
      expect(ModalStore.state.view).toBe('SessionSignTypedDataModal');
    });

    it('should support SessionSendTransactionModal view', () => {
      ModalStore.open('SessionSendTransactionModal', undefined);
      expect(ModalStore.state.view).toBe('SessionSendTransactionModal');
    });

    it('should support SessionUnsupportedMethodModal view', () => {
      ModalStore.open('SessionUnsupportedMethodModal', undefined);
      expect(ModalStore.state.view).toBe('SessionUnsupportedMethodModal');
    });

    it('should support SessionSignCosmosModal view', () => {
      ModalStore.open('SessionSignCosmosModal', undefined);
      expect(ModalStore.state.view).toBe('SessionSignCosmosModal');
    });

    it('should support AuthRequestModal view', () => {
      ModalStore.open('AuthRequestModal', undefined);
      expect(ModalStore.state.view).toBe('AuthRequestModal');
    });

    it('should support SwitchChainModal view', () => {
      ModalStore.open('SwitchChainModal', undefined);
      expect(ModalStore.state.view).toBe('SwitchChainModal');
    });
  });

  describe('modal data handling', () => {
    it('should handle proposal data correctly', () => {
      const proposalData = {
        proposal: {
          id: 456,
          params: {
            id: 123456,
            expiryTimestamp: 0,
            pairingTopic: 'test-topic',
            proposer: {
              publicKey: '0xabc123',
              metadata: {
                name: 'DApp',
                description: 'Test DApp',
                url: 'https://example.com',
                icons: [],
              },
            },
            requiredNamespaces: {
              eip155: {
                methods: ['eth_sendTransaction'],
                chains: ['eip155:1'],
                events: ['accountsChanged'],
              },
            },
            optionalNamespaces: {},
            relays: [{ protocol: 'irn' }],
          },
          verifyContext: {
            verified: {
              validation: 'VALID' as const,
              origin: 'https://example.com',
              verifyUrl: 'https://example.com/verify',
            },
          },
        },
      };

      ModalStore.open('SessionProposalModal', proposalData);

      expect(ModalStore.state.data?.proposal?.id).toBe(456);
      expect(ModalStore.state.data?.proposal?.params.proposer.metadata.name).toBe('DApp');
      expect(ModalStore.state.data?.proposal?.params.requiredNamespaces.eip155.methods).toContain('eth_sendTransaction');
    });

    it('should handle request event data correctly', () => {
      const requestData = {
        requestEvent: {
          id: 789,
          topic: 'test-topic',
          params: {
            request: {
              method: 'personal_sign',
              params: ['0x4d65737361676521', '0x1234567890123456789012345678901234567890'],
            },
            chainId: 'eip155:1',
          },
        } as any,
      };

      ModalStore.open('SessionSignModal', requestData);

      expect(ModalStore.state.data?.requestEvent?.id).toBe(789);
      expect(ModalStore.state.data?.requestEvent?.params.request.method).toBe('personal_sign');
      expect(ModalStore.state.data?.requestEvent?.params.chainId).toBe('eip155:1');
    });

    it('should handle auth request data correctly', () => {
      const authData = {
        sessionAuthenticatePayload: {
          id: 101112,
          topic: 'auth-topic',
          params: {
            expiryTimestamp: 0,
            requester: {
              publicKey: '0xabc123',
              metadata: {
                name: 'DApp',
                description: 'Test DApp',
                url: 'https://example.com',
                icons: [],
              },
            },
            authPayload: {
              domain: 'example.com',
              aud: 'https://example.com',
              type: 'eip4361',
              nonce: 'test-nonce',
              iat: '2023-01-01T00:00:00.000Z',
              chains: [],
              version: '1',
            },
          },
          verifyContext: {
            verified: {
              validation: 'VALID' as const,
              origin: 'https://example.com',
              verifyUrl: 'https://example.com/verify',
            },
          },
        },
      };

      ModalStore.open('AuthRequestModal', authData);

      expect(ModalStore.state.data?.sessionAuthenticatePayload?.id).toBe(101112);
      expect(ModalStore.state.data?.sessionAuthenticatePayload?.params.authPayload.domain).toBe('example.com');
      expect(ModalStore.state.data?.sessionAuthenticatePayload?.params.authPayload.type).toBe('eip4361');
    });
  });

  describe('state reactivity', () => {
    it('should maintain state reference across operations', () => {
      const initialState = ModalStore.state;

      ModalStore.open('SessionSignModal', undefined);
      ModalStore.close();

      // State object should be the same reference (valtio proxy behavior)
      expect(ModalStore.state).toBe(initialState);
    });

    it('should allow direct state access and modification', () => {
      // Direct state modification (though not recommended, it's possible with valtio)
      ModalStore.state.open = true;
      expect(ModalStore.state.open).toBe(true);

      ModalStore.state.view = 'SessionSignModal';
      expect(ModalStore.state.view).toBe('SessionSignModal');
    });
  });
});
