import { useSessionStorage } from 'usehooks-ts';
import { AuthLoginStep } from '../constants';

const SESSION_STORAGE_AUTH_LOGIN_STEP = '@CAPSULE/loginFlowStep';

export function useAuthLoginStep() {
  return useSessionStorage(SESSION_STORAGE_AUTH_LOGIN_STEP, AuthLoginStep.MANUAL_LOGIN);
}
