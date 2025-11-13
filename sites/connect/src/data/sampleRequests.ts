import { WalletKitTypes } from '@reown/walletkit';
import { SessionTypes, SignClientTypes } from '@walletconnect/types';

export const sampleSessionAuthenticatePayload: WalletKitTypes.SessionAuthenticate = {
  id: 1234567890,
  topic: 'c4d3ca7ea9fb5ecf79f4db7e2d8b5e6f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7',
  params: {
    requester: {
      publicKey:
        '0x04a1b2c3d4e5f6789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      metadata: {
        name: 'Sample DApp',
        description: 'A sample decentralized application',
        url: 'https://sample-dapp.example.com',
        icons: ['https://sample-dapp.example.com/icon.png'],
      },
    },
    authPayload: {
      domain: 'sample-dapp.example.com',
      aud: 'https://sample-dapp.example.com',
      version: '1',
      nonce: '32891756',
      iat: '2023-09-06T15:30:00.000Z',
      nbf: '2023-09-06T15:30:00.000Z',
      exp: '2023-09-06T16:30:00.000Z',
      statement: 'I accept the ServiceOrg Terms of Service: https://service.invalid/tos',
      requestId: '1',
      resources: [
        'ipfs://bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq/',
        'https://example.com/my-web2-claim.json',
      ],
      chains: ['eip155:1'],
      type: 'caip122',
    },
    expiryTimestamp: 1694015400,
  },
  verifyContext: {
    verified: {
      verifyUrl: 'https://verify.walletconnect.com',
      validation: 'VALID',
      origin: 'https://sample-dapp.example.com',
    },
  },
};

export const sampleProposal: SignClientTypes.EventArguments['session_proposal'] = {
  id: 1234567890,
  params: {
    id: 1234567890,
    pairingTopic: 'a1b2c3d4e5f6789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    expiry: 1699123200,
    expiryTimestamp: 1699123200,
    requiredNamespaces: {
      eip155: {
        methods: ['eth_sendTransaction', 'eth_signTransaction', 'eth_sign', 'personal_sign', 'eth_signTypedData'],
        chains: ['eip155:1', 'eip155:137'],
        events: ['chainChanged', 'accountsChanged'],
      },
    },
    optionalNamespaces: {
      eip155: {
        methods: ['eth_signTypedData_v4'],
        chains: ['eip155:42161', 'eip155:10', 'eip155:1313161554', 'eip155:33139'],
        events: [],
      },
    },
    relays: [
      {
        protocol: 'irn',
      },
    ],
    proposer: {
      publicKey:
        '0x04a1b2c3d4e5f6789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      metadata: {
        name: 'Sample DApp',
        description: 'A sample decentralized application',
        url: 'https://sample-dapp.example.com',
        icons: ['https://avatars.githubusercontent.com/u/37784886?s=400&v=4'],
      },
    },
  },
  verifyContext: {
    verified: {
      verifyUrl: 'https://verify.walletconnect.com',
      validation: 'VALID',
      origin: 'https://sample-dapp.example.com',
      isScam: true,
    },
  },
};

// Sample requestEvent (SignClientTypes.EventArguments['session_request'])
export const sampleRequestEvent: SignClientTypes.EventArguments['session_request'] = {
  id: 1698765432,
  topic: 'b2c3d4e5f6789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0',
  params: {
    request: {
      method: 'personal_sign',
      params: [
        '0x57656c636f6d6520746f204f70656e536561210a0a436c69636b20746f207369676e20696e20616e642061636365707420746865204f70656e5365612054657273206f6620536572766963653a2068747470733a2f2f6f70656e7365612e696f2f746f730a0a5468697320726571756573742077696c6c206e6f742074726967676572206120626c6f636b636861696e207472616e73616374696f6e206f7220636f737420616e792067617320666565732e20596f75722061757468656e7469636174696f6e20737461747573206f6e6c79207265736574732061667465722032342068726e65746f7273206f6620696e61637469766974792e0a0a57616c6c65742061646472657373733a0a3078373432643335636332396263376638663835413564306537623435366637633663366336633663366336633663360a0a4e6f6e63653a0a34336163393939612d383765372d343464352d623735312d613764613564383664306132',
        '0x742d35cc29bc7f8f85A5d0e7b456f7c6c6c6c6c6',
      ],
      expiryTimestamp: 1699123200,
    },
    chainId: 'eip155:1',
  },
  verifyContext: {
    verified: {
      verifyUrl: 'https://verify.walletconnect.com',
      validation: 'VALID',
      origin: 'https://sample-dapp.example.com',
      isScam: false,
    },
  },
};

