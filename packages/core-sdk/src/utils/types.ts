import { ServerAuthState } from '@getpara/user-management-client';

export function isServerAuthState(obj: ServerAuthState | Record<string, never>): obj is ServerAuthState {
  return 'stage' in obj;
}
