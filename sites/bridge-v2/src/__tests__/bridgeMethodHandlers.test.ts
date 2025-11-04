import { describe, expect, it, vi } from 'vitest';
import { bridgeMethodHandlers } from '../bridgeMethodHandlers';

const createPara = (overrides: Record<string, any> = {}) => {
  const deleteSelf = vi.fn().mockResolvedValue(undefined);
  const logout = vi.fn().mockResolvedValue(undefined);

  return {
    userId: 'user-id',
    ctx: {
      client: {
        deleteSelf,
      },
    },
    logout,
    ...overrides,
  };
};

describe('bridgeMethodHandlers.deleteAccount', () => {
  it('deletes the user and logs out on success', async () => {
    const para = createPara();

    await expect(bridgeMethodHandlers.deleteAccount(para as any, undefined)).resolves.toBeNull();

    expect(para.ctx.client.deleteSelf).toHaveBeenCalledWith('user-id');
    expect(para.logout).toHaveBeenCalledTimes(1);
  });

  it('throws when no user is authenticated', async () => {
    const para = createPara({ userId: undefined });

    await expect(bridgeMethodHandlers.deleteAccount(para as any, undefined)).rejects.toThrowError('No authenticated user');

    expect(para.ctx.client.deleteSelf).not.toHaveBeenCalled();
    expect(para.logout).not.toHaveBeenCalled();
  });

  it('propagates errors from deleteSelf', async () => {
    const error = new Error('deleteSelf failed');
    const para = createPara({
      ctx: { client: { deleteSelf: vi.fn().mockRejectedValue(error) } },
    });

    await expect(bridgeMethodHandlers.deleteAccount(para as any, undefined)).rejects.toThrowError(error);

    expect(para.ctx.client.deleteSelf).toHaveBeenCalledTimes(1);
    expect(para.logout).not.toHaveBeenCalled();
  });

  it('propagates errors from logout', async () => {
    const error = new Error('logout failed');
    const para = createPara({
      logout: vi.fn().mockRejectedValue(error),
    });

    await expect(bridgeMethodHandlers.deleteAccount(para as any, undefined)).rejects.toThrowError(error);

    expect(para.ctx.client.deleteSelf).toHaveBeenCalledWith('user-id');
    expect(para.logout).toHaveBeenCalledTimes(1);
  });
});