export const sampleTypedDataRequestEvent: SignClientTypes.EventArguments['session_request'] = {
  id: 1698765433,
  topic: 'c3d4e5f6789abcdef0123456789abcdef0123456789abcdef0123456789abcdef01',
  params: {
    request: {
      method: 'eth_signTypedData_v4',
      params: [
        JSON.stringify({
          types: {
            EIP712Domain: [
              { name: 'name', type: 'string' },
              { name: 'version', type: 'string' },
              { name: 'chainId', type: 'uint256' },
              { name: 'verifyingContract', type: 'address' },
            ],
            Person: [
              { name: 'name', type: 'string' },
              { name: 'wallet', type: 'address' },
            ],
            Mail: [
              { name: 'from', type: 'Person' },
              { name: 'to', type: 'Person' },
              { name: 'contents', type: 'string' },
              { name: 'timestamp', type: 'uint256' },
            ],
          },
          primaryType: 'Mail',
          domain: {
            name: 'Ether Mail',
            version: '1',
            chainId: 1,
            verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
          },
          message: {
            from: {
              name: 'Cow',
              wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
            },
            to: {
              name: 'Bob',
              wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
            },
            contents:
              'Hello, Bob! This is a very long message to demonstrate how typed data signing works in practice. It contains multiple lines of text and shows how complex structured data can be presented to users for signing. This message includes various details about the transaction, terms of service, privacy policy acknowledgments, and other important information that users need to review before signing. The message continues with additional context about the dApp, its functionality, security considerations, and user responsibilities when interacting with smart contracts on the blockchain.',
            timestamp: 1699123200,
          },
        }),
        '0x742d35cc29bc7f8f85A5d0e7b456f7c6c6c6c6c6',
      ],
      expiryTimestamp: 1699123200,
    },
    chainId: 'eip155:1',
  },
  verifyContext: {
    verified: {
      verifyUrl: 'https://verify.walletconnect.com',
      validation: 'VALID',
      origin: 'https://sample-dapp.example.com',
      isScam: false,
    },
  },
};

export const sampleSendTransactionRequestEvent: SignClientTypes.EventArguments['session_request'] = {
  id: 1698765434,
  topic: 'd4e5f6789abcdef0123456789abcdef0123456789abcdef0123456789abcdef012',
  params: {
    request: {
      method: 'eth_sendTransaction',
      params: [
        {
          from: '0x742d35cc29bc7f8f85A5d0e7b456f7c6c6c6c6c6',
          to: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
          value: '0x2386f26fc10000', // 0.01 ETH in wei
          gas: '0x5208', // 21000
          gasPrice: '0x4a817c800', // 20 gwei
          data: '0x',
        },
      ],
      expiryTimestamp: 1699123200,
    },
    chainId: 'eip155:1',
  },
  verifyContext: {
    verified: {
      verifyUrl: 'https://verify.walletconnect.com',
      validation: 'VALID',
      origin: 'https://sample-dapp.example.com',
      isScam: false,
    },
  },
};

