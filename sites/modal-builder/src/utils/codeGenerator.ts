import { COSMOS_WALLETS, EVM_WALLETS, SOLANA_WALLETS } from '@getpara/react-sdk';
import { ModalBuilderConfig } from '../types';

export const getModalCodeString = (config: ModalBuilderConfig): string => {
  return `
  <ParaProvider
    paraClientConfig={{
      env: Environment.BETA, //or Environment.PROD from production apps
      apiKey: YOUR_API_KEY,
    }}
      ${
        config.authentication.isWeb3AuthEnabled
          ? `externalWalletConfig={{
      appName: YOUR_APP_NAME,
      wallets: ${JSON.stringify(config.authentication.externalWallets)},
      walletConnect: { projectId: YOUR_WALLET_CONNECT_PROJECT_ID },
      ${
        config.authentication.externalWallets.some(w => w in COSMOS_WALLETS)
          ? ` cosmosConnector: {
        config: {
          selectedChainId: SELECTED_CHAIN_FROM_YOUR_STATE,
          onSwitchChain: FN_TO_SWITCH_YOUR_STATE,
          chains: YOUR_SUPPORTED_COSMOS_CHAINS,
        },
      },`
          : ''
      }
      ${
        config.authentication.externalWallets.some(w => w in EVM_WALLETS)
          ? `evmConnector: {
        config: {
          chains: YOUR_SUPPORTED_EVM_CHAINS,
        },
      },`
          : ''
      }
      ${
        config.authentication.externalWallets.some(w => w in SOLANA_WALLETS)
          ? `solanaConnector: {
        config: {
          endpoint: ENDPOINT_FOR_SOLANA_CONNECTION,
          chain: SOLANA_CHAIN,
        },
      },`
          : ''
      }
    }}`
          : ''
      }
    
    paraModalConfig={{
      ${config.appearance.logo ? `logo: ${JSON.stringify(config.appearance.logo)}` : ''}
      ${!!Object.keys(config.appearance.theme).length ? `theme: ${JSON.stringify(config.appearance.theme)}` : ''}
      oAuthMethods: ${JSON.stringify(config.authentication.oAuthMethods)}
      ${!!config.authentication.disableEmailLogin ? 'disableEmailLogin: true' : ''}
      ${!!config.authentication.disablePhoneLogin ? 'disablePhoneLogin: true' : ''}
      authLayout: ${JSON.stringify(config.authentication.authLayout)}
      ${!!config.security.twoFactorAuthEnabled ? 'twoFactorAuthEnabled: true' : ''}
      ${!!config.security.recoverySecretStepEnabled ? 'recoverySecretStepEnabled: true' : ''}
      ${!!config.wallets.hideWallets ? 'hideWallets: true' : ''}
      onRampTestMode: true
    }}
  >
    {REST_OF_APP}
  </ParaProvider>
  
`
    .split('\n')
    .filter(line => line.trim() !== '')
    .join('\n');
};
