import { AuthMethod } from '@getpara/user-management-client';
import { ParaPortal } from '../classes/ParaPortal';

export const checkIsEnclaveUser = async ({ para, sessionId }: { para: ParaPortal; sessionId: string }): Promise<boolean> => {
  const auth = await para.ctx.client.sessionAuth(sessionId);
  const isSLOUser = auth.loginAuthMethods?.methods.includes(AuthMethod.BASIC_LOGIN);
  para.isEnclaveUser = isSLOUser;
  return isSLOUser;
};