// Sample requestSession (SessionTypes.Struct)
export const sampleRequestSession: SessionTypes.Struct = {
  topic: 'b2c3d4e5f6789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0',
  pairingTopic: 'a1b2c3d4e5f6789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  relay: {
    protocol: 'irn',
  },
  expiry: 1699209600,
  acknowledged: true,
  controller:
    '0x04a1b2c3d4e5f6789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  namespaces: {
    eip155: {
      accounts: [
        'eip155:1:0x742d35cc29bc7f8f85A5d0e7b456f7c6c6c6c6c6',
        'eip155:137:0x742d35cc29bc7f8f85A5d0e7b456f7c6c6c6c6c6',
      ],
      methods: ['eth_sendTransaction', 'eth_signTransaction', 'eth_sign', 'personal_sign', 'eth_signTypedData'],
      events: ['chainChanged', 'accountsChanged'],
    },
  },
  requiredNamespaces: {
    eip155: {
      methods: ['eth_sendTransaction', 'eth_signTransaction', 'eth_sign', 'personal_sign', 'eth_signTypedData'],
      chains: ['eip155:1', 'eip155:137'],
      events: ['chainChanged', 'accountsChanged'],
    },
  },
  optionalNamespaces: {
    eip155: {
      methods: ['eth_signTypedData_v4'],
      chains: ['eip155:42161', 'eip155:10'],
      events: [],
    },
  },
  self: {
    publicKey:
      '0x04b1c2d3e4f5a6789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    metadata: {
      name: 'Capsule Wallet',
      description: 'Capsule Connect Wallet',
      url: 'https://usecapsule.com',
      icons: ['https://usecapsule.com/icon.png'],
    },
  },
  peer: {
    publicKey:
      '0x04a1b2c3d4e5f6789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    metadata: {
      name: 'Sample DApp',
      description: 'A sample decentralized application',
      url: 'https://sample-dapp.example.com',
      icons: ['https://sample-dapp.example.com/icon.png'],
    },
  },
};

export const sampleSwitchChainRequestEvent: SignClientTypes.EventArguments['session_request'] = {
  id: 1698765436,
  topic: 'f6789abcdef0123456789abcdef0123456789abcdef0123456789abcdef01234567',
  params: {
    request: {
      method: 'wallet_switchEthereumChain',
      params: [
        {
          chainId: 'eip155:137', // Polygon Mainnet (137 in decimal)
        },
      ],
      expiryTimestamp: 1699123200,
    },
    chainId: 'eip155:1', // Current chain (Ethereum Mainnet)
  },
  verifyContext: {
    verified: {
      verifyUrl: 'https://verify.walletconnect.com',
      validation: 'VALID',
      origin: 'https://sample-dapp.example.com',
      isScam: false,
    },
  },
};

export const sampleSessionAuthenticatePayload2: WalletKitTypes.SessionAuthenticate = {
  id: 1698765438,
  topic: 'a1b2c3d4e5f6789abcdef0123456789abcdef0123456789abcdef0123456789abcdef1',
  params: {
    requester: {
      publicKey:
        '0x04c1d2e3f4a5b6789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      metadata: {
        name: 'DeFi Exchange',
        description: 'Decentralized exchange for trading cryptocurrencies with advanced features and low fees',
        url: 'https://defi-exchange.example.com',
        icons: ['https://defi-exchange.example.com/logo.png'],
      },
    },
    authPayload: {
      domain: 'defi-exchange.example.com',
      aud: 'https://defi-exchange.example.com',
      version: '2',
      nonce: 'abc123def456ghi789jkl012mno345pqr',
      iat: '2024-11-05T10:30:00.000Z',
      nbf: '2024-11-05T10:30:00.000Z',
      exp: '2024-11-05T12:30:00.000Z',
      statement:
        'Welcome to DeFi Exchange! By signing this message, you agree to our Terms of Service and Privacy Policy. This signature will authenticate your wallet without initiating any blockchain transactions or incurring gas fees. Your session will remain active for security purposes and will automatically expire after 2 hours of inactivity.',
      requestId: 'req_789456123',
      resources: [
        'https://defi-exchange.example.com/terms',
        'https://defi-exchange.example.com/privacy',
        'ipfs://QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o',
        'https://api.defi-exchange.example.com/user-preferences',
      ],
      chains: ['eip155:1', 'eip155:137', 'eip155:42161'],
      type: 'caip122',
    },
    expiryTimestamp: 1730808600,
  },
  verifyContext: {
    verified: {
      verifyUrl: 'https://verify.walletconnect.com',
      validation: 'VALID',
      origin: 'https://defi-exchange.example.com',
      isScam: false,
    },
  },
};
