import { CoreAction, CoreMethod, CoreMethodName, CoreMethodParams, PARA_CORE_METHODS, ParaWeb } from '@getpara/web-sdk';
import { logger } from './logging';
import {
  initEthersSigner,
  ethersSignMessage,
  ethersSignTransaction,
  ethersSendTransaction,
  ethersSignTypedData,
} from './signers/ethersSigner';
import {
  initSolanaWeb3Signer,
  solanaWeb3SendTransaction,
  solanaWeb3SignTransaction,
  solanaWeb3SignVersionedTransaction,
} from './signers/solanaWeb3Signer';
import { initCosmJsSigners, cosmJsSignAmino, cosmJsSignDirect } from './signers/cosmjsSigner';
import { login, loginV2, generatePasskey, generatePasskeyV2, verifyWebChallenge } from './bridgeAuth';
import {
  CosmJsSignAminoArgs,
  CosmJsSignDirectArgs,
  EthersSendTransactionArgs,
  EthersSignMessageArgs,
  EthersSignTransactionArgs,
  EthersSignTypedDataArgs,
  EthersSignerInitArgs,
  GeneratePasskeyArgs,
  GeneratePasskeyV2Args,
  GetWebChallengeArgs,
  LoginArgs,
  LoginV2Args,
  SetEmailArgs,
  SolanaSendTransactionArgs,
  SolanaSignTransactionArgs,
  SolanaSignVersionedTransactionArgs,
  SolanaSignerInitArgs,
  CosmJsSignersInitArgs,
  VerifyWebChallengeArgs,
} from './types';

type CoreMethodHandlers = {
  [key in CoreMethodName]: CoreAction<key>;
};

export const coreMethodHandlers: CoreMethodHandlers = PARA_CORE_METHODS.reduce((acc, method: CoreMethodName) => {
  const action = async (para: ParaWeb, args: CoreMethodParams<typeof method>) => {
    logger.info(`${method} invoked with args:`, JSON.stringify(args));

    try {
      // Spread the args object as parameters
      const result = await (para[method] as CoreMethod<typeof method>)(args);

      logger.info(`${method} returned:`, JSON.stringify(result));

      return result;
    } catch (e) {
      logger.info(`${method} failed:`, e?.message?.toString() ?? e?.toString() ?? 'Unknown error'); // Log the error message
    }
  };

  return {
    ...acc,
    [method]: action,
  };
}, {}) as CoreMethodHandlers;

export const bridgeMethodHandlers: Record<string, (para: ParaWeb, args: any) => Promise<any>> = {
  cosmJsSignAmino: async (_, args: CosmJsSignAminoArgs) => {
    logger.info('Signing CosmJS transaction...');
    const signature = await cosmJsSignAmino(args);
    return signature;
  },
  cosmJsSignDirect: async (_, args: CosmJsSignDirectArgs) => {
    logger.info('Signing direct message...');
    const signature = await cosmJsSignDirect(args);
    return signature;
  },
  ethersSignMessage: async (_, args: EthersSignMessageArgs) => {
    logger.info('Signing ethers message...');
    const signature = await ethersSignMessage(args);
    return signature;
  },
  ethersSignTransaction: async (_, args: EthersSignTransactionArgs) => {
    logger.info('Signing ethers transaction...');
    const signature = await ethersSignTransaction(args);
    return signature;
  },
  ethersSignTypedData: async (_, args: EthersSignTypedDataArgs) => {
    logger.info('Signing typed data...');
    const signature = await ethersSignTypedData(args);
    return signature;
  },
  ethersSendTransaction: async (_, args: EthersSendTransactionArgs) => {
    logger.info('Sending ethers transaction...');
    const txResponse = await ethersSendTransaction(args);
    return txResponse;
  },
  generatePasskey: async (para, args: GeneratePasskeyArgs) => {
    logger.info('Generating passkey...');
    const result = await generatePasskey(para, args);
    logger.info('Passkey generated successfully.');
    return result;
  },
  generatePasskeyV2: async (para, args: GeneratePasskeyV2Args) => {
    logger.info('Generating passkey V2...');
    const result = await generatePasskeyV2(para, args);
    logger.info('Passkey V2 generated successfully.');
    return result;
  },
  getEmail: async (para, _) => {
    logger.info('Getting email...');
    return para.email;
  },
  getWebChallenge: async (para, args: GetWebChallengeArgs) => {
    logger.info('Getting web challenge...');
    const getWebChallengeResult = await para.ctx.client.getWebChallenge({ email: args.email });
    logger.info('Web challenge result:', getWebChallengeResult);
    return getWebChallengeResult;
  },
  initEthersSigner: async (para, args: EthersSignerInitArgs) => {
    logger.info('Initializing Ethers signer...');
    const result = await initEthersSigner(para, args);
    return result;
  },
  initSolanaWeb3Signer: async (para, args: SolanaSignerInitArgs) => {
    logger.info('Initializing Solana signer...');
    const result = await initSolanaWeb3Signer(para, args);
    return result;
  },
  initCosmJsSigners: async (para, args: CosmJsSignersInitArgs) => {
    logger.info('Initializing CosmJS signers...');
    const result = await initCosmJsSigners(para, args);
    return result;
  },
  login: async (para, args: LoginArgs) => {
    logger.info('Logging in...');
    const desiredWallet = await login(para, args);
    logger.info('Login successful. Desired wallet:', desiredWallet);
    return desiredWallet;
  },
  loginV2: async (para, args: LoginV2Args) => {
    logger.info('Logging in V2...');
    const desiredWallet2 = await loginV2(para, args);
    logger.info('Login V2 successful. Desired wallet:', desiredWallet2);
    return desiredWallet2;
  },
  logout: async (para, _) => {
    logger.info('Logging out...');
    await para.logout();
    return null;
  },
  setEmail: async (para, args: SetEmailArgs) => {
    logger.info('Setting email...');
    await para.setEmail(args.email);
    return null;
  },
  solanaWeb3SendTransaction: async (_, args: SolanaSendTransactionArgs) => {
    logger.info('Sending Solana transaction...');
    const txResponse = await solanaWeb3SendTransaction(args);
    return txResponse;
  },
  solanaWeb3SignTransaction: async (_, args: SolanaSignTransactionArgs) => {
    logger.info('Signing Solana transaction...');
    const txResponse = await solanaWeb3SignTransaction(args);
    return txResponse;
  },
  solanaWeb3SignVersionedTransaction: async (_, args: SolanaSignVersionedTransactionArgs) => {
    logger.info('Signing Solana versioned transaction...');
    const txResponse = await solanaWeb3SignVersionedTransaction(args);
    return txResponse;
  },
  verifyWebChallenge: async (para, args: VerifyWebChallengeArgs) => {
    logger.info('Verifying web challenge...');
    const verifyWebChallengeResult = await verifyWebChallenge(para, args);
    logger.info('Web challenge verified:', verifyWebChallengeResult);
    return verifyWebChallengeResult;
  },
};
