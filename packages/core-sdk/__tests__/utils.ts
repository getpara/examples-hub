import { readFile } from 'fs/promises';
import { faker } from '@faker-js/faker';
import { MockPara } from './mocks/mockParaCore';
import {
  Auth,
  extractAuthInfo,
  PregenAuth,
  PrimaryAuthInfo,
  toPregenTypeAndId,
  WalletEntity,
  TWalletType,
} from '@getpara/user-management-client';
import { PARTNER, USER_CUSTOM_ID, USER_EMAIL, USER_ID, USER_PHONE, WALLET } from './constants';
import { expect } from 'vitest';

export const getWorkerContent = async (): Promise<string> => await readFile(`${__dirname}/worker.min.js`, 'utf8');

export const setAuth = async (para: MockPara, authInfo: PrimaryAuthInfo) => {
  await para.setAuth(authInfo.auth, { userId: USER_ID });
};

export const getWallet = ({
  id,
  auth,
  address,
  publicKey,
  type,
  partnerId,
}: {
  type: TWalletType;
  address?: string;
  publicKey?: string;
  id?: string;
  auth?: PregenAuth;
  partnerId?: string;
}): WalletEntity => {
  return <WalletEntity>{
    ...WALLET,
    id: id ?? faker.string.uuid(),
    address: address ?? faker.string.alphanumeric(32),
    name: faker.word.words(),
    partnerId: partnerId ?? PARTNER.id,
    publicKey: publicKey ?? faker.string.alphanumeric(64),
    ...(() => {
      switch (type) {
        case 'EVM':
          return {
            type: 'EVM',
            scheme: 'DKLS',
          };
        case 'SOLANA':
          return {
            type: 'SOLANA',
            scheme: 'ED25519',
          };
        case 'COSMOS':
          return {
            type: 'COSMOS',
            scheme: 'DKLS',
          };
      }
    })(),
    ...(auth
      ? (() => {
          const [pregenIdentifierType, pregenIdentifier] = toPregenTypeAndId(auth);
          return {
            isPregen: true,
            pregenIdentifier,
            pregenIdentifierType,
          };
        })()
      : {
          isPregen: false,
          pregenIdentifier: null,
          pregenIdentifierType: null,
        }),
  };
};

const emailAuth = { email: USER_EMAIL };
const phoneAuth = { phone: USER_PHONE };
const evmAddress = '0xc61710a3d06ecf3dbdb081e9bdcd6dc5df44d2fb';
const evmPublicKey =
  '0x04b12e04b5078c2d41a10994537a09bf10e68927daf33031b7033fa7b412ecfe05a4cda4c5f6c1837db97f30fe8865a2bbd11738ad541a1a5c732484e65313fbf4';
const solanaAddress = 'AdaMbKgkbAUWgjmY8KyAVn72maZYLVJSTERKVeKcJnet';
const customIdAuth = { customId: USER_CUSTOM_ID };
const externalWalletAddress = '0x4a67cA5eB9098bf58cC552a77B1a947a2dc6A695';

