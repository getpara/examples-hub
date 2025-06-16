import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MockPara } from '../mocks/mockParaCore';
import { prepareMock } from '../utils';
import {
  API_KEY,
  EXTERNAL_WALLET,
  LINKED_ACCOUNTS,
  USER_EMAIL,
  USER_TELEGRAM_AUTH_OBJECT,
  UUID,
  VERIFICATION_CODE,
} from '../constants';
import { Environment } from '../../src';
import { LinkAccountParams, OAUTH_METHODS, TLinkedAccountType } from '@getpara/user-management-client';
import {
  mockGetLinkedAccounts,
  mockLinkAccount,
  mockUnlinkAccount,
  mockVerifyLink,
} from '../mocks/mockUserManagementClient';

const ANOTHER_EMAIL = `another_${USER_EMAIL}`;
const ANOTHER_PHONE = '+13105559876';

describe('account linking', () => {
  let para: MockPara;

  beforeEach(async () => {
    para = new MockPara(Environment.DEV, API_KEY);

    await prepareMock(para);
  });

  // afterEach(() => {
  //   vi.resetAllMocks();
  // });

  it('fetches linked accounts', async () => {
    const accounts = await para.getLinkedAccounts();

    expect(mockGetLinkedAccounts).toHaveBeenCalledWith({
      userId: para.userId,
    });

    expect(accounts).toBe(LINKED_ACCOUNTS);
  });

  it('rejects for invalid arguments', async () => {
    await expect(para.linkAccount({ type: 'ASDF' } as any)).rejects.toThrow();
  });

  (
    [
      ['EMAIL', { auth: { email: ANOTHER_EMAIL } }],
      ['PHONE', { auth: { phone: ANOTHER_PHONE } }],
      ['EXTERNAL_WALLET', { externalWallet: EXTERNAL_WALLET }],
      ['FARCASTER', { type: 'FARCASTER' }],
      ['TELEGRAM', { type: 'TELEGRAM' }],
      ...OAUTH_METHODS.map(method => [method, { type: method }]),
      ['X', { type: 'X' }],
    ] as [TLinkedAccountType | 'X', LinkAccountParams][]
  ).forEach(([type, args]) => {
    const [identifier, externalWallet] = (() => {
      switch (type) {
        case 'EMAIL':
          return [ANOTHER_EMAIL, undefined];
        case 'PHONE':
          return [ANOTHER_PHONE, undefined];
        case 'EXTERNAL_WALLET':
          return [EXTERNAL_WALLET.address, args.externalWallet];
        default:
          return [undefined, undefined];
      }
    })();
    describe(type, () => {
      describe('starts account linking', () => {
        [false, true].forEach(isConflict => {
          if (isConflict && !['EMAIL', 'PHONE'].includes(type)) {
            return;
          }

          it(isConflict ? 'throws error when conflict' : 'succeeds', async () => {
            switch (isConflict) {
              case true:
                {
                  mockLinkAccount.mockResolvedValueOnce({
                    isConflict: true,
                  });

                  await expect(para.linkAccount(args)).rejects.toThrow('CONFLICT');
                }
                break;
              case false: {
                const accountLinkInProgress = await para.linkAccount(args!);

                expect(mockLinkAccount).toHaveBeenCalledWith({
                  type: type === 'X' ? 'TWITTER' : type,
                  ...(externalWallet ? { externalWallet } : identifier ? { identifier } : {}),
                  userId: para.userId,
                });

                expect(accountLinkInProgress).toStrictEqual({
                  id: UUID,
                  type: type === 'X' ? 'TWITTER' : type,
                  isComplete: false,
                  ...(externalWallet
                    ? { externalWallet: { ...externalWallet, signatureVerificationMessage: UUID } }
                    : identifier
                      ? { identifier }
                      : {}),
                });

                expect(para.accountLinkInProgress).toStrictEqual(accountLinkInProgress);
              }
            }
          });
        });
      });

      describe('verifies linked account', () => {
        [false, true].forEach(isConflict => {
          if (isConflict && ['EMAIL', 'PHONE'].includes(type)) {
            return;
          }

          it(isConflict ? 'throws error when conflict' : 'succeeds', async () => {
            const accountLinkInProgress = await para.linkAccount(args!);

            mockVerifyLink.mockResolvedValueOnce(isConflict ? { isConflict: true } : { accounts: [] });

            let verify,
              expectParams = {};
            switch (type) {
              case 'EMAIL':
              case 'PHONE':
                {
                  verify = para.verifyEmailOrPhoneLink({
                    verificationCode: VERIFICATION_CODE,
                  });
                  expectParams = {
                    verificationCode: VERIFICATION_CODE,
                  };
                }
                break;
              case 'TELEGRAM':
                {
                  verify = para.verifyTelegramLink({
                    telegramAuthResponse: USER_TELEGRAM_AUTH_OBJECT,
                  });
                  expectParams = {
                    telegramAuthResponse: USER_TELEGRAM_AUTH_OBJECT,
                  };
                }
                break;
              case 'FARCASTER':
                {
                  verify = para.verifyFarcasterLink({
                    onConnectUri: vi.fn(),
                  });
                }
                break;
              case 'EXTERNAL_WALLET':
                {
                  verify = para.verifyExternalWalletLink({
                    signedMessage: 'asdf',
                  });
                  expectParams = {
                    externalWallet: accountLinkInProgress.externalWallet!,
                    signedMessage: 'asdf',
                  };
                }
                break;
              default:
                verify = para.verifyOAuthLink({
                  method: type === 'X' ? 'TWITTER' : type,
                  onOAuthUrl: vi.fn(),
                });

                break;
            }

            switch (isConflict) {
              case true:
                await expect(verify).rejects.toThrow('CONFLICT');

                break;
              case false:
                await verify;

                expect(mockVerifyLink).toHaveBeenCalledWith({
                  linkedAccountId: accountLinkInProgress.id,
                  userId: para.userId,
                  ...expectParams,
                });

                expect(para.accountLinkInProgress).toBeUndefined();
                break;
            }
          });
        });
      });

      describe('unlinks account', () => {
        it('fails with no account id', async () => {
          await expect(para.unlinkAccount({} as any)).rejects.toThrow();
        });

        it('succeeds', async () => {
          mockUnlinkAccount.mockResolvedValueOnce({
            accounts: {
              primary: {
                type: 'EMAIL',
                identifier: USER_EMAIL,
                displayName: USER_EMAIL,
              },
              linked: [],
            },
          });

          await para.unlinkAccount({ linkedAccountId: UUID });

          expect(mockUnlinkAccount).toHaveBeenCalledWith({
            linkedAccountId: UUID,
            userId: para.userId,
          });
          expect(para.accountLinkInProgress).toBeUndefined();
        });
      });
    });
  });
});
