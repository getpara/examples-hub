import { vi } from 'vitest';
import { ParaInternal } from '@getpara/react-common';

export const mockLogout = vi.fn();
export const mockTouch = vi.fn().mockResolvedValue({ isAuthenticated: true });
export const mockLoginExternalWallet = vi.fn().mockResolvedValue({ stage: 'login' });

export class MockPara extends ParaInternal {
  logout = mockLogout;
  loginExternalWallet = mockLoginExternalWallet;
  touchSession = mockTouch;
}