export async function prepareMockSession({
  auth = emailAuth,
  partnerId = PARTNER.id,
  excludeAll = false,
  withoutAuth = false,
  excludePregen = false,
  excludeUnclaimed = false,
  excludeUnclaimable = false,
  withExternal = false,
}: {
  auth?: Auth<'email' | 'phone'>;
  partnerId?: string;
  excludeAll?: boolean;
  excludePregen?: boolean;
  excludeUnclaimed?: boolean;
  excludeUnclaimable?: boolean;
  withExternal?: boolean;
  withoutAuth?: boolean;
} = {}): Promise<{
  session: string;
  sessionInfo: Record<string, unknown>;
  partnerId: string;
  evmId: string;
  solanaId: string;
  evmPregenId: string;
  solanaPregenId: string;
  evmPregenUnclaimedId: string;
  solanaPregenUnclaimedId: string;
  evmPregenUnclaimableId: string;
  solanaPregenUnclaimableId: string;
  externalWalletAddress: string;
  evmAddress: string;
  solanaAddress: string;
}> {
  const authInfo = extractAuthInfo(auth, {
    isRequired: true,
  });

  const walletIds = [
    faker.string.uuid(),
    faker.string.uuid(),
    faker.string.uuid(),
    faker.string.uuid(),
    faker.string.uuid(),
    faker.string.uuid(),
    faker.string.uuid(),
    faker.string.uuid(),
  ];

  const [
    evmId,
    solanaId,
    evmPregenId,
    solanaPregenId,
    evmPregenUnclaimedId,
    solanaPregenUnclaimedId,
    evmPregenUnclaimableId,
    solanaPregenUnclaimableId,
  ] = walletIds;

  const wallets = Object.fromEntries(
    excludeAll
      ? []
      : [
          ...(!withoutAuth
            ? [
                getWallet({ id: evmId, address: evmAddress, publicKey: evmPublicKey, type: 'EVM', partnerId }),
                getWallet({ id: solanaId, address: solanaAddress, type: 'SOLANA', partnerId }),
              ]
            : []),
          ...(!excludePregen
            ? [
                getWallet({
                  id: evmPregenId,
                  type: 'EVM',
                  partnerId,
                  auth: authInfo.authType === 'email' ? emailAuth : phoneAuth,
                }),
                getWallet({
                  id: solanaPregenId,
                  type: 'SOLANA',
                  partnerId,
                  auth: authInfo.authType === 'email' ? emailAuth : phoneAuth,
                }),
              ]
            : []),
          ...(!excludeUnclaimed
            ? [
                getWallet({ id: evmPregenUnclaimedId, type: 'EVM', partnerId, auth: customIdAuth }),
                getWallet({ id: solanaPregenUnclaimedId, type: 'SOLANA', partnerId, auth: customIdAuth }),
              ]
            : []),
          ...(!excludeUnclaimable
            ? [
                getWallet({
                  id: evmPregenUnclaimableId,
                  type: 'EVM',
                  partnerId,
                  auth: authInfo.authType === 'email' ? phoneAuth : emailAuth,
                }),
                getWallet({
                  id: solanaPregenUnclaimableId,
                  type: 'SOLANA',
                  partnerId,
                  auth: authInfo.authType === 'email' ? phoneAuth : emailAuth,
                }),
              ]
            : []),
        ].map(wallet => [wallet.id, { ...wallet, signer: faker.string.alphanumeric(32) }]),
  );

  const externalWallets = withExternal
    ? {
        [externalWalletAddress]: getWallet({
          id: faker.string.uuid(),
          type: 'EVM',
          address: externalWalletAddress,
          partnerId,
        }),
      }
    : {};

  const sessionInfo = {
    ...(withoutAuth ? {} : { authInfo, userId: USER_ID }),
    wallets,
    currentWalletIds: excludeAll || withoutAuth ? {} : { EVM: [evmId], COSMOS: [evmId], SOLANA: [solanaId] },
    sessionCookie: 'session-cookie',
    externalWallets,
  };

  const session = Buffer.from(JSON.stringify(sessionInfo)).toString('base64');

  return {
    session,
    sessionInfo,
    partnerId,
    evmId,
    solanaId,
    evmPregenId,
    solanaPregenId,
    evmPregenUnclaimedId,
    solanaPregenUnclaimedId,
    evmPregenUnclaimableId,
    solanaPregenUnclaimableId,
    externalWalletAddress,
    evmAddress,
    solanaAddress,
  };
}

export async function prepareMock(
  para: MockPara,
  opts: Parameters<typeof prepareMockSession>[0] = {},
): ReturnType<typeof prepareMockSession> {
  const result = await prepareMockSession(opts);

  await para.importSession(result.session);

  return result;
}

function searchParamsToObject(url: URL): Record<string, string> {
  const obj: Record<string, string> = {};

  for (const [key, value] of url.searchParams.entries()) {
    obj[key] = value;
  }

  return obj;
}

export function expectSearchParams(url: URL, expected: Record<string, string>): void {
  const searchParams = searchParamsToObject(url);

  expect(searchParams).toEqual(expected);
}
