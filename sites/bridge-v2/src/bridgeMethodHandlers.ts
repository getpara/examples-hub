import { CoreAction, CoreMethod, CoreMethodName, CoreMethodParams, PARA_CORE_METHODS, ParaWeb } from '@getpara/web-sdk';
import { Secp256k1, sha256, Sha256 } from '@cosmjs/crypto';
import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { VerifiedAuth, isEmail, isPhone } from '@getpara/user-management-client';
import { ethers } from 'ethers';
import { ParaEthersSigner } from '@getpara/ethers-v6-integration';
import { logger } from './logging';
import { getBlockchainBalance, getSolanaRecentBlockhash } from './utils/balanceUtils';
import { loginWithPasskey, generatePasskey, verifyWebChallenge } from './bridgeAuth';
import {
  formatMessage,
  TransactionParams,
  formatCosmosTransaction,
  CosmosTransactionParams,
  EVMTransactionParams,
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
  deleteAccount: async (para, _) => {
    logger.info('Deleting account...');

    const userId = para.userId;
    if (!userId) {
      logger.warn('deleteAccount called with no authenticated user.');
      throw new Error('No authenticated user');
    }

    try {
      logger.info('Calling deleteSelf for user:', userId);
      await para.ctx.client.deleteSelf(userId);
      logger.info('deleteSelf succeeded, logging out…');
    } catch (error) {
      logger.error('deleteAccount failed while calling deleteSelf:', error);
      throw error;
    }

    try {
      await para.logout();
    } catch (error) {
      logger.error('deleteAccount failed while logging out:', error);
      throw error;
    }

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
  touchSession: async (para, args: { regenerate?: boolean } = {}) => {
    logger.info('touchSession invoked', args);
    const session = await para.touchSession(args?.regenerate ?? false);
    logger.info('touchSession returned:', session ? 'session refreshed' : 'no session');
    return session;
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

      // Check if signing was denied
      if ('pendingTransactionId' in result) {
        return result;
      }

      // Message signing returns just the signature (not a transaction)
      logger.info('formatAndSignMessage completed successfully');
      return {
        signature: result.signature,
      };
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

      // Check if signing was denied
      if ('pendingTransactionId' in signResult) {
        throw new Error('Transaction was denied or is pending review');
      }

      logger.info('Transaction signed', { signedTransaction: signResult.signedTransaction?.substring(0, 20) + '...' });

      // formatAndSignTransaction returns a complete signed transaction for EVM
      // No need to reconstruct it - just use it directly
      const serializedTx = signResult.signedTransaction.startsWith('0x')
        ? signResult.signedTransaction
        : '0x' + signResult.signedTransaction;

      logger.info('Broadcasting signed transaction', {
        signedTxLength: serializedTx.length,
        preview: serializedTx.substring(0, 20) + '...',
      });

      const txResponse = await provider.broadcastTransaction(serializedTx);

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
        const signResult = await para.signMessage({
          walletId: args.walletId,
          messageBase64,
          cosmosSignDocBase64, // Only included for Proto
        });

        // Check if signing was denied
        if ('pendingTransactionId' in signResult) {
          return signResult;
        }

        // Use Para's Cosmos signers for complete signed transaction
        try {
          const { ParaProtoSigner, ParaAminoSigner } = await import('@getpara/cosmjs-v0-integration');
          const { TxRaw } = await import('cosmjs-types/cosmos/tx/v1beta1/tx');

          // Determine chain prefix from chainId (e.g., 'cosmoshub-4' -> 'cosmos')
          const chainPrefix = args.chainId?.split('-')[0] || 'cosmos';

          if (format === 'proto') {
            // Use ParaProtoSigner for Proto format
            const signer = new ParaProtoSigner(para, chainPrefix, args.walletId);

            // Sign using Para's signer
            const signResponse = await signer.signDirect(wallet.address, signDoc);

            // Create the complete signed transaction
            const txRaw = TxRaw.fromPartial({
              bodyBytes: signResponse.signed.bodyBytes,
              authInfoBytes: signResponse.signed.authInfoBytes,
              signatures: [Buffer.from(signResponse.signature.signature, 'base64')],
            });

            // Serialize the complete signed transaction
            const signedTransaction = Buffer.from(TxRaw.encode(txRaw).finish()).toString('hex');

            logger.info('Cosmos Proto transaction signed successfully', { signedTransaction });

            return {
              signedTransaction,
            };
          } else {
            // Use ParaAminoSigner for Amino format
            const signer = new ParaAminoSigner(para, chainPrefix, args.walletId);

            // Sign using Para's signer
            const signResponse = await signer.signAmino(wallet.address, signDoc);

            // Create complete signed transaction with signature
            const signedDoc = {
              ...signResponse.signed,
              signature: signResponse.signature,
            };

            // Serialize as JSON for Amino
            const signedTransaction = JSON.stringify(signedDoc);

            logger.info('Cosmos Amino transaction signed successfully', { signedTransaction });

            return {
              signedTransaction,
            };
          }
        } catch (error) {
          logger.error('Failed to sign Cosmos transaction with Para signers:', error);
          // Fallback: if Para signers fail, we can only return the signature
          // The caller will need to handle transaction construction manually
          return {
            signature: signResult.signature,
          };
        }
      } else if (wallet.type === 'SOLANA') {
        // Solana transaction signing using Para's Solana signer
        try {
          // Check if this is a pre-serialized transaction
          if ('type' in args.transaction && args.transaction.type === 'serialized' && 'data' in args.transaction) {
            const { Transaction, Message, PublicKey } = await import('@solana/web3.js');

            try {
              // Decode the base64 input
              const buffer = Buffer.from(args.transaction.data, 'base64');

              let transaction;
              let messageToSign: Buffer;

              // Try to deserialize as a full Transaction first
              try {
                transaction = Transaction.from(buffer);
                // Extract the message to sign
                messageToSign = transaction.serializeMessage();
              } catch (txError) {
                // If that fails, try as a Message
                const message = Message.from(buffer);
                transaction = Transaction.populate(message);
                // The buffer itself is the message to sign
                messageToSign = buffer;
              }

              // Convert message to base64 for signing
              const messageBase64 = messageToSign.toString('base64');

              // Sign the message
              const result = await para.signMessage({
                walletId: args.walletId,
                messageBase64: messageBase64,
              });

              // Check if signing was denied
              if ('pendingTransactionId' in result) {
                return result;
              }

              // Add the signature to the transaction
              const signatureBuffer = Buffer.from(result.signature, 'base64');
              const publicKey = new PublicKey(wallet.address);

              // Try to add signature - this will fail if wallet doesn't match transaction
              try {
                transaction.addSignature(publicKey, signatureBuffer);
              } catch (addSigError: any) {
                logger.error('Failed to add signature to transaction', {
                  error: addSigError.message,
                  walletAddress: wallet.address,
                  transactionFeePayer: transaction.feePayer?.toBase58(),
                });

                // Return just the signature as fallback
                return {
                  signedTransaction: result.signature,
                };
              }

              // Serialize the complete signed transaction
              const signedTransactionBuffer = transaction.serialize({
                requireAllSignatures: false,
                verifySignatures: false,
              });
              const signedTransactionBase64 = signedTransactionBuffer.toString('base64');

              // Return the full signed transaction (ready to submit to Solana)
              return {
                signedTransaction: signedTransactionBase64,
              };
            } catch (error) {
              logger.error('Failed to process pre-serialized Solana transaction:', error);
              // Fallback to returning just the signature if deserialization fails
              // This maintains backward compatibility for non-standard cases
              const result = await para.signMessage({
                walletId: args.walletId,
                messageBase64: args.transaction.data,
              });

              if ('pendingTransactionId' in result) {
                return result;
              }

              return {
                signedTransaction: result.signature,
              };
            }
          }

          // Use Para's Solana signer for complete signed transaction
          const { ParaSolanaWeb3Signer } = await import('@getpara/solana-web3.js-v1-integration');
          const { Connection } = await import('@solana/web3.js');
          const { formatSolanaTransactionWithObject } = await import('./formatters/solanaFormatter');

          // Create connection
          const rpcUrl = args.rpcUrl || 'https://api.mainnet-beta.solana.com';
          const connection = new Connection(rpcUrl);

          // Create Para signer
          const signer = new ParaSolanaWeb3Signer(para, connection, args.walletId);

          // Use the formatter to build the transaction (avoiding duplication)
          const { transaction } = await formatSolanaTransactionWithObject(
            args.transaction as any,
            wallet.address,
            args.rpcUrl,
          );

          // Sign transaction using Para signer
          const signedTx = await signer.signTransaction(transaction);

          // Serialize the complete signed transaction
          const signedTransaction = Buffer.from(signedTx.serialize()).toString('hex');

          logger.info('Solana transaction signed successfully', { signedTransaction });

          return {
            signedTransaction,
          };
        } catch (error) {
          if (error && typeof error === 'object' && 'pendingTransactionId' in error) {
            return error;
          }
          logger.error('Failed to sign Solana transaction:', error);
          throw error;
        }
      } else {
        // EVM transaction signing using ParaEthersSigner
        // Enforce single convention: chainId must be provided at top-level
        const effectiveChainId = args.chainId;
        if (!effectiveChainId) {
          throw new Error('EVM transaction requires top-level chainId');
        }

        try {
          // Cast to EVMTransactionParams since we know this is an EVM wallet
          const evmParams = args.transaction as EVMTransactionParams;

          // Handle smart contract encoding if ABI and function are provided
          let data = evmParams.data;

          // Check if we have smart contract parameters from Flutter/other SDKs
          const smartContractAbi = (evmParams as any).smartContractAbi;
          const smartContractFunctionName = (evmParams as any).smartContractFunctionName;
          const smartContractFunctionArgs = (evmParams as any).smartContractFunctionArgs;

          if (smartContractAbi && smartContractFunctionName) {
            logger.info('Encoding smart contract function call', {
              functionName: smartContractFunctionName,
              args: smartContractFunctionArgs,
            });

            try {
              // Parse and validate ABI
              const abi = typeof smartContractAbi === 'string' ? JSON.parse(smartContractAbi) : smartContractAbi;
              const iface = new ethers.Interface(abi);

              // Validate function exists in ABI
              const fragment = iface.getFunction(smartContractFunctionName);
              if (!fragment) {
                throw new Error(`Function ${smartContractFunctionName} not found in ABI`);
              }

              // Encode the function call
              data = iface.encodeFunctionData(smartContractFunctionName, smartContractFunctionArgs || []);

              logger.info('Encoded function data', { data });
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              logger.error('Failed to encode smart contract function', {
                functionName: smartContractFunctionName,
                error: errorMessage,
              });
              throw new Error(`Failed to encode function ${smartContractFunctionName}: ${errorMessage}`);
            }
          }

          // Build transaction request - ParaEthersSigner will handle validation
          const txRequest: ethers.TransactionRequest = {
            to: evmParams.to,
            value: evmParams.value,
            data,
            gasLimit: evmParams.gasLimit,
            gasPrice: evmParams.gasPrice,
            maxFeePerGas: evmParams.maxFeePerGas,
            maxPriorityFeePerGas: evmParams.maxPriorityFeePerGas,
            nonce: evmParams.nonce ? Number(evmParams.nonce) : undefined,
            type: evmParams.type,
            chainId: BigInt(effectiveChainId),
          };

          // Sign using ParaEthersSigner
          const signer = new ParaEthersSigner(para, null, args.walletId);
          const signedTransaction = await signer.signTransaction(txRequest);

          logger.info('EVM transaction signed successfully', { signedTransaction });

          return {
            signedTransaction,
          };
        } catch (error) {
          // Check if it's a denial or pending review
          if (error && typeof error === 'object' && 'pendingTransactionId' in error) {
            return error; // Return the denial result as-is
          }

          logger.error('Failed to sign transaction with ParaEthersSigner:', error);
          throw error;
        }
      }
    } catch (error) {
      logger.error('formatAndSignTransaction failed:', error);
      throw error;
    }
  },
};
