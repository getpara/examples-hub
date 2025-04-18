import { vi } from 'vitest';

import Client from '@getpara/user-management-client';

vi.mock('@getpara/user-management-client', async importOriginal => {
  const actual = await importOriginal<{ default: Client }>();
  return {
    ...actual,
    default: vi.fn().mockImplementation(() => ({
      ...actual.default,
    })),
  };
});
