import { Auth } from '@getpara/user-management-client';
import ParaWeb from '@getpara/web-sdk';

export type InitiateLoginArgs = Auth;

export const initiateLogin = async (para?: ParaWeb, args?: Auth) => {
  if (!para) {
    throw new Error('no para instance');
  }

  if (!args) {
    throw new Error('no valid args passed to initiateLogin');
  }

  try {
    return await para.initiateUserLoginV2(args);
  } catch (e) {
    throw new Error(e);
  }
};
