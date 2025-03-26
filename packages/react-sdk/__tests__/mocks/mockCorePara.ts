import { vi } from 'vitest';
import { ParaInternal } from '@getpara/react-common';
import { TEST_EMAIL, TEST_WALLETS, TEST_WALLET, TEST_USER_ID } from '../constants';

export const mockCheckIfUserExists = vi.fn();
export const mockCheckIfUserExistsByPhone = vi.fn();
export const mockCreateUser = vi.fn();
export const mockCreateUserByPhone = vi.fn();
export const mockInitiateUserLoginV2 = vi.fn();
export const mockKeepSessionAlive = vi.fn().mockResolvedValue(true);
export const mockLogout = vi.fn();
export const mockSendTransaction = vi.fn();
export const mockSignMessage = vi.fn();
export const mockSignTransaction = vi.fn();
export const mockWaitForAccountCreation = vi.fn().mockResolvedValue(true);
export const mockWaitForLoginAndSetup = vi.fn().mockResolvedValue({ isError: false });
export const mockWaitForPasskeyAndCreateWallet = vi.fn().mockResolvedValue({ isError: false });
export const mockIsFullyLoggedIn = vi.fn().mockResolvedValue(true);
export const mockFindWallet = vi.fn().mockResolvedValue(TEST_WALLET);

export class MockPara extends ParaInternal {
  checkIfUserExists = mockCheckIfUserExists;
  checkIfUserExistsByPhone = mockCheckIfUserExistsByPhone;
  createUser = mockCreateUser;
  createUserByPhone = mockCreateUserByPhone;
  initiateUserLoginV2 = mockInitiateUserLoginV2;
  keepSessionAlive = mockKeepSessionAlive;
  logout = mockLogout;
  sendTransaction = mockSendTransaction;
  signMessage = mockSignMessage;
  signTransaction = mockSignTransaction;
  waitForAccountCreation = mockWaitForAccountCreation;
  waitForLoginAndSetup = mockWaitForLoginAndSetup;
  waitForPasskeyAndCreateWallet = mockWaitForPasskeyAndCreateWallet;
  isFullyLoggedIn = mockIsFullyLoggedIn;
  findWallet = mockFindWallet;

  wallets = TEST_WALLETS;
  userId = TEST_USER_ID;

  getOAuthURL = vi.fn().mockResolvedValue('https://example.com');
}

vi.spyOn(MockPara.prototype, 'email', 'get').mockReturnValue(TEST_EMAIL);
vi.spyOn(MockPara.prototype, 'authInfo', 'get').mockReturnValue({
  auth: { email: TEST_EMAIL },
  authType: 'email',
  identifier: TEST_EMAIL,
});
