import { CoreAction, CoreMethod, CoreMethodName, CoreMethodParams, PARA_CORE_METHODS, ParaWeb } from '@getpara/web-sdk';
import { Secp256k1, sha256, Sha256 } from '@cosmjs/crypto';
import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { VerifiedAuth, isEmail, isPhone } from '@getpara/user-management-client';
import { logger } from './logging';
import { getBlockchainBalance, getSolanaRecentBlockhash } from './utils/balanceUtils';
import { loginWithPasskey, generatePasskey, verifyWebChallenge } from './bridgeAuth';
import {
  formatTransaction,
  formatMessage,
  TransactionParams,
  formatCosmosTransaction,
  CosmosTransactionParams,
} from './formatters';
import { getCosmosAddress } from '@getpara/core-sdk';
import {
  GeneratePasskeyArgs,
  GetWebChallengeArgs,
  LoginWithPasskeyArgs,
  SetEmailArgs,
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
      throw e; // Re-throw the error so it can be handled properly by the bridge
    }
  };

  return {
    ...acc,
    [method]: action,
  };
}, {}) as CoreMethodHandlers;

export const bridgeMethodHandlers: Record<string, (para: ParaWeb, args: any) => Promise<any>> = {
  generatePasskey: async (para, args: GeneratePasskeyArgs) => {
    logger.info('Generating passkey...');
    const result = await generatePasskey(para, args);
    logger.info('Passkey generated successfully.');
    return result;
  },
  getEmail: async (para, _) => {
    logger.info('Getting email...');
    return para.email;
  },
  getCurrentSessionDetails: async (para, _) => {
    logger.info('Getting current session details...');

    const result = {
      authInfo: para.authInfo,
      userId: para.userId,
    };

    logger.info('Session details retrieved:', result.userId ? 'User authenticated' : 'No active session');
    return result;
  },
  getWebChallenge: async (para, args: GetWebChallengeArgs) => {
    logger.info('Getting web challenge...');

    let authArg: VerifiedAuth | undefined;

    if (isEmail(args)) {
      authArg = args;
      logger.info('Using email for web challenge:', args.email);
    } else if (isPhone(args)) {
      authArg = args;
      logger.info('Using phone for web challenge:', args.phone);
    } else {
      logger.warn('Invalid arguments for getWebChallenge: neither email nor phone provided.', args);
    }

    const getWebChallengeResult = await para.ctx.client.getWebChallenge(authArg);
    logger.info('Web challenge result:', getWebChallengeResult);
    return getWebChallengeResult;
  },
  loginWithPasskey: async (para, args: LoginWithPasskeyArgs) => {
    logger.info('Logging in with passkey...');
    const desiredWallet = await loginWithPasskey(para, args);
    logger.info('Login with passkey successful. Desired wallet:', desiredWallet);
    return desiredWallet;
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
  solanaWeb3GetRecentBlockhash: async (para, args: { rpcUrl?: string }) => {
    logger.info('Getting Solana recent blockhash...', { rpcUrl: args.rpcUrl });
    const result = await getSolanaRecentBlockhash(args.rpcUrl);
    return result;
  },
  verifyWebChallenge: async (para, args: VerifyWebChallengeArgs) => {
    logger.info('Verifying web challenge...');
    const verifyWebChallengeResult = await verifyWebChallenge(para, args);
    logger.info('Web challenge verified:', verifyWebChallengeResult);
    return verifyWebChallengeResult;
  },
  loadTransmissionKeyshares: async (para, _) => {
    logger.info('Loading transmission keyshares...');
    try {
      const tempSharesRes = await (para as any).getTransmissionKeyShares();
      const temporaryShares = tempSharesRes.data.temporaryShares;

      if (temporaryShares.length > 0) {
        await (para as any).setupAfterLogin({ temporaryShares });

        // Build currentWalletIds from the loaded wallets
        const currentWalletIds = {};
        const fetchedWallets = await para.fetchWallets();

        fetchedWallets.forEach(wallet => {
          if (!currentWalletIds[wallet.type]) {
            currentWalletIds[wallet.type] = [];
          }
          currentWalletIds[wallet.type].push(wallet.id);
        });

        // Set the current wallet IDs so wallets are marked as usable
        await (para as any).setCurrentWalletIds(currentWalletIds);

        logger.info(`Loaded ${temporaryShares.length} transmission keyshares and set currentWalletIds:`, currentWalletIds);
        return { sharesLoaded: temporaryShares.length };
      } else {
        logger.info('No transmission keyshares found.');
        return { sharesLoaded: 0 };
      }
    } catch (error) {
      logger.error('Failed to load transmission keyshares:', error);
      throw error;
    }
  },

  // New formatting methods for native SDKs
  // Generic getBalance that routes to chain-specific methods
  getBalance: async (
    para,
    args: { walletId: string; token?: string; rpcUrl?: string; chainPrefix?: string; denom?: string },
  ) => {
    logger.info('getBalance invoked', {
      walletId: args.walletId,
      token: args.token,
      rpcUrl: args.rpcUrl,
      chainPrefix: args.chainPrefix,
      denom: args.denom,
    });

    try {
      // Get wallet to determine type
      const wallet = para.wallets[args.walletId];
      if (!wallet) {
        throw new Error(`Wallet not found: ${args.walletId}`);
      }

      let address = wallet.address;

      // For Cosmos, derive the correct bech32 address based on chain prefix
      if (wallet.type === 'COSMOS') {
        if (args.chainPrefix) {
          // Derive address with the correct prefix from public key
          let publicKey = (wallet as any).publicKey;
          if (!publicKey) {
            try {
              const fetched = await para.fetchWallets();
              const match = fetched.find((w: any) => w.id === args.walletId);
              publicKey = match?.publicKey;
            } catch (e) {
              // ignore, will fallback below
            }
          }
          if (publicKey) {
            address = getCosmosAddress(publicKey, args.chainPrefix);
            logger.info('Derived Cosmos address with chain prefix', {
              chainPrefix: args.chainPrefix,
              derivedAddress: address,
            });
          } else {
            // Fallback to addressSecondary if no public key
            address = (wallet as any).addressSecondary || wallet.address;
          }
        } else {
          // Use addressSecondary (default cosmos prefix) if no chainPrefix provided
          address = (wallet as any).addressSecondary || wallet.address;
        }
      }

      logger.info('Using address for balance check', {
        walletType: wallet.type,
        address,
        originalAddress: wallet.address,
        addressSecondary: (wallet as any).addressSecondary,
      });

      // Use consolidated balance utility with RPC URL from SDK
      const balance = await getBlockchainBalance(address, wallet.type, {
        token: args.token,
        rpcUrl: args.rpcUrl, // Forward the RPC URL from SDK
        denom: args.denom,
      });

      return balance;
    } catch (error) {
      logger.error('getBalance failed:', error);
      throw error;
    }
  },

  formatAndSignMessage: async (para, args: { walletId: string; message: string }) => {
    logger.info('formatAndSignMessage invoked', { walletId: args.walletId });

    try {
      // Get wallet to determine type
      const wallet = para.wallets[args.walletId];
      if (!wallet) {
        throw new Error(`Wallet not found: ${args.walletId}`);
      }

      // Format message based on wallet type
      const messageBase64 = formatMessage(args.message, wallet.type, wallet.address);

      // Call core SDK signMessage
      const result = await para.signMessage({
        walletId: args.walletId,
        messageBase64,
      });

      logger.info('formatAndSignMessage completed successfully');
      return result;
    } catch (error) {
      logger.error('formatAndSignMessage failed:', error);
      throw error;
    }
  },

  // Complete transfer function for EVM (build, sign, broadcast)
  transfer: async (
    para,
    args: {
      walletId: string;
      toAddress: string;
      amount: string; // Amount in wei
      chainId?: string;
      rpcUrl?: string;
    },
  ) => {
    logger.info('transfer invoked', {
      walletId: args.walletId,
      toAddress: args.toAddress,
      amount: args.amount,
      chainId: args.chainId,
      rpcUrl: args.rpcUrl,
    });

    try {
      // Get wallet
      const wallet = para.wallets[args.walletId];
      if (!wallet) {
        throw new Error(`Wallet not found: ${args.walletId}`);
      }

      // Only support EVM for now
      if (wallet.type !== 'EVM') {
        throw new Error(`Transfer not supported for wallet type: ${wallet.type}`);
      }

      // Use provided RPC or default
      const rpcUrl = args.rpcUrl || 'https://eth.llamarpc.com';
      const { ethers } = await import('ethers');
      const provider = new ethers.JsonRpcProvider(rpcUrl);

      // Get chain ID if not provided
      let chainId = args.chainId;
      if (!chainId) {
        const network = await provider.getNetwork();
        chainId = network.chainId.toString();
      }

      // Build transaction
      const [nonce, feeData, gasLimit] = await Promise.all([
        provider.getTransactionCount(wallet.address),
        provider.getFeeData(),
        provider.estimateGas({
          from: wallet.address,
          to: args.toAddress,
          value: args.amount,
        }),
      ]);

      // Build transaction object
      const transaction = {
        to: args.toAddress,
        value: args.amount,
        nonce: nonce.toString(),
        gasLimit: gasLimit.toString(),
        maxFeePerGas: feeData.maxFeePerGas?.toString(),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
        chainId,
        type: 2, // EIP-1559 transaction
      };

      logger.info('Built EVM transaction', transaction);

      // Use formatAndSignTransaction which properly handles EVM signing
      const signResult = await bridgeMethodHandlers.formatAndSignTransaction(para, {
        walletId: args.walletId,
        transaction,
        chainId,
        rpcUrl,
      });

      logger.info('Transaction signed', { signature: signResult.signature?.substring(0, 20) + '...' });

      // The signature from formatAndSignTransaction is a hex string without 0x prefix
      // We need to properly format it for ethers
      const signature = signResult.signature.startsWith('0x') ? signResult.signature : '0x' + signResult.signature;

      // Validate signature length (65 bytes = 130 hex chars + 0x prefix)
      const sigHex = signature.replace('0x', '');
      if (sigHex.length !== 130) {
        throw new Error(`Invalid signature length: expected 130 hex chars, got ${sigHex.length}`);
      }

      // Parse the signature components (r, s, v)
      // The signature is 65 bytes: r (32 bytes) + s (32 bytes) + v (1 byte)
      const r = '0x' + signature.slice(2, 66);
      const s = '0x' + signature.slice(66, 130);
      const v = parseInt(signature.slice(130, 132), 16);

      // Build the signed transaction
      const tx = ethers.Transaction.from({
        to: args.toAddress,
        value: args.amount,
        nonce,
        gasLimit,
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        chainId: BigInt(chainId),
        type: 2,
        signature: {
          r,
          s,
          v,
        },
      });

      const signedTxHex = tx.serialized;

      logger.info('Broadcasting signed transaction', {
        signedTxLength: signedTxHex.length,
        preview: signedTxHex.substring(0, 20) + '...',
      });

      const txResponse = await provider.broadcastTransaction(signedTxHex);

      logger.info('Transaction broadcasted', {
        hash: txResponse.hash,
        from: wallet.address,
        to: args.toAddress,
        amount: args.amount,
      });

      return {
        hash: txResponse.hash,
        from: wallet.address,
        to: args.toAddress,
        amount: args.amount,
        chainId,
      };
    } catch (error) {
      logger.error('transfer failed:', error);
      throw error;
    }
  },

  formatAndSignTransaction: async (
    para,
    args: {
      walletId: string;
      transaction: TransactionParams;
      chainId?: string;
      rpcUrl?: string;
    },
  ) => {
    logger.info('formatAndSignTransaction invoked', {
      walletId: args.walletId,
      transaction: args.transaction,
      chainId: args.chainId,
      rpcUrl: args.rpcUrl,
    });

    try {
      // Get wallet to determine type
      const wallet = para.wallets[args.walletId];
      if (!wallet) {
        throw new Error(`Wallet not found: ${args.walletId}`);
      }

      // Handle Cosmos differently - it uses signMessage with cosmosSignDocBase64
      if (wallet.type === 'COSMOS') {
        // Get public key for Cosmos
        let pubKeyHex: string | undefined = (wallet as any).publicKey;

        // If missing, fetch wallets from core and hydrate
        if (!pubKeyHex) {
          try {
            const fetchedWallets = await para.fetchWallets();
            const matching = fetchedWallets.find((w: any) => w.id === args.walletId);
            pubKeyHex = matching?.publicKey;
          } catch (e) {
            // Ignore fetch errors here; we'll throw a clear error below if still missing
          }
        }

        if (!pubKeyHex) {
          throw new Error('Public key not available for Cosmos wallet');
        }

        // Decode hex (accept with or without 0x prefix) and compress to match integration
        const cleaned = pubKeyHex.startsWith('0x') ? pubKeyHex.slice(2) : pubKeyHex;
        const uncompressed = new Uint8Array(Buffer.from(cleaned, 'hex'));
        const publicKey = Secp256k1.compressPubkey(uncompressed);

        // Format Cosmos transaction (pure formatting, no hashing)
        const { signBytes, signDoc, format } = await formatCosmosTransaction(
          args.transaction as CosmosTransactionParams,
          wallet.address,
          publicKey,
          args.chainId || 'cosmoshub-4',
        );

        // Follow exact cosmjs integration pattern
        let messageBase64: string;
        let cosmosSignDocBase64: string | undefined;

        if (format === 'amino') {
          // Amino: Hash with Sha256 class (matches cosmjs integration)
          const hashedMessage = new Sha256(signBytes).digest();
          messageBase64 = Buffer.from(hashedMessage).toString('base64');
          // No cosmosSignDocBase64 for Amino
        } else {
          // Proto: Hash with sha256 function and include cosmosSignDocBase64
          const hashedMessage = sha256(signBytes);
          messageBase64 = Buffer.from(hashedMessage).toString('base64');

          // Create cosmosSignDocBase64 for Proto (for review UI)
          const signDocJson = SignDoc.toJSON(signDoc);
          cosmosSignDocBase64 = Buffer.from(JSON.stringify(signDocJson)).toString('base64');
        }

        // Call signMessage (NOT signTransaction) for Cosmos
        const result = await para.signMessage({
          walletId: args.walletId,
          messageBase64,
          cosmosSignDocBase64, // Only included for Proto
        });

        return result;
      } else if (wallet.type === 'SOLANA') {
        // Check if this is a pre-serialized transaction
        if ('type' in args.transaction && args.transaction.type === 'serialized' && 'data' in args.transaction) {
          // Direct signing of pre-serialized transaction
          logger.info('Signing pre-serialized Solana transaction');
          const result = await para.signMessage({
            walletId: args.walletId,
            messageBase64: args.transaction.data,
          });
          return result;
        }

        // Regular formatting path for structured transactions
        const messageBase64 = await formatTransaction(
          args.transaction,
          wallet.type,
          wallet.address,
          undefined,
          undefined,
          args.rpcUrl,
        );

        const result = await para.signMessage({
          walletId: args.walletId,
          messageBase64,
        });

        return result;
      } else {
        // EVM uses signTransaction with RLP-encoded tx base64
        // Enforce single convention: chainId must be provided at top-level
        const effectiveChainId = args.chainId;
        if (!effectiveChainId) {
          throw new Error('EVM transaction requires top-level chainId');
        }

        const rlpEncodedTxBase64 = await formatTransaction(
          args.transaction,
          wallet.type,
          wallet.address,
          effectiveChainId,
          undefined,
          args.rpcUrl,
        );

        // Normalize chainId to a base-10 string for downstream MPC systems
        const normalizedChainId = (() => {
          try {
            return BigInt(String(effectiveChainId)).toString(10);
          } catch (_) {
            return String(effectiveChainId);
          }
        })();

        const result = await para.signTransaction({
          walletId: args.walletId,
          rlpEncodedTxBase64,
          chainId: normalizedChainId as any, // core expects string; may be undefined and handled upstream
        });

        return result;
      }
    } catch (error) {
      logger.error('formatAndSignTransaction failed:', error);
      throw error;
    }
  },
};
