import 'dotenv/config';

import type { Address as SolanaAddress } from '@solana/addresses';
import { verifyMessage as verifyViemMessage } from 'viem';
import { ethers } from 'ethers';

import { ParaRestClient, type RestWallet, type WalletType } from '@getpara/rest-sdk';
import { createParaRestEthersSigner } from '@getpara/rest-sdk/ethers';
import { createParaRestSolanaSigner } from '@getpara/rest-sdk/solana';
import { createParaRestViemAccount } from '@getpara/rest-sdk/viem';

const apiKey = process.env.PARA_API_KEY;
const env = (process.env.PARA_ENVIRONMENT ?? 'BETA').toUpperCase() as 'PROD' | 'BETA' | 'SANDBOX';

if (!apiKey) {
  throw new Error('PARA_API_KEY is required');
}

const para = new ParaRestClient({ apiKey, env });

async function main(): Promise<void> {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const evmWallet = await createReadyWallet(
    'EVM',
    `rest-sdk-evm-${suffix}@test.getpara.com`,
  );
  const solanaWallet = await createReadyWallet(
    'SOLANA',
    `rest-sdk-sol-${suffix}@test.getpara.com`,
  );

  if (!evmWallet.address) throw new Error('EVM wallet address missing');
  if (!solanaWallet.address) throw new Error('Solana wallet address missing');

  const ethersSigner = createParaRestEthersSigner({
    client: para,
    walletId: evmWallet.id,
    address: evmWallet.address,
  });
  const ethersSignature = await ethersSigner.signMessage('hello from ethers');
  const ethersRecovered = ethers.verifyMessage('hello from ethers', ethersSignature);
  assertEqual(ethersRecovered.toLowerCase(), evmWallet.address.toLowerCase(), 'ethers recovered address mismatch');

  const viemAccount = createParaRestViemAccount({
    client: para,
    walletId: evmWallet.id,
    address: evmWallet.address as `0x${string}`,
    publicKey: (evmWallet.publicKey as `0x${string}` | undefined) ?? '0x',
  });
  const viemSignature = await viemAccount.signMessage({ message: 'hello from viem' });
  const viemVerified = await verifyViemMessage({
    address: evmWallet.address as `0x${string}`,
    message: 'hello from viem',
    signature: viemSignature,
  });
  assertEqual(viemVerified, true, 'viem signature did not verify');

  const solanaSigner = createParaRestSolanaSigner({
    client: para,
    walletId: solanaWallet.id,
    address: solanaWallet.address as SolanaAddress,
  });
  const solanaAddress = solanaWallet.address as SolanaAddress;
  const solanaSignatures = await solanaSigner.signMessages([
    {
      content: new TextEncoder().encode('hello from solana'),
      signatures: {},
    },
  ]);
  const solanaSignature = solanaSignatures[0][solanaAddress];
  if (!solanaSignature || solanaSignature.length !== 64) {
    throw new Error('Solana signature was not a 64-byte ed25519 signature');
  }

  process.stdout.write(
    [
      `EVM wallet: ${evmWallet.address}`,
      `Solana wallet: ${solanaWallet.address}`,
      `ethers signature: ${ethersSignature}`,
      `viem signature: ${viemSignature}`,
      `solana signature bytes: ${solanaSignature.length}`,
    ].join('\n') + '\n',
  );
}

async function createReadyWallet(type: WalletType, userIdentifier: string): Promise<RestWallet> {
  const wallet = await para.createWallet({
    type,
    userIdentifier,
    userIdentifierType: 'EMAIL',
  });

  for (let attempt = 0; attempt < 20; attempt++) {
    const latest = await para.getWallet(wallet.id);
    if (latest.status === 'ready' && latest.address) {
      return latest;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  throw new Error(`${type} wallet ${wallet.id} was not ready in time`);
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(message);
  }
}

main().catch(error => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exit(1);
});
